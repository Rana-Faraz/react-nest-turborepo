import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const repoRoot = process.cwd();

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const positionalArgs = args.filter((arg) => !arg.startsWith("--"));

  const prompt = createPrompt();

  try {
    printBanner();

    const rawProjectName =
      positionalArgs[0] ?? (await promptForProjectName(prompt));
    const scope = normalizeScope(rawProjectName);

    if (!scope) {
      console.error(
        `Could not derive a valid npm scope from "${rawProjectName}".`,
      );
      process.exit(1);
    }

    const workspaceManifestPaths = [
      ...collectManifestPaths(path.join(repoRoot, "apps")),
      ...collectManifestPaths(path.join(repoRoot, "packages")),
    ];

    const manifests = workspaceManifestPaths.map((manifestPath) => ({
      path: manifestPath,
      dirName: path.basename(path.dirname(manifestPath)),
      json: JSON.parse(readFileSync(manifestPath, "utf8")),
    }));

    const renameMap = new Map();
    const filterRenameMap = new Map();

    for (const manifest of manifests) {
      const oldName = manifest.json.name;
      const newName = `@${scope}/${manifest.dirName}`;

      if (typeof oldName === "string" && oldName.length > 0) {
        renameMap.set(oldName, newName);
      }

      filterRenameMap.set(manifest.dirName, newName);

      if (typeof oldName === "string" && oldName.length > 0) {
        filterRenameMap.set(oldName, newName);
      }
    }

    const rootPackagePath = path.join(repoRoot, "package.json");
    const rootPackage = JSON.parse(readFileSync(rootPackagePath, "utf8"));
    const updatedRootPackage = {
      ...rootPackage,
      name: scope,
    };

    const updatedManifests = manifests.map((manifest) => ({
      ...manifest,
      json: updateManifest(manifest.json, renameMap),
    }));

    const textReplacementMap = buildTextReplacementMap(
      renameMap,
      filterRenameMap,
    );
    const textFilePaths = collectTextFilePaths(repoRoot);

    const changedFiles = [];

    recordIfChanged(
      changedFiles,
      rootPackagePath,
      JSON.stringify(updatedRootPackage, null, 2) + "\n",
    );

    for (const manifest of updatedManifests) {
      recordIfChanged(
        changedFiles,
        manifest.path,
        JSON.stringify(manifest.json, null, 2) + "\n",
      );
    }

    for (const filePath of textFilePaths) {
      const original = readFileSync(filePath, "utf8");
      const updated = applyReplacements(original, textReplacementMap);

      recordIfChanged(changedFiles, filePath, updated);
    }

    if (changedFiles.length === 0) {
      console.log("No changes were required.");
      process.exit(0);
    }

    const shouldInstall = dryRun
      ? false
      : await promptForYesNo(
          prompt,
          "Run pnpm install after rewriting package names?",
          true,
        );

    console.log("");
    console.log(`Project scope: @${scope}`);
    console.log(`Root package name: ${scope}`);
    console.log("Workspace package names:");

    for (const manifest of manifests) {
      const oldName = manifest.json.name;
      const newName = renameMap.get(oldName) ?? oldName;
      console.log(`- ${oldName} -> ${newName}`);
    }

    console.log("");
    console.log("Files to update:");

    for (const change of changedFiles) {
      console.log(`- ${path.relative(repoRoot, change.path)}`);
    }

    if (dryRun) {
      console.log("");
      console.log("Dry run complete. No files were written.");
      process.exit(0);
    }

    const shouldApply = await promptForYesNo(
      prompt,
      "Apply these changes now?",
      true,
    );

    if (!shouldApply) {
      console.log("Initialization cancelled. No files were written.");
      process.exit(0);
    }

    for (const change of changedFiles) {
      writeFileSync(change.path, change.content, "utf8");
    }

    if (!shouldInstall) {
      console.log("Skipped pnpm install.");
      process.exit(0);
    }

    const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
    const installResult = spawnSync(pnpmCommand, ["install"], {
      cwd: repoRoot,
      stdio: "inherit",
    });

    if (installResult.status !== 0) {
      process.exit(installResult.status ?? 1);
    }
  } finally {
    prompt.close();
  }
}

function createPrompt() {
  return createInterface({ input, output });
}

function printBanner() {
  console.log(String.raw`
+--------------------------------------------------+
|   ___       _ _      ____            _           |
|  |_ _|_ __ (_) |_   |  _ \ _ __ ___ (_) ___  ___ |
|   | || '_ \| | __|  | |_) | '__/ _ \| |/ _ \/ __||
|   | || | | | | |_   |  __/| | | (_) | |  __/ (__ |
|  |___|_| |_|_|\__|  |_|   |_|  \___// |\___|\___||
|                                     |__/         |
+--------------------------------------------------+
`);
  console.log("Workspace template bootstrap");
  console.log("");
}

async function promptForProjectName(prompt) {
  while (true) {
    const answer = await prompt.question("Project name: ");
    const normalized = normalizeScope(answer);

    if (normalized) {
      return answer;
    }

    console.log(
      "Enter a non-empty project name using letters, numbers, or dashes.",
    );
  }
}

async function promptForYesNo(prompt, question, defaultValue) {
  const suffix = defaultValue ? " [Y/n]: " : " [y/N]: ";
  const answer = (await prompt.question(`${question}${suffix}`))
    .trim()
    .toLowerCase();

  if (answer.length === 0) {
    return defaultValue;
  }

  return answer === "y" || answer === "yes";
}

function normalizeScope(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function collectManifestPaths(rootDir) {
  if (!safeExists(rootDir)) {
    return [];
  }

  return readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(rootDir, entry.name, "package.json"))
    .filter((manifestPath) => safeExists(manifestPath));
}

function updateManifest(manifest, renameMap) {
  const updated = {
    ...manifest,
    name: renameMap.get(manifest.name) ?? manifest.name,
  };

  for (const field of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    if (updated[field]) {
      updated[field] = renameDependencyObject(updated[field], renameMap);
    }
  }

  return updated;
}

function renameDependencyObject(dependencies, renameMap) {
  const next = {};

  for (const [name, version] of Object.entries(dependencies)) {
    next[renameMap.get(name) ?? name] = version;
  }

  return next;
}

function buildTextReplacementMap(renameMap, filterRenameMap) {
  const replacements = new Map(renameMap);

  for (const [from, to] of filterRenameMap) {
    replacements.set(`pnpm --filter ${from}`, `pnpm --filter ${to}`);
  }

  return [...replacements.entries()].sort(([left], [right]) =>
    right.length - left.length,
  );
}

function collectTextFilePaths(rootDir) {
  const textExtensions = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".json",
    ".md",
    ".yaml",
    ".yml",
    ".toml",
    ".txt",
  ]);

  const ignoredDirectories = new Set([
    ".git",
    "node_modules",
    "dist",
    ".turbo",
    ".logs",
  ]);

  const files = [];

  walkDirectory(rootDir, (entryPath, entryName, isDirectory) => {
    if (isDirectory && ignoredDirectories.has(entryName)) {
      return "skip";
    }

    if (isDirectory) {
      return;
    }

    if (path.basename(entryPath) === "package.json") {
      return;
    }

    if (path.basename(entryPath) === "pnpm-lock.yaml") {
      return;
    }

    if (textExtensions.has(path.extname(entryPath))) {
      files.push(entryPath);
    }
  });

  return files;
}

function walkDirectory(currentDir, visit) {
  for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
    const entryPath = path.join(currentDir, entry.name);
    const result = visit(entryPath, entry.name, entry.isDirectory());

    if (result === "skip") {
      continue;
    }

    if (entry.isDirectory()) {
      walkDirectory(entryPath, visit);
    }
  }
}

function applyReplacements(content, replacements) {
  let next = content;

  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }

  return next;
}

function recordIfChanged(changes, filePath, content) {
  const current = readFileSync(filePath, "utf8");

  if (current !== content) {
    changes.push({
      path: filePath,
      content,
    });
  }
}

function safeExists(targetPath) {
  try {
    statSync(targetPath);
    return true;
  } catch {
    return false;
  }
}

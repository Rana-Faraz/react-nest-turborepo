import { createBaseConfig, nodeGlobals } from "@repo/eslint-config";

export default createBaseConfig({
  tsconfigRootDir: import.meta.dirname,
  extraGlobals: nodeGlobals,
});

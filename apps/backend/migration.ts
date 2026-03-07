import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Get the migration name from command line arguments
const migrationName: string = process.argv[2];

if (!migrationName) {
  console.error('Please provide a migration name');
  console.log('Usage: pnpm run migration:generate <migration-name>');
  process.exit(1);
}

try {
  // Generate the migration
  console.log(`Generating migration: ${migrationName}`);
  execSync(`npx typeorm-ts-node-commonjs -d src/config/datasource.config.ts migration:generate ${migrationName}`, { stdio: 'inherit' });
  
  // Find the generated migration file
  const files: string[] = fs.readdirSync('.').filter(f => f.match(/^\d+-.*\.ts$/));
  
  if (files.length > 0) {
    // Get the most recently created migration file
    const file: string = files[files.length - 1];
    
    // Ensure src/migrations directory exists
    const migrationsDir: string = 'src/migrations';
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    // Read the migration content
    const content: string = fs.readFileSync(file, 'utf8');
    
    // Write to src/migrations directory
    const targetPath: string = path.join(migrationsDir, file);
    fs.writeFileSync(targetPath, content);
    
    // Remove the original file
    fs.unlinkSync(file);
    
  } else {
    console.log('No migration file was generated');
  }
} catch (error: any) {
  console.error('Error generating migration:', error.message);
  process.exit(1);
}

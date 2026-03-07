import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export function runMigrations(db: Database) {
  console.log("Running migrations...");

  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const migrationsDir = path.join(process.cwd(), "server", "migrations");
  
  // Ensure directory exists (create_file will do it, but for runtime we check)
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  const appliedMigrations = db.prepare("SELECT name FROM _migrations").all() as { name: string }[];
  const appliedNames = new Set(appliedMigrations.map(m => m.name));

  for (const file of files) {
    if (!appliedNames.has(file)) {
      console.log(`Applying migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      
      try {
        db.transaction(() => {
          // Split SQL into individual statements and execute them one by one
          // to handle "already exists" errors gracefully if needed
          const statements = sql.split(";").filter(s => s.trim() !== "");
          
          for (const statement of statements) {
            try {
              db.exec(statement);
            } catch (err: any) {
              // Ignore "duplicate column name" or "table already exists" errors
              // to make migrations more resilient during transitions
              if (err.message.includes("duplicate column name") || 
                  err.message.includes("already exists")) {
                console.log(`Migration notice: ${err.message} (skipping statement)`);
              } else {
                throw err;
              }
            }
          }
          db.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file);
        })();
        console.log(`Successfully applied migration: ${file}`);
      } catch (error) {
        console.error(`Error applying migration ${file}:`, error);
        throw error; // Stop if a migration fails
      }
    }
  }
}

import Database from "better-sqlite3";

const db = new Database("masonic_lodge.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cim TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    degree TEXT NOT NULL,
    role TEXT,
    password TEXT NOT NULL,
    must_change_password INTEGER DEFAULT 1,
    initiation_date TEXT,
    elevation_date TEXT,
    exaltation_date TEXT,
    pays_through_lodge INTEGER DEFAULT 1,
    disconnected INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('palavra_semestral', 'Virtude');

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    degree TEXT NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS attendance (
    session_id INTEGER,
    member_id INTEGER,
    present INTEGER DEFAULT 0,
    PRIMARY KEY (session_id, member_id),
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (member_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT CHECK(type IN ('income', 'expense')),
    category TEXT NOT NULL,
    member_id INTEGER,
    FOREIGN KEY (member_id) REFERENCES members(id)
  );
`);

// Migration: Add member_id to transactions if it doesn't exist
try {
  db.exec("ALTER TABLE transactions ADD COLUMN member_id INTEGER REFERENCES members(id)");
  console.log("Migration: Added member_id to transactions table.");
} catch (e) {
  // Column already exists or table doesn't exist (unlikely due to CREATE TABLE above)
}

// Seed initial members if empty
const memberCount = db.prepare("SELECT COUNT(*) as count FROM members").get() as { count: number };
console.log(`Database initialized. Current member count: ${memberCount.count}`);

if (memberCount.count === 0) {
  console.log("Seeding initial members...");
  const insert = db.prepare(`
    INSERT INTO members (cim, name, degree, role, password, must_change_password, initiation_date, pays_through_lodge, disconnected) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run("100001", "Hiram Abiff", "Mestre", "Venerável Mestre", "100001", 1, "1717-06-24", 1, 0);
  insert.run("100002", "Jacques de Molay", "Mestre", "1° Vigilante", "100002", 1, "1314-03-18", 1, 0);
  insert.run("100003", "George Washington", "Mestre", "2° Vigilante", "100003", 1, "1752-11-04", 1, 0);
  insert.run("100004", "Benjamin Franklin", "Mestre", "Secretário", "100004", 1, "1731-02-01", 1, 0);
  insert.run("100005", "Dom Pedro I", "Mestre", "Orador", "100005", 1, "1822-08-02", 1, 0);
  insert.run("100006", "Aprendiz Exemplo", "Aprendiz", "Obreiro", "100006", 1, "2023-01-01", 1, 0);
  insert.run("100007", "Companheiro Exemplo", "Companheiro", "Obreiro", "100007", 1, "2022-01-01", 1, 0);
  console.log("Seed data inserted successfully.");
}

export default db;

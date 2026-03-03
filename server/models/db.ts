import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import { normalizePalavra } from "../utils/normalize";

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
    payment_start_date TEXT,
    pays_through_lodge INTEGER DEFAULT 1,
    disconnected INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  -- We will handle the initial insertion in a migration below to ensure it's hashed

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
    month INTEGER,
    year INTEGER,
    FOREIGN KEY (member_id) REFERENCES members(id)
  );
`);

try {
  db.exec("ALTER TABLE transactions ADD COLUMN month INTEGER");
  console.log("Migration: Added month to transactions table.");
} catch (e) {}

try {
  db.exec("ALTER TABLE transactions ADD COLUMN year INTEGER");
  console.log("Migration: Added year to transactions table.");
} catch (e) {}

try {
  db.exec("ALTER TABLE members ADD COLUMN payment_start_date TEXT");
  console.log("Migration: Added payment_start_date to members table.");
} catch (e) {
  // Column already exists
}

// Migration: Add member_id to transactions if it doesn't exist
try {
  db.exec("ALTER TABLE transactions ADD COLUMN member_id INTEGER REFERENCES members(id)");
  console.log("Migration: Added member_id to transactions table.");
} catch (e) {
  // Column already exists or table doesn't exist (unlikely due to CREATE TABLE above)
}

// Migration: Hash existing plain text passwords
const allMembers = db.prepare("SELECT id, password FROM members").all() as { id: number, password: string }[];
for (const m of allMembers) {
  // Check if password is already hashed (bcrypt hashes start with $2b$ or $2a$)
  if (!m.password.startsWith("$2b$") && !m.password.startsWith("$2a$")) {
    const hashedPassword = bcrypt.hashSync(m.password, 10);
    db.prepare("UPDATE members SET password = ? WHERE id = ?").run(hashedPassword, m.id);
    console.log(`Migration: Hashed password for member ID ${m.id}`);
  }
}

// Migration: Hash Palavra Semestral
const palavraSetting = db.prepare("SELECT value FROM settings WHERE key = 'palavra_semestral'").get() as { value: string } | undefined;
if (!palavraSetting) {
  const hashedPalavra = bcrypt.hashSync(normalizePalavra("Virtude"), 10);
  db.prepare("INSERT INTO settings (key, value) VALUES ('palavra_semestral', ?)").run(hashedPalavra);
  console.log("Migration: Initialized and hashed Palavra Semestral.");
} else if (!palavraSetting.value.startsWith("$2b$") && !palavraSetting.value.startsWith("$2a$")) {
  const hashedPalavra = bcrypt.hashSync(normalizePalavra(palavraSetting.value), 10);
  db.prepare("UPDATE settings SET value = ? WHERE key = 'palavra_semestral'").run(hashedPalavra);
  console.log("Migration: Hashed existing Palavra Semestral.");
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
  
  const saltRounds = 10;
  insert.run("294445", "Alex Araujo de Vasconcellos", "Mestre Instalado", "", bcrypt.hashSync("294445", saltRounds), 1, "1717-06-24", 1, 0);
  insert.run("340196", "Alexandre Barreira Aragão", "Mestre", "", bcrypt.hashSync("340196", saltRounds), 1, "1314-03-18", 1, 0);
  insert.run("304489", "Dirceu de Sousa Bezerra", "Mestre", "", bcrypt.hashSync("304489", saltRounds), 1, "1752-11-04", 0, 0);
  insert.run("347193", "Edmo Magalhães Carneiro Júnior", "Mestre", "", bcrypt.hashSync("347193", saltRounds), 1, "1731-02-01", 1, 0);
  insert.run("343633", "Emanual Chavez Roque", "Mestre", "", bcrypt.hashSync("343633", saltRounds), 1, "1822-08-02", 0, 0);
  insert.run("336610", "Fábio Rodrigues Ferreira", "Mestre", "", bcrypt.hashSync("330958", saltRounds), 1, "2023-01-01", 0, 0);
  insert.run("330958", "Fabrício de Oliveira Carvalho", "Mestre", " ", bcrypt.hashSync("330958", saltRounds), 1, "2022-01-01", 1, 0);
  insert.run("342810", "Felipe Bandeira de Medeiros", "Mestre", "", bcrypt.hashSync("342810", saltRounds), 1, "2022-01-01", 0, 0);
  insert.run("202940", "Francisco Círio Tabosa Maia", "Mestre Instalado", "", bcrypt.hashSync("202940", saltRounds), 1, "2022-01-01", 0, 0);
  insert.run("308163", "Francisco Weber dos Anjos", "Mestre Instalado", "", bcrypt.hashSync("308163", saltRounds), 1, "2022-01-01", 0, 0);
  insert.run("339299", "Francisco Welington Andrade Paiva", "Mestre Instalado", " ", bcrypt.hashSync("339299", saltRounds), 1, "2022-01-01", 0, 0);
  insert.run("339349", "Gabriel de Oliveira Marreiros", "Mestre", "", bcrypt.hashSync("339349", saltRounds), 1, "2022-01-01", 0, 0);
  insert.run("357063", "Gregory Matheus Manoel Silva", "Aprendiz", "", bcrypt.hashSync("357063", saltRounds), 1, "2022-01-01", 1, 0);
  insert.run("330960", "Guilherme Braga dos Santos Rodrigues", "Mestre", "Secretário", bcrypt.hashSync("330960", saltRounds), 1, "2022-01-01", 1, 0);
  insert.run("325077", "Italo Leite da Silva", "Mestre Instalado", "Venerável Mestre", bcrypt.hashSync("325077", saltRounds), 1, "2022-01-01", 1, 0);
  insert.run("355121", "Johnes Gonçalves Madeira", "Aprendiz", "", bcrypt.hashSync("355121", saltRounds), 1, "2022-01-01", 1, 0);
  insert.run("333167", "Jose Arthur Façanha Xenofonte Filho", "Mestre", "", bcrypt.hashSync("333167", saltRounds), 1, "2022-01-01", 0, 0);
  insert.run("351782", "José Diego Dantas de Araújo", "Aprendiz", "", bcrypt.hashSync("351782", saltRounds), 1, "2022-01-01", 1, 0);
  insert.run("271382", "Leonardo de Almeida Monteiro", "Mestre Instalado", "", bcrypt.hashSync("271382", saltRounds), 1, "2022-01-01", 0, 0);
  insert.run("335383", "Levy Sombra de Oliveira Barcelos", "Mestre Instalado", "", bcrypt.hashSync("335383", saltRounds), 1, "2022-01-01", 0, 0);
  insert.run("340197", "Marcelo Holanda Calvacante", "Mestre", "Tesoureiro", bcrypt.hashSync("340197", saltRounds), 1, "2022-01-01", 1, 0);
  insert.run("355122", "Marcus Vinicius Magalhães Pontes", "Aprendiz", "", bcrypt.hashSync("355122", saltRounds), 1, "2022-01-01", 1, 0);
  insert.run("320999", "Paulo Roberto de Lima Carvalho", "Mestre", "", bcrypt.hashSync("320999", saltRounds), 1, "2022-01-01", 0, 0);
  insert.run("330959", "Pedro Felipe Lima Rocha", "Mestre", "1° Vigilante", bcrypt.hashSync("330959", saltRounds), 1, "2022-01-01", 1, 0);
  insert.run("337131", "Pedro Sávio de Oliveira Nobre", "Mestre", "Mestre de Cerimônias", bcrypt.hashSync("337131", saltRounds), 1, "2022-01-01", 1, 0);
  insert.run("335738", "Raul Nixon Costa Saraiva", "Mestre", "", bcrypt.hashSync("335738", saltRounds), 1, "2022-01-01", 0, 0);
  insert.run("342032", "Vagner Mota de Souza", "Mestre Instalado", "", bcrypt.hashSync("342032", saltRounds), 1, "2022-01-01", 0, 0);
  console.log("Seed data inserted successfully.");
}

export default db;

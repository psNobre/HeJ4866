import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import { normalizePalavra } from "../utils/normalize";
import path from "path";
import { runMigrations } from "../utils/migrator";
import { sessionsData, attendanceData } from "./seedData";

const isProd = process.env.NODE_ENV === "production";
const defaultDbName = isProd ? "masonic_lodge_prod.db" : "masonic_lodge_dev.db";
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), defaultDbName);

console.log(`Using database: ${dbPath} (${isProd ? 'PRODUCTION' : 'DEVELOPMENT'})`);
const db = new Database(dbPath);

export function initDB() {
  console.log("Initializing database...");
  try {
    // Run migrations from files
    runMigrations(db);

    // Migration: Add new columns if they don't exist
    const tableInfo = db.prepare("PRAGMA table_info(members)").all() as any[];
    const hasPaymentEndDate = tableInfo.some(col => col.name === 'payment_end_date');
    const hasRegularizationStartDate = tableInfo.some(col => col.name === 'regularization_start_date');

    if (!hasPaymentEndDate) {
      db.prepare("ALTER TABLE members ADD COLUMN payment_end_date TEXT").run();
      console.log("Migration: Added payment_end_date column to members table.");
    }
    if (!hasRegularizationStartDate) {
      db.prepare("ALTER TABLE members ADD COLUMN regularization_start_date TEXT").run();
      console.log("Migration: Added regularization_start_date column to members table.");
    }

    // Migration: Hash existing plain text passwords
    const allMembers = db.prepare("SELECT id, password FROM members").all() as { id: number, password: string }[];
    const hashPasswordStmt = db.prepare("UPDATE members SET password = ? WHERE id = ?");

    db.transaction(() => {
      for (const m of allMembers) {
        if (!m.password.startsWith("$2b$") && !m.password.startsWith("$2a$")) {
          const hashedPassword = bcrypt.hashSync(m.password, 10);
          hashPasswordStmt.run(hashedPassword, m.id);
          console.log(`Migration: Hashed password for member ID ${m.id}`);
        }
      }
    })();

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

    if (memberCount.count === 0) {
      console.log("Seeding initial members...");
      const insert = db.prepare(`
        INSERT INTO members (cim, name, degree, role, password, must_change_password, initiation_date, pays_through_lodge, disconnected, frequency_exempt, permissions, payment_end_date, regularization_start_date, payment_start_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const saltRounds = 10;
      const allPerms = JSON.stringify(['dashboard', 'treasury', 'attendance', 'members', 'settings', 'profile', 'access-control']);
      const treasurerPerms = JSON.stringify(['dashboard', 'treasury', 'members', 'profile']);
      const defaultPerms = JSON.stringify(['dashboard', 'profile']);

      insert.run("294445", "Alex Araujo de Vasconcellos", "Mestre Instalado", "", bcrypt.hashSync("294445", saltRounds), 1, "1717-06-24", 1, 0, 0, defaultPerms, null, "2024-09-26", "2026-02-01");
      insert.run("340196", "Alexandre Barreira Aragão", "Mestre", "", bcrypt.hashSync("340196", saltRounds), 1, "1314-03-18", 1, 0, 1, defaultPerms, null, "2024-10-24", "2024-12-01");
      insert.run("304489", "Dirceu de Sousa Bezerra", "Mestre", "", bcrypt.hashSync("304489", saltRounds), 1, "1752-11-04", 0, 0, 1, defaultPerms, null, "2024-09-26", null);
      insert.run("347193", "Edmo Magalhães Carneiro Júnior", "Mestre", "", bcrypt.hashSync("347193", saltRounds), 1, "1731-02-01", 1, 0, 0, defaultPerms, null, "2025-06-05", "2025-08-01");
      insert.run("343633", "Emanual Chavez Roque", "Mestre", "", bcrypt.hashSync("343633", saltRounds), 1, "1822-08-02", 0, 0, 1, defaultPerms, null, "2025-08-28", null);
      insert.run("336610", "Fábio Rodrigues Ferreira", "Mestre", "", bcrypt.hashSync("336610", saltRounds), 1, "2023-01-01", 0, 0, 1, defaultPerms, null, "2024-09-26", null);
      insert.run("330958", "Fabrício de Oliveira Carvalho", "Mestre", "2° Vigilante", bcrypt.hashSync("330958", saltRounds), 1, "2022-01-01", 1, 0, 0, defaultPerms, null, "2024-09-26", "2024-11-01");
      insert.run("342810", "Felipe Bandeira de Medeiros", "Mestre", "", bcrypt.hashSync("342810", saltRounds), 1, "2022-01-01", 0, 0, 1, defaultPerms, null, "2024-09-26", null);
      insert.run("202940", "Francisco Círio Tabosa Maia", "Mestre Instalado", "", bcrypt.hashSync("202940", saltRounds), 1, "2022-01-01", 0, 0, 1, defaultPerms, null, "2024-09-26", null);
      insert.run("308163", "Francisco Weber dos Anjos", "Mestre Instalado", "", bcrypt.hashSync("308163", saltRounds), 1, "2022-01-01", 0, 0, 1, defaultPerms, null, "2024-09-26", null);
      insert.run("339299", "Francisco Welington Andrade Paiva", "Mestre Instalado", " ", bcrypt.hashSync("339299", saltRounds), 1, "2022-01-01", 0, 0, 1, defaultPerms, null, "2024-09-26", null);
      insert.run("339349", "Gabriel de Oliveira Marreiros", "Mestre", "", bcrypt.hashSync("339349", saltRounds), 1, "2022-01-01", 0, 0, 1, defaultPerms, null, "2024-09-26", null);
      insert.run("357063", "Gregory Matheus Manoel Silva", "Aprendiz", "", bcrypt.hashSync("357063", saltRounds), 1, "2025-10-23", 1, 0, 0, defaultPerms, null, "2025-10-23", "2025-11-01");
      insert.run("330960", "Guilherme Braga dos Santos Rodrigues", "Mestre", "Secretário", bcrypt.hashSync("330960", saltRounds), 1, "2022-01-01", 1, 0, 0, defaultPerms, null, "2024-09-26", "2024-11-01");
      insert.run("325077", "Italo Leite da Silva", "Mestre Instalado", "Venerável Mestre", bcrypt.hashSync("325077", saltRounds), 1, "2022-01-01", 1, 0, 0, allPerms, null, "2024-09-26", "2024-11-01");
      insert.run("355121", "Johnes Gonçalves Madeira", "Aprendiz", "", bcrypt.hashSync("355121", saltRounds), 1, "2025-08-09", 1, 0, 0, defaultPerms, null, "2025-08-09", "2025-09-01");
      insert.run("333167", "Jose Arthur Façanha Xenofonte Filho", "Mestre", "", bcrypt.hashSync("333167", saltRounds), 1, "2022-01-01", 0, 0, 1, defaultPerms, null, "2024-09-26", null);
      insert.run("351782", "José Diego Dantas de Araújo", "Aprendiz", "", bcrypt.hashSync("351782", saltRounds), 1, "2025-03-16", 1, 0, 0, defaultPerms, null, "2025-03-16", "2025-04-01");
      insert.run("271382", "Leonardo de Almeida Monteiro", "Mestre Instalado", "", bcrypt.hashSync("271382", saltRounds), 1, "2022-01-01", 0, 0, 1, defaultPerms, null, "2024-09-26", null);
      insert.run("335383", "Levy Sombra de Oliveira Barcelos", "Mestre Instalado", "", bcrypt.hashSync("335383", saltRounds), 1, "2022-01-01", 0, 0, 1, defaultPerms, null, "2024-09-26", null);
      insert.run("340197", "Marcelo Holanda Calvacante", "Mestre", "Tesoureiro", bcrypt.hashSync("340197", saltRounds), 1, "2022-01-01", 1, 0, 0, treasurerPerms, null, "2024-10-24", "2024-12-01");
      insert.run("355122", "Marcus Vinicius Magalhães Pontes", "Aprendiz", "", bcrypt.hashSync("355122", saltRounds), 1, "2025-08-09", 1, 0, 0, defaultPerms, null, "2025-08-09", "2025-09-01");
      insert.run("320999", "Paulo Roberto de Lima Carvalho", "Mestre", "", bcrypt.hashSync("320999", saltRounds), 1, "2022-01-01", 0, 0, 1, defaultPerms, null, "2024-09-26", null);
      insert.run("330959", "Pedro Felipe Lima Rocha", "Mestre", "1° Vigilante", bcrypt.hashSync("330959", saltRounds), 1, "2022-01-01", 1, 0, 0, defaultPerms, null, "2024-09-26", "2024-11-01");
      insert.run("337131", "Pedro Sávio de Oliveira Nobre", "Mestre", "Chanceler", bcrypt.hashSync("337131", saltRounds), 1, "2022-01-01", 1, 0, 0, allPerms, null, "2024-09-26", "2024-11-01");
      insert.run("335738", "Raul Nixon Costa Saraiva", "Mestre", "", bcrypt.hashSync("335738", saltRounds), 1, "2022-01-01", 0, 0, 1, defaultPerms, null, "2024-09-26", null);
      insert.run("342032", "Vagner Mota de Souza", "Mestre Instalado", "", bcrypt.hashSync("342032", saltRounds), 1, "2022-01-01", 0, 0, 1, defaultPerms, null, "2024-09-26", null);
      insert.run("360001", "Leonardo Teófilo Lioba", "Aprendiz", "", bcrypt.hashSync("360001", saltRounds), 1, "2026-02-26", 1, 0, 0, defaultPerms, null, "2026-02-26", null);
      insert.run("360002", "Sandro Silveira Lima", "Aprendiz", "", bcrypt.hashSync("360002", saltRounds), 1, "2026-02-26", 1, 0, 0, defaultPerms, null, "2026-02-26", null);
      console.log("Seed data inserted successfully.");

      // Seed Sessions
      console.log(`Seeding ${sessionsData.length} sessions...`);
      const insertSession = db.prepare(`
        INSERT INTO sessions (date, type, degree, description) 
        VALUES (?, ?, ?, ?)
      `);

      for (const s of sessionsData) {
        insertSession.run(s[0], s[2], s[3], s[4]);
      }

      // Seed Attendance
      console.log(`Seeding ${attendanceData.length} attendance records...`);
      const insertAttendance = db.prepare(`
        INSERT OR IGNORE INTO attendance (session_id, member_id, present) 
        VALUES (?, ?, ?)
      `);

      for (const a of attendanceData) {
        const member = db.prepare("SELECT id FROM members WHERE name = ?").get(a[0]) as { id: number } | undefined;
        // Match session by date (first 10 chars of the title string in seedData)
        const sessionDate = a[1].substring(0, 10);
        const session = db.prepare("SELECT id FROM sessions WHERE date = ?").get(sessionDate) as { id: number } | undefined;
        if (member && session) {
          try {
            insertAttendance.run(session.id, member.id, 1);
          } catch (err) {
            // Ignore duplicates
          }
        }
      }
      console.log("Sessions and attendance seeded successfully.");
    } else {
      // Migration for existing members: Ensure Pedro Sávio and Italo have full access
      const allPerms = JSON.stringify(['dashboard', 'treasury', 'attendance', 'members', 'settings', 'profile', 'access-control']);
      const treasurerPerms = JSON.stringify(['dashboard', 'treasury', 'members', 'profile']);
      const defaultPerms = JSON.stringify(['dashboard', 'profile']);

      db.prepare("UPDATE members SET permissions = ? WHERE name LIKE '%Pedro Sávio%' OR name LIKE '%Italo Leite%'").run(allPerms);
      db.prepare("UPDATE members SET permissions = ? WHERE role = 'Tesoureiro' AND permissions IS NULL").run(treasurerPerms);
      db.prepare("UPDATE members SET permissions = ? WHERE permissions IS NULL").run(defaultPerms);
      console.log("Migration: Updated permissions for existing members.");

      // Migration: Seed sessions and attendance if they don't exist
      console.log("Checking for missing sessions and attendance...");
      const insertSession = db.prepare(`
        INSERT INTO sessions (date, type, degree, description) 
        VALUES (?, ?, ?, ?)
      `);

      const insertAttendance = db.prepare(`
        INSERT OR IGNORE INTO attendance (session_id, member_id, present) 
        VALUES (?, ?, ?)
      `);

      let sessionsAdded = 0;
      for (const s of sessionsData) {
        const exists = db.prepare("SELECT id FROM sessions WHERE date = ?").get(s[0]);
        if (!exists) {
          insertSession.run(s[0], s[2], s[3], s[4]);
          sessionsAdded++;
        }
      }
      if (sessionsAdded > 0) console.log(`Migration: Added ${sessionsAdded} missing sessions.`);

      let attendanceAdded = 0;
      for (const a of attendanceData) {
        const member = db.prepare("SELECT id FROM members WHERE name = ?").get(a[0]) as { id: number } | undefined;
        const sessionDate = a[1].substring(0, 10);
        const session = db.prepare("SELECT id FROM sessions WHERE date = ?").get(sessionDate) as { id: number } | undefined;
        if (member && session) {
          try {
            const info = insertAttendance.run(session.id, member.id, 1);
            if (info.changes > 0) {
              attendanceAdded++;
            }
          } catch (err) {
            // Ignore duplicates
          }
        }
      }
      if (attendanceAdded > 0) console.log(`Migration: Added ${attendanceAdded} missing attendance records.`);
      console.log("Sessions and attendance migration check completed.");

      const missingMembers = [];

      const insertMember = db.prepare(`
        INSERT INTO members (cim, name, degree, role, password, must_change_password, initiation_date, pays_through_lodge, disconnected, permissions) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const m of missingMembers) {
        const exists = db.prepare("SELECT id FROM members WHERE cim = ?").get(m[0]);
        if (!exists) {
          insertMember.run(m[0], m[1], m[2], m[3], bcrypt.hashSync(m[4] as string, 10), m[5], m[6], m[7], m[8], m[9]);
          console.log(`Migration: Added missing member ${m[1]}`);
        }
      }

      // Migration: Update payment_start_date for specific members
      console.log("Migration: Updating payment_start_date for specific members...");
      const updatePaymentStart = db.prepare("UPDATE members SET payment_start_date = ? WHERE name LIKE ?");
      const paymentStartDates = [
        ["2024-11-01", "%Italo Leite da Silva%"],
        ["2024-11-01", "%Fabrício de Oliveira Carvalho%"],
        ["2024-11-01", "%Pedro Felipe Lima Rocha%"],
        ["2024-11-01", "%Guilherme Braga dos Santos Rodrigues%"],
        ["2024-11-01", "%Pedro Sávio de Oliveira Nobre%"],
        ["2024-12-01", "%Alexandre Barreira Aragão%"],
        ["2024-12-01", "%Marcelo Holanda Calvacante%"],
        ["2025-04-01", "%José Diego Dantas de Araújo%"],
        ["2025-08-01", "%Edmo Magalhães Carneiro Júnior%"],
        ["2025-09-01", "%Johnes Gonçalves Madeira%"],
        ["2025-09-01", "%Marcus Vinicius Magalhães Pontes%"],
        ["2025-11-01", "%Gregory Matheus Manoel Silva%"],
        ["2026-02-01", "%Alex Araujo de Vasconcellos%"]
      ];

      db.transaction(() => {
        for (const [date, namePattern] of paymentStartDates) {
          updatePaymentStart.run(date, namePattern);
        }
      })();
      console.log("Migration: payment_start_date updated successfully.");
    }
  } catch (error) {
    console.error("DATABASE INITIALIZATION ERROR:", error);
    throw error;
  }
}

export default db;

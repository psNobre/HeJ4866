import Database from "better-sqlite3";
import path from "path";

const isProd = process.env.NODE_ENV === "production";
const defaultDbName = isProd ? "masonic_lodge_prod.db" : "masonic_lodge_dev.db";
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), defaultDbName);

const db = new Database(dbPath);

try {
  const sessions = db.prepare("SELECT * FROM sessions ORDER BY date DESC LIMIT 5").all();
  console.log("Latest sessions:", sessions);
  
  const seededSession = db.prepare("SELECT * FROM sessions WHERE title LIKE '%2024-10-24%'").get();
  console.log("Seeded session:", seededSession);
  if (seededSession) {
    const attendance = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE session_id = ?").get(seededSession.id);
    console.log(`Attendance count for seeded session ${seededSession.id}:`, attendance.count);
  }
} catch (error) {
  console.error("Error checking database:", error);
} finally {
  db.close();
}

import Database from "better-sqlite3";
import path from "path";

const isProd = process.env.NODE_ENV === "production";
const defaultDbName = isProd ? "masonic_lodge_prod.db" : "masonic_lodge_dev.db";
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), defaultDbName);

const db = new Database(dbPath);

try {
  const sessions = db.prepare("SELECT COUNT(*) as count FROM sessions").get();
  const attendance = db.prepare("SELECT COUNT(*) as count FROM attendance").get();
  const members = db.prepare("SELECT COUNT(*) as count FROM members").get();
  
  console.log("Sessions count:", sessions.count);
  console.log("Attendance count:", attendance.count);
  console.log("Members count:", members.count);
  
  if (sessions.count > 0) {
    const firstSession = db.prepare("SELECT * FROM sessions LIMIT 1").get();
    console.log("First session sample:", firstSession);
  }
} catch (error) {
  console.error("Error checking database:", error);
} finally {
  db.close();
}

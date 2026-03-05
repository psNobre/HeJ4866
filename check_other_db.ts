import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "masonic_lodge.db");
const db = new Database(dbPath);

try {
  const sessions = db.prepare("SELECT COUNT(*) as count FROM sessions").get();
  console.log("masonic_lodge.db sessions count:", sessions.count);
} catch (error) {
  console.error("Error checking masonic_lodge.db:", error);
} finally {
  db.close();
}

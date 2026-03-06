-- Initial Schema
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
  payment_end_date TEXT,
  regularization_start_date TEXT,
  pays_through_lodge INTEGER DEFAULT 1,
  disconnected INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  permissions TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

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

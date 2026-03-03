import { Request, Response } from "express";
import db from "../models/db";

export const getSessions = (req: Request, res: Response) => {
  const sessions = db.prepare("SELECT * FROM sessions ORDER BY date DESC").all();
  res.json(sessions);
};

export const createSession = (req: Request, res: Response) => {
  const { date, title, type, degree, description, attendance } = req.body;
  const info = db.prepare("INSERT INTO sessions (date, title, type, degree, description) VALUES (?, ?, ?, ?, ?)").run(date, title, type, degree, description);
  const sessionId = info.lastInsertRowid;

  const insertAttendance = db.prepare("INSERT INTO attendance (session_id, member_id, present) VALUES (?, ?, ?)");
  for (const memberId of Object.keys(attendance)) {
    insertAttendance.run(sessionId, memberId, attendance[memberId] ? 1 : 0);
  }
  res.json({ id: sessionId });
};

export const getAttendance = (req: Request, res: Response) => {
  const attendance = db.prepare(`
    SELECT m.id, m.name, m.degree, COALESCE(a.present, 0) as present
    FROM members m
    LEFT JOIN attendance a ON m.id = a.member_id AND a.session_id = ?
  `).all(req.params.sessionId);
  res.json(attendance);
};

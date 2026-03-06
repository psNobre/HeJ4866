import { Request, Response } from "express";
import db from "../models/db";

export const getSessions = (req: Request, res: Response) => {
  const sessions = db.prepare(`
    SELECT s.*, 
    (SELECT COUNT(*) FROM attendance a WHERE a.session_id = s.id AND a.present = 1) as presentCount,
    (SELECT COUNT(*) FROM attendance a WHERE a.session_id = s.id) as totalCount
    FROM sessions s 
    ORDER BY date DESC
  `).all();
  res.json(sessions);
};

export const createSession = (req: Request, res: Response) => {
  const { date, type, degree, description, attendance } = req.body;
  const info = db.prepare("INSERT INTO sessions (date, type, degree, description) VALUES (?, ?, ?, ?)").run(date, type, degree, description);
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
    WHERE m.disconnected = 0 OR m.id IN (SELECT member_id FROM attendance WHERE session_id = ?)
    ORDER BY m.name ASC
  `).all(req.params.sessionId, req.params.sessionId);
  res.json(attendance);
};

export const updateSession = (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, type, degree, description, attendance } = req.body;
  console.log(`Updating session ${id}:`, { date, type, degree });

  const update = db.transaction((sessionId: string, sessionData: any, attendanceData: any) => {
    db.prepare("UPDATE sessions SET date = ?, type = ?, degree = ?, description = ? WHERE id = ?")
      .run(sessionData.date, sessionData.type, sessionData.degree, sessionData.description, sessionId);

    if (attendanceData) {
      // Delete old attendance and insert new
      db.prepare("DELETE FROM attendance WHERE session_id = ?").run(sessionId);
      const insertAttendance = db.prepare("INSERT INTO attendance (session_id, member_id, present) VALUES (?, ?, ?)");
      for (const memberId of Object.keys(attendanceData)) {
        insertAttendance.run(sessionId, memberId, attendanceData[memberId] ? 1 : 0);
      }
    }
  });

  try {
    update(id, { date, type, degree, description }, attendance);
    res.json({ success: true });
  } catch (error) {
    console.error(`Error updating session ${id}:`, error);
    res.status(500).json({ error: "Erro ao atualizar sessão" });
  }
};

export const deleteSession = (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`Deleting session ${id}`);

  const del = db.transaction((sessionId: string) => {
    db.prepare("DELETE FROM attendance WHERE session_id = ?").run(sessionId);
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
  });

  try {
    del(id);
    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting session ${id}:`, error);
    res.status(500).json({ error: "Erro ao excluir sessão" });
  }
};

export const getMemberAttendanceStats = (req: Request, res: Response) => {
  const { filter } = req.query; // 'year' or '12months' or 'all'
  let dateFilter = "";

  if (filter === 'year') {
    const currentYear = new Date().getFullYear();
    dateFilter = `AND s.date >= '${currentYear}-01-01'`;
  } else if (filter === '12months') {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    dateFilter = `AND s.date >= '${twelveMonthsAgo.toISOString().split('T')[0]}'`;
  }

  // We only consider sessions that have already occurred
  const today = new Date().toISOString().split('T')[0];

  const stats = db.prepare(`
    SELECT 
      m.id, 
      m.name, 
      m.degree,
      m.frequency_exempt as frequencyExempt,
      (
        SELECT COUNT(*) 
        FROM sessions s
        WHERE s.date <= ?
        AND s.date >= COALESCE(m.regularization_start_date, m.initiation_date, '1900-01-01')
        ${dateFilter}
      ) as totalSessions,
      CASE 
        WHEN m.frequency_exempt = 1 THEN 
          (
            SELECT COUNT(*) 
            FROM sessions s
            WHERE s.date <= ?
            AND s.date >= COALESCE(m.regularization_start_date, m.initiation_date, '1900-01-01')
            ${dateFilter}
          )
        ELSE
          (
            SELECT COUNT(*) 
            FROM attendance a 
            JOIN sessions s ON a.session_id = s.id 
            WHERE a.member_id = m.id 
            AND a.present = 1 
            AND s.date <= ?
            AND s.date >= COALESCE(m.regularization_start_date, m.initiation_date, '1900-01-01')
            ${dateFilter}
          )
      END as presences,
      CASE 
        WHEN m.frequency_exempt = 1 THEN 0
        ELSE
          (
            SELECT COUNT(*) 
            FROM sessions s
            WHERE s.date <= ?
            AND s.date >= COALESCE(m.regularization_start_date, m.initiation_date, '1900-01-01')
            ${dateFilter}
            AND NOT EXISTS (
              SELECT 1 FROM attendance a 
              WHERE a.session_id = s.id 
              AND a.member_id = m.id 
              AND a.present = 1
            )
          )
      END as absences
    FROM members m
    WHERE m.disconnected = 0
    GROUP BY m.id
    ORDER BY m.name ASC
  `).all(today, today, today, today);

  res.json(stats);
};

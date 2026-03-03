import { Request, Response } from "express";
import db from "../models/db";

export const getTransactions = (req: Request, res: Response) => {
  const transactions = db.prepare(`
    SELECT t.*, m.name as memberName 
    FROM transactions t 
    LEFT JOIN members m ON t.member_id = m.id 
    ORDER BY t.date DESC
  `).all();
  res.json(transactions);
};

export const createTransaction = (req: Request, res: Response) => {
  const { date, description, amount, type, category, memberId, month, year } = req.body;
  db.prepare("INSERT INTO transactions (date, description, amount, type, category, member_id, month, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(date, description, amount, type, category, memberId || null, month || null, year || null);
  res.json({ success: true });
};

export const getStats = (req: Request, res: Response) => {
  const balance = db.prepare(`
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM transactions
  `).get() as { income: number, expense: number };

  const memberStats = db.prepare("SELECT COUNT(*) as total FROM members WHERE disconnected = 0").get() as { total: number };
  
  const lastSession = db.prepare("SELECT id FROM sessions ORDER BY date DESC LIMIT 1").get() as { id: number } | undefined;
  let attendanceRate = 0;
  if (lastSession) {
    const att = db.prepare("SELECT SUM(present) as present, COUNT(*) as total FROM attendance WHERE session_id = ?").get(lastSession.id) as { present: number, total: number };
    attendanceRate = att.total > 0 ? (att.present / att.total) * 100 : 0;
  }

  res.json({
    balance: (balance.income || 0) - (balance.expense || 0),
    income: balance.income || 0,
    expense: balance.expense || 0,
    activeMembers: memberStats.total,
    lastAttendanceRate: Math.round(attendanceRate)
  });
};

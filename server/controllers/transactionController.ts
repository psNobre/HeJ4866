import type { Request, Response } from "express";
import db from "../models/db.ts";

export const getTransactions = (req: Request, res: Response) => {
  const transactions = db.prepare(`
    SELECT t.*, m.name as memberName,
    (SELECT GROUP_CONCAT(month || '/' || year, ', ') FROM member_payments WHERE transaction_id = t.id) as paymentMonths
    FROM transactions t 
    LEFT JOIN members m ON t.member_id = m.id 
    ORDER BY t.date DESC
  `).all();
  res.json(transactions);
};

export const createTransaction = (req: Request, res: Response) => {
  const { date, description, amount, type, category, memberId, month, year, payments } = req.body;
  
  const insertTransaction = db.prepare("INSERT INTO transactions (date, description, amount, type, category, member_id, month, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  const insertPayment = db.prepare("INSERT INTO member_payments (transaction_id, member_id, month, year) VALUES (?, ?, ?, ?)");

  const create = db.transaction((data: any) => {
    const info = insertTransaction.run(
      data.date, 
      data.description, 
      data.amount, 
      data.type, 
      data.category, 
      data.memberId || null, 
      data.month || null, 
      data.year || null
    );
    const transactionId = info.lastInsertRowid;

    if (data.category === 'Mensalidade' && data.payments && Array.isArray(data.payments)) {
      for (const p of data.payments) {
        insertPayment.run(transactionId, data.memberId, p.month, p.year);
      }
    } else if (data.category === 'Mensalidade' && data.month && data.year) {
      // Fallback for single payment if payments array is not provided
      insertPayment.run(transactionId, data.memberId, data.month, data.year);
    }
    
    return transactionId;
  });

  try {
    const id = create({ date, description, amount, type, category, memberId, month, year, payments });
    res.json({ success: true, id });
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    res.status(400).json({ error: error.message });
  }
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

export const updateTransaction = (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, description, amount, type, category, memberId, month, year, payments } = req.body;

  const updateTransactionStmt = db.prepare(`
    UPDATE transactions 
    SET date = ?, description = ?, amount = ?, type = ?, category = ?, member_id = ?, month = ?, year = ?
    WHERE id = ?
  `);
  const deletePaymentsStmt = db.prepare("DELETE FROM member_payments WHERE transaction_id = ?");
  const insertPaymentStmt = db.prepare("INSERT INTO member_payments (transaction_id, member_id, month, year) VALUES (?, ?, ?, ?)");

  const update = db.transaction((data: any) => {
    updateTransactionStmt.run(
      data.date, 
      data.description, 
      data.amount, 
      data.type, 
      data.category, 
      data.memberId || null, 
      data.month || null, 
      data.year || null,
      data.id
    );

    deletePaymentsStmt.run(data.id);

    if (data.category === 'Mensalidade' && data.payments && Array.isArray(data.payments)) {
      for (const p of data.payments) {
        insertPaymentStmt.run(data.id, data.memberId, p.month, p.year);
      }
    } else if (data.category === 'Mensalidade' && data.month && data.year) {
      insertPaymentStmt.run(data.id, data.memberId, data.month, data.year);
    }
  });

  try {
    update({ id, date, description, amount, type, category, memberId, month, year, payments });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error updating transaction:", error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteTransaction = (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const del = db.transaction(() => {
      db.prepare("DELETE FROM member_payments WHERE transaction_id = ?").run(id);
      db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
    });
    del();
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting transaction:", error);
    res.status(400).json({ error: error.message });
  }
};

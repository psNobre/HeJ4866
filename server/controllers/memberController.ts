import { Request, Response } from "express";
import bcrypt from "bcrypt";
import db from "../models/db.ts";

export const getMembers = (req: Request, res: Response) => {
  const members = db.prepare(`
    SELECT 
      id, cim, name, degree, role, 
      initiation_date as initiationDate, 
      elevation_date as elevationDate, 
      exaltation_date as exaltationDate, 
      payment_start_date as paymentStartDate,
      payment_end_date as paymentEndDate,
      regularization_start_date as regularizationStartDate,
      pays_through_lodge as paysThroughLodge, 
      disconnected, active,
      must_change_password as mustChangePassword,
      frequency_exempt as frequencyExempt,
      permissions
    FROM members
  `).all();
  
  const parsedMembers = members.map((m: any) => ({
    ...m,
    permissions: m.permissions ? JSON.parse(m.permissions) : []
  }));
  
  res.json(parsedMembers);
};

export const createMember = (req: Request, res: Response) => {
  const { cim, name, degree, role, initiationDate, elevationDate, exaltationDate, paymentStartDate, paymentEndDate, regularizationStartDate, paysThroughLodge, disconnected, frequencyExempt } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(cim.toString(), 10);
    db.prepare(`
      INSERT INTO members (cim, name, degree, role, password, must_change_password, initiation_date, elevation_date, exaltation_date, payment_start_date, payment_end_date, regularization_start_date, pays_through_lodge, disconnected, frequency_exempt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      cim, 
      name, 
      degree, 
      role === "" ? null : role, 
      hashedPassword, 
      1, 
      initiationDate, 
      elevationDate, 
      exaltationDate, 
      paymentStartDate, 
      paymentEndDate, 
      regularizationStartDate, 
      (paysThroughLodge === true || paysThroughLodge === '1' || paysThroughLodge === 1) ? 1 : 0, 
      (disconnected === true || disconnected === '1' || disconnected === 1) ? 1 : 0, 
      (frequencyExempt === true || frequencyExempt === '1' || frequencyExempt === 1) ? 1 : 0
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const toggleDisconnected = (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    db.prepare("UPDATE members SET disconnected = 1 - disconnected WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const togglePays = (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    db.prepare("UPDATE members SET pays_through_lodge = 1 - pays_through_lodge WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const toggleFrequencyExempt = (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    db.prepare("UPDATE members SET frequency_exempt = 1 - frequency_exempt WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProfile = (req: Request, res: Response) => {
  const { id, name, password } = req.body;
  try {
    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      db.prepare("UPDATE members SET name = ?, password = ? WHERE id = ?").run(name, hashedPassword, id);
    } else {
      db.prepare("UPDATE members SET name = ? WHERE id = ?").run(name, id);
    }
    
    const updatedUser = db.prepare(`
      SELECT 
        id, cim, name, degree, role, 
        initiation_date as initiationDate, 
        elevation_date as elevationDate, 
        exaltation_date as exaltationDate, 
        payment_start_date as paymentStartDate,
        payment_end_date as paymentEndDate,
        regularization_start_date as regularizationStartDate,
        pays_through_lodge as paysThroughLodge, 
        disconnected, active,
        must_change_password as mustChangePassword,
        frequency_exempt as frequencyExempt,
        permissions
      FROM members WHERE id = ?
    `).get(id);
    
    if (updatedUser) {
      (updatedUser as any).permissions = (updatedUser as any).permissions ? JSON.parse((updatedUser as any).permissions) : [];
    }
    
    res.json({ success: true, user: updatedUser });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateMember = (req: Request, res: Response) => {
  const { id } = req.params;
  const { cim, name, degree, role, initiationDate, elevationDate, exaltationDate, paymentStartDate, paymentEndDate, regularizationStartDate, paysThroughLodge, disconnected, frequencyExempt } = req.body;
  try {
    db.prepare(`
      UPDATE members 
      SET cim = ?, name = ?, degree = ?, role = ?, initiation_date = ?, elevation_date = ?, exaltation_date = ?, payment_start_date = ?, payment_end_date = ?, regularization_start_date = ?, pays_through_lodge = ?, disconnected = ?, frequency_exempt = ?
      WHERE id = ?
    `).run(
      cim, 
      name, 
      degree, 
      role === "" ? null : role, 
      initiationDate, 
      elevationDate, 
      exaltationDate, 
      paymentStartDate,
      paymentEndDate,
      regularizationStartDate,
      (paysThroughLodge === true || paysThroughLodge === '1' || paysThroughLodge === 1) ? 1 : 0, 
      (disconnected === true || disconnected === '1' || disconnected === 1) ? 1 : 0, 
      (frequencyExempt === true || frequencyExempt === '1' || frequencyExempt === 1) ? 1 : 0,
      id
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMemberStats = (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Attendance stats
    const member = db.prepare("SELECT initiation_date as initiationDate, regularization_start_date as regularizationStartDate, payment_start_date as paymentStartDate, pays_through_lodge as paysThroughLodge, frequency_exempt as frequencyExempt FROM members WHERE id = ?").get(id) as any;
    
    let attendanceRate = 0;
    if (member.frequencyExempt) {
      attendanceRate = 100;
    } else {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      const dateLimit = twelveMonthsAgo.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      const frequencyBaseDate = member.regularizationStartDate || member.initiationDate || '1900-01-01';

      const stats = db.prepare(`
        SELECT 
          (
            SELECT COUNT(*) 
            FROM sessions s
            WHERE s.date <= ?
            AND s.date >= ?
            AND s.date >= ?
          ) as total,
          (
            SELECT COUNT(*) 
            FROM attendance a 
            JOIN sessions s ON a.session_id = s.id 
            WHERE a.member_id = ? 
            AND a.present = 1 
            AND s.date <= ?
            AND s.date >= ?
            AND s.date >= ?
          ) as attended
      `).get(today, dateLimit, frequencyBaseDate, id, today, dateLimit, frequencyBaseDate) as { total: number, attended: number };
      
      attendanceRate = stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0;
    }

    // Compliance stats
    if (!member.paysThroughLodge) {
      return res.json({ attendanceRate, compliance: 'Isento', missingMonths: [] });
    }

    const startDateStr = member.paymentStartDate || member.initiationDate;
    if (!startDateStr) {
      return res.json({ attendanceRate, compliance: 'Sem Data', missingMonths: [] });
    }

    const startDate = new Date(startDateStr);
    const endDate = member.paymentEndDate ? new Date(member.paymentEndDate) : new Date();
    const now = new Date();
    const limitDate = endDate < now ? endDate : now;

    const paidTransactions = db.prepare(`
      SELECT month, year 
      FROM member_payments 
      WHERE member_id = ?
    `).all(id) as { month: number, year: number }[];

    const paidSet = new Set();
    paidTransactions.forEach(p => {
      paidSet.add(`${p.month}-${p.year}`);
    });

    const missingMonths: string[] = [];
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (current <= limitDate) {
      const m = current.getMonth() + 1;
      const y = current.getFullYear();
      const key = `${m}-${y}`;
      
      if (!paidSet.has(key)) {
        const monthLabel = current.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        missingMonths.push(monthLabel);
      }
      current.setMonth(current.getMonth() + 1);
    }

    const compliance = missingMonths.length <= 0 ? 'Adimplente' : 'Inadimplente';

    res.json({ 
      attendanceRate, 
      compliance, 
      missingMonths,
      totalPayments: paidTransactions.length,
      requiredPayments: paidTransactions.length + missingMonths.length // This is a bit dynamic
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMemberSessions = (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const sessions = db.prepare(`
      SELECT s.* 
      FROM sessions s
      JOIN attendance a ON s.id = a.session_id
      WHERE a.member_id = ? AND a.present = 1
      ORDER BY s.date DESC
    `).all(id);
    res.json(sessions);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMissingMonths = (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const member = db.prepare("SELECT initiation_date as initiationDate, payment_start_date as paymentStartDate, pays_through_lodge as paysThroughLodge FROM members WHERE id = ?").get(id) as any;
    
    if (!member || !member.paysThroughLodge) {
      return res.json([]);
    }

    const startDateStr = member.paymentStartDate || member.initiationDate;
    if (!startDateStr) {
      return res.json([]);
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(); // Only up to current month
    const limitDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    const paidTransactions = db.prepare(`
      SELECT month, year 
      FROM member_payments 
      WHERE member_id = ?
    `).all(id) as { month: number, year: number }[];

    const paidSet = new Set();
    paidTransactions.forEach(p => {
      paidSet.add(`${p.month}-${p.year}`);
    });

    const missingMonths: { month: number, year: number, label: string }[] = [];
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    
    while (current <= limitDate) {
      const m = current.getMonth() + 1;
      const y = current.getFullYear();
      const key = `${m}-${y}`;
      
      if (!paidSet.has(key)) {
        const label = current.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        missingMonths.push({ month: m, year: y, label });
      }
      current.setMonth(current.getMonth() + 1);
    }

    res.json(missingMonths);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updatePermissions = (req: Request, res: Response) => {
  const { id } = req.params;
  const { permissions } = req.body;
  try {
    db.prepare("UPDATE members SET permissions = ? WHERE id = ?").run(JSON.stringify(permissions), id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

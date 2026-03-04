import { Request, Response } from "express";
import bcrypt from "bcrypt";
import db from "../models/db";

export const getMembers = (req: Request, res: Response) => {
  const members = db.prepare(`
    SELECT 
      id, cim, name, degree, role, 
      initiation_date as initiationDate, 
      elevation_date as elevationDate, 
      exaltation_date as exaltationDate, 
      payment_start_date as paymentStartDate,
      pays_through_lodge as paysThroughLodge, 
      disconnected, active,
      must_change_password as mustChangePassword,
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
  const { cim, name, degree, role, initiationDate, elevationDate, exaltationDate, paymentStartDate, paysThroughLodge, disconnected } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(cim.toString(), 10);
    db.prepare(`
      INSERT INTO members (cim, name, degree, role, password, must_change_password, initiation_date, elevation_date, exaltation_date, payment_start_date, pays_through_lodge, disconnected) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(cim, name, degree, role === "" ? null : role, hashedPassword, 1, initiationDate, elevationDate, exaltationDate, paymentStartDate, paysThroughLodge ? 1 : 0, disconnected ? 1 : 0);
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
        pays_through_lodge as paysThroughLodge, 
        disconnected, active,
        must_change_password as mustChangePassword,
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
  const { cim, name, degree, role, initiationDate, elevationDate, exaltationDate, paymentStartDate, paysThroughLodge, disconnected } = req.body;
  try {
    db.prepare(`
      UPDATE members 
      SET cim = ?, name = ?, degree = ?, role = ?, initiation_date = ?, elevation_date = ?, exaltation_date = ?, payment_start_date = ?, pays_through_lodge = ?, disconnected = ?
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
      paysThroughLodge ? 1 : 0, 
      disconnected ? 1 : 0,
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
    const attendance = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN present = 1 THEN 1 ELSE 0 END) as attended
      FROM attendance
      WHERE member_id = ?
    `).get(id) as { total: number, attended: number };

    const attendanceRate = attendance.total > 0 ? Math.round((attendance.attended / attendance.total) * 100) : 0;

    // Compliance stats
    const member = db.prepare("SELECT initiation_date as initiationDate, payment_start_date as paymentStartDate, pays_through_lodge as paysThroughLodge FROM members WHERE id = ?").get(id) as any;
    
    if (!member.paysThroughLodge) {
      return res.json({ attendanceRate, compliance: 'Isento', missingMonths: [] });
    }

    const startDateStr = member.paymentStartDate || member.initiationDate;
    if (!startDateStr) {
      return res.json({ attendanceRate, compliance: 'Sem Data', missingMonths: [] });
    }

    const startDate = new Date(startDateStr);
    const now = new Date();

    const paidTransactions = db.prepare(`
      SELECT month, year 
      FROM transactions 
      WHERE member_id = ? AND category = 'Mensalidade' AND type = 'income'
    `).all(id) as { month: number | null, year: number | null }[];

    const paidSet = new Set();
    let oldPaymentsCount = 0;

    paidTransactions.forEach(p => {
      if (p.month && p.year) {
        paidSet.add(`${p.month}-${p.year}`);
      } else {
        oldPaymentsCount++;
      }
    });

    const missingMonths: string[] = [];
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (current <= now) {
      const m = current.getMonth() + 1;
      const y = current.getFullYear();
      const key = `${m}-${y}`;
      
      if (paidSet.has(key)) {
        // Already paid
      } else if (oldPaymentsCount > 0) {
        // Use one of the old payments to cover this month
        oldPaymentsCount--;
      } else {
        // Truly missing
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

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
      must_change_password as mustChangePassword
    FROM members
  `).all();
  res.json(members);
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
        must_change_password as mustChangePassword
      FROM members WHERE id = ?
    `).get(id);
    
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

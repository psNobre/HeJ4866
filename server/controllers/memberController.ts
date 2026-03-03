import { Request, Response } from "express";
import db from "../models/db";

export const getMembers = (req: Request, res: Response) => {
  const members = db.prepare(`
    SELECT 
      id, cim, name, degree, role, 
      initiation_date as initiationDate, 
      elevation_date as elevationDate, 
      exaltation_date as exaltationDate, 
      pays_through_lodge as paysThroughLodge, 
      disconnected, active,
      must_change_password as mustChangePassword
    FROM members
  `).all();
  res.json(members);
};

export const createMember = (req: Request, res: Response) => {
  const { cim, name, degree, role, initiationDate, elevationDate, exaltationDate, paysThroughLodge, disconnected } = req.body;
  try {
    db.prepare(`
      INSERT INTO members (cim, name, degree, role, password, must_change_password, initiation_date, elevation_date, exaltation_date, pays_through_lodge, disconnected) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(cim, name, degree, role === "" ? null : role, cim, 1, initiationDate, elevationDate, exaltationDate, paysThroughLodge ? 1 : 0, disconnected ? 1 : 0);
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

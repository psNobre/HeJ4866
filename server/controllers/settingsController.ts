import { Request, Response } from "express";
import db from "../models/db";

export const getPalavra = (req: Request, res: Response) => {
  const settings = db.prepare("SELECT value FROM settings WHERE key = 'palavra_semestral'").get() as { value: string };
  res.json({ value: settings.value });
};

export const updatePalavra = (req: Request, res: Response) => {
  const { value } = req.body;
  db.prepare("UPDATE settings SET value = ? WHERE key = 'palavra_semestral'").run(value);
  res.json({ success: true });
};

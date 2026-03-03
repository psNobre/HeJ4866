import { Request, Response } from "express";
import bcrypt from "bcrypt";
import db from "../models/db";
import { normalizePalavra } from "../utils/normalize";

export const getPalavra = (req: Request, res: Response) => {
  // We don't return the actual hashed value for security, just a placeholder if it exists
  const settings = db.prepare("SELECT value FROM settings WHERE key = 'palavra_semestral'").get() as { value: string };
  res.json({ value: settings ? "********" : "" });
};

export const updatePalavra = (req: Request, res: Response) => {
  const { value } = req.body;
  const normalizedValue = normalizePalavra(value || "");
  const hashedValue = bcrypt.hashSync(normalizedValue, 10);
  db.prepare("UPDATE settings SET value = ? WHERE key = 'palavra_semestral'").run(hashedValue);
  res.json({ success: true });
};

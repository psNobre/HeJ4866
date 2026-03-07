import { Request, Response } from "express";
import bcrypt from "bcrypt";
import db from "../models/db.ts";
import { normalizePalavra } from "../utils/normalize.ts";

export const login = (req: Request, res: Response) => {
  const { cim, password, palavraSemestral } = req.body;
  
  // Trim inputs to be more robust
  const trimmedCim = cim?.toString().trim();
  const trimmedPassword = password?.toString().trim();
  const trimmedPalavra = palavraSemestral?.toString().trim();

  console.log(`Login attempt - CIM: ${trimmedCim}, Palavra: ${trimmedPalavra}`);

  const settings = db.prepare("SELECT value FROM settings WHERE key = 'palavra_semestral'").get() as { value: string };
  
  const normalizedInputPalavra = normalizePalavra(trimmedPalavra || "");
  const isPalavraValid = settings && bcrypt.compareSync(normalizedInputPalavra, settings.value);

  if (!isPalavraValid) {
    console.log(`Login failed for CIM ${trimmedCim}: Incorrect Palavra Semestral`);
    return res.status(401).json({ success: false, error: "Palavra Semestral incorreta." });
  }

  const member = db.prepare(`
    SELECT 
      id, cim, name, degree, role, password,
      initiation_date as initiationDate, 
      elevation_date as elevationDate, 
      exaltation_date as exaltationDate, 
      pays_through_lodge as paysThroughLodge, 
      disconnected, active,
      must_change_password as mustChangePassword,
      permissions
    FROM members 
    WHERE cim = ?
  `).get(trimmedCim);

  if (member) {
    const m = member as any;
    const isPasswordValid = bcrypt.compareSync(trimmedPassword, m.password);
    
    if (!isPasswordValid) {
      console.log(`Login failed for CIM ${trimmedCim}: Incorrect Password`);
      return res.status(401).json({ success: false, error: "CIM ou Senha incorretos." });
    }

    if (m.disconnected) {
      console.log(`Login failed for CIM ${trimmedCim}: Member disconnected`);
      return res.status(403).json({ success: false, error: "Membro desligado do quadro." });
    }
    
    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = m;
    if (userWithoutPassword.permissions) {
      try {
        userWithoutPassword.permissions = JSON.parse(userWithoutPassword.permissions);
      } catch (e) {
        userWithoutPassword.permissions = [];
      }
    }
    console.log(`Login successful for CIM ${trimmedCim} (${m.name})`);
    res.json({ success: true, user: userWithoutPassword });
  } else {
    console.log(`Login failed for CIM ${trimmedCim}: CIM not found in database`);
    const allCims = db.prepare("SELECT cim FROM members").all();
    console.log("Available CIMs in DB:", allCims.map((row: any) => row.cim).join(", "));
    res.status(401).json({ success: false, error: "CIM ou Senha incorretos." });
  }
};

export const changePassword = (req: Request, res: Response) => {
  const { id, newPassword } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare("UPDATE members SET password = ?, must_change_password = 0 WHERE id = ?").run(hashedPassword, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

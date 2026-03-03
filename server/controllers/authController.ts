import { Request, Response } from "express";
import db from "../models/db";

export const login = (req: Request, res: Response) => {
  const { cim, password, palavraSemestral } = req.body;
  
  // Trim inputs to be more robust
  const trimmedCim = cim?.toString().trim();
  const trimmedPassword = password?.toString().trim();
  const trimmedPalavra = palavraSemestral?.toString().trim();

  console.log(`Login attempt - CIM: ${trimmedCim}, Palavra: ${trimmedPalavra}`);

  const settings = db.prepare("SELECT value FROM settings WHERE key = 'palavra_semestral'").get() as { value: string };
  
  if (!trimmedPalavra || trimmedPalavra.toLowerCase() !== settings.value.toLowerCase()) {
    console.log(`Login failed for CIM ${trimmedCim}: Incorrect Palavra Semestral (Expected: ${settings.value}, Received: ${trimmedPalavra})`);
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
      must_change_password as mustChangePassword
    FROM members 
    WHERE cim = ?
  `).get(trimmedCim);

  if (member) {
    const m = member as any;
    if (m.password !== trimmedPassword) {
      console.log(`Login failed for CIM ${trimmedCim}: Incorrect Password (Received: ${trimmedPassword}, DB has: ${m.password})`);
      return res.status(401).json({ success: false, error: "CIM ou Senha incorretos." });
    }

    if (m.disconnected) {
      console.log(`Login failed for CIM ${trimmedCim}: Member disconnected`);
      return res.status(403).json({ success: false, error: "Membro desligado do quadro." });
    }
    
    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = m;
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
    db.prepare("UPDATE members SET password = ?, must_change_password = 0 WHERE id = ?").run(newPassword, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

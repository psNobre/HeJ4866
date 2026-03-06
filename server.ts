import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./server/routes";
import { initDB } from "./server/models/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  console.log("Starting server initialization...");
  
  try {
    // Initialize Database
    console.log("Initializing database...");
    initDB();
    console.log("Database initialized successfully.");
  } catch (dbError) {
    console.error("CRITICAL: Database initialization failed:", dbError);
    // Continue for now, but the app might be broken
  }
  
  // API Routes
  app.use("/api", apiRoutes);
  
  // Debug route to download DB
  app.get("/api/debug/download-db", (req, res) => {
    const dbPath = path.join(process.cwd(), "masonic_lodge_dev.db");
    res.download(dbPath, "masonic_lodge_dev.db");
  });
  
  console.log("API routes registered.");

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite server for development...");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware integrated.");
    } catch (viteError) {
      console.error("CRITICAL: Vite server initialization failed:", viteError);
    }
  } else {
    console.log("Running in production mode.");
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Humildade e Justiça nº 4866 - Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

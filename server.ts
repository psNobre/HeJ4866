import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./server/routes/index.ts";
import { initDB } from "./server/models/db.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || "0.0.0.0";

  app.use(express.json());

  console.log("Starting server initialization...");
  
  // API Routes
  app.use("/api", apiRoutes);
  
  // Debug route to download DB
  app.get("/api/debug/download-db", (req, res) => {
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "masonic_lodge_dev.db");
    res.download(dbPath, "masonic_lodge.db");
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
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`Humildade e Justiça nº 4866 - Server running on http://${HOST}:${PORT}`);
    
    // Initialize Database AFTER starting to listen to avoid health check timeouts
    console.log("Initializing database...");
    try {
      initDB();
      console.log("Database initialized successfully.");
    } catch (dbError) {
      console.error("CRITICAL: Database initialization failed:", dbError);
    }
  });

  server.on("error", (error: any) => {
    if (error.code === "EADDRNOTAVAIL") {
      console.warn(`WARNING: Address ${HOST} not available. Falling back to 0.0.0.0...`);
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Humildade e Justiça nº 4866 - Server running on http://0.0.0.0:${PORT} (fallback)`);
        console.log("Initializing database (fallback)...");
        try {
          initDB();
          console.log("Database initialized successfully.");
        } catch (dbError) {
          console.error("CRITICAL: Database initialization failed:", dbError);
        }
      });
    } else {
      console.error("Server error:", error);
    }
  });
}

startServer();

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import apiRoutes from "./server/routes";
import { initDB } from "./server/models/db";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  console.log("Starting server initialization...");
  
  // Initialize Database
  initDB();
  console.log("Database initialized.");
  
  // API Routes
  app.use("/api", apiRoutes);
  console.log("API routes registered.");

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite server...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware integrated.");
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Humildade e Justiça nº 4866 - Server running on http://localhost:${PORT}`);
  });
}

startServer();

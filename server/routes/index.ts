import { Router } from "express";
import authRoutes from "./authRoutes.ts";
import memberRoutes from "./memberRoutes.ts";
import sessionRoutes from "./sessionRoutes.ts";
import transactionRoutes from "./transactionRoutes.ts";
import settingsRoutes from "./settingsRoutes.ts";

const router = Router();

router.use("/auth", authRoutes);
router.use("/members", memberRoutes);
router.use("/sessions", sessionRoutes);
router.use("/transactions", transactionRoutes);
router.use("/settings", settingsRoutes);

export default router;

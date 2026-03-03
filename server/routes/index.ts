import { Router } from "express";
import authRoutes from "./authRoutes";
import memberRoutes from "./memberRoutes";
import sessionRoutes from "./sessionRoutes";
import transactionRoutes from "./transactionRoutes";
import settingsRoutes from "./settingsRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/members", memberRoutes);
router.use("/sessions", sessionRoutes);
router.use("/transactions", transactionRoutes);
router.use("/settings", settingsRoutes);

export default router;

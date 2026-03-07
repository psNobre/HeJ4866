import { Router } from "express";
import * as authController from "../controllers/authController.ts";

const router = Router();

router.post("/login", authController.login);
router.post("/change-password", authController.changePassword);

export default router;

import { Router } from "express";
import * as sessionController from "../controllers/sessionController";

const router = Router();

router.get("/", sessionController.getSessions);
router.post("/", sessionController.createSession);
router.get("/attendance/:sessionId", sessionController.getAttendance);

export default router;

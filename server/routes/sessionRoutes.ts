import { Router } from "express";
import * as sessionController from "../controllers/sessionController.ts";

const router = Router();

router.get("/", sessionController.getSessions);
router.post("/", sessionController.createSession);
router.put("/:id", sessionController.updateSession);
router.delete("/:id", sessionController.deleteSession);
router.get("/attendance/:sessionId", sessionController.getAttendance);
router.get("/stats/members", sessionController.getMemberAttendanceStats);

export default router;

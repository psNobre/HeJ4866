import { Router } from "express";
import * as memberController from "../controllers/memberController";

const router = Router();

router.get("/", memberController.getMembers);
router.get("/:id/stats", memberController.getMemberStats);
router.get("/:id/missing-months", memberController.getMissingMonths);
router.get("/:id/sessions", memberController.getMemberSessions);
router.post("/", memberController.createMember);
router.patch("/:id/toggle-disconnected", memberController.toggleDisconnected);
router.patch("/:id/toggle-pays", memberController.togglePays);
router.patch("/:id/toggle-frequency-exempt", memberController.toggleFrequencyExempt);
router.put("/:id", memberController.updateMember);
router.patch("/:id/permissions", memberController.updatePermissions);
router.post("/update-profile", memberController.updateProfile);

export default router;

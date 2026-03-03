import { Router } from "express";
import * as memberController from "../controllers/memberController";

const router = Router();

router.get("/", memberController.getMembers);
router.post("/", memberController.createMember);
router.patch("/:id/toggle-disconnected", memberController.toggleDisconnected);
router.patch("/:id/toggle-pays", memberController.togglePays);
router.put("/:id", memberController.updateMember);
router.post("/update-profile", memberController.updateProfile);

export default router;

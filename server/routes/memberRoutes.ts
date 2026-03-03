import { Router } from "express";
import * as memberController from "../controllers/memberController";

const router = Router();

router.get("/", memberController.getMembers);
router.post("/", memberController.createMember);
router.patch("/:id/toggle-disconnected", memberController.toggleDisconnected);
router.patch("/:id/toggle-pays", memberController.togglePays);

export default router;

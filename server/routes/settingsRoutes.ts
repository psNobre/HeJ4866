import { Router } from "express";
import * as settingsController from "../controllers/settingsController.ts";

const router = Router();

router.get("/palavra", settingsController.getPalavra);
router.post("/palavra", settingsController.updatePalavra);

export default router;

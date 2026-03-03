import { Router } from "express";
import * as transactionController from "../controllers/transactionController";

const router = Router();

router.get("/", transactionController.getTransactions);
router.post("/", transactionController.createTransaction);
router.get("/stats", transactionController.getStats);

export default router;

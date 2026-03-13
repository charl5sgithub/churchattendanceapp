import { Router } from "express";
import {
  exportCsv,
  exportPdf,
  monthlyReport,
  rangeReport
} from "../controllers/reportController";
import { authMiddleware } from "../middlewares/authMiddleware";

export const reportRouter = Router();

reportRouter.use(authMiddleware);

reportRouter.get("/monthly", monthlyReport);
reportRouter.get("/range", rangeReport);
reportRouter.get("/export/csv", exportCsv);
reportRouter.get("/export/pdf", exportPdf);


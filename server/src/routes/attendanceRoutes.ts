import { Router } from "express";
import {
  getAttendanceByDate,
  markAttendance
} from "../controllers/attendanceController";
import { authMiddleware } from "../middlewares/authMiddleware";

export const attendanceRouter = Router();

attendanceRouter.use(authMiddleware);

attendanceRouter.post("/", markAttendance);
attendanceRouter.get("/", getAttendanceByDate);


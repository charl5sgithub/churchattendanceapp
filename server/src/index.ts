import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { json, urlencoded } from "express";
import { authRouter } from "./routes/authRoutes";
import { memberRouter } from "./routes/memberRoutes";
import { attendanceRouter } from "./routes/attendanceRoutes";
import { reportRouter } from "./routes/reportRoutes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(
  cors({
    origin: "*"
  })
);
app.use(json());
app.use(urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/members", memberRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/reports", reportRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${env.port}`);
});


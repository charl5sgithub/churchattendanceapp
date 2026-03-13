import type { Request, Response } from "express";
import { getAttendanceSummaryInRange } from "../services/reportService";
import PDFDocument from "pdfkit";

function parseRange(req: Request): { start: Date; end: Date } | null {
  const { start, end } = req.query as { start?: string; end?: string };
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }
  return { start: startDate, end: endDate };
}

export async function monthlyReport(req: Request, res: Response) {
  const { month, year } = req.query as { month?: string; year?: string };
  const now = new Date();
  const y = year ? Number(year) : now.getFullYear();
  const m = month ? Number(month) - 1 : now.getMonth();

  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999);

  const data = await getAttendanceSummaryInRange(start, end);
  return res.json({ start, end, data });
}

export async function rangeReport(req: Request, res: Response) {
  const range = parseRange(req);
  if (!range) {
    return res
      .status(400)
      .json({ error: "start and end query parameters are required" });
  }
  const data = await getAttendanceSummaryInRange(range.start, range.end);
  return res.json({ start: range.start, end: range.end, data });
}

export async function exportCsv(req: Request, res: Response) {
  const range = parseRange(req);
  if (!range) {
    return res
      .status(400)
      .json({ error: "start and end query parameters are required" });
  }
  const data = await getAttendanceSummaryInRange(range.start, range.end);

  const rows = [
    ["Member Name", "Present Days", "Absent Days", "Attendance %"],
    ...data.map((d) => [
      d.name,
      d.presentDays.toString(),
      d.absentDays.toString(),
      d.percentage.toString()
    ])
  ];

  const csv = rows.map((r) => r.join(",")).join("\n");

  res.header("Content-Type", "text/csv");
  res.header(
    "Content-Disposition",
    'attachment; filename="attendance-report.csv"'
  );
  return res.send(csv);
}

export async function exportPdf(req: Request, res: Response) {
  const range = parseRange(req);
  if (!range) {
    return res
      .status(400)
      .json({ error: "start and end query parameters are required" });
  }
  const data = await getAttendanceSummaryInRange(range.start, range.end);

  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="attendance-report.pdf"'
  );

  doc.pipe(res);

  doc.fontSize(18).text("Attendance Report", { align: "center" });
  doc
    .fontSize(12)
    .moveDown()
    .text(`From: ${range.start.toDateString()}`)
    .text(`To: ${range.end.toDateString()}`)
    .moveDown();

  data.forEach((d) => {
    doc
      .fontSize(12)
      .text(`Member: ${d.name}`)
      .text(`Present: ${d.presentDays}`)
      .text(`Absent: ${d.absentDays}`)
      .text(`Attendance: ${d.percentage}%`)
      .moveDown();
  });

  doc.end();
}


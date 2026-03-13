import type { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export async function markAttendance(req: Request, res: Response) {
  const { memberId, date, status } = req.body as {
    memberId?: number;
    date?: string;
    status?: "present" | "absent";
  };

  if (!memberId || !date || !status) {
    return res
      .status(400)
      .json({ error: "memberId, date and status are required" });
  }

  const member = await prisma.member.findUnique({
    where: { id: Number(memberId) }
  });
  if (!member) {
    return res.status(404).json({ error: "Member not found" });
  }

  const isoDate = new Date(date);

  const record = await prisma.attendance.upsert({
    where: {
      memberId_date: { memberId: member.id, date: isoDate }
    },
    update: {
      status: status === "present" ? "PRESENT" : "ABSENT"
    },
    create: {
      memberId: member.id,
      date: isoDate,
      status: status === "present" ? "PRESENT" : "ABSENT"
    }
  });

  return res.status(201).json(record);
}

export async function getAttendanceByDate(req: Request, res: Response) {
  const date = req.query.date as string | undefined;
  if (!date) {
    return res.status(400).json({ error: "date query param is required" });
  }

  const targetDate = new Date(date);
  const records = await prisma.attendance.findMany({
    where: { date: targetDate },
    include: { member: true }
  });

  return res.json(records);
}


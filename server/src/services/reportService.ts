import { prisma } from "../utils/prisma";

export interface AttendanceSummary {
  memberId: number;
  name: string;
  presentDays: number;
  absentDays: number;
  percentage: number;
}

export async function getAttendanceSummaryInRange(
  start: Date,
  end: Date
): Promise<AttendanceSummary[]> {
  const records = await prisma.attendance.findMany({
    where: {
      date: {
        gte: start,
        lte: end
      }
    },
    include: { member: true }
  });

  const map = new Map<
    number,
    { name: string; present: number; absent: number }
  >();

  for (const r of records) {
    const existing = map.get(r.memberId) ?? {
      name: r.member.name,
      present: 0,
      absent: 0
    };
    if (r.status === "PRESENT") {
      existing.present += 1;
    } else {
      existing.absent += 1;
    }
    map.set(r.memberId, existing);
  }

  const summaries: AttendanceSummary[] = [];
  for (const [memberId, value] of map.entries()) {
    const total = value.present + value.absent;
    const percentage = total === 0 ? 0 : (value.present / total) * 100;
    summaries.push({
      memberId,
      name: value.name,
      presentDays: value.present,
      absentDays: value.absent,
      percentage: Math.round(percentage * 100) / 100
    });
  }

  return summaries;
}


import { useEffect, useState } from "react";
import { api } from "../services/api";

interface Member {
  id: number;
  name: string;
}

export function DashboardPage() {
  const [totalMembers, setTotalMembers] = useState(0);
  const [todayPresent, setTodayPresent] = useState(0);
  const [todayPercentage, setTodayPercentage] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const membersRes = await api.get<Member[]>("/members");
        setTotalMembers(membersRes.data.length);

        const today = new Date().toISOString().slice(0, 10);
        const attendanceRes = await api.get("/attendance", {
          params: { date: today }
        });
        const records: any[] = attendanceRes.data;
        const presentCount = records.filter(
          (r) => r.status === "PRESENT"
        ).length;
        setTodayPresent(presentCount);
        const percent =
          membersRes.data.length === 0
            ? 0
            : (presentCount / membersRes.data.length) * 100;
        setTodayPercentage(Math.round(percent));
      } catch {
        // ignore on dashboard
      }
    }
    load();
  }, []);

  const cards = [
    {
      label: "Total Members",
      value: totalMembers.toString()
    },
    {
      label: "Today Present",
      value: todayPresent.toString()
    },
    {
      label: "Attendance %",
      value: `${todayPercentage}%`
    }
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-800">
        Dashboard Overview
      </h1>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-sm px-3 py-3 flex flex-col items-start justify-between"
          >
            <span className="text-[11px] uppercase tracking-wide text-slate-500">
              {card.label}
            </span>
            <span className="mt-1 text-lg font-semibold text-slate-900">
              {card.value}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Use the tabs above to manage members, mark attendance, and view
        detailed reports.
      </p>
    </div>
  );
}


import { useEffect, useState } from "react";
import { api } from "../services/api";

interface Member {
  id: number;
  name: string;
  family?: string;
}

type Status = "present" | "absent" | "";

export function AttendancePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [statuses, setStatuses] = useState<Record<number, Status>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadMembers() {
    const res = await api.get<Member[]>("/members");
    setMembers(res.data);
  }

  async function loadExistingAttendance(targetDate: string) {
    try {
      const res = await api.get("/attendance", {
        params: { date: targetDate }
      });
      const records: any[] = res.data;
      const map: Record<number, Status> = {};
      records.forEach((r) => {
        map[r.memberId] = r.status === "PRESENT" ? "present" : "absent";
      });
      setStatuses(map);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    loadExistingAttendance(date);
  }, [date]);

  async function saveAttendance() {
    setLoading(true);
    setMessage(null);
    try {
      const entries = Object.entries(statuses).filter(
        ([, value]) => value !== ""
      ) as [string, Exclude<Status, "">][];

      await Promise.all(
        entries.map(([memberId, status]) =>
          api.post("/attendance", {
            memberId: Number(memberId),
            date,
            status
          })
        )
      );
      setMessage("Attendance saved.");
    } catch {
      setMessage("Failed to save attendance.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">Attendance</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
      </div>
      {message && (
        <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
          {message}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm divide-y">
        {members.map((m) => {
          const status = statuses[m.id] ?? "";
          return (
            <div
              key={m.id}
              className="flex items-center justify-between px-3 py-3"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-800">
                  {m.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  {m.family || "No family"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    status === "present"
                      ? "bg-green-500 text-white"
                      : "border border-slate-200 text-slate-600 bg-white"
                  }`}
                  onClick={() =>
                    setStatuses((prev) => ({ ...prev, [m.id]: "present" }))
                  }
                >
                  Present
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    status === "absent"
                      ? "bg-red-500 text-white"
                      : "border border-slate-200 text-slate-600 bg-white"
                  }`}
                  onClick={() =>
                    setStatuses((prev) => ({ ...prev, [m.id]: "absent" }))
                  }
                >
                  Absent
                </button>
              </div>
            </div>
          );
        })}
        {members.length === 0 && (
          <p className="px-3 py-4 text-xs text-slate-500">
            No members found. Add members first.
          </p>
        )}
      </div>
      <button
        onClick={saveAttendance}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium shadow-sm active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Attendance"}
      </button>
    </div>
  );
}


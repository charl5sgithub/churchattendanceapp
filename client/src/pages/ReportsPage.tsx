import { useEffect, useState } from "react";
import { api } from "../services/api";

interface SummaryItem {
  name: string;
  presentDays: number;
  absentDays: number;
  percentage: number;
}

type Mode = "month" | "last3" | "range";

export function ReportsPage() {
  const [mode, setMode] = useState<Mode>("month");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [items, setItems] = useState<SummaryItem[]>([]);

  async function fetchData() {
    try {
      if (mode === "month") {
        const now = new Date();
        const res = await api.get("/reports/monthly", {
          params: { month: now.getMonth() + 1, year: now.getFullYear() }
        });
        setItems(res.data.data);
      } else if (mode === "last3") {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        const res = await api.get("/reports/range", {
          params: {
            start: startDate.toISOString().slice(0, 10),
            end: endDate.toISOString().slice(0, 10)
          }
        });
        setItems(res.data.data);
      } else if (mode === "range" && start && end) {
        const res = await api.get("/reports/range", {
          params: { start, end }
        });
        setItems(res.data.data);
      }
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function download(type: "csv" | "pdf") {
    const now = new Date();
    let startDate = start;
    let endDate = end;
    if (mode === "month") {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      const e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startDate = s.toISOString().slice(0, 10);
      endDate = e.toISOString().slice(0, 10);
    } else if (mode === "last3") {
      const e = new Date();
      const s = new Date();
      s.setMonth(s.getMonth() - 3);
      startDate = s.toISOString().slice(0, 10);
      endDate = e.toISOString().slice(0, 10);
    }
    if (!startDate || !endDate) return;

    const url =
      type === "csv" ? "/reports/export/csv" : "/reports/export/pdf";
    const res = await api.get(url, {
      params: { start: startDate, end: endDate },
      responseType: "blob"
    });
    const blob = new Blob([res.data], {
      type: type === "csv" ? "text/csv" : "application/pdf"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download =
      type === "csv" ? "attendance-report.csv" : "attendance-report.pdf";
    link.click();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-800">Reports</h1>

      <div className="bg-white rounded-xl shadow-sm p-3 space-y-3">
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setMode("month")}
            className={`flex-1 py-2 rounded-full font-medium ${
              mode === "month"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setMode("last3")}
            className={`flex-1 py-2 rounded-full font-medium ${
              mode === "last3"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Last 3 Months
          </button>
          <button
            onClick={() => setMode("range")}
            className={`flex-1 py-2 rounded-full font-medium ${
              mode === "range"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Custom Range
          </button>
        </div>

        {mode === "range" && (
          <div className="flex gap-2 text-xs">
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <button
              onClick={fetchData}
              className="px-3 py-2 rounded-lg bg-slate-900 text-white font-medium"
            >
              Go
            </button>
          </div>
        )}

        <div className="flex gap-2 text-xs">
          <button
            onClick={() => download("csv")}
            className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700"
          >
            Download CSV
          </button>
          <button
            onClick={() => download("pdf")}
            className="flex-1 py-2 rounded-lg bg-slate-900 text-white font-medium"
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-3 py-2">Member</th>
              <th className="text-right px-3 py-2">Present</th>
              <th className="text-right px-3 py-2">Absent</th>
              <th className="text-right px-3 py-2">%</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.name} className="border-t border-slate-100">
                <td className="px-3 py-2 text-slate-800">{item.name}</td>
                <td className="px-3 py-2 text-right">{item.presentDays}</td>
                <td className="px-3 py-2 text-right">{item.absentDays}</td>
                <td className="px-3 py-2 text-right">
                  {item.percentage.toFixed(0)}%
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-slate-500"
                >
                  No data for this range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


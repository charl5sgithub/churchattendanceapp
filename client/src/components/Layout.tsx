import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function Layout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const navLinkClass =
    "flex-1 text-center py-2 text-xs sm:text-sm font-medium rounded-full";

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-slate-800">
          Church Attendance
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="text-xs sm:text-sm text-red-600"
        >
          Logout
        </button>
      </header>
      <nav className="px-4 pt-3 pb-2 bg-slate-100">
        <div className="flex gap-2 bg-white p-1 rounded-full shadow-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${navLinkClass} ${
                isActive ? "bg-indigo-600 text-white" : "text-slate-600"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/members"
            className={({ isActive }) =>
              `${navLinkClass} ${
                isActive ? "bg-indigo-600 text-white" : "text-slate-600"
              }`
            }
          >
            Members
          </NavLink>
          <NavLink
            to="/attendance"
            className={({ isActive }) =>
              `${navLinkClass} ${
                isActive ? "bg-indigo-600 text-white" : "text-slate-600"
              }`
            }
          >
            Attendance
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `${navLinkClass} ${
                isActive ? "bg-indigo-600 text-white" : "text-slate-600"
              }`
            }
          >
            Reports
          </NavLink>
        </div>
      </nav>
      <main className="flex-1 px-4 pb-4 pt-2">
        <Outlet />
      </main>
    </div>
  );
}


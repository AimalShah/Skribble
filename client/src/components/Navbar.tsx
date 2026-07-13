import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Compass, PenTool, User, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const links = [
    { to: "/", label: "Home", icon: <Home size={16} /> },
    { to: "/feed", label: "Feed", icon: <Compass size={16} /> },
    { to: "/create-room", label: "Create", icon: <PenTool size={16} /> },
    { to: "/profile", label: "Profile", icon: <User size={16} /> },
  ];

  return (
    <nav className="bg-slate-900/80 border-b-2 border-dashed border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold font-display transition-all ${
                  location.pathname === link.to
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-400/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 font-display hidden sm:block">{user?.displayName}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition font-display"
              title="Logout"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

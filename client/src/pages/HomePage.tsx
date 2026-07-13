import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Users, PenTool, BarChart3 } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/15 text-indigo-300 border-2 border-dashed border-indigo-400/40 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
          <span>Welcome back, artist!</span>
        </div>
        <h1 className="text-5xl font-display font-bold text-yellow-300 drop-shadow-md">
          Hey, {user.displayName}! 👋
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/feed"
          className="block bg-slate-900/80 sketchy-card border-slate-700 p-6 hover:bg-slate-800/80 transition-all wobbly-glow group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-500/15 rounded-xl border border-indigo-400/30">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-display font-bold text-white">Browse Rooms</h2>
          </div>
          <p className="text-slate-400 text-sm">Find and join published rooms from the public feed.</p>
        </Link>

        <Link
          to="/create-room"
          className="block bg-slate-900/80 sketchy-card border-slate-700 p-6 hover:bg-slate-800/80 transition-all wobbly-glow group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-400/15 rounded-xl border border-yellow-400/30">
              <PenTool className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-xl font-display font-bold text-white">Create Room</h2>
          </div>
          <p className="text-slate-400 text-sm">Set up a new public or private room with custom settings.</p>
        </Link>
      </div>

      <div className="mt-8 bg-slate-900/80 sketchy-card border-slate-700 p-6 wobbly-glow">
        <div className="flex items-center gap-2 mb-4 border-b-2 border-dashed border-slate-800 pb-3">
          <BarChart3 className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-display font-bold text-yellow-300">Your Stats</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          {[
            { value: user.stats.gamesPlayed, label: "Played", color: "text-indigo-400" },
            { value: user.stats.gamesWon, label: "Won", color: "text-emerald-400" },
            { value: user.stats.totalScore, label: "Score", color: "text-yellow-400" },
            { value: user.stats.drawingRounds, label: "Drawn", color: "text-pink-400" },
            { value: user.stats.wordsGuessed, label: "Guessed", color: "text-cyan-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <div className={`text-2xl font-bold font-display ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide font-display">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

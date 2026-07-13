import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User, BarChart3, Save } from "lucide-react";

const EYE_OPTIONS = ["◕◕", "••", "««", "XX", "OO"];
const MOUTH_OPTIONS = ["O", "‿", "—", "∆", "D"];
const BODY_OPTIONS = ["◓", "◒", "◙", "◐", "○"];

export default function ProfilePage() {
  const { user, updateUser, token } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [avatar, setAvatar] = useState(user?.avatar || { body: 0, eyes: 0, mouth: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!user) return null;

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName, avatar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      updateUser(data.user);
      setMessage("Profile updated!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function cycleAvatar(part: "eyes" | "mouth" | "body", direction: "next" | "prev") {
    const options = part === "eyes" ? EYE_OPTIONS : part === "mouth" ? MOUTH_OPTIONS : BODY_OPTIONS;
    setAvatar((prev) => {
      const current = prev[part];
      const next = direction === "next" ? (current + 1) % options.length : (current - 1 + options.length) % options.length;
      return { ...prev, [part]: next };
    });
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-display font-bold text-yellow-300">
          <User className="inline w-8 h-8 mr-2" />
          Your Profile
        </h1>
      </div>

      {/* Avatar Preview */}
      <div className="bg-slate-900/80 sketchy-card border-slate-700 p-6 mb-5 wobbly-glow">
        <h2 className="text-lg font-display font-bold text-yellow-300 mb-4 border-b-2 border-dashed border-slate-800 pb-2">Avatar</h2>
        <div className="flex items-center gap-8">
          <div className="p-4 bg-slate-950 rounded-2xl border-2 border-slate-700">
            <div className="text-center text-5xl leading-tight">
              <div>{EYE_OPTIONS[avatar.eyes]}</div>
              <div>{MOUTH_OPTIONS[avatar.mouth]}</div>
              <div>{BODY_OPTIONS[avatar.body]}</div>
            </div>
          </div>
          <div className="space-y-3">
            {(["eyes", "mouth", "body"] as const).map((part) => (
              <div key={part} className="flex items-center gap-2">
                <span className="w-16 text-sm text-slate-400 capitalize font-display">{part}</span>
                <button
                  onClick={() => cycleAvatar(part, "prev")}
                  className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-slate-300 transition"
                >
                  &lt;
                </button>
                <span className="w-10 text-center text-lg">
                  {part === "eyes" ? EYE_OPTIONS[avatar.eyes] : part === "mouth" ? MOUTH_OPTIONS[avatar.mouth] : BODY_OPTIONS[avatar.body]}
                </span>
                <button
                  onClick={() => cycleAvatar(part, "next")}
                  className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-slate-300 transition"
                >
                  &gt;
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div className="bg-slate-900/80 sketchy-card border-slate-700 p-5 mb-5 wobbly-glow">
        <h2 className="text-lg font-display font-bold text-yellow-300 mb-3 border-b-2 border-dashed border-slate-800 pb-2">Display Name</h2>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-3 py-2.5 bg-slate-950/80 border-2 border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
        />
      </div>

      {/* Stats */}
      <div className="bg-slate-900/80 sketchy-card border-slate-700 p-5 mb-5 wobbly-glow">
        <div className="flex items-center gap-2 mb-4 border-b-2 border-dashed border-slate-800 pb-2">
          <BarChart3 className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-display font-bold text-yellow-300">Statistics</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
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

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 font-bold font-display sketchy-btn border-indigo-400 transition"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {message && <span className="text-emerald-400 text-sm font-display">{message}</span>}
        {error && <span className="text-red-400 text-sm font-display">{error}</span>}
      </div>
    </div>
  );
}

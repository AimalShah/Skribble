import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Languages } from "../types";
import { PenTool, Lock, Globe, Users, Clock, RotateCw, Gamepad2, Lightbulb } from "lucide-react";

export default function CreateRoomPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState(Languages.en);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [drawTime, setDrawTime] = useState(60);
  const [rounds, setRounds] = useState(1);
  const [wordCount, setWordCount] = useState(3);
  const [hints, setHints] = useState(2);
  const [customWords, setCustomWords] = useState("");
  const [onlyCustomWords, setOnlyCustomWords] = useState(false);
  const [publish, setPublish] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          isPrivate,
          password: isPrivate ? password : undefined,
          language,
          settings: {
            players: maxPlayers,
            drawTime,
            rounds,
            wordCount,
            hints,
            customWords: customWords.split(",").map((w) => w.trim()).filter(Boolean),
            onlyCustomWords,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create room");

      if (publish && !isPrivate) {
        await fetch(`${API_BASE}/api/rooms/${data.roomId}/publish`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      navigate(`/room/${data.roomId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const selectClass = "w-full p-2.5 bg-slate-950/80 border-2 border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 text-sm hover:cursor-pointer disabled:opacity-50";
  const inputClass = "w-full px-3 py-2.5 bg-slate-950/80 border-2 border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 text-sm";

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-display font-bold text-yellow-300">
          <PenTool className="inline w-8 h-8 mr-2" />
          Create Room
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Room Name */}
        <div className="bg-slate-900/80 sketchy-card border-slate-700 p-5 wobbly-glow">
          <h2 className="text-lg font-display font-bold text-yellow-300 mb-3 border-b-2 border-dashed border-slate-800 pb-2">Room Details</h2>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1 font-display">Room Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="My awesome room"
              className={inputClass}
            />
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-slate-900/80 sketchy-card border-slate-700 p-5 wobbly-glow">
          <h2 className="text-lg font-display font-bold text-yellow-300 mb-3 border-b-2 border-dashed border-slate-800 pb-2">Visibility</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 bg-slate-950 border-slate-800"
              />
              <span className="text-slate-300 text-sm flex items-center gap-2">
                <Lock size={14} className="text-indigo-400" />
                Private Room (requires password)
              </span>
            </label>
            {isPrivate && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1 font-display">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={isPrivate}
                  minLength={4}
                  className={inputClass + " font-mono"}
                />
              </div>
            )}
            {!isPrivate && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publish}
                  onChange={(e) => setPublish(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 bg-slate-950 border-slate-800"
                />
                <span className="text-slate-300 text-sm">Publish to Public Feed</span>
              </label>
            )}
          </div>
        </div>

        {/* Game Settings */}
        <div className="bg-slate-900/80 sketchy-card border-slate-700 p-5 wobbly-glow">
          <h2 className="text-lg font-display font-bold text-yellow-300 mb-3 border-b-2 border-dashed border-slate-800 pb-2">Game Settings</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-sm text-slate-300 mb-1 font-display"><Globe size={14} className="text-indigo-400" /> Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value as Languages)} className={selectClass}>
                {Object.entries(Languages).map(([key, value]) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm text-slate-300 mb-1 font-display"><Users size={14} className="text-indigo-400" /> Max Players</label>
              <select value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))} className={selectClass}>
                {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm text-slate-300 mb-1 font-display"><Clock size={14} className="text-indigo-400" /> Draw Time</label>
              <select value={drawTime} onChange={(e) => setDrawTime(Number(e.target.value))} className={selectClass}>
                {[20, 30, 45, 60, 80, 120, 240].map((n) => (
                  <option key={n} value={n}>{n}s</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm text-slate-300 mb-1 font-display"><RotateCw size={14} className="text-indigo-400" /> Rounds</label>
              <select value={rounds} onChange={(e) => setRounds(Number(e.target.value))} className={selectClass}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm text-slate-300 mb-1 font-display"><Gamepad2 size={14} className="text-indigo-400" /> Word Count</label>
              <select value={wordCount} onChange={(e) => setWordCount(Number(e.target.value))} className={selectClass}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm text-slate-300 mb-1 font-display"><Lightbulb size={14} className="text-indigo-400" /> Hints</label>
              <select value={hints} onChange={(e) => setHints(Number(e.target.value))} className={selectClass}>
                {[0, 1, 2, 3].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Custom Words */}
        <div className="bg-slate-900/80 sketchy-card border-slate-700 p-5 wobbly-glow">
          <h2 className="text-lg font-display font-bold text-yellow-300 mb-3 border-b-2 border-dashed border-slate-800 pb-2">Custom Words</h2>
          <textarea
            value={customWords}
            onChange={(e) => setCustomWords(e.target.value.slice(0, 2000))}
            placeholder="apple, banana, cat, dog"
            rows={3}
            className={inputClass + " resize-none"}
          />
          <label className="flex items-center gap-3 mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyCustomWords}
              onChange={(e) => setOnlyCustomWords(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 bg-slate-950 border-slate-800"
            />
            <span className="text-slate-300 text-sm">Use only custom words</span>
          </label>
        </div>

        {error && <p className="text-red-400 text-sm font-display">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 text-lg font-bold font-display sketchy-btn border-indigo-400 transition"
        >
          {loading ? "Creating..." : "Create Room"}
        </button>
      </form>
    </div>
  );
}

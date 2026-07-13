import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PasswordModal from "../components/PasswordModal";
import { Lock, RefreshCw, Users, Clock, Globe } from "lucide-react";

interface FeedRoom {
  _id: string;
  roomId: string;
  name: string;
  isPrivate: boolean;
  language: string;
  playerCount: number;
  settings: {
    players: number;
    drawTime: number;
    rounds: number;
  };
  ownerId: {
    displayName: string;
    avatar: { body: number; eyes: number; mouth: number };
  };
}

const EYES = ["◕◕", "••", "««", "XX", "OO"];
const MOUTH = ["O", "‿", "—", "∆", "D"];
const BODY = ["◓", "◒", "◙", "◐", "○"];

export default function FeedPage() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [rooms, setRooms] = useState<FeedRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwordRoom, setPasswordRoom] = useState<FeedRoom | null>(null);
  const [passwordError] = useState("");

  async function fetchRooms() {
    try {
      const res = await fetch(`${API_BASE}/api/rooms/feed`);
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch {
      setError("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  function handleJoinPublic(room: FeedRoom) {
    navigate(`/room/${room.roomId}`);
  }

  function handleJoinPrivate(room: FeedRoom) {
    setPasswordRoom(room);
  }

  function handlePasswordSubmit(password: string) {
    if (!passwordRoom) return;
    navigate(`/room/${passwordRoom.roomId}?password=${encodeURIComponent(password)}`);
  }

  function renderAvatar(avatar: { body: number; eyes: number; mouth: number }) {
    return (
      <span className="text-base leading-none">
        {EYES[avatar.eyes]}{MOUTH[avatar.mouth]}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-12 px-4">
        <h1 className="text-3xl font-display font-bold mb-8 text-yellow-300">Public Feed</h1>
        <p className="text-slate-400 animate-pulse">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-yellow-300">Public Feed</h1>
        <button
          onClick={fetchRooms}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600/15 text-indigo-400 border-2 border-indigo-400/30 rounded-xl hover:bg-indigo-600/25 font-bold font-display transition sketchy-btn"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {error && <p className="text-red-400 mb-4 font-display">{error}</p>}

      {rooms.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 sketchy-card border-slate-700">
          <div className="text-5xl mb-4">🎨</div>
          <p className="text-slate-300 text-lg font-display">No published rooms yet.</p>
          <p className="text-slate-500 mt-2">Create a room and publish it to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-slate-900/80 sketchy-card border-slate-700 p-5 wobbly-glow hover:scale-[1.02] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-white truncate font-display">{room.name}</h3>
                {room.isPrivate ? (
                  <span className="px-2 py-1 text-xs bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg flex-shrink-0 flex items-center gap-1 font-display">
                    <Lock size={10} />
                    Private
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-lg flex-shrink-0 font-display">
                    Public
                  </span>
                )}
              </div>

              <div className="text-sm text-slate-400 space-y-1.5 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-slate-800 rounded-lg border border-slate-700">
                    {renderAvatar(room.ownerId.avatar)}
                  </span>
                  <span className="text-slate-300">{room.ownerId.displayName}</span>
                </div>
                <div className="flex gap-3 text-xs font-display">
                  <span className="flex items-center gap-1"><Globe size={12} className="text-indigo-400" />{room.language}</span>
                  <span className="flex items-center gap-1"><Users size={12} className="text-indigo-400" />{room.settings.players} max</span>
                  <span className="flex items-center gap-1"><Clock size={12} className="text-indigo-400" />{room.settings.drawTime}s</span>
                </div>
                <span className="text-xs font-display">{room.settings.rounds} rounds</span>
              </div>

              <button
                onClick={() =>
                  room.isPrivate
                    ? handleJoinPrivate(room)
                    : handleJoinPublic(room)
                }
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-bold text-sm font-display sketchy-btn border-indigo-400 transition"
              >
                {room.isPrivate ? "Enter Password & Join" : "Join Room"}
              </button>
            </div>
          ))}
        </div>
      )}

      {passwordRoom && (
        <PasswordModal
          roomId={passwordRoom.roomId}
          onJoin={handlePasswordSubmit}
          onClose={() => setPasswordRoom(null)}
          error={passwordError}
        />
      )}
    </div>
  );
}

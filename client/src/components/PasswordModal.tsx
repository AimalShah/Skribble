import { useState } from "react";
import { Lock } from "lucide-react";

interface PasswordModalProps {
  roomId: string;
  onJoin: (password: string) => void;
  onClose: () => void;
  error?: string;
}

export default function PasswordModal({ roomId, onJoin, onClose, error }: PasswordModalProps) {
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onJoin(password);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-slate-900/95 sketchy-card border-slate-700 p-6 w-full max-w-md shadow-2xl wobbly-glow">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-500/15 rounded-xl border-2 border-indigo-400/30">
            <Lock className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold font-display text-white">Private Room</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          This room requires a password to join.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            className="w-full bg-slate-950/80 border-2 border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 font-mono"
          />
          {error && <p className="text-red-400 text-sm font-display">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border-2 border-slate-700 rounded-xl text-slate-400 hover:bg-slate-800 font-bold font-display transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim()}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-40 font-bold font-display sketchy-btn border-indigo-400 transition"
            >
              Join Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

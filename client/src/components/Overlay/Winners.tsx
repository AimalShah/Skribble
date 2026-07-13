import { useNavigate } from "react-router-dom";
import { useRoom } from "../../context/RoomContext";
import { socket } from "../../socketHandler";
import { useEffect } from "react";

export default function Winners() {
  const { players } = useRoom();
  const navigate = useNavigate();
  const sorted = [...players].sort((a, b) => b.score - a.score);

  function handleExit() {
    socket.disconnect();
    navigate("/");
  }

  // Also listen for disconnect to navigate away (e.g. if host ends game from server side)
  useEffect(() => {
    function onDisconnect() {
      navigate("/");
    }
    socket.on("disconnect", onDisconnect);
    return () => { socket.off("disconnect", onDisconnect); };
  }, [navigate]);

  return (
    <div className="text-center w-full max-w-md mx-auto select-none">
      <div className="p-3 bg-yellow-400/10 border-2 border-yellow-400 text-yellow-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
        <span className="text-3xl">🏆</span>
      </div>
      <h3 className="text-3xl font-display font-extrabold text-yellow-300 mb-6">
        Game Ended
      </h3>
      <div className="bg-slate-900 border-2 border-dashed border-slate-700 p-4 rounded-2xl mb-6">
        <div className="space-y-3">
          {sorted.map((player, index) => (
            <div
              key={player.playerId}
              className={`flex items-center justify-between p-3 rounded-xl border-2 ${
                index === 0
                  ? "bg-amber-500/10 border-amber-500 shadow-[4px_4px_0px_0px_rgba(245,158,11,0.3)]"
                  : index === 1
                    ? "bg-slate-300/10 border-slate-600 shadow-[4px_4px_0px_0px_rgba(148,163,184,0.2)]"
                    : "bg-slate-950/60 border-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold font-display ${
                  index === 0 ? "text-yellow-400" : index === 1 ? "text-slate-300" : "text-amber-600"
                }`}>
                  #{index + 1}
                </span>
                <span className="font-bold text-slate-200 font-display">{player.name}</span>
              </div>
              <span className="font-display text-lg text-yellow-300 font-bold">{player.score}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleExit}
        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-display text-lg sketchy-btn border-indigo-400 wobbly-glow transition cursor-pointer"
      >
        Exit to Lobby
      </button>
    </div>
  );
}

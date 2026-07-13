import React, { useEffect, useState } from "react";
import { GameEvent, Player, Room } from "../types";
import { socket } from "../socketHandler";
import { useRoom } from "../context/RoomContext";
import { AnimatePresence, motion } from "framer-motion";
import PlayerCard from "./Player/PlayerCard";

const PlayerScores: React.FC = () => {
  const { currentRound, settings, players } = useRoom();
  const [displayers, setDisplayers] = useState<Player[]>(players);

  function addPlayer(player: Player) {
    setDisplayers((p) => {
      if (player.playerId === socket.id) {
        return p;
      }
      return [...p, player];
    });
  }
  function removePlayer(player: Player) {
    setDisplayers((p) => {
      return p.filter((e) => e.playerId != player.playerId);
    });
  }

  function roundEnd(room: Room) {
    setDisplayers(room.players);
  }

  useEffect(() => {
    socket.on(GameEvent.PLAYER_JOINED, addPlayer);
    socket.on(GameEvent.PLAYER_LEFT, removePlayer);
    socket.on(GameEvent.TURN_END, roundEnd);

    return () => {
      socket.off(GameEvent.PLAYER_JOINED, addPlayer);
      socket.off(GameEvent.PLAYER_LEFT, removePlayer);
      socket.off(GameEvent.TURN_END, roundEnd);
    };
  });

  return (
    <div className="bg-slate-900/80 sketchy-card border-slate-700 p-4 flex flex-col gap-3 shadow-lg wobbly-glow-red h-full">
      <div className="text-sm font-bold uppercase tracking-wider text-yellow-300 border-b-2 border-dashed border-slate-800 pb-2 mb-1 flex items-center justify-between font-display">
        <span>Scoreboard</span>
        <span className="text-[11px] text-indigo-300 font-display bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded-md">
          {players.length} Artists
        </span>
      </div>

      {currentRound > 0 && (
        <p className="text-center text-indigo-400 font-display font-semibold bg-slate-950 border border-slate-800 rounded-xl py-1 text-sm">
          Round {currentRound} of {settings.rounds}
        </p>
      )}

      <motion.ul className="space-y-2 flex-1 overflow-y-auto">
        <AnimatePresence>
          {displayers
            .sort((a, b) => b.score - a.score)
            .map((player, index) => (
              <PlayerCard key={player.playerId} player={player} index={index} />
            ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
};
export default PlayerScores;

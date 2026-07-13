import { GameEvent, Player } from "../../types";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useRoom } from "../../context/RoomContext";
import { CrownIcon, VolumeXIcon } from "lucide-react";
import { socket } from "../../socketHandler";
import Dialog from "../ui/Dialog";
import { useState } from "react";
import Button from "../ui/Button";
import RoomLink from "../RoomLink";

const BODY = ["◓", "◒", "◙", "◐", "○"];
const EYES = ["◕◕", "••", "««", "XX", "OO"];
const MOUTH = ["O", "‿", "—", "∆", "D"];

function renderAvatar(appearance?: number[]) {
  if (!appearance || appearance.length < 3) return <span className="text-xl">?</span>;
  return (
    <span className="text-lg leading-none">
      {EYES[appearance[1]] || "••"}{MOUTH[appearance[2]] || "O"}
    </span>
  );
}

export default function PlayerCard({
  player,
  index,
}: {
  player: Player;
  index: number;
}) {
  const { currentPlayer, creator, mutePlayer, mutedPlayers, removeMute } =
    useRoom();
  const [isOpen, setIsOpen] = useState(false);
  const isPlayerSelf = player.playerId === socket.id;
  const isMuted = mutedPlayers.includes(player.playerId);
  const isDrawing = currentPlayer?.playerId === player.playerId;

  const handleVoteKick = () => {
    socket.emit(GameEvent.VOTE_KICK, player.playerId);
    setIsOpen(false);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <motion.div
        className={clsx(
          "relative flex items-center w-full p-2.5 rounded-2xl border-2 transition-all duration-200 sketchy-card-subtle cursor-pointer",
          {
            "bg-emerald-500/10 border-emerald-500/80 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)]": player.guessed,
            "bg-indigo-500/15 border-indigo-500/80 shadow-[4px_4px_0px_0px_rgba(99,102,241,0.35)]": isDrawing && !player.guessed,
            "bg-slate-950/60 border-slate-800": !isDrawing && !player.guessed,
          }
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={player.playerId}
        onClick={() => setIsOpen(true)}
      >
        <span className="text-xs font-bold text-slate-400 w-6 text-center font-display shrink-0">
          #{index + 1}
        </span>

        <div className="p-1 rounded-xl border-2 border-slate-700 bg-slate-950 shrink-0 mr-2">
          {renderAvatar(player.appearance)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {player.playerId === creator && (
              <CrownIcon className="text-yellow-400 shrink-0" size={14} />
            )}
            {isMuted && (
              <VolumeXIcon className="text-slate-500 shrink-0" size={14} />
            )}
            <span className={clsx("text-sm font-bold truncate font-display", {
              "text-indigo-400": isPlayerSelf,
              "text-slate-200": !isPlayerSelf,
            })}>
              {player.name} {isPlayerSelf && "(You)"}
            </span>
          </div>
          {isDrawing && (
            <span className="text-[10px] text-indigo-400 font-bold block leading-none font-display">
              Drawing
            </span>
          )}
          {player.guessed && (
            <span className="text-[10px] text-emerald-400 font-bold block leading-none font-display">
              Guessed!
            </span>
          )}
        </div>

        <div className="text-right shrink-0">
          <span className="text-sm font-bold text-slate-100 font-display block leading-none">{player.score}</span>
          <span className="text-[9px] text-slate-400 uppercase leading-none font-bold font-display">pts</span>
        </div>
      </motion.div>
      <Dialog title={player.name} isOpen={isOpen} onClose={onClose}>
        <div className="flex items-center justify-between gap-4">
          <div className="p-4 rounded-2xl border-2 border-slate-700 bg-slate-950 text-4xl">
            {renderAvatar(player.appearance)}
          </div>

          <div className="flex flex-col gap-3 w-1/2">
            <RoomLink className="w-full" />
            {!isPlayerSelf && (
              <>
                <Button
                  size="md"
                  className="font-bold"
                  onClick={handleVoteKick}
                >
                  Vote Kick
                </Button>
                <Button
                  size="md"
                  onClick={() => {
                    if (isMuted) removeMute(player.playerId);
                    else mutePlayer(player.playerId);
                    onClose();
                  }}
                >
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
              </>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}

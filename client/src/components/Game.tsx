import PlayerScores from "./PlayerScores";
import GameCanvas from "./GameCanvas";
import Chat from "./Chat";
import { Room } from "../types";
import GameHeader from "./Header";
import useIsMobile from "../hooks/useIsMobile";
import OverlayContent from "./OverlayContent";
import AudioManager from "./Audio/AudioManager";
import GuessInput from "./GuessInput";
import MessagesContext from "../context/MessagesContext";
import ToastStack from "./Overlay/ToastMessage";
import Logo from "./Logo";

const Game = ({ room }: { room: Room }) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-[#0d1222] flex flex-col">
      <MessagesContext>
        <Logo />
        <GameHeader />
        <div className="flex-1 flex flex-col lg:flex-row gap-4 px-4 pb-4 max-w-7xl mx-auto w-full">
          <AudioManager />
          {/* Left: Players */}
          <div className="w-full lg:w-72 shrink-0">
            <PlayerScores />
          </div>
          {/* Center: Canvas */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <div className="flex-1 relative sketchy-card border-slate-700 bg-slate-950 p-2 overflow-hidden wobbly-glow min-h-[350px]">
              <GameCanvas room={room} />
              <OverlayContent />
              <ToastStack />
            </div>
          </div>
          {/* Right: Chat */}
          <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
            <GuessInput />
            {isMobile && <PlayerScores />}
            <Chat />
          </div>
        </div>
      </MessagesContext>
    </div>
  );
};

export default Game;

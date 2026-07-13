import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socketHandler";
import { GameEvent, PlayerData, Room } from "../types";
import { RoomProvider } from "../context/RoomContext";
import Game from "../components/Game";

export default function GameRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const joinEmitted = useRef(false);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Update stats when game ends
  useEffect(() => {
    if (!user || !token) return;

    function handleGameEnd({ room: endedRoom }: { room: Room; time: number }) {
      const me = endedRoom.players.find((p) => p.playerId === socket.id);
      if (!me) return;

      const isWinner = endedRoom.players.every((p) => p.score <= me.score);
      const wordsGuessed = endedRoom.gameState.guessedWords?.length || 0;
      const drawingRounds = endedRoom.players.filter(
        (p) => p.playerId === socket.id
      ).length;

      fetch(`${API_BASE}/api/stats/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gamesPlayed: 1,
          gamesWon: isWinner ? 1 : 0,
          totalScore: me.score,
          drawingRounds,
          wordsGuessed,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) updateUser(data.user);
        })
        .catch(() => {});
    }

    socket.on(GameEvent.GAME_ENDED, handleGameEnd);
    return () => {
      socket.off(GameEvent.GAME_ENDED, handleGameEnd);
    };
  }, [user, token, API_BASE]);

  useEffect(() => {
    if (!roomId || !user || joinEmitted.current) return;

    const password = searchParams.get("password") || undefined;

    const playerData: PlayerData = {
      name: user.displayName,
      appearance: [user.avatar.body, user.avatar.eyes, user.avatar.mouth],
    };

    function handleJoined(r: Room) {
      navigate(`/room/${roomId}`, { replace: true });
      setRoom(r);
      setJoined(true);
    }

    function handleError(msg: string) {
      setError(msg);
      joinEmitted.current = false;
    }

    function handleDisconnect() {
      navigate("/");
    }

    socket.on(GameEvent.JOINED_ROOM, handleJoined);
    socket.on("error", handleError);
    socket.on(GameEvent.DISCONNECT, handleDisconnect);

    function emitJoin() {
      if (joinEmitted.current) return;
      joinEmitted.current = true;
      socket.emit(
        GameEvent.JOIN_ROOM,
        playerData,
        "English",
        roomId,
        !!password,
        password
      );
    }

    if (!socket.connected) {
      socket.connect();
      socket.once("connect", emitJoin);
    } else {
      emitJoin();
    }

    return () => {
      socket.off(GameEvent.JOINED_ROOM, handleJoined);
      socket.off("error", handleError);
      socket.off(GameEvent.DISCONNECT, handleDisconnect);
      socket.off("connect", emitJoin);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0d1222]">
        <div className="bg-slate-900/80 sketchy-card border-slate-700 p-8 text-center max-w-md wobbly-glow">
          <p className="text-red-400 text-lg mb-4 font-display">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-bold sketchy-btn border-indigo-400"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!joined || !room) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d1222]">
        <div className="bg-slate-900/80 sketchy-card border-slate-700 p-8 text-center wobbly-glow">
          <div className="animate-bounce mb-4">
            <span className="text-4xl">✏️</span>
          </div>
          <p className="text-slate-300 text-lg font-display">Joining room...</p>
        </div>
      </div>
    );
  }

  return (
    <RoomProvider>
      <Game room={room} />
    </RoomProvider>
  );
}

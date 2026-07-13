import { useRoom } from "../../context/RoomContext";

export default function ChoosingWord() {
  const { currentPlayer } = useRoom();
  return (
    <div className="text-center">
      <div className="animate-bounce mb-4">
        <span className="text-4xl">✏️</span>
      </div>
      <span className="font-display text-3xl font-bold text-white">
        <span className="text-indigo-400">{currentPlayer?.name}</span>{" "}
        is choosing a word...
      </span>
    </div>
  );
}

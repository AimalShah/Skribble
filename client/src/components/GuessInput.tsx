import { useState } from "react";
import { socket } from "../socketHandler";
import { GameEvent } from "../types";

export default function GuessInput() {
  const [guess, setGuess] = useState<string>("");
  const handleSend = () => {
    if (guess.trim()) {
      socket.emit(GameEvent.GUESS, { guess });
      setGuess("");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
      className="sm:hidden flex items-center gap-2"
    >
      <input
        className="flex-1 bg-slate-900/80 border-2 border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
        placeholder="Type your guess"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
      />
      {guess.length > 0 && (
        <span className="text-xs text-slate-500 font-mono">{guess.length}</span>
      )}
    </form>
  );
}

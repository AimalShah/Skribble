import { socket } from "../../socketHandler";
import { GameEvent } from "../../types";
import { Award } from "lucide-react";

export default function WordSelector({ words }: { words: string[] }) {
  function handleWordSelect(word: string) {
    socket.emit(GameEvent.WORD_SELECT, word);
  }

  return (
    <div className="text-center select-none">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/15 text-indigo-300 border-2 border-dashed border-indigo-400/40 rounded-full text-xs font-bold mb-4 animate-bounce font-display">
        <Award className="w-4 h-4 text-yellow-300" />
        <span>PICK A WORD TO DRAW</span>
      </div>
      <h3 className="text-3xl font-extrabold text-white font-display mb-6">Your turn!</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
        {words.map((e) => (
          <button
            key={e}
            onClick={() => handleWordSelect(e)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-4 rounded-2xl transition duration-200 sketchy-btn border-white/20 select-none cursor-pointer font-display text-lg uppercase"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

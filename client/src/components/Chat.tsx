import { useEffect, useRef, useState } from "react";
import { socket } from "../socketHandler";
import { GameEvent } from "../types";
import { SendIcon } from "lucide-react";
import useIsMobile from "../hooks/useIsMobile";
import { AnimatePresence } from "framer-motion";
import Message from "./Chat/Message";
import useMessages from "../hooks/useMessages";
import { useRoom } from "../context/RoomContext";

const Chat = () => {
  const [message, setMessage] = useState<string>("");
  const messagesBottomDiv = useRef<HTMLDivElement | null>(null);
  const { messages } = useMessages();
  const { myTurn } = useRoom();

  const isMobile = useIsMobile();

  const handleSend = () => {
    if (message.trim()) {
      socket.emit(GameEvent.GUESS, { guess: message });
      setMessage("");
    }
  };

  const scrollToBottom = () => {
    if (!messagesBottomDiv || !messagesBottomDiv.current) return;
    messagesBottomDiv.current.scrollTop =
      messagesBottomDiv.current?.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col bg-slate-900/80 sketchy-card border-slate-700 overflow-hidden wobbly-glow flex-1 lg:flex-none">
      <div className="text-sm font-bold uppercase tracking-wider text-yellow-300 border-b-2 border-dashed border-slate-800 pb-2 px-4 pt-3 font-display">
        Live Chat
      </div>

      <div
        className={`flex-1 overflow-y-auto p-4 space-y-2 min-h-0 ${myTurn ? 'max-h-[300px] lg:max-h-[500px]' : 'max-h-[400px] lg:max-h-[600px]'}`}
        ref={messagesBottomDiv}
      >
        <AnimatePresence>
          {messages.map((msg, index) => (
            <Message key={index} message={msg} />
          ))}
        </AnimatePresence>
      </div>

      {!isMobile && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 p-3 border-t-2 border-dashed border-slate-800"
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type something fun..."
            className="flex-1 bg-slate-950/80 border-2 border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
          />
          <button
            type="submit"
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl sketchy-btn border-indigo-400 transition cursor-pointer"
          >
            <SendIcon size={16} />
          </button>
        </form>
      )}
    </div>
  );
};

export default Chat;

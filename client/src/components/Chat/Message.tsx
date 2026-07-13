import { motion } from "framer-motion";

// eslint-disable-next-line react-refresh/only-export-components
export enum MessageType {
  Guess = "guess",
  PlayerLeft = "playerLeft",
  PlayerJoin = "playerJoin",
  WordGuessed = "wordGuessed",
  GuessClose = "guessClose",
  WordChoosen = "wordChosen",
  WordWas = "wordWas",
  Error = "error",
  VoteKick = "voteKick",
}
export interface IMessage {
  sender: string;
  message: string;
  type: MessageType;
}

export const Message = ({ message }: { message: IMessage }) => {
  let content = (
    <>
      <b className="text-slate-100">{message.sender}</b>{" "}
      <span className="text-slate-300">{message.message}</span>
    </>
  );
  let bgClass = "bg-slate-950/60 border-slate-800";

  switch (message.type) {
    case MessageType.PlayerJoin:
      bgClass = "bg-emerald-500/10 border-emerald-500/50";
      content = (
        <span className="text-emerald-400 font-display">
          {message.sender} joined the game
        </span>
      );
      break;
    case MessageType.PlayerLeft:
      bgClass = "bg-red-500/10 border-red-500/50";
      content = (
        <span className="text-red-400 font-display">{message.sender} left the game</span>
      );
      break;
    case MessageType.Error:
      bgClass = "bg-red-500/10 border-red-500/50";
      content = <span className="text-red-400 font-display">{message.message}</span>;
      break;
    case MessageType.WordGuessed:
      bgClass = "bg-emerald-500/10 border-emerald-500/80";
      content = (
        <span className="text-emerald-300 font-bold font-display">
          <b>{message.sender}</b> guessed the word!
        </span>
      );
      break;
    case MessageType.WordChoosen:
      bgClass = "bg-indigo-950/60 border-indigo-900/40";
      content = (
        <span className="text-indigo-300 font-display">
          <b>{message.sender}</b> {message.message}
        </span>
      );
      break;
    case MessageType.GuessClose:
      bgClass = "bg-amber-500/10 border-amber-500/80";
      content = (
        <span className="text-amber-300 font-bold font-display">'{message.message}' is close!</span>
      );
      break;
    case MessageType.WordWas:
      bgClass = "bg-indigo-950/60 border-indigo-900/40";
      content = (
        <span className="text-emerald-300 font-display">
          The word was '<b>{message.message}</b>'
        </span>
      );
      break;
    case MessageType.VoteKick:
      bgClass = "bg-red-500/10 border-red-500/80";
      content = <span className="text-red-400 font-display">{message.message}</span>;
      break;
    default:
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`p-2 rounded-xl border-2 text-xs ${bgClass} transition-colors duration-200`}
    >
      {content}
    </motion.div>
  );
};
export default Message;

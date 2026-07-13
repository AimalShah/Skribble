import React, { useEffect, useState } from "react";
import { GameEvent, Languages, Settings, SettingValue } from "../types";
import { socket } from "../socketHandler";
import { useRoom } from "../context/RoomContext";
import RoomLink from "./RoomLink";
import Button from "./ui/Button";
import {
  Clock,
  Gamepad2,
  Globe,
  Lightbulb,
  RotateCw,
  Users,
} from "lucide-react";

const GameSettings: React.FC = () => {
  const { settings, creator, changeSetting, isPrivateRoom } = useRoom();

  const [gameSettings, setGameSettings] = useState<Settings>(settings);
  const [customWords, setCustomWords] = useState<string>(
    settings.customWords.join(",")
  );

  function handleSettingChange(
    setting: SettingValue,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    emitEvent: boolean = false
  ) {
    changeSetting(setting, value.toString());
    switch (setting) {
      case SettingValue.players:
        setGameSettings({ ...gameSettings, players: value });
        break;
      case SettingValue.drawTime:
        setGameSettings({ ...gameSettings, drawTime: value });
        break;
      case SettingValue.rounds:
        setGameSettings({ ...gameSettings, rounds: value });
        break;
      case SettingValue.wordCount:
        setGameSettings({ ...gameSettings, wordCount: value });
        break;
      case SettingValue.hints:
        setGameSettings({ ...gameSettings, hints: value });
        break;
      case SettingValue.language:
        setGameSettings({ ...gameSettings, language: value as Languages });
        break;
      case SettingValue.onlyCustomWords:
        setGameSettings({ ...gameSettings, onlyCustomWords: value === 1 });
        break;

      default:
        break;
    }

    if (emitEvent && isOwner) {
      socket.emit(GameEvent.CHANGE_SETTIING, setting, value);
    }
  }

  useEffect(() => {
    socket.on(GameEvent.SETTINGS_CHANGED, handleSettingChange);

    return () => {
      socket.off(GameEvent.SETTINGS_CHANGED, handleSettingChange);
    };
  });

  const isOwner = creator === socket.id;

  const handleStart = () => {
    if (socket.id != creator) return;
    socket.emit(GameEvent.START_GAME, {
      words: customWords.split(",").map((w) => w.trim()),
    });
  };

  const settingsOptions = [
    {
      label: "Players",
      value: gameSettings.players,
      type: SettingValue.players,
      icon: <Users size={16} />,
      options: [...Array(7)].map((_, i) => {
        return { value: i + 2, label: i + 2 };
      }),
    },
    {
      label: "Language",
      value: gameSettings.language,
      type: SettingValue.language,
      icon: <Globe size={16} />,
      options: Object.entries(Languages).map(([key, val]) => ({
        value: key,
        label: val,
      })),
    },
    {
      label: "Drawtime",
      value: gameSettings.drawTime,
      type: SettingValue.drawTime,
      icon: <Clock size={16} />,
      options: [...Array(23)].map((_, i) => {
        return { value: i * 10 + 20, label: i * 10 + 20 };
      }),
    },
    {
      label: "Rounds",
      value: gameSettings.rounds,
      type: SettingValue.rounds,
      icon: <RotateCw size={16} />,
      options: [...Array(8)].map((_, i) => {
        return { value: i + 1, label: i + 1 };
      }),
    },
    {
      label: "Word Count",
      value: gameSettings.wordCount,
      type: SettingValue.wordCount,
      icon: <Gamepad2 size={16} />,
      options: [...Array(5)].map((_, i) => {
        return { value: i + 1, label: i + 1 };
      }),
    },
    {
      label: "Hints",
      value: gameSettings.hints,
      type: SettingValue.hints,
      icon: <Lightbulb size={16} />,
      options: [...Array(3)].map((_, i) => {
        return { value: i + 1, label: i + 1 };
      }),
    },
  ];

  if (!isPrivateRoom)
    return (
      <div className="w-full h-full p-2 sm:p-6 text-white justify-center flex-col flex items-center text-2xl sm:text-5xl gap-5 font-display">
        <div className="animate-pulse">
          <span className="text-5xl">🎮</span>
        </div>
        Waiting for players
        <span className="text-base sm:text-xl text-slate-400">
          The game will start as soon as a player joins
        </span>
      </div>
    );

  return (
    <div className="w-full h-full p-2 sm:p-6 flex flex-col">
      <h3 className="text-lg font-display font-bold text-yellow-300 mb-4 border-b-2 border-dashed border-slate-800 pb-2">
        Game Settings
      </h3>
      <div className="space-y-2 flex-1 overflow-y-auto">
        {settingsOptions.map((item, index) => (
          <div className="flex justify-between items-center" key={index}>
            <label className="block text-sm font-medium text-slate-300 font-display">
              <div className="flex gap-2 items-center">
                <span className="text-indigo-400">{item.icon}</span>
                {item.label}
              </div>
            </label>
            <select
              value={item.value}
              onChange={(event) =>
                handleSettingChange(item.type, event.target.value, true)
              }
              disabled={!isOwner}
              className="w-1/2 p-1.5 bg-slate-950/80 border-2 border-slate-800 rounded-xl text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer focus:outline-none focus:border-indigo-500 text-sm"
            >
              {item.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-slate-300 font-display">
            Custom Words
          </label>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-400 cursor-pointer">
              Only custom
            </label>
            <input
              type="checkbox"
              className="p-1 border-2 border-slate-800 rounded-md bg-slate-950 disabled:cursor-not-allowed hover:cursor-pointer accent-indigo-500"
              disabled={!isOwner}
              checked={gameSettings.onlyCustomWords}
              onChange={() =>
                handleSettingChange(
                  SettingValue.onlyCustomWords,
                  !gameSettings.onlyCustomWords,
                  true
                )
              }
            />
          </div>
        </div>
        <textarea
          className="w-full bg-slate-950/80 border-2 border-slate-800 rounded-xl p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 resize-none disabled:opacity-50"
          placeholder="Words separated by commas, max 2000 chars"
          value={customWords}
          onChange={(e) => setCustomWords(e.target.value)}
          disabled={!isOwner}
          maxLength={2000}
          rows={4}
        />
      </div>
      <div className="mt-3 flex gap-3 justify-end">
        <Button
          onClick={handleStart}
          className="w-2/3"
          disabled={!isOwner}
          variant="success"
        >
          Start Game
        </Button>
        <RoomLink />
      </div>
    </div>
  );
};

export default GameSettings;

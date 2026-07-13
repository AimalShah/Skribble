import React, { useEffect, useState } from "react";
import { GameEvent, RoomState } from "../types";
import { socket } from "../socketHandler";
import { useRoom } from "../context/RoomContext";
import LineWidthSelector from "./Toolbar/LineWidthSelector";
import { Undo2, Eraser } from "lucide-react";

function splitArray<T>(arr: T[]): [T[], T[]] {
  const mid = Math.floor(arr.length / 2);
  return [arr.slice(0, mid), arr.slice(mid)];
}

const colors = [
  "#FFFFFF",
  "#c1c1c1",
  "#ef130b",
  "#ff7100",
  "#ffe400",
  "#00cc00",
  "#00ff91",
  "#00b2ff",
  "#231fd3",
  "#a300ba",
  "#df69a7",
  "#ffac8e",
  "#a0522d",

  "#000000",
  "#505050",
  "#740b07",
  "#c23800",
  "#e8a200",
  "#004619",
  "#00785d",
  "#00569e",
  "#0e0865",
  "#550069",
  "#873554",
  "#cc774d",
  "#63300d",
];

interface ToolbarProps {
  onLineWidthChange: (width: number) => void;
  onColorChange: (color: string) => void;
  handleUndo: () => void;
  handleClear: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onLineWidthChange,
  onColorChange,
  handleUndo,
  handleClear,
}) => {
  const [primaryColor, setPrimaryColor] = useState<string>("#000000");
  const [secondaryColor, setSecondaryColor] = useState<string>("#FFFFFF");

  const [selectedLineWidth, setSelectedLineWidth] = useState<number>(5);
  const { myTurn, roomState } = useRoom();

  useEffect(() => {
    onColorChange(primaryColor);
  }, [onColorChange, primaryColor]);

  const handleLineWidthChange = (width: number) => {
    setSelectedLineWidth(width);
    onLineWidthChange(width);
  };

  const handleColorChange = (color: string) => {
    setPrimaryColor(color);
    onColorChange(color);
  };

  const handleSwap = () => {
    const temp = primaryColor;
    setPrimaryColor(secondaryColor);
    setSecondaryColor(temp);
  };

  if (!myTurn || roomState !== RoomState.DRAWING) {
    return null;
  }

  return (
    <div className="px-3 py-2 relative flex justify-between items-center w-full bg-slate-900/80 border-t-2 border-dashed border-slate-700">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 border-2 border-slate-600 rounded-xl overflow-hidden relative cursor-pointer shrink-0" onClick={handleSwap}>
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              background: `linear-gradient(to bottom right, ${primaryColor} 50%, ${secondaryColor} 50%)`,
            }}
          />
        </div>

        <div className="flex flex-col">
          {splitArray(colors).map((clrs, i) => (
            <div className="flex" key={i}>
              {clrs.map((color, j) => (
                <div
                  key={j}
                  onClick={() => handleColorChange(color)}
                  className="w-4 h-4 cursor-pointer hover:scale-125 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          ))}
        </div>
        <LineWidthSelector onSelect={handleLineWidthChange} selectedWidth={selectedLineWidth} />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => { socket.emit(GameEvent.DRAW_UNDO); handleUndo(); }}
          className="p-2 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
          title="Undo"
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={() => { socket.emit(GameEvent.DRAW_CLEAR); handleClear(); }}
          className="p-2 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
          title="Clear"
        >
          <Eraser size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;

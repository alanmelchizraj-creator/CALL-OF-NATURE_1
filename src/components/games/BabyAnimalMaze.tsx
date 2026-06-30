import React, { useState, useEffect } from "react";
import { playSound } from "../../utils/audio";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RefreshCw, Star } from "lucide-react";

interface GameProps {
  onWin: (score: number, stars: number) => void;
  onLose: () => void;
}

export default function BabyAnimalMaze({ onWin, onLose }: GameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [babyPos, setBabyPos] = useState({ r: 0, c: 0 });
  const [movesCount, setMovesCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);

  // A 7x7 grid maze layout: 0 = Path, 1 = Dense Tree/Thicket (Wall)
  // Ensures solvable pathways
  const MAZE_GRID = [
    [0, 0, 1, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0],
    [1, 1, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 0, 0, 0], // Parent at row 6, col 6
  ];

  const exitPos = { r: 6, c: 6 };

  useEffect(() => {
    if (!isPlaying) return;
    if (timeRemaining <= 0) {
      playSound("failure");
      setIsPlaying(false);
      onLose();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeRemaining]);

  const moveBaby = (dr: number, dc: number) => {
    if (!isPlaying) return;
    const nr = babyPos.r + dr;
    const nc = babyPos.c + dc;

    // Boundary check
    if (nr >= 0 && nr < MAZE_GRID.length && nc >= 0 && nc < MAZE_GRID[0].length) {
      if (MAZE_GRID[nr][nc] === 0) {
        setBabyPos({ r: nr, c: nc });
        setMovesCount((m) => m + 1);
        playSound("select");

        // Check for Win condition
        if (nr === exitPos.r && nc === exitPos.c) {
          setIsPlaying(false);
          playSound("victory");
          // Calculate star rating based on speed and steps (extremely easy)
          let stars = 2;
          if (timeRemaining > 30 || movesCount < 40) stars = 3;
          
          const finalScore = 300 + timeRemaining * 10 - movesCount * 5;
          onWin(Math.max(100, finalScore), stars);
        }
      }
    }
  };

  const startMaze = () => {
    setBabyPos({ r: 0, c: 0 });
    setMovesCount(0);
    setTimeRemaining(60);
    setIsPlaying(true);
    playSound("select");
  };

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        moveBaby(-1, 0);
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        moveBaby(1, 0);
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        moveBaby(0, -1);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        moveBaby(0, 1);
      }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [isPlaying, babyPos, movesCount]);

  return (
    <div 
      className="flex flex-col items-center bg-slate-900 border border-green-800 rounded-2xl p-6 text-white overflow-hidden max-w-xl mx-auto shadow-xl relative"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="w-full flex justify-between items-center mb-4">
        <span className="text-sm font-semibold tracking-wide text-amber-500 font-sans">
          MISSION 2: BABY ANIMAL MAZE
        </span>
        <div className="flex gap-4 text-xs font-mono">
          <span className="text-stone-300">⏳ {timeRemaining}s</span>
          <span className="text-yellow-400">Steps: {movesCount}</span>
        </div>
      </div>

      {!isPlaying ? (
        <div className="w-full aspect-square bg-slate-950 flex flex-col items-center justify-center p-6 text-center rounded-xl border border-amber-800/30">
          <span className="text-5xl mb-4 animate-bounce">🐻</span>
          <h4 className="text-lg font-bold text-amber-300">Lost Bear Cub</h4>
          <p className="text-xs text-gray-300 max-w-sm mt-2 leading-relaxed">
            Haze and industrial deforestation debris have scattered baby animals away from parent shelter. Guide this tiny bear cub through the safe lanes to its mother!
          </p>
          <button
            onClick={startMaze}
            className="mt-6 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg text-sm font-bold shadow-lg shadow-amber-900/30 active:scale-95 transition-transform"
          >
            ENTER FORST PATHS
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          {/* Maze Frame */}
          <div className="grid grid-cols-7 gap-1.5 p-3 bg-stone-950 rounded-xl border-2 border-stone-800 w-full max-w-[340px]">
            {MAZE_GRID.map((row, r) =>
              row.map((cell, c) => {
                const isBaby = babyPos.r === r && babyPos.c === c;
                const isExit = exitPos.r === r && exitPos.c === c;
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`aspect-square rounded-md flex items-center justify-center text-xl transition-all duration-150 ${
                      cell === 1
                        ? "bg-emerald-950/80 border border-emerald-900/50 shadow-inner"
                        : "bg-slate-900/60 border border-slate-800/20"
                    }`}
                  >
                    {isBaby && (
                      <span className="animate-pulse select-none" style={{ transform: "scale(1.3)" }}>🐻</span>
                    )}
                    {isExit && !isBaby && (
                      <span className="animate-bounce select-none">🐻‍❄️</span>
                    )}
                    {cell === 1 && !isBaby && !isExit && (
                      <span className="text-xs opacity-45 select-none">🌲</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* D-Pad controls for touch users */}
          <div className="mt-6 flex flex-col items-center gap-1.5">
            <button
              onClick={() => moveBaby(-1, 0)}
              className="w-12 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-lg flex items-center justify-center border border-slate-700 active:border-amber-400 transition-colors"
            >
              <ArrowUp className="w-5 h-5 text-amber-500" />
            </button>
            <div className="flex gap-8">
              <button
                onClick={() => moveBaby(0, -1)}
                className="w-12 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-lg flex items-center justify-center border border-slate-700 active:border-amber-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-amber-500" />
              </button>
              <button
                onClick={() => moveBaby(0, 1)}
                className="w-12 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-lg flex items-center justify-center border border-slate-700 active:border-amber-400 transition-colors"
              >
                <ArrowRight className="w-5 h-5 text-amber-500" />
              </button>
            </div>
            <button
              onClick={() => moveBaby(1, 0)}
              className="w-12 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-lg flex items-center justify-center border border-slate-700 active:border-amber-400 transition-colors"
            >
              <ArrowDown className="w-5 h-5 text-amber-500" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-center text-[10px] text-slate-400 font-sans">
        💡 Use <kbd className="bg-slate-800 px-1 py-0.5 rounded text-white font-mono">ARROWS</kbd> or <kbd className="bg-slate-800 px-1 py-0.5 rounded text-white font-mono">WASD</kbd> keys. Exit is the Mother Bear at the bottom-right!
      </div>
    </div>
  );
}

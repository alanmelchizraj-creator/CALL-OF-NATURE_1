import React, { useState, useEffect } from "react";
import { playSound } from "../../utils/audio";
import { ShieldCheck, Trees } from "lucide-react";

interface GameProps {
  onWin: (score: number, stars: number) => void;
  onLose: () => void;
}

interface PopupCharacter {
  id: number;
  row: number;
  col: number;
  type: "logger" | "ranger";
  timeLeft: number; // millseconds before they execute action/leave
  emoji: string;
}

export default function StopLoggers({ onWin, onLose }: GameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [treeCover, setTreeCover] = useState(100); // starts 100%, if hits 0, lose
  const [characters, setCharacters] = useState<PopupCharacter[]>([]);
  const [netsDeployed, setNetsDeployed] = useState(0);

  const WIN_NETS_DEPLOYED = 15;

  // Grid locations 3 rows x 3 columns for popup spots
  const gridSize = 3;

  const charactersRef = React.useRef(characters);
  charactersRef.current = characters;

  useEffect(() => {
    if (!isPlaying) return;

    let spawnInterval = window.setInterval(() => {
      if (charactersRef.current.length >= 4) return; // limit active popups

      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);

      // Check if spot is occupied
      const occupied = charactersRef.current.some((c) => c.row === row && c.col === col);
      if (occupied) return;

      const isRanger = Math.random() < 0.22; // 22% chance of being a ranger
      const type = isRanger ? "ranger" : "logger";
      const emoji = isRanger ? "🧑‍🌾" : "🪓";

      setCharacters((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          row,
          col,
          type,
          timeLeft: 1800 + Math.random() * 1200, // Reduced from 4000-6000 for faster and more intense action
          emoji,
        },
      ]);
    }, 750); // Spawning rate accelerated from 1500ms to 750ms

    return () => clearInterval(spawnInterval);
  }, [isPlaying]);

  // Handle timer countdown for active popups
  useEffect(() => {
    if (!isPlaying) return;

    let characterTicks = window.setInterval(() => {
      setCharacters((prev) => {
        let treeRotTimer = false;
        const updated = prev.map((char) => {
          return { ...char, timeLeft: char.timeLeft - 100 };
        });

        // Did any logger time out? If so, they chop down tree!
        const timedOutLoggers = updated.filter((char) => char.timeLeft <= 0 && char.type === "logger");
        if (timedOutLoggers.length > 0) {
          playSound("failure");
          setTreeCover((tc) => Math.max(0, tc - 10 * timedOutLoggers.length)); // Penalty increased from 6% to 10%
        }

        return updated.filter((char) => char.timeLeft > 0);
      });
    }, 100);

    return () => clearInterval(characterTicks);
  }, [isPlaying]);

  const handleCapture = (char: PopupCharacter, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying) return;

    // Remove popup
    setCharacters((prev) => prev.filter((c) => c.id !== char.id));

    if (char.type === "logger") {
      playSound("net");
      setNetsDeployed((nd) => nd + 1);
      setScore((s) => s + 70);
    } else {
      // Ranger! (Penalty)
      playSound("failure");
      setScore((s) => Math.max(0, s - 100)); // big deduction
      setTreeCover((tc) => Math.max(10, tc - 10)); // tiny drop
    }
  };

  // Safe game outcome states checked on committed render layout
  useEffect(() => {
    if (!isPlaying) return;
    if (treeCover <= 0) {
      setIsPlaying(false);
      onLose();
    }
  }, [treeCover, isPlaying, onLose]);

  useEffect(() => {
    if (!isPlaying) return;
    if (netsDeployed >= WIN_NETS_DEPLOYED) {
      setIsPlaying(false);
      playSound("victory");
      // Stars based on remaining tree cover
      let stars = 1;
      if (treeCover >= 80) stars = 3;
      else if (treeCover >= 50) stars = 2;
      onWin(score + 300 + treeCover * 5, stars);
    }
  }, [netsDeployed, treeCover, score, isPlaying, onWin]);

  const startCombat = () => {
    setScore(0);
    setNetsDeployed(0);
    setTreeCover(100);
    setCharacters([]);
    setIsPlaying(true);
    playSound("select");
  };

  return (
    <div 
      className="flex flex-col items-center bg-slate-900 border border-green-800 rounded-2xl p-6 text-white overflow-hidden max-w-xl mx-auto shadow-xl relative"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="w-full flex justify-between items-center mb-4">
        <span className="text-sm font-semibold tracking-wide text-lime-400 font-sans">
          MISSION 6: STOP THE LOGGERS
        </span>
        <div className="flex items-center gap-1.5 font-mono text-xs text-lime-200">
          <Trees className="w-4 h-4 text-emerald-500" />
          <span>Canopy: {treeCover}%</span>
        </div>
      </div>

      <div className="w-full flex justify-between text-xs text-lime-300 font-mono mb-4">
        <span>Loggers Captured: {netsDeployed} / {WIN_NETS_DEPLOYED}</span>
        <span>Score: {score} pts</span>
      </div>

      {/* Grid stage */}
      <div className="relative bg-slate-950 p-4 rounded-xl border border-lime-900 w-full aspect-square max-w-[340px]">
        {!isPlaying ? (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-10 rounded-xl">
            <span className="text-5xl mb-4 animate-bounce">🪓</span>
            <h4 className="text-lg font-bold text-lime-300">Save the Redwoods</h4>
            <p className="text-xs text-gray-300 max-w-xs mt-2 leading-relaxed">
              Greedy woodcutters are sneaking behind ancient trees. Deploy net traps to catch them before they fell trees. Do NOT trap the helpful Park Rangers (🧑‍🌾)!
            </p>
            <button
              onClick={startCombat}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-lime-600 to-emerald-700 rounded-lg text-sm font-bold shadow-lg shadow-lime-900/40 active:scale-95 transition-transform"
            >
              LAUNCH NET RECON
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-3 h-full">
          {Array.from({ length: 9 }).map((_, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            const activeChar = characters.find((c) => c.row === row && c.col === col);

            return (
              <div
                key={index}
                className="bg-slate-900/60 border border-slate-800 rounded-lg relative overflow-hidden flex items-end justify-center pb-2 shadow-inner"
              >
                {/* Background Mossy Bush */}
                <div className="absolute bottom-0 w-full h-8 bg-emerald-950/80 rounded-b-lg border-t border-emerald-900 flex items-center justify-center pointer-events-none">
                  <span className="text-xs text-emerald-800">🌿 Bush</span>
                </div>

                {activeChar && (
                  <button
                    onClick={(e) => handleCapture(activeChar, e)}
                    className="absolute z-10 bottom-4 text-3.5xl hover:scale-115 active:scale-95 transition-transform animate-bounce focus:outline-none flex flex-col items-center"
                    style={{ animationDuration: "1.2s" }}
                  >
                    <span>{activeChar.emoji}</span>
                    {/* Tiny timer line */}
                    <div className="w-8 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${(activeChar.timeLeft / 3500) * 100}%` }}
                      />
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-slate-400 font-sans">
        💡 Catch the loggers (🪓) instantly. Do NOT tap or cage the friendly park rangers (🧑‍🌾) or you'll suffer heavy score penalties!
      </div>
    </div>
  );
}

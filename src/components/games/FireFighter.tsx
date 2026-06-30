import React, { useState, useEffect } from "react";
import { playSound } from "../../utils/audio";
import { Flame, ShieldAlert, Sparkles } from "lucide-react";

interface GameProps {
  onWin: (score: number, stars: number) => void;
  onLose: () => void;
}

interface ForestFire {
  id: number;
  x: number;
  y: number;
  intensity: number; // 1 to 5, increases over time
}

interface AnimalResc {
  id: number;
  x: number;
  y: number;
  emoji: string;
  saved: boolean;
}

export default function FireFighter({ onWin, onLose }: GameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [heatLevel, setHeatLevel] = useState(25); // 0 (cool) to 100 (complete burn)
  const [fires, setFires] = useState<ForestFire[]>([]);
  const [animals, setAnimals] = useState<AnimalResc[]>([]);
  const [waterTank, setWaterTank] = useState(100); // 0 to 100% capacity

  const boxWidth = 450;
  const boxHeight = 350;
  const WIN_FIRES_DOUSED = 10;
  const [firesDoused, setFiresDoused] = useState(0);

  const firesDousedRef = React.useRef(firesDoused);
  firesDousedRef.current = firesDoused;
  const firesRef = React.useRef(fires);
  firesRef.current = fires;
  const animalsRef = React.useRef(animals);
  animalsRef.current = animals;

  useEffect(() => {
    if (!isPlaying) return;

    let animFrame: number;
    let spawnCounter = 0;
    let heatCounter = 0;

    const gameLoop = () => {
      // 1. Spawning fires naturally
      spawnCounter++;
      if (spawnCounter > 40 && firesRef.current.length < 9) {
        spawnCounter = 0;
        setFires((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: 40 + Math.random() * (boxWidth - 80),
            y: 40 + Math.random() * (boxHeight - 80),
            intensity: 1,
          },
        ]);

        // Randomly spawn an endangered animal in the burning woods!
        if (Math.random() < 0.35 && animalsRef.current.filter((a) => !a.saved).length < 2) {
          const animalList = ["🐿️", "🦔", "🦉", "🦌"];
          setAnimals((prev) => [
            ...prev,
            {
              id: Date.now() + 10,
              x: 50 + Math.random() * (boxWidth - 100),
              y: 50 + Math.random() * (boxHeight - 100),
              emoji: animalList[Math.floor(Math.random() * animalList.length)],
              saved: false,
            },
          ]);
        }
      }

      // 2. Heat ticks up based on fires count & fire intensity
      heatCounter++;
      if (heatCounter > 30) {
        heatCounter = 0;
        
        // Intensify fires
        setFires((prev) => {
          return prev.map((f) => {
            const nextLvl = Math.min(5, f.intensity + 0.4);
            return { ...f, intensity: nextLvl };
          });
        });

        // Update overall forest heat
        setHeatLevel((h) => {
          const addedHeat = firesRef.current.reduce((acc, f) => acc + f.intensity * 0.4, 0);
          const next = h + Math.round(addedHeat) - (firesRef.current.length === 0 ? 8 : 0);
          return Math.max(0, Math.min(100, next));
        });

        // Slowly replenish water tank over time
        setWaterTank((wt) => Math.min(100, wt + 10));
      }

      animFrame = requestAnimationFrame(gameLoop);
    };

    animFrame = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying]);

  // Direct click / hover behavior to spray water
  const handleSprayWater = (fireId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying) return;
    if (waterTank <= 0) return;

    playSound("water");
    setWaterTank((wt) => Math.max(0, wt - 3));

    setFires((prev) => {
      const match = prev.find((f) => f.id === fireId);
      if (!match) return prev;

      if (match.intensity <= 1) {
        setFiresDoused((fd) => fd + 1);
        setScore((s) => s + 60);
        return prev.filter((f) => f.id !== fireId);
      } else {
        // Douse intensity down
        return prev.map((f) => (f.id === fireId ? { ...f, intensity: f.intensity - 1.2 } : f));
      }
    });
  };

  // Safe win/loss game state checks on render commit
  useEffect(() => {
    if (!isPlaying) return;
    if (heatLevel >= 100) {
      setIsPlaying(false);
      onLose();
    }
  }, [heatLevel, isPlaying, onLose]);

  useEffect(() => {
    if (!isPlaying) return;
    if (firesDoused >= WIN_FIRES_DOUSED) {
      setIsPlaying(false);
      playSound("victory");
      // Stars based on low heat level
      let stars = 1;
      if (heatLevel <= 35) stars = 3;
      else if (heatLevel <= 65) stars = 2;
      onWin(score + 350 - heatLevel * 2, stars);
    }
  }, [firesDoused, heatLevel, score, isPlaying, onWin]);

  // Click on animals to rescue/safeguard them
  const handleRescueAnimal = (aniId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying) return;

    playSound("collect");
    setAnimals((prev) => prev.map((a) => (a.id === aniId ? { ...a, saved: true } : a)));
    setScore((s) => s + 150); // Massive bonus points!
  };

  const handleRefillWater = () => {
    if (!isPlaying) return;
    playSound("select");
    setWaterTank(100);
  };

  const startGame = () => {
    setScore(0);
    setFiresDoused(0);
    setHeatLevel(15);
    setWaterTank(100);
    setFires([
      { id: 1, x: 100, y: 120, intensity: 1.5 },
      { id: 2, x: 300, y: 200, intensity: 2 },
    ]);
    setAnimals([]);
    setIsPlaying(true);
    playSound("select");
  };

  return (
    <div 
      className="flex flex-col items-center bg-slate-900 border border-green-800 rounded-2xl p-6 text-white overflow-hidden max-w-xl mx-auto shadow-xl relative"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="w-full flex justify-between items-center mb-4">
        <span className="text-sm font-semibold tracking-wide text-orange-400 font-sans">
          MISSION 5: FIRE FIGHTER HERO
        </span>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span>Heat Limit: </span>
          <div className="w-20 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-300 ${heatLevel > 70 ? "bg-red-600" : heatLevel > 40 ? "bg-orange-500" : "bg-yellow-400"}`}
              style={{ width: `${heatLevel}%` }}
            />
          </div>
          <span className="text-red-400 font-bold">{heatLevel}%</span>
        </div>
      </div>

      <div className="w-full flex justify-between text-xs text-orange-300 font-mono mb-4">
        <span>Fires Extinguished: {firesDoused} / {WIN_FIRES_DOUSED}</span>
        <span>Score: {score} pts</span>
      </div>

      {/* Play Canvas Area */}
      <div
        className="relative bg-slate-950 rounded-xl overflow-hidden border border-orange-950 w-full"
        style={{ height: `${boxHeight}px`, width: `${boxWidth}px`, maxWidth: "100%" }}
      >
        {!isPlaying ? (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-xs">
            <span className="text-5xl mb-4 animate-bounce">🔥</span>
            <h4 className="text-lg font-bold text-orange-400">Evergreen forest on Fire!</h4>
            <p className="text-xs text-gray-300 max-w-md mt-2 leading-relaxed">
              Arid winds have ignited dangerous dry brush. Extinguish fires immediately before the high forest heat consumes the ecosystem! Keep an eye out for trapped forest wildlife (🐿️, 🦔, 🦉)!
            </p>
            <button
              onClick={startGame}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg text-sm font-bold shadow-lg shadow-red-900/40 active:scale-95 transition-transform"
            >
              DOUSE BRUSHFIRES
            </button>
          </div>
        ) : null}

        {/* Charcoal scorched trees background elements */}
        <div className="absolute bottom-4 left-6 text-slate-800 text-4xl select-none">🌲</div>
        <div className="absolute bottom-4 left-24 text-slate-800 text-5xl select-none">🌲</div>
        <div className="absolute bottom-4 right-10 text-slate-800 text-4xl select-none">🌲</div>
        <div className="absolute top-12 left-1/3 text-slate-800 text-3xl select-none">🌴</div>

        {/* Burning Wood Tones */}
        {fires.map((fire) => {
          const diameter = 30 + fire.intensity * 10;
          return (
            <button
              key={fire.id}
              onClick={(e) => handleSprayWater(fire.id, e)}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center hover:scale-110 active:scale-90 transition-all cursor-crosshair focus:outline-none"
              style={{
                left: `${fire.x}px`,
                top: `${fire.y}px`,
                width: `${diameter}px`,
                height: `${diameter}px`,
              }}
            >
              <Flame
                className="text-red-500 hover:text-orange-400"
                style={{
                  width: "100%",
                  height: "100%",
                  transform: `scale(${1 + Math.sin(Date.now() / 200) * 0.1})`,
                }}
              />
              <span className="absolute text-[10px] bg-black/60 px-1 py-0.2 rounded text-white font-mono -bottom-2">
                HP: {Math.round(fire.intensity * 20)}
              </span>
            </button>
          );
        })}

        {/* Trapped and endangered animal icons */}
        {animals.map((ani) => (
          <div
            key={ani.id}
            className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full select-none transition-all duration-500 ${
              ani.saved ? "bg-emerald-500/30 border border-emerald-400 opacity-60 scale-75" : "bg-red-500/20 border-2 border-red-500 animate-bounce"
            }`}
            style={{ left: `${ani.x}px`, top: `${ani.y}px` }}
          >
            {ani.saved ? (
              <span className="text-xl">💚 Saved!</span>
            ) : (
              <button
                onClick={(e) => handleRescueAnimal(ani.id, e)}
                className="text-2xl animate-pulse focus:outline-none focus:ring-2 focus:ring-green-400 rounded-full"
                title="Tap to rescue!"
              >
                {ani.emoji}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Hose controls at the bottom */}
      <div className="w-full mt-4 flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div className="flex flex-col gap-1 w-2/3">
          <span className="text-[10px] text-gray-400 font-mono">WATER TANK RESERVOIR</span>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full bg-cyan-500 transition-all duration-150`}
              style={{ width: `${waterTank}%` }}
            />
          </div>
        </div>
        <button
          onClick={handleRefillWater}
          className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-xs font-bold font-sans active:ring-2 active:ring-cyan-300"
          disabled={waterTank >= 95}
        >
          {waterTank < 30 ? "⚡ REFILL HOSE" : "Tank Ready"}
        </button>
      </div>

      <div className="mt-4 text-center text-xs text-slate-400 font-sans">
        💡 Hover or Click on spreading flames (🔥) to extinguish them. Tap trapped animals (🐿️, 🦔) to save them for +150 bonus points!
      </div>
    </div>
  );
}

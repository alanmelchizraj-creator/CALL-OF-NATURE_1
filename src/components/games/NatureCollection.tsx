import React, { useState, useEffect, useRef } from "react";
import { playSound } from "../../utils/audio";
import { Sparkles } from "lucide-react";

interface GameProps {
  onWin: (score: number, stars: number) => void;
  onLose: () => void;
}

export default function NatureCollection({ onWin, onLose }: GameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [basketX, setBasketX] = useState(250);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [items, setItems] = useState<{ id: number; x: number; y: number; type: "seed" | "berry" | "water" | "flower" | "trash"; emoji: string; speed: number }[]>([]);
  
  const containerWidth = 500;
  const gameHeight = 350;
  const basketWidth = 70;

  const basketXRef = useRef(basketX);
  basketXRef.current = basketX;

  useEffect(() => {
    if (!isPlaying) return;

    let animFrame: number;
    let spawnCounter = 0;

    const gameLoop = () => {
      // 1. Spawning items
      spawnCounter++;
      if (spawnCounter > 40) {
        spawnCounter = 0;
        const types: { type: "seed" | "berry" | "water" | "flower" | "trash"; emoji: string }[] = [
          { type: "seed", emoji: "🌱" },
          { type: "berry", emoji: "🍒" },
          { type: "water", emoji: "💧" },
          { type: "flower", emoji: "🌸" },
          { type: "trash", emoji: "🗑️" },
          { type: "trash", emoji: "🥫" },
          { type: "trash", emoji: "🧴" },
        ];
        const chosen = types[Math.floor(Math.random() * types.length)];
        setItems((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: 20 + Math.random() * (containerWidth - 60),
            y: 0,
            type: chosen.type,
            emoji: chosen.emoji,
            speed: 1.5 + Math.random() * 2,
          },
        ]);
      }

      // 2. Moving falling items
      setItems((prev) => {
        let updated = prev.map((item) => ({ ...item, y: item.y + item.speed }));

        // Checking collisions with bottom basket
        const caughtItems = updated.filter((item) => {
          const basketY = gameHeight - 35;
          const hitsY = item.y >= basketY - 10 && item.y <= basketY + 15;
          const hitsX = item.x >= basketXRef.current - 25 && item.x <= basketXRef.current + basketWidth - 15;
          return hitsY && hitsX;
        });

        // Add points or subtract health
        caughtItems.forEach((item) => {
          if (item.type === "trash") {
            playSound("failure");
            setHealth((h) => Math.max(0, h - 1));
          } else {
            playSound("collect");
            setScore((s) => s + 50);
          }
        });

        // Filter out those that hit basket or went past
        return updated.filter((item) => {
          const caught = caughtItems.some((ci) => ci.id === item.id);
          return !caught && item.y < gameHeight + 20;
        });
      });

      animFrame = requestAnimationFrame(gameLoop);
    };

    animFrame = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying]);

  // Handle keys for left/right basket slide
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        setBasketX((x) => Math.max(0, x - 25));
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        setBasketX((x) => Math.min(containerWidth - basketWidth, x + 25));
      }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [isPlaying]);

  // Check Game State for Win/Loss safely on render commits
  useEffect(() => {
    if (!isPlaying) return;
    if (health <= 0) {
      setIsPlaying(false);
      onLose();
    }
  }, [health, isPlaying, onLose]);

  useEffect(() => {
    if (!isPlaying) return;
    if (score >= 500) {
      setIsPlaying(false);
      playSound("victory");
      onWin(score + 200, health);
    }
  }, [score, isPlaying, health, onWin]);

  const handleTouchZone = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isPlaying) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    setBasketX(Math.max(0, Math.min(containerWidth - basketWidth, relativeX - basketWidth / 2)));
  };

  const startQuest = () => {
    setScore(0);
    setHealth(3);
    setItems([]);
    setBasketX(210);
    setIsPlaying(true);
    playSound("select");
  };

  return (
    <div 
      className="flex flex-col items-center bg-slate-900 border border-green-800 rounded-2xl p-6 text-white overflow-hidden max-w-xl mx-auto shadow-xl relative"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="w-full flex justify-between items-center mb-4">
        <span className="text-sm font-semibold tracking-wide text-teal-400 font-sans">
          MISSION 3: COLLECTION QUEST
        </span>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-md transition-all duration-300 ${i < health ? "text-red-500 scale-10" : "text-gray-600 scale-75"}`}>❤️</span>
          ))}
        </div>
      </div>

      <div className="w-full flex justify-between text-xs text-teal-200/70 font-mono mb-4">
        <span>Goal: 500 pts</span>
        <span>Current: {score} pts</span>
      </div>

      <div
        className="w-full rounded-xl relative overflow-hidden bg-slate-950 border border-teal-900 select-none cursor-ew-resize"
        style={{ height: `${gameHeight}px`, width: `${containerWidth}px`, maxWidth: "100%" }}
        onMouseMove={handleTouchZone}
        onTouchMove={handleTouchZone}
      >
        {!isPlaying ? (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-xs">
            <span className="text-5xl mb-4 animate-bounce">🧺</span>
            <h4 className="text-lg font-bold text-teal-300">Collect Natural Seeds</h4>
            <p className="text-xs text-gray-300 max-w-sm mt-2 leading-relaxed">
              Deteriorated soil needs vital organic materials to recover! Grab seeds, berries, and drops of water. Do NOT pick up toxic plastic or metal trash!
            </p>
            <button
              onClick={startQuest}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg text-sm font-bold shadow-lg shadow-teal-900/30 active:scale-95 transition-transform"
            >
              START HARVESTING
            </button>
          </div>
        ) : null}

        {/* Ambient forest canopy light beams */}
        <div className="absolute top-0 left-1/4 w-32 h-full bg-teal-500/5 -skew-x-12 blur-md" />
        <div className="absolute top-0 right-1/4 w-40 h-full bg-emerald-500/5 -skew-x-12 blur-md" />

        {/* Falling items */}
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute text-2xl transition-all duration-75 select-none"
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
            }}
          >
            {item.emoji}
          </div>
        ))}

        {/* Gathering Basket */}
        <div
          className="absolute h-9 bg-amber-800 border-2 border-amber-900 rounded-b-xl flex items-center justify-center font-bold text-[10px] text-amber-100 shadow-md shadow-black/80"
          style={{
            left: `${basketX}px`,
            bottom: "10px",
            width: `${basketWidth}px`,
          }}
        >
          🧺 GUARD
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm">✨</div>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-slate-400 font-sans">
        💡 Move your **mouse/finger** across the screen OR use <kbd className="bg-slate-800 px-1 py-0.5 rounded text-white text-[10px]">A</kbd> / <kbd className="bg-slate-800 px-1 py-0.5 rounded text-white text-[10px]">D</kbd> or <kbd className="bg-slate-800 px-1 py-0.5 rounded text-white text-[10px]">◀</kbd> / <kbd className="bg-slate-800 px-1 py-0.5 rounded text-white text-[10px]">▶</kbd> to slide the basket.
      </div>
    </div>
  );
}

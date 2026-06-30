import React, { useState, useEffect, useRef } from "react";
import { playSound } from "../../utils/audio";
import { Trash2, Waves } from "lucide-react";

interface GameProps {
  onWin: (score: number, stars: number) => void;
  onLose: () => void;
}

interface RiverItem {
  id: number;
  x: number;
  y: number;
  speed: number;
  type: "trash" | "wildlife";
  emoji: string;
  angle: number;
}

export default function RiverCleanup({ onWin, onLose }: GameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [items, setItems] = useState<RiverItem[]>([]);
  const [trashCleared, setTrashCleared] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const gameRef = useRef<HTMLDivElement>(null);

  const WIN_TRASH_CLEARED = 10;
  const boxWidth = 450;
  const boxHeight = 350;

  useEffect(() => {
    if (!isPlaying) return;

    let animFrame: number;
    let spawnCounter = 0;

    const gameLoop = () => {
      // 1. Spawning drifting river items
      spawnCounter++;
      if (spawnCounter > 30 && items.length < 12) {
        spawnCounter = 0;
        const isTrash = Math.random() < 0.65; // 65% trash, 35% wildlife
        
        let emoji = "🍼";
        let type: "trash" | "wildlife" = "trash";
        
        if (isTrash) {
          const trashEmojis = ["🍼", "🥫", "🛞", "🛍️", "🧴"];
          emoji = trashEmojis[Math.floor(Math.random() * trashEmojis.length)];
          type = "trash";
        } else {
          const wildlifeEmojis = ["🐟", "🐠", "🦦", "🐸"];
          emoji = wildlifeEmojis[Math.floor(Math.random() * wildlifeEmojis.length)];
          type = "wildlife";
        }

        setItems((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: 20 + Math.random() * (boxWidth - 60),
            y: -30, // scroll down from top
            speed: 0.8 + Math.random() * 1.2,
            type,
            emoji,
            angle: Math.random() * 0.1 - 0.05, // drifting skew
          },
        ]);
      }

      // 2. Drift items downriver
      setItems((prev) => {
        let itemsAtBottom: RiverItem[] = [];
        const moved = prev.map((item) => {
          const nx = item.x + Math.sin(item.y / 20) * 0.8; // wavy drift pathing
          const ny = item.y + item.speed;
          return { ...item, x: nx, y: ny };
        });

        // Detect those passing bottom floor
        itemsAtBottom = moved.filter((item) => item.y > boxHeight + 10);

        // If trash passes bottom, slight penalty (optional) or just filter out
        const missedTrashCount = itemsAtBottom.filter((i) => i.type === "trash").length;
        if (missedTrashCount > 0) {
          // simple score deductions if litter hits ocean
          setScore((s) => Math.max(0, s - 10 * missedTrashCount));
        }

        return moved.filter((item) => item.y <= boxHeight + 10);
      });

      animFrame = requestAnimationFrame(gameLoop);
    };

    animFrame = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying]);

  // Safe game outcome states checked on committed render layout
  useEffect(() => {
    if (!isPlaying) return;
    if (health <= 0) {
      setIsPlaying(false);
      onLose();
    }
  }, [health, isPlaying, onLose]);

  useEffect(() => {
    if (!isPlaying) return;
    if (trashCleared >= WIN_TRASH_CLEARED) {
      setIsPlaying(false);
      playSound("victory");
      onWin(score + 350 + health * 50, health);
    }
  }, [trashCleared, score, health, isPlaying, onWin]);

  const handleInteract = (item: RiverItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying) return;

    // Filter out item
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    if (item.type === "trash") {
      playSound("collect");
      setTrashCleared((tc) => tc + 1);
      setScore((s) => s + 50);
    } else {
      // Caught / spooked animal!
      playSound("failure");
      setHealth((h) => Math.max(0, h - 1));
    }
  };

  const startRescue = () => {
    setScore(0);
    setHealth(3);
    setTrashCleared(0);
    setItems([]);
    setIsPlaying(true);
    playSound("select");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameRef.current) return;
    const rect = gameRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div 
      className="flex flex-col items-center bg-slate-900 border border-green-800 rounded-2xl p-6 text-white overflow-hidden max-w-xl mx-auto shadow-xl relative"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?auto=format&fit=crop&w=800&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="w-full flex justify-between items-center mb-4">
        <span className="text-sm font-semibold tracking-wide text-cyan-400 font-sans">
          MISSION 8: RIVER CLEANUP
        </span>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`text-md transition-transform duration-300 ${i < health ? "text-red-500 scale-100" : "text-gray-600 scale-75"}`}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>

      <div className="w-full flex justify-between text-xs text-sky-300 font-mono mb-4">
        <span>Litter Scoped: {trashCleared} / {WIN_TRASH_CLEARED}</span>
        <span>Score: {score} pts</span>
      </div>

      {/* River Canvas with customized cursor mapping */}
      <div
        ref={gameRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative bg-gradient-to-b from-sky-950 to-blue-900 rounded-xl overflow-hidden border border-blue-950 w-full"
        style={{
          height: `${boxHeight}px`,
          width: `${boxWidth}px`,
          maxWidth: "100%",
          cursor: isPlaying && isHovered ? "none" : "default"
        }}
      >
        {!isPlaying ? (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-xs">
            <Waves className="w-12 h-12 text-cyan-400 animate-pulse mb-4" />
            <h4 className="text-lg font-bold text-cyan-300">Clean the Evergreen River</h4>
            <p className="text-xs text-gray-300 max-w-sm mt-2 leading-relaxed">
              Industrial leakage and plastics are floating down. Use your eco-cleanup Net to scoop up floating bottles, cans, and tires safely. Do NOT snag swimming creatures!
            </p>
            <button
              onClick={startRescue}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-sm font-bold shadow-lg shadow-cyan-900/40 active:scale-95 transition-transform"
            >
              CLEAN CURRENT
            </button>
          </div>
        ) : null}

        {/* Ambient flowing river lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="w-full h-1 bg-cyan-200 absolute top-12 animate-pulse" />
          <div className="w-full h-1 bg-cyan-200 absolute top-28 animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="w-full h-1 bg-cyan-200 absolute top-48 animate-pulse" style={{ animationDelay: "0.4s" }} />
          <div className="w-full h-1 bg-cyan-200 absolute top-72 animate-pulse" style={{ animationDelay: "0.1s" }} />
        </div>

        {/* Physical Net cursor overlay (follows mouse pointer) */}
        {isPlaying && isHovered && (
          <div
            className="absolute pointer-events-none text-4xl z-30 transition-transform select-none filter drop-shadow-[0_4px_12px_rgba(34,211,238,0.7)]"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            🕸️
          </div>
        )}

        {/* Floating drift objects */}
        {items.map((item) => (
          <button
            key={item.id}
            onClick={(e) => handleInteract(item, e)}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-2.5xl hover:scale-120 active:scale-90 transition-transform focus:outline-none"
            style={{ left: `${item.x}px`, top: `${item.y}px` }}
          >
            {item.emoji}
          </button>
        ))}
      </div>

      <div className="mt-4 text-center text-xs text-slate-400 font-sans">
        💡 Move your **glowing eco-net 🕸️** over the river and tap/click on floating trash items (🍼, 🥫, 🧴) to scoop them up. Avoid hitting local creatures (🐟, 🦦)!
      </div>
    </div>
  );
}

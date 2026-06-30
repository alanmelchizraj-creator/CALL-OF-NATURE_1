import React, { useState, useEffect } from "react";
import { playSound } from "../../utils/audio";
import { Heart, Activity } from "lucide-react";

interface GameProps {
  onWin: (score: number, stars: number) => void;
  onLose: () => void;
}

interface Bug {
  id: number;
  x: number;
  y: number;
  angle: number; // angle creeping towards center
  speed: number;
  type: "beetle" | "spider" | "mite";
  emoji: string;
}

export default function ProtectPlant({ onWin, onLose }: GameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [plantHealth, setPlantHealth] = useState(100);
  const [bugsZapped, setBugsZapped] = useState(0);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; text: string }[]>([]);

  const center = { x: 200, y: 175 }; // Plant position in the box
  const boxWidth = 400;
  const boxHeight = 350;
  const WIN_BUGS_ZAPPED = 10;
 
   useEffect(() => {
     if (!isPlaying) return;
 
     let animFrame: number;
     let spawnTimer = 0;
 
     const gameLoop = () => {
       // 1. Spawning bugs from borders
       spawnTimer++;
       if (spawnTimer > 100) {
        spawnTimer = 0;
        const bugTypes: { type: "beetle" | "spider" | "mite"; emoji: string }[] = [
          { type: "beetle", emoji: "🪲" },
          { type: "spider", emoji: "🕷️" },
          { type: "mite", emoji: "🐛" },
        ];
        const chosen = bugTypes[Math.floor(Math.random() * bugTypes.length)];
        
        // Spawn randomly around border
        let startX = 0;
        let startY = 0;
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { // Top
          startX = Math.random() * boxWidth;
          startY = 0;
        } else if (side === 1) { // Right
          startX = boxWidth;
          startY = Math.random() * boxHeight;
        } else if (side === 2) { // Bottom
          startX = Math.random() * boxWidth;
          startY = boxHeight;
        } else { // Left
          startX = 0;
          startY = Math.random() * boxHeight;
        }

        // Angle pointing to central plant
        const angle = Math.atan2(center.y - startY, center.x - startX);

        setBugs((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: startX,
            y: startY,
            angle: angle,
            speed: 0.5 + Math.random() * 0.6,
            type: chosen.type,
            emoji: chosen.emoji,
          },
        ]);
      }

      // 2. Advancing bugs closer to center
      setBugs((prev) => {
        let reachedBugs: Bug[] = [];
        let movingBugs = prev.map((bug) => {
          const nx = bug.x + Math.cos(bug.angle) * bug.speed;
          const ny = bug.y + Math.sin(bug.angle) * bug.speed;
          return { ...bug, x: nx, y: ny };
        });

        // Detect those within 30px of center plant
        reachedBugs = movingBugs.filter((bug) => {
          const dist = Math.hypot(bug.x - center.x, bug.y - center.y);
          return dist < 30;
        });

        if (reachedBugs.length > 0) {
          playSound("failure");
          setPlantHealth((h) => Math.max(0, h - 15 * reachedBugs.length));
        }

        // Filter out bugs that reached the centerpiece
        return movingBugs.filter((bug) => {
          const reached = reachedBugs.some((rb) => rb.id === bug.id);
          return !reached;
        });
      });

      animFrame = requestAnimationFrame(gameLoop);
    };

    animFrame = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying]);

  // Click handler to zap bugs
  const handleBugClick = (bugId: number, bx: number, by: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying) return;
    
    playSound("zap");
    setBugs((prev) => prev.filter((b) => b.id !== bugId));
    setBugsZapped((z) => z + 1);

    // Create cloud particles representation
    setParticles((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), x: bx, y: by, text: "🌸 Saved!" },
    ]);
  };

  // Safe win/loss game state checks on render commit
  useEffect(() => {
    if (!isPlaying) return;
    if (plantHealth <= 0) {
      setIsPlaying(false);
      onLose();
    }
  }, [plantHealth, isPlaying, onLose]);

  useEffect(() => {
    if (!isPlaying) return;
    if (bugsZapped >= WIN_BUGS_ZAPPED) {
      setIsPlaying(false);
      playSound("victory");
      // Calculate stars based on remaining plant health
      let stars = 1;
      if (plantHealth >= 80) stars = 3;
      else if (plantHealth >= 50) stars = 2;
      onWin(bugsZapped * 50 + plantHealth * 5, stars);
    }
  }, [bugsZapped, plantHealth, isPlaying, onWin]);

  // Remove stale particles
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles((prev) => prev.slice(1));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  const startGame = () => {
    setPlantHealth(100);
    setBugsZapped(0);
    setBugs([]);
    setParticles([]);
    setIsPlaying(true);
    playSound("select");
  };

  return (
    <div 
      className="flex flex-col items-center bg-slate-900 border border-green-800 rounded-2xl p-6 text-white overflow-hidden max-w-xl mx-auto shadow-xl relative"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('/src/assets/images/harmony_1782201450092.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="w-full flex justify-between items-center mb-4">
        <span className="text-sm font-semibold tracking-wide text-purple-400 font-sans">
          MISSION 4: PROTECT THE PLANT
        </span>
        <div className="flex items-center gap-1 bg-red-950/40 border border-red-900/60 rounded px-2 py-0.5">
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <span className="text-xs font-mono font-bold text-red-400">{plantHealth}%</span>
        </div>
      </div>

      <div className="w-full flex justify-between text-xs text-purple-300 font-mono mb-4">
        <span>Defended: {bugsZapped} / {WIN_BUGS_ZAPPED}</span>
        <span>Threat: {bugs.length} crawling</span>
      </div>

      <div
        className="relative bg-slate-950 rounded-xl overflow-hidden border border-purple-900 w-full"
        style={{ height: `${boxHeight}px`, width: `${boxWidth}px`, maxWidth: "100%" }}
      >
        {!isPlaying ? (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-xs">
            <span className="text-5xl mb-4 animate-pulse">🌸</span>
            <h4 className="text-lg font-bold text-purple-300">The Heart of Evergreen</h4>
            <p className="text-xs text-gray-300 max-w-sm mt-2 leading-relaxed">
              Invasive pests are swarming the last glowing spirit blossom. Tap/click on approaching insects to zap them with water drops before they feed on the flower!
            </p>
            <button
              onClick={startGame}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-sm font-bold shadow-lg shadow-purple-900/30 active:scale-95 transition-transform"
            >
              DEFEND BLOSSOM
            </button>
          </div>
        ) : null}

        {/* Outer ambient glow rings */}
        <div
          className="absolute rounded-full border border-purple-500/10 animate-ping duration-3000 pointer-events-none"
          style={{
            left: `${center.x - 60}px`,
            top: `${center.y - 60}px`,
            width: "120px",
            height: "120px",
          }}
        />

        {/* Central glowing flower */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 select-none"
          style={{ left: `${center.x}px`, top: `${center.y}px` }}
        >
          <div className="relative">
            <span className="text-5xl animate-bounce duration-2000">🌸</span>
            <div className="absolute -inset-1 rounded-full bg-purple-500/20 blur-md pointer-events-none animate-pulse" />
          </div>
        </div>

        {/* Crawling bugs */}
        {bugs.map((bug) => (
          <button
            key={bug.id}
            onClick={(e) => handleBugClick(bug.id, bug.x, bug.y, e)}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl hover:scale-125 transition-transform active:scale-90 cursor-crosshair focus:outline-none"
            style={{ left: `${bug.x}px`, top: `${bug.y}px` }}
          >
            {bug.emoji}
          </button>
        ))}

        {/* Particle alerts */}
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-teal-400 font-mono animate-bounce select-none pointer-events-none bg-slate-900/80 px-1.5 py-0.5 rounded shadow"
            style={{ left: `${p.x}px`, top: `${p.y - 15}px`, animationDuration: "0.8s" }}
          >
            {p.text}
          </span>
        ))}
      </div>

      <div className="mt-4 text-center text-xs text-slate-400 font-sans">
        💡 Tap or Click directly on crawling insects (🪲, 🕷️, 🐛) to clear them. Let none touch the central plant!
      </div>
    </div>
  );
}

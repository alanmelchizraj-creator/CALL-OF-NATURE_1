import React, { useState, useEffect, useRef } from "react";
import { playSound } from "../../utils/audio";
import { Snowflake, Leaf, Shield, Award } from "lucide-react";

interface GameProps {
  onWin: (score: number, stars: number) => void;
  onLose: () => void;
}

export default function ForestRunner({ onWin, onLose }: GameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [deerY, setDeerY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<{ id: number; x: number; type: "log" | "rock" | "pit"; width: number; height: number }[]>([]);
  const [collectibles, setCollectibles] = useState<{ id: number; x: number; y: number; collected: boolean }[]>([]);
  const [puzzles, setPuzzles] = useState<{ id: number; x: number; y: number; collected: boolean }[]>([]);
  const [puzzlePiecesCollected, setPuzzlePiecesCollected] = useState<number>(0);
  const [health, setHealth] = useState(3);
  const gameRef = useRef<HTMLDivElement>(null);

  const TARGET_DISTANCE = 1000; // 1000 meters to reach the safe habitat
  const gameSpeed = 4; // px per frame
  const containerWidth = 600;

  useEffect(() => {
    if (!isPlaying) return;

    let animFrame: number;
    let obstacleTimer = 0;
    let collectibleTimer = 0;
    let puzzleTimer = 0;

    const gameLoop = () => {
      // 1. Advance Distance
      setDistance((prev) => Math.min(prev + 1.2, TARGET_DISTANCE)); // increment distance slightly faster to make it feel responsive

      // 2. Spawn Obstacles
      obstacleTimer++;
      if (obstacleTimer > 150) {
        obstacleTimer = 0;
        const types: ("log" | "rock" | "pit")[] = ["log", "rock", "pit"];
        const randomType = types[Math.floor(Math.random() * types.length)];
        setObstacles((prev) => [
          ...prev,
          {
            id: Date.now(),
            x: containerWidth,
            type: randomType,
            width: randomType === "pit" ? 28 : 22,
            height: randomType === "log" ? 18 : randomType === "rock" ? 18 : 8,
          },
        ]);
      }

      // 3. Spawn Collectibles (Green leaves)
      collectibleTimer++;
      if (collectibleTimer > 60) {
        collectibleTimer = 0;
        setCollectibles((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            x: containerWidth,
            y: 40 + Math.random() * 80,
            collected: false,
          },
        ]);
      }

      // 3b. Spawn Puzzle pieces (🧩)
      puzzleTimer++;
      if (puzzleTimer > 200) {
        puzzleTimer = 0;
        setPuzzles((prev) => [
          ...prev,
          {
            id: Date.now() + 5,
            x: containerWidth,
            y: 60 + Math.random() * 60,
            collected: false,
          },
        ]);
      }

      // 4. Update Obstacles positional movement
      setObstacles((prev) => {
        return prev
          .map((ob) => ({ ...ob, x: ob.x - gameSpeed }))
          .filter((ob) => ob.x > -50);
      });

      // 5. Update Collectibles positional movement
      setCollectibles((prev) => {
        return prev
          .map((item) => ({ ...item, x: item.x - gameSpeed }))
          .filter((item) => item.x > -50);
      });

      // 5b. Update Puzzle positional movement
      setPuzzles((prev) => {
        return prev
          .map((item) => ({ ...item, x: item.x - gameSpeed }))
          .filter((item) => item.x > -50);
      });

      animFrame = requestAnimationFrame(gameLoop);
    };

    animFrame = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying]);

  // Jump physics emulation with standard react intervals for simplicity - now optimized for perfect clearance!
  useEffect(() => {
    if (!isPlaying) return;
    if (isJumping) {
      let height = 0;
      let goingUp = true;
      const jumpInterval = setInterval(() => {
        if (goingUp) {
          height += 18;
          if (height >= 165) goingUp = false; // Higher, easier flight!
        } else {
          height -= 10; // Slower, softer landing gives player full control
          if (height <= 0) {
            height = 0;
            setIsJumping(false);
            clearInterval(jumpInterval);
          }
        }
        setDeerY(height);
      }, 16); // Faster framerate iteration for perfectly fluid control

      return () => clearInterval(jumpInterval);
    }
  }, [isJumping, isPlaying]);

  // Handle Collisions with obstacles, leaves, and puzzles
  useEffect(() => {
    if (!isPlaying) return;

    // Check collisions
    obstacles.forEach((ob) => {
      // Deer x range is roughly 50px to 90px
      const deerX = 70;
      const deerWidth = 40;
      // Generous hitbox buffer ensures player gets a clean window to clear obstacles
      const xOverlap = (ob.x + 10) < (deerX + deerWidth) && (ob.x + ob.width - 10) > deerX;

      if (xOverlap) {
        // Pit collision is on ground, logs/rocks are on ground
        const isGroundObstacle = ob.type === "pit" || ob.type === "log" || ob.type === "rock";
        // If deer height is low, we hit! Any jump (deerY >= 4) is perfectly safe!
        const hitHeightThreshold = 4;
        
        if (isGroundObstacle && deerY < hitHeightThreshold) {
          // Remove obstacle so it doesn't multi-hit
          setObstacles((prev) => prev.filter((o) => o.id !== ob.id));
          playSound("failure");
          setHealth((h) => Math.max(0, h - 1));
        }
      }
    });

    collectibles.forEach((item) => {
      if (item.collected) return;
      const deerX = 70;
      const deerWidth = 40;
      const xOverlap = item.x < deerX + deerWidth && item.x + 20 > deerX;
      
      // Collectible altitude vs Deer altitude
      const dy = Math.abs(item.y - (deerY + 30)); // 30 is base body height approx
      if (xOverlap && dy < 40) {
        // Collect!
        playSound("collect");
        setCollectibles((prev) =>
          prev.map((c) => (c.id === item.id ? { ...c, collected: true } : c))
        );
        setScore((s) => s + 50);
      }
    });

    puzzles.forEach((item) => {
      if (item.collected) return;
      const deerX = 70;
      const deerWidth = 40;
      const xOverlap = item.x < deerX + deerWidth && item.x + 24 > deerX;
      
      const dy = Math.abs(item.y - (deerY + 30));
      if (xOverlap && dy < 45) {
        // Collect puzzle piece!
        playSound("collect");
        setPuzzles((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, collected: true } : p))
        );
        setPuzzlePiecesCollected((p) => Math.min(3, p + 1));
        setScore((s) => s + 150);
      }
    });
  }, [obstacles, collectibles, puzzles, deerY, isPlaying]);

  const handleJump = () => {
    if (!isPlaying) return;
    if (!isJumping) {
      playSound("jump");
      setIsJumping(true);
    }
  };

  const handleStart = () => {
    setScore(0);
    setDistance(0);
    setDeerY(0);
    setHealth(3);
    setObstacles([]);
    setCollectibles([]);
    setPuzzles([]);
    setPuzzlePiecesCollected(0);
    setIsPlaying(true);
    playSound("select");
  };

  // Monitor win or loss conditions safely on committed renders
  useEffect(() => {
    if (!isPlaying) return;
    if (health <= 0) {
      setIsPlaying(false);
      onLose();
    }
  }, [health, isPlaying, onLose]);

  useEffect(() => {
    if (!isPlaying) return;
    if (distance >= TARGET_DISTANCE && puzzlePiecesCollected >= 3) {
      setIsPlaying(false);
      const totalPoints = score + 400; // completion bonus
      let stars = 1;
      if (health === 3) stars = 3;
      else if (health === 2) stars = 2;
      onWin(totalPoints, stars);
    }
  }, [distance, isPlaying, health, score, puzzlePiecesCollected, onWin]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPlaying, isJumping]);

  return (
    <div className="flex flex-col items-center bg-slate-900 border border-green-800 rounded-2xl p-6 text-white overflow-hidden max-w-xl mx-auto shadow-xl">
      <div className="w-full flex justify-between items-center mb-4">
        <span className="text-sm font-semibold tracking-wide text-emerald-400 font-sans">
          MISSION 1: FOREST RUNNER
        </span>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`text-lg transition-transform duration-300 ${i < health ? "text-red-500 scale-100" : "text-gray-600 scale-75"}`}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* Progress slider bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 mb-4 relative overflow-hidden">
        <div
          className="bg-emerald-500 h-full transition-all duration-100 ease-out"
          style={{ width: `${(distance / TARGET_DISTANCE) * 100}%` }}
        />
      </div>

      <div className="w-full flex justify-between text-xs text-gray-400 font-mono mb-4 bg-slate-950/40 p-2 rounded-lg border border-slate-800">
        <span className="flex items-center gap-1">🗺️ {Math.floor(distance)}m / {TARGET_DISTANCE}m</span>
        <span className="text-yellow-400 font-bold flex items-center gap-1">🧩 Puzzles: {puzzlePiecesCollected} / 3</span>
        <span>Score: {score} pts</span>
      </div>

      {/* Play Stage */}
      <div
        ref={gameRef}
        onClick={handleJump}
        className="w-full h-48 bg-slate-950 rounded-xl relative overflow-hidden cursor-pointer border border-emerald-900"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(6, 78, 59, 0.85)), url('https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=800&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {!isPlaying ? (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 text-center z-10 backdrop-blur-xs">
            <span className="text-5xl mb-2 animate-bounce inline-block" style={{ transform: "scaleX(-1)" }}>🦌</span>
            <h4 className="text-lg font-bold text-emerald-300 font-sans">Guide the Deer home</h4>
            <p className="text-xs text-gray-300 max-w-sm mt-1 leading-relaxed">
              Deforestation is pushing wildlife out! Jump over logs and rocky pits to reach the Evergreen Sanctuary.
            </p>
            <p className="text-[10px] text-yellow-400 font-extrabold mt-1 uppercase">
              ⚠️ Objective: Collect 3 🧩 puzzle pieces to complete the map!
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStart();
              }}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/30 active:scale-95 transition-transform"
            >
              START RUN
            </button>
          </div>
        ) : null}

        {/* Ambient Moon */}
        <div className="absolute top-4 right-8 w-12 h-12 rounded-full bg-emerald-100/10 blur-xs" />
        <div className="absolute top-4 right-8 w-12 h-12 rounded-full border border-emerald-500/20" />

        {/* Scrolling background trees parallax emulation */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-emerald-900/40 flex items-end justify-around select-none pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="text-3xl text-emerald-900/20 animate-pulse duration-1000" style={{ transform: `translateX(-${(distance * 2) % 100}px)` }}>🌲</span>
          ))}
        </div>

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-stone-800 to-stone-900 border-t-2 border-emerald-800" />

        {/* Deer character sprite representation */}
        <div
          className="absolute left-16 transition-all duration-75"
          style={{ bottom: `${deerY + 30}px` }} // bottom bound is ground level
        >
          <div className="flex flex-col items-center relative select-none">
            {/* Animated legs */}
            <span className="text-3xl select-none relative animate-bounce inline-block" style={{ transform: "scaleX(-1)" }}>🦌</span>
            {isJumping && (
              <span className="absolute -bottom-3 text-[10px] text-emerald-400 animate-ping">⚡</span>
            )}
          </div>
        </div>

        {/* Obstacles Rendering */}
        {obstacles.map((ob) => (
          <div
            key={ob.id}
            className="absolute"
            style={{
              left: `${ob.x}px`,
              bottom: "30px", // Ground base is 30px
              width: `${ob.width}px`,
              height: `${ob.height}px`,
            }}
          >
            {ob.type === "log" && (
              <span className="text-2xl select-none leading-none absolute bottom-0">🪵</span>
            )}
            {ob.type === "rock" && (
              <span className="text-xl select-none leading-none absolute bottom-0">🪨</span>
            )}
            {ob.type === "pit" && (
              <div className="w-full h-4 bg-red-950 border-t-2 border-red-500 rounded-b-md absolute top-0" />
            )}
          </div>
        ))}

        {/* Collectible Leaves */}
        {collectibles.map((item) => (
          !item.collected && (
            <div
              key={item.id}
              className="absolute animate-bounce"
              style={{
                left: `${item.x}px`,
                bottom: `${item.y}px`,
              }}
            >
              <span className="text-lg select-none">🍃</span>
            </div>
          )
        ))}

        {/* Collectible Puzzles */}
        {puzzles.map((item) => (
          !item.collected && (
            <div
              key={item.id}
              className="absolute animate-bounce"
              style={{
                left: `${item.x}px`,
                bottom: `${item.y}px`,
              }}
            >
              <span className="text-xl select-none filter drop-shadow">🧩</span>
            </div>
          )
        ))}
      </div>

      <div className="mt-4 text-center text-xs text-slate-400 font-sans">
        💡 <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white text-[10px]">SPACE</kbd> or <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white text-[10px]">CLICK</kbd> on the screen to Jump. Avoid obstacles, collect 🍃 leaves, and snag 3 🧩 puzzle pieces to win!
      </div>
    </div>
  );
}

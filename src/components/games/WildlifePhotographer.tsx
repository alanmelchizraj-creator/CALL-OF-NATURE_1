import React, { useState, useEffect } from "react";
import { playSound } from "../../utils/audio";
import { Camera, Eye, Info } from "lucide-react";

interface GameProps {
  onWin: (score: number, stars: number) => void;
  onLose: () => void;
}

interface PhotoSpawn {
  id: number;
  x: number;
  y: number;
  emoji: string;
  name: string;
  timeLeft: number; // ms to tap
  maxTime: number;
  isSnapped: boolean;
}

export default function WildlifePhotographer({ onWin, onLose }: GameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(40);
  const [spawns, setSpawns] = useState<PhotoSpawn[]>([]);
  const [photosSnapped, setPhotosSnapped] = useState(0);
  const [lastRating, setLastRating] = useState<string | null>(null);

  const WIN_PHOTOS_NEEDED = 8;
  const boxWidth = 450;
  const boxHeight = 350;

  // Track ticking seconds
  useEffect(() => {
    if (!isPlaying) return;
    if (timeRemaining <= 0) {
      playSound("failure");
      setIsPlaying(false);
      if (photosSnapped < WIN_PHOTOS_NEEDED) {
        onLose();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeRemaining, photosSnapped]);

  // Spawning animals in bushes & skies
  useEffect(() => {
    if (!isPlaying) return;

    const spawnTimer = window.setInterval(() => {
      setSpawns((prev) => {
        if (prev.filter((s) => !s.isSnapped).length >= 2) return prev;

        const animals = [
          { emoji: "🐯", name: "Bengal Tiger" },
          { emoji: "🦅", name: "Bald Eagle" },
          { emoji: "🐼", name: "Giant Panda" },
          { emoji: "🦊", name: "Red Fox" },
          { emoji: "🦉", name: "Great Horned Owl" },
          { emoji: "🐿️", name: "Chipmunk" },
        ];
        const chosen = animals[Math.floor(Math.random() * animals.length)];

        return [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: 40 + Math.random() * (boxWidth - 80),
            y: 40 + Math.random() * (boxHeight - 80),
            emoji: chosen.emoji,
            name: chosen.name,
            timeLeft: 2200, // 2.2 seconds to snap photo
            maxTime: 2200,
            isSnapped: false,
          },
        ];
      });
    }, 1200);

    return () => clearInterval(spawnTimer);
  }, [isPlaying]);

  // Ticking individual spawn visibility timers
  useEffect(() => {
    if (!isPlaying) return;

    let visibilityTick = window.setInterval(() => {
      setSpawns((prev) => {
        const updated = prev.map((s) => ({ ...s, timeLeft: s.timeLeft - 100 }));
        return updated.filter((s) => s.timeLeft > 0 || s.isSnapped);
      });
    }, 100);

    return () => clearInterval(visibilityTick);
  }, [isPlaying]);

  const snapPhoto = (s: PhotoSpawn, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying) return;
    if (s.isSnapped) return;

    // Trigger physical shutter sounds
    playSound("shutter");

    setSpawns((prev) => prev.map((cur) => (cur.id === s.id ? { ...cur, isSnapped: true } : cur)));

    // Calculate quality rating based on remaining time
    const ratio = s.timeLeft / s.maxTime;
    let quality = "Perfect Focus! 🌟";
    let gainedPoints = 150;

    if (ratio > 0.70) {
      quality = "Perfect Focus! 🌟";
      gainedPoints = 150;
    } else if (ratio > 0.40) {
      quality = "Good Focus 👍";
      gainedPoints = 90;
    } else {
      quality = "Slightly Blurry 📸";
      gainedPoints = 40;
    }

    setLastRating(`${s.emoji} ${s.name}: ${quality} (+${gainedPoints} pts)`);
    setScore((sc) => sc + gainedPoints);
    setPhotosSnapped((ps) => ps + 1);
  };

  // Safe game outcome states checked on committed render layout
  useEffect(() => {
    if (!isPlaying) return;
    if (photosSnapped >= WIN_PHOTOS_NEEDED) {
      setIsPlaying(false);
      playSound("victory");
      // Stars based on overall accuracy & points
      let stars = 1;
      if (score >= 900) stars = 3;
      else if (score >= 600) stars = 2;
      onWin(score + timeRemaining * 10, stars);
    }
  }, [photosSnapped, score, timeRemaining, isPlaying, onWin]);

  const startPhotography = () => {
    setScore(0);
    setTimeRemaining(40);
    setPhotosSnapped(0);
    setSpawns([]);
    setLastRating(null);
    setIsPlaying(true);
    playSound("select");
  };

  return (
    <div 
      className="flex flex-col items-center bg-slate-900 border border-green-800 rounded-2xl p-6 text-white overflow-hidden max-w-xl mx-auto shadow-xl relative"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('/src/assets/images/guardian_awaken_1782201535249.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="w-full flex justify-between items-center mb-4">
        <span className="text-sm font-semibold tracking-wide text-fuchsia-400 font-sans">
          MISSION 9: WILDLIFE PHOTOGRAPHER
        </span>
        <div className="text-xs font-mono text-zinc-300">
          ⏳ {timeRemaining}s Left
        </div>
      </div>

      <div className="w-full flex justify-between text-xs text-fuchsia-300 font-mono mb-4">
        <span>Snapped: {photosSnapped} / {WIN_PHOTOS_NEEDED}</span>
        <span>Score: {score} pts</span>
      </div>

      {lastRating && (
        <div className="w-full bg-fuchsia-950/40 border border-fuchsia-900/40 p-2 text-center rounded-lg text-xs mb-3 text-fuchsia-300 animate-pulse font-sans">
          {lastRating}
        </div>
      )}

      {/* Camera viewfinder canvas */}
      <div
        className="relative bg-slate-950 rounded-xl overflow-hidden border border-fuchsia-950 w-full cursor-crosshair"
        style={{ height: `${boxHeight}px`, width: `${boxWidth}px`, maxWidth: "100%" }}
      >
        {!isPlaying ? (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center z-10 backdrop-blur-xs">
            <Camera className="w-12 h-12 text-fuchsia-400 animate-pulse mb-4" />
            <h4 className="text-lg font-bold text-fuchsia-300">Sanctuary Bio-Documentation</h4>
            <p className="text-xs text-gray-300 max-w-sm mt-2 leading-relaxed">
              Animals are returning to recovered meadows! Scan the environment. As soon as an animal rustles out of hiding, click them instantly with high focus to snap their picture. Focus quality determines points!
            </p>
            <button
              onClick={startPhotography}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-fuchsia-500 to-pink-600 rounded-lg text-sm font-bold shadow-lg shadow-fuchsia-900/40 active:scale-95 transition-transform"
            >
              FOCUS LENS
            </button>
          </div>
        ) : null}

        {/* Viewfinder Circle Overlay (Camera effect) */}
        <div className="absolute inset-4 border border-white/5 rounded-lg pointer-events-none flex items-center justify-center">
          <div className="w-40 h-40 border-2 border-dashed border-white/10 rounded-full" />
        </div>

        {/* Spawning target species */}
        {spawns.map(
          (s) =>
            !s.isSnapped && (
              <button
                key={s.id}
                onClick={(e) => snapPhoto(s, e)}
                className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 flex flex-col items-center transition-all hover:scale-110 active:scale-95"
                style={{ left: `${s.x}px`, top: `${s.y}px` }}
              >
                <span className="text-4xl animate-pulse">{s.emoji}</span>
                {/* Visual shrinking timer circle representation */}
                <div className="w-10 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1 pointer-events-none">
                  <div
                    className="h-full bg-fuchsia-500 transition-all duration-100 ease-linear"
                    style={{ width: `${(s.timeLeft / s.maxTime) * 100}%` }}
                  />
                </div>
              </button>
            )
        )}
      </div>

      <div className="mt-4 text-center text-xs text-slate-400 font-sans">
        💡 Hover and Click animals (🐯, 🦅, 🐼) the moment they pop out of the brush. Be swift to grab a 3-star "Perfect Focus" snap!
      </div>
    </div>
  );
}

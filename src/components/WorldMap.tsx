import React from "react";
import { playSound } from "../utils/audio";
import { MISSIONS_LIST, MissionConfig } from "../types";
import { Star, Target, Trees } from "lucide-react";
import ecologyMap from "../assets/images/ecology_map_1782201714180.jpg";

interface MapProps {
  unlockedMissions: number[];
  missionStars: Record<number, number>;
  onSelectMission: (mission: MissionConfig) => void;
  onBackToMenu: () => void;
}

export default function WorldMap({ unlockedMissions, missionStars, onSelectMission }: MapProps) {
  
  const handleSelect = (mission: MissionConfig) => {
    const isUnlocked = unlockedMissions.includes(mission.id);
    if (isUnlocked) {
      playSound("select");
      onSelectMission(mission);
    } else {
      playSound("failure");
    }
  };

  return (
    <div className="relative w-full flex-1 flex flex-col justify-between p-4 rounded-2xl overflow-hidden border border-emerald-900/40 bg-zinc-950/80 shadow-inner">
      {/* Immersive background map */}
      <div 
        style={{ backgroundImage: `url(${ecologyMap})` }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.22] pointer-events-none filter brightness-90 contrast-125"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent pointer-events-none" />

      {/* Grid of stages */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 z-10 py-4 relative">
        {MISSIONS_LIST.map((mission, idx) => {
          const isUnlocked = unlockedMissions.includes(mission.id);
          const starsEarned = missionStars[mission.id] || 0;
          const isCompleted = starsEarned > 0;
          
          return (
            <button
              key={mission.id}
              onClick={() => handleSelect(mission)}
              disabled={!isUnlocked}
              className={`p-4 rounded-2xl flex flex-col items-center justify-between transition-all duration-300 relative border-2 min-h-[140px] shadow-lg group select-none cursor-pointer ${
                isUnlocked
                  ? isCompleted
                    ? "bg-slate-900/90 hover:bg-slate-800/90 text-white border-emerald-500/50 hover:border-lime-400 hover:scale-105 active:scale-95"
                    : "bg-emerald-950/80 text-white border-amber-500 hover:border-yellow-300 hover:scale-105 active:scale-95 animate-pulse"
                  : "bg-zinc-950/40 border-slate-900 text-slate-700 cursor-not-allowed opacity-40"
              }`}
            >
              {/* Floating index identifier indicator */}
              <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs border-2 select-none shadow-md ${
                isUnlocked
                  ? isCompleted
                    ? "bg-emerald-950 text-emerald-400 border-emerald-500"
                    : "bg-amber-950 text-amber-400 border-amber-500"
                  : "bg-zinc-900 text-zinc-650 border-zinc-950"
              }`}>
                {String(idx + 1).padStart(2, "0")}
              </div>

              {/* Central symbol icon */}
              <div className="text-4xl select-none mt-2 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] transform group-hover:scale-110 transition-transform">
                {isUnlocked ? mission.bannerEmoji : "🔒"}
              </div>

              {/* Label */}
              <div className="text-center mt-2.5">
                <span className={`text-[11px] uppercase tracking-widest font-extrabold block leading-none ${
                  isUnlocked ? "text-slate-100" : "text-slate-600"
                }`}>
                  {mission.title}
                </span>
                {isUnlocked && !isCompleted && (
                  <span className="text-[8px] bg-amber-500 text-amber-950 font-black uppercase px-2 py-0.5 rounded mt-1.5 inline-block animate-bounce" style={{ animationDuration: "2s" }}>
                    ACTIVE
                  </span>
                )}
              </div>

              {/* Star Rating Tracker */}
              <div className="flex gap-1 justify-center mt-3 w-full">
                {isUnlocked && isCompleted ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < starsEarned ? "text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_2px_rgba(234,179,8,0.5)]" : "text-slate-650"
                      }`}
                    />
                  ))
                ) : !isUnlocked ? (
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-600 font-mono">Unreached</span>
                ) : (
                  <span className="text-[9px] uppercase font-extrabold tracking-wider text-amber-400 flex items-center gap-1 font-mono">
                     <Target className="w-3 h-3 text-amber-400" /> START
                  </span>
                )}
              </div>

            </button>
          );
        })}
      </div>
      
      {/* Map statistics summary */}
      <div className="mt-4 pt-4 border-t border-emerald-500/10 text-center flex flex-wrap justify-between items-center text-xs font-bold text-slate-400 gap-2 z-10 relative">
        <span className="flex items-center gap-1.5 font-sans">
          <Trees className="w-4 h-4 text-emerald-400" /> Complete missions to return wild species back home!
        </span>
        <span className="font-mono text-[10px] bg-emerald-950/60 text-emerald-400 px-3 py-1 rounded-lg border border-emerald-500/20 shadow-md">
          島 Sanctuary Healed: {Math.round((Object.keys(missionStars).length / 10) * 100)}%
        </span>
      </div>
    </div>
  );
}

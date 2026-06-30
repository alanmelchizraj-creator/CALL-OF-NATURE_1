import React, { useEffect } from "react";
import { playSound } from "../utils/audio";
import { Play, BookOpen, Trophy, Settings, HelpCircle, Compass, LogOut, Globe } from "lucide-react";
import { motion } from "motion/react";
import treeOfLife from "../assets/images/tree_of_life_1782201568074.jpg";

interface MenuProps {
  onNavigate: (view: "story" | "lobby" | "world" | "encyclopedia" | "achievements" | "settings" | "credits" | "chrome") => void;
  naturePoints: number;
  onInstallPWA?: () => void;
}

export default function MainMenu({ onNavigate, naturePoints, onInstallPWA }: MenuProps) {
  const handleSelectNav = (view: "story" | "lobby" | "world" | "encyclopedia" | "achievements" | "settings" | "credits" | "chrome") => {
    playSound("select");
    onNavigate(view);
  };

  return (
    <div className="relative min-h-[92vh] w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border border-amber-500/20 bg-zinc-950 flex flex-col justify-between shadow-[0_24px_70px_-15px_rgba(0,0,0,0.95)]">
      {/* Background treeOfLife cover */}
      <div 
        style={{ backgroundImage: `url(${treeOfLife})` }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none filter brightness-[0.45] contrast-105"
      />

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none" />

      {/* Header Info Banner */}
      <div className="flex justify-between items-center px-8 pt-8 pb-4 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-1.5 flex items-center gap-2 text-xs font-black font-mono text-amber-300 shadow-md">
            <span className="animate-pulse">🏆</span>
            <span>ECO SCORE:</span>
            <span className="font-extrabold text-white">{naturePoints} NP</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onInstallPWA && (
            <button
              onClick={onInstallPWA}
              className="text-[10px] text-white font-extrabold tracking-wider font-mono uppercase bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/50 px-3 py-1.5 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-1.5 cursor-pointer transition-all animate-pulse"
            >
              <span>📲</span>
              <span>INSTALL PWA APP</span>
            </button>
          )}
          <div className="text-[10px] text-lime-400 font-extrabold tracking-widest font-mono uppercase bg-emerald-950/80 border border-lime-500/30 px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(132,204,22,0.2)] flex items-center gap-1.5">
            <Globe className="w-3 h-3 animate-spin" style={{ animationDuration: "8s" }} />
            <span>CHROME WEB GAME</span>
          </div>
        </div>
      </div>

      {/* Title Logo Block */}
      <div className="flex flex-col items-center text-center px-6 my-auto z-20 relative">
        {/* Wood-texture styled logo background */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative max-w-xl mx-auto"
        >
          {/* Subtle logo outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-emerald-500 rounded-2xl blur-lg opacity-25" />
          
          <div className="relative bg-zinc-900/80 border-2 border-amber-500/30 rounded-2xl px-8 py-5 shadow-2xl backdrop-blur-md">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight flex items-center justify-center gap-2 select-none uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] text-slate-100">
              <span className="font-sans text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 block">CALL OF NATURE</span>
            </h1>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent my-3" />
            <p className="text-emerald-100/90 text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-semibold italic">
              "Become the legendary Guardian. Fight forest fires, douse industrial hazards, capture loggers, and save natural balance."
            </p>
          </div>
        </motion.div>

        {/* Triple-A Large Glowing Play Button (Matching Slide 6 of User request) */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="mt-8 relative"
        >
          <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
          
          <button
            onClick={() => handleSelectNav("lobby")}
            className="relative px-12 py-5 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-500 text-white font-black text-lg tracking-widest uppercase rounded-2xl shadow-2xl border-2 border-emerald-300/40 transition-all cursor-pointer flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6 fill-current animate-bounce" style={{ animationDuration: "1.5s" }} />
            <span>PLAY ADVENTURE</span>
          </button>
        </motion.div>
      </div>

      {/* Premium Navigation Grid on Bottom Bar */}
      <div className="p-8 z-20 relative bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent w-full border-t border-slate-900">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-6 gap-3 w-full">
          {/* Guardian Lobby Island */}
          <button
            onClick={() => handleSelectNav("lobby")}
            className="px-3 py-3 bg-gradient-to-r from-emerald-950 to-teal-950 hover:from-emerald-900 hover:to-teal-900 border border-emerald-500/40 hover:border-lime-400 rounded-xl text-xs font-black tracking-wider text-lime-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span className="text-sm">🌳</span>
            <span className="truncate">LOBBY ISLAND</span>
          </button>

          {/* World Map */}
          <button
            onClick={() => handleSelectNav("world")}
            className="px-3 py-3 bg-zinc-900/95 hover:bg-zinc-800/95 border border-slate-800 hover:border-amber-500/40 rounded-xl text-xs font-bold tracking-wider text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span className="text-sm">🧭</span>
            <span className="truncate">WORLD MAP</span>
          </button>

          {/* Story Intro Review */}
          <button
            onClick={() => handleSelectNav("story")}
            className="px-3 py-3 bg-zinc-900/95 hover:bg-zinc-800/95 border border-slate-800 hover:border-amber-500/40 rounded-xl text-xs font-bold tracking-wider text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">INTRO STORY</span>
          </button>

          {/* Encyclopedia index */}
          <button
            onClick={() => handleSelectNav("encyclopedia")}
            className="px-3 py-3 bg-zinc-900/95 hover:bg-zinc-800/95 border border-slate-800 hover:border-amber-500/40 rounded-xl text-xs font-bold tracking-wider text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">WILDLIFE</span>
          </button>

          {/* Achievements badge */}
          <button
            onClick={() => handleSelectNav("achievements")}
            className="px-3 py-3 bg-zinc-900/95 hover:bg-zinc-800/95 border border-slate-800 hover:border-amber-500/40 rounded-xl text-xs font-bold tracking-wider text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">TROPHIES</span>
          </button>

          {/* Settings / Clear saves */}
          <button
            onClick={() => handleSelectNav("settings")}
            className="px-3 py-3 bg-zinc-900/95 hover:bg-zinc-800/95 border border-slate-800 hover:border-amber-500/40 rounded-xl text-xs font-bold tracking-wider text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Settings className="w-4 h-4 text-amber-200 shrink-0" />
            <span className="truncate">SETTINGS</span>
          </button>

          {/* Chrome Edition Hub */}
          <button
            onClick={() => handleSelectNav("chrome")}
            className="px-3 py-3 bg-gradient-to-r from-teal-950 via-emerald-950 to-teal-950 hover:from-teal-900 hover:to-emerald-900 border border-emerald-500/50 hover:border-emerald-300 rounded-xl text-xs font-black tracking-wider text-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)] col-span-2 sm:col-span-1"
          >
            <Globe className="w-4 h-4 text-emerald-400 animate-spin shrink-0" style={{ animationDuration: "10s" }} />
            <span className="truncate">CHROME GAME</span>
          </button>
        </div>

        {/* Small subtle credit tag */}
        <p className="text-center text-[10px] text-zinc-500 mt-4 tracking-wide font-mono select-none uppercase">
          🌿 Preserve nature today • Every single action counts towards evergreen balance 🌿
        </p>
      </div>
    </div>
  );
}

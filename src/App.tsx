import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import IntroCutscene from "./components/IntroCutscene";
import WorldMap from "./components/WorldMap";
import MainMenu from "./components/MainMenu";
import GuardianIsland from "./components/GuardianIsland";
import { playSound, initAudio, setMasterVolume, startMusicLoop, stopMusicLoop } from "./utils/audio";
import { PlayerProgress, MissionConfig, MISSIONS_LIST } from "./types";
import { ENCYCLOPEDIA_DATA } from "./utils/encyclopedia";
import { Volume2, VolumeX, Sparkles, Trophy, BookOpen, Settings, Info, RefreshCw, Star, Heart, Compass, LogOut, CheckCircle2, Award, Zap, Menu, X, Globe, Download, Laptop, ExternalLink, Maximize, Minimize } from "lucide-react";

// Individual Game Imports
import ForestRunner from "./components/games/ForestRunner";
import BabyAnimalMaze from "./components/games/BabyAnimalMaze";
import NatureCollection from "./components/games/NatureCollection";
import ProtectPlant from "./components/games/ProtectPlant";
import FireFighter from "./components/games/FireFighter";
import StopLoggers from "./components/games/StopLoggers";
import HabitatMatch from "./components/games/HabitatMatch";
import RiverCleanup from "./components/games/RiverCleanup";
import WildlifePhotographer from "./components/games/WildlifePhotographer";
import FinalChallenge from "./components/games/FinalChallenge";
import RestorationCutscene from "./components/RestorationCutscene";

const LOCAL_STORAGE_KEY = "call_of_nature_progress_v2";

const DEFAULT_PROGRESS: PlayerProgress = {
  unlockedMissions: [1], // Mission 1 is unlocked initially
  missionStars: {},
  missionHighScores: {},
  naturePoints: 0,
  unlockedAnimals: ["deer"],
  unlockedAchievements: [],
  restoredAreas: [],
};

const ACHIEVEMENTS_LIST = [
  {
    id: "first_run",
    title: "Pathfinder Initiate",
    description: "Guide your first deer to safety by completing Mission 1.",
    condition: "Complete Mission 1",
    points: 100,
    emoji: "🦌"
  },
  {
    id: "perfect_star",
    title: "Perfect Restoration",
    description: "Earn 3 stars to signal ultimate forest balance.",
    condition: "Earn a 3-star rating on any mission",
    points: 250,
    emoji: "🌟"
  },
  {
    id: "point_collector",
    title: "Nature Ambassador",
    description: "Amass a score showing dedicated protection.",
    condition: "Reach 500 total Nature Points",
    points: 300,
    emoji: "🌱"
  },
  {
    id: "wildfire_hero",
    title: "Wildfire Hero",
    description: "Douse spreading brushfires and save scorched wildlife in Mission 5.",
    condition: "Complete Mission 5 with 3 stars",
    points: 350,
    emoji: "🔥"
  },
  {
    id: "master_guardian",
    title: "Eco Overlord",
    description: "Settle all ecological unrest and defeat the shadow of pollution.",
    condition: "Complete the Final Challenge (Mission 10)",
    points: 1000,
    emoji: "👑"
  },
];

const ENVIRO_ADVICE = [
  "Turn off electrical appliances when leaving a room to reduce unnecessary power generation.",
  "Decrease household waste by composting natural scraps to re-fertilize soil naturally.",
  "Ditch bottled fluids: carry a robust reusable thermos to avoid plastic micro-particles.",
  "Every dripping tap wastes dozens of liters per day. Tighten faucets to preserve pure streams.",
  "Plant native flora in your immediate garden or balcony to support regional wild pollinators.",
  "Opt for reusable tote bags during grocery visits to protect marine organisms from plastic bags.",
  "Consider walking or riding bikes for nearby transits to minimize carbon output."
];

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress>(DEFAULT_PROGRESS);
  const [activeTab, setActiveTab] = useState<"menu" | "world" | "encyclopedia" | "achievements" | "settings" | "credits" | "chrome">("menu");
  const [isIntroPlaying, setIsIntroPlaying] = useState<boolean>(true);
  const [isFromPlayAdventure, setIsFromPlayAdventure] = useState<boolean>(false);
  const [selectedMission, setSelectedMission] = useState<MissionConfig | null>(null);
  const [activePlayableMission, setActivePlayableMission] = useState<MissionConfig | null>(null);
  const [pendingMissionAfterIntro, setPendingMissionAfterIntro] = useState<MissionConfig | null>(null);
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [activeOutcome, setActiveOutcome] = useState<{
    status: "win" | "lose";
    missionId: number;
    score?: number;
    stars?: number;
  } | null>(null);

  const [activeRestorationCutscene, setActiveRestorationCutscene] = useState<{
    missionId: number;
    score: number;
    stars: number;
  } | null>(null);
  
  // Audio state
  const [musicVol, setMusicVol] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [cycledAdviceIdx, setCycledAdviceIdx] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    
    const handleInstalled = () => {
      setDeferredPrompt(null);
      try {
        playSound("victory");
      } catch (err) {}
    };
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    playSound("select");
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        playSound("victory");
      }
    } else {
      alert("📲 How to install Call of Nature PWA:\n\n• Desktop Chrome/Edge: Click the Install icon (⊕) on the right side of the URL address bar.\n• iOS Safari: Tap the 'Share' icon at the bottom, then select 'Add to Home Screen'.\n• Android Chrome: Tap the 3 dots menu (⋮) in the top right, then select 'Install app' or 'Add to Home screen'.");
    }
  };

  // Load progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.restoredAreas) {
          parsed.restoredAreas = [];
        }
        setProgress(parsed);
        if (parsed.unlockedMissions && parsed.unlockedMissions.length > 1) {
          setIsIntroPlaying(false);
          setActiveTab("menu");
        }
      }
    } catch (e) {
      console.error("Failed to load progress from local storage", e);
    }
  }, []);

  // Update localStorage helper
  const saveProgressState = (newPrg: PlayerProgress) => {
    setProgress(newPrg);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newPrg));
    } catch (e) {
      // Ignore storage errors in sandboxed iframes or file:// URLs
    }
  };

  // Cycle advice
  useEffect(() => {
    const interval = setInterval(() => {
      setCycledAdviceIdx((prev) => (prev + 1) % ENVIRO_ADVICE.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Music initialization trigger on first user interaction
  useEffect(() => {
    if (!isIntroPlaying) {
      startMusicLoop(activePlayableMission ? (activePlayableMission.id === 10 ? "final" : "game") : "menu");
    } else {
      stopMusicLoop();
    }
    return () => {
      stopMusicLoop();
    };
  }, [isIntroPlaying, activePlayableMission]);

  // Handle music volume scaling
  useEffect(() => {
    if (isMuted) {
      setMasterVolume(0);
    } else {
      setMasterVolume(musicVol);
    }
  }, [musicVol, isMuted]);

  // Navigate back/forth
  const handleStartGame = () => {
    setIsIntroPlaying(false);
    if (isFromPlayAdventure) {
      setIsFromPlayAdventure(false);
      setActiveTab("world");
      playSound("select");
      startMusicLoop("menu");
    } else if (pendingMissionAfterIntro) {
      setActivePlayableMission(pendingMissionAfterIntro);
      setPendingMissionAfterIntro(null);
      setActiveTab("world");
      playSound("select");
      startMusicLoop("game");
    } else {
      setActiveTab("menu");
      playSound("select");
      startMusicLoop("menu");
    }
  };

  // Trigger game launch
  const handleLaunchMission = (mission: MissionConfig) => {
    playSound("select");
    if (mission.id === 1) {
      setPendingMissionAfterIntro(mission);
      setIsFromPlayAdventure(false);
      setIsIntroPlaying(true);
    } else {
      setActivePlayableMission(mission);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Game Victory
  const handleGameWin = (missionId: number, scoreAwarded: number, starsEarned: number) => {
    playSound("victory");

    // Copy original progress arrays
    const originalStars = progress.missionStars[missionId] || 0;
    const finalStars = Math.max(originalStars, starsEarned);
    
    // Check for passive upgrade bonuses from restored areas
    const hasDeadTrees = progress.restoredAreas?.includes("dead_trees");
    const scoreDiff = hasDeadTrees ? Math.round(scoreAwarded * 1.1) : scoreAwarded; // add whole final score (+10% dead_trees passive bonus!)
    
    // Unlocks next mission
    const updatedUnlockedMissions = [...progress.unlockedMissions];
    const nextMissionId = missionId + 1;
    if (nextMissionId <= 10 && !updatedUnlockedMissions.includes(nextMissionId)) {
      updatedUnlockedMissions.push(nextMissionId);
      playSound("unlock");
    }

    // Check newly unlocked achievements
    const newlyUnlockedAchievements = [...progress.unlockedAchievements];
    
    if (missionId === 1 && !newlyUnlockedAchievements.includes("first_run")) {
      newlyUnlockedAchievements.push("first_run");
    }
    if (starsEarned === 3 && !newlyUnlockedAchievements.includes("perfect_star")) {
      newlyUnlockedAchievements.push("perfect_star");
    }
    if (progress.naturePoints + scoreDiff >= 500 && !newlyUnlockedAchievements.includes("point_collector")) {
      newlyUnlockedAchievements.push("point_collector");
    }
    if (missionId === 5 && starsEarned === 3 && !newlyUnlockedAchievements.includes("wildfire_hero")) {
      newlyUnlockedAchievements.push("wildfire_hero");
    }
    if (missionId === 10 && !newlyUnlockedAchievements.includes("master_guardian")) {
      newlyUnlockedAchievements.push("master_guardian");
    }

    // Unlocked animal index expansion
    const newlyUnlockedAnimals = [...progress.unlockedAnimals];
    const animalMap: Record<number, string> = {
      2: "bear",
      3: "fox",
      4: "owl",
      5: "wolf",
      6: "tiger",
      7: "eagle",
      8: "panda",
      9: "elephant"
    };
    if (animalMap[missionId] && !newlyUnlockedAnimals.includes(animalMap[missionId])) {
      newlyUnlockedAnimals.push(animalMap[missionId]);
    }

    const updatedStars = {
      ...progress.missionStars,
      [missionId]: finalStars
    };

    const updatedHighScores = {
      ...progress.missionHighScores,
      [missionId]: Math.max(progress.missionHighScores[missionId] || 0, scoreAwarded)
    };

    const newProgress: PlayerProgress = {
      ...progress,
      unlockedMissions: updatedUnlockedMissions,
      missionStars: updatedStars,
      missionHighScores: updatedHighScores,
      naturePoints: progress.naturePoints + scoreDiff,
      unlockedAnimals: newlyUnlockedAnimals,
      unlockedAchievements: newlyUnlockedAchievements,
    };

    saveProgressState(newProgress);
    setActiveRestorationCutscene({
      missionId,
      score: scoreAwarded,
      stars: starsEarned,
    });
    setActivePlayableMission(null); // return to world map viewport
  };

  // Handle Game Defeat
  const handleGameLose = () => {
    playSound("failure");
    if (activePlayableMission) {
      setActiveOutcome({
        status: "lose",
        missionId: activePlayableMission.id,
      });
    }
    setActivePlayableMission(null); // return to world map
  };

  // Reset progress state back to zero
  const executeResetProgress = () => {
    playSound("failure");
    saveProgressState(DEFAULT_PROGRESS);
    setActiveTab("menu");
    setSelectedMission(null);
    setActivePlayableMission(null);
    setIsFromPlayAdventure(false);
    setIsIntroPlaying(true);
    setShowResetConfirm(false);
  };

  // Dev Helper: Unlock all missions and fauna instantly
  const handleDevUnlockAll = () => {
    playSound("unlock");
    const allMissions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const updatedProgress = {
      ...progress,
      unlockedMissions: allMissions,
      unlockedAnimals: ["deer", "bear", "rabbit", "fox", "owl", "wolf", "tiger", "eagle", "panda", "elephant"],
      naturePoints: Math.max(progress.naturePoints, 1500)
    };
    saveProgressState(updatedProgress);
  };

  const handleDownloadChromeGame = async () => {
    playSound("select");
    if (window.location.protocol === "file:") {
      alert("🎮 You are already running the standalone Google Chrome Offline Edition locally on your computer!\n\nYour game data and progress are automatically saved directly to Google Chrome's secure storage.");
      return;
    }
    const paths = [
      "./Double_Click_To_Play_Offline.html",
      "./Call_of_Nature_Chrome_Game.html",
      "/Double_Click_To_Play_Offline.html",
      "/Call_of_Nature_Chrome_Game.html"
    ];
    
    for (const p of paths) {
      try {
        const res = await fetch(p);
        if (res.ok) {
          const html = await res.text();
          if (html.includes("Call of Nature") && !html.includes('src="/src/main.tsx"')) {
            const blob = new Blob([html], { type: "text/html;charset=utf-8" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Call_of_Nature_Chrome_Game.html";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            playSound("victory");
            return;
          }
        }
      } catch (e) {
        // try next path
      }
    }
    
    alert("🎮 Google Chrome Standalone Game Package:\n\nTo play completely offline in Chrome without internet:\n1. Click 'Settings -> Export to ZIP' or 'Share' in the top right menu.\n2. In your downloaded folder, double-click 'Double_Click_To_Play_Offline.html' or 'Call_of_Nature_Chrome_Game.html' in Google Chrome!");
  };

  const totalStars: number = Object.values(progress.missionStars).reduce((sum: number, s: any) => sum + (Number(s) || 0), 0) as number;
  const totalCompletes = Object.keys(progress.missionStars).length;
  // Dynamic island health score percentage
  const islandHealth = Math.min(100, Math.round((totalStars / 30) * 100));

  if (isIntroPlaying) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
        <IntroCutscene 
          onStartGame={handleStartGame} 
          isFromPlayAdventure={isFromPlayAdventure}
        />
      </div>
    );
  }

  if (activeTab === "menu") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans select-none">
        <MainMenu
          naturePoints={progress.naturePoints}
          onInstallPWA={handleInstallPWA}
          onNavigate={(view) => {
            if (view === "story") {
              setIsFromPlayAdventure(false);
              setIsIntroPlaying(true);
            } else if (view === "world") {
              setIsFromPlayAdventure(true);
              setIsIntroPlaying(true);
            } else {
              setActiveTab(view);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-50 font-sans p-2.5 md:p-4 select-none flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col">
        
        {/* HEADER BAR SUMMARY */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2 border-b border-emerald-900 pb-2.5 relative">
          <div className="flex flex-col cursor-pointer" onClick={() => { playSound("select"); setActiveTab("world"); }}>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-lime-400 select-none hover:text-white transition-colors flex items-center gap-1.5">
              🌿 CALL OF NATURE
            </h1>
            <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-lime-500 mt-0.5">
              The Guardian's Path
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-start">
            <div className="flex gap-3">
              <div className="bg-emerald-900/40 border border-emerald-800 py-1.5 px-3 md:px-3.5 rounded-xl flex flex-col items-end">
                <span className="text-[8px] sm:text-[9px] uppercase font-black tracking-widest opacity-60 text-emerald-300">Nature Points</span>
                <span className="text-base md:text-xl font-black text-yellow-400 tracking-tight">
                  {progress.naturePoints.toLocaleString()}
                </span>
              </div>
              <div className="bg-emerald-900/40 border border-emerald-800 py-1.5 px-3 md:px-3.5 rounded-xl flex flex-col items-end w-24 sm:w-28">
                <span className="text-[8px] sm:text-[9px] uppercase font-black tracking-widest opacity-60 text-emerald-300">Stars Earned</span>
                <span className="text-base md:text-xl font-black text-yellow-500 underline decoration-2 underline-offset-2 tracking-tight">
                  {totalStars} / 30
                </span>
              </div>
            </div>

            {/* THREE DASH HAMBURGER DROPDOWN IN THE TOP RIGHT */}
            <div className="relative">
              <button
                id="three-dash-hamburger"
                onClick={() => { playSound("select"); setIsNavOpen(!isNavOpen); }}
                className="p-2.5 sm:p-3 bg-emerald-900/80 border border-emerald-700 text-lime-400 rounded-xl hover:bg-emerald-850 hover:text-white transition-all cursor-pointer flex items-center justify-center relative shadow-lg active:scale-95"
                title="Toggle Directory Menu"
              >
                {isNavOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>

              {/* DROPDOWN OPTIONS CARD */}
              {isNavOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-emerald-950 border-2 border-emerald-700 rounded-2xl shadow-[0_15px_40px_-5px_rgba(0,0,0,0.8)] z-50 overflow-hidden p-3 flex flex-col gap-1.5 animate-fadeIn">
                  <div className="text-[9px] font-black uppercase text-lime-400/70 tracking-widest px-2 pb-1 border-b border-emerald-900 mb-1 flex justify-between items-center">
                    <span>🧭 Guardian Directory</span>
                    <span className="text-yellow-500 animate-pulse">● Live</span>
                  </div>
                  
                  <button
                    onClick={() => { playSound("select"); setActiveTab("menu"); setActivePlayableMission(null); setIsNavOpen(false); }}
                    className={`font-semibold text-xs py-2 px-3 rounded-lg text-left transition-colors uppercase cursor-pointer flex items-center gap-2 ${
                      activeTab === "menu" ? "bg-lime-400 text-emerald-950 font-black" : "text-emerald-100 hover:bg-emerald-900/60"
                    }`}
                  >
                    <span>🏠</span> Main Menu
                  </button>

                  <button
                    onClick={() => { playSound("select"); setActiveTab("lobby"); setActivePlayableMission(null); setIsNavOpen(false); }}
                    className={`font-semibold text-xs py-2 px-3 rounded-lg text-left transition-colors uppercase cursor-pointer flex items-center gap-2 ${
                      activeTab === "lobby" ? "bg-lime-400 text-emerald-950 font-black" : "text-emerald-100 hover:bg-emerald-900/60"
                    }`}
                  >
                    <span>🌳</span> Lobby Island
                  </button>

                  <button
                    onClick={() => { playSound("select"); setActiveTab("world"); setActivePlayableMission(null); setIsNavOpen(false); }}
                    className={`font-semibold text-xs py-2 px-3 rounded-lg text-left transition-colors uppercase cursor-pointer flex items-center gap-2 ${
                      activeTab === "world" && !activePlayableMission ? "bg-lime-400 text-emerald-950 font-black" : "text-emerald-100 hover:bg-emerald-900/60"
                    }`}
                  >
                    <span>🎮</span> Play Game
                  </button>

                  <button
                    onClick={() => { playSound("select"); setActiveTab("encyclopedia"); setActivePlayableMission(null); setIsNavOpen(false); }}
                    className={`font-semibold text-xs py-2 px-3 rounded-lg text-left transition-colors uppercase cursor-pointer flex items-center gap-2 ${
                      activeTab === "encyclopedia" ? "bg-lime-400 text-emerald-950 font-black" : "text-emerald-100 hover:bg-emerald-900/60"
                    }`}
                  >
                    <span>📖</span> Encyclopedia
                  </button>

                  <button
                    onClick={() => { playSound("select"); setActiveTab("achievements"); setActivePlayableMission(null); setIsNavOpen(false); }}
                    className={`font-semibold text-xs py-2 px-3 rounded-lg text-left transition-colors uppercase cursor-pointer flex items-center gap-2 ${
                      activeTab === "achievements" ? "bg-lime-400 text-emerald-950 font-black" : "text-emerald-100 hover:bg-emerald-900/60"
                    }`}
                  >
                    <span>🏆</span> Achievements
                  </button>

                  <button
                    onClick={() => { playSound("select"); setActiveTab("settings"); setActivePlayableMission(null); setIsNavOpen(false); }}
                    className={`font-semibold text-xs py-2 px-3 rounded-lg text-left transition-colors uppercase cursor-pointer flex items-center gap-2 ${
                      activeTab === "settings" ? "bg-lime-400 text-emerald-950 font-black" : "text-emerald-100 hover:bg-emerald-900/60"
                    }`}
                  >
                    <span>⚙️</span> Settings
                  </button>

                  <button
                    onClick={() => { playSound("select"); setActiveTab("credits"); setActivePlayableMission(null); setIsNavOpen(false); }}
                    className={`font-semibold text-xs py-2 px-3 rounded-lg text-left transition-colors uppercase cursor-pointer flex items-center gap-2 ${
                      activeTab === "credits" ? "bg-lime-400 text-emerald-950 font-black" : "text-emerald-100 hover:bg-emerald-900/60"
                    }`}
                  >
                    <span>ℹ️</span> Credits & Tips
                  </button>

                  <button
                    onClick={() => { playSound("select"); setActiveTab("chrome"); setActivePlayableMission(null); setIsNavOpen(false); }}
                    className={`font-semibold text-xs py-2 px-3 rounded-lg text-left transition-colors uppercase cursor-pointer flex items-center gap-2 ${
                      activeTab === "chrome" ? "bg-lime-400 text-emerald-950 font-black" : "text-emerald-100 hover:bg-emerald-900/60"
                    }`}
                  >
                    <span>🌐</span> Chrome Hub
                  </button>

                  {/* Integrated Echo tip inside three-dash dropdown */}
                  <div className="border-t border-emerald-900 mt-2 pt-2 text-emerald-100 bg-emerald-900/30 p-2.5 rounded-xl">
                    <span className="text-[8px] font-black tracking-wider text-lime-400 uppercase flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-2.5 h-2.5 fill-lime-400" /> forest wisdom
                    </span>
                    <p className="text-[10px] font-medium leading-normal mt-1 italic">
                      "{ENVIRO_ADVICE[cycledAdviceIdx]}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN GAME BODY LAYOUT */}
        <main className="flex-1 flex flex-col gap-4">
          
          {/* RIGHT VIEWPORT FOR INTERACTIVE MODULES (full width for immersive game size) */}
          <section className="flex-1 bg-emerald-900/20 border-2 border-emerald-800 rounded-2xl relative overflow-hidden flex flex-col p-4 min-h-[440px] shadow-inner">
            {/* Background pattern from design HTML code */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #84cc16 1px, transparent 0)", backgroundSize: "40px 40px" }} />
            
            <div className="relative z-10 flex-1 flex flex-col">
              
              {/* PLAY GAME / WATER ACTIVE MISSION OVERLAY */}
              {activePlayableMission ? (
                <div className="flex-1 flex flex-col justify-center py-4">
                  <div className="mb-4 flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-emerald-900">
                    <span className="text-xs font-black uppercase text-amber-500 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500 animate-pulse" /> Live Mission Active
                    </span>
                    <button
                      onClick={() => { playSound("select"); setActivePlayableMission(null); }}
                      className="text-xs px-3 py-1 bg-red-950/80 border border-red-900 text-red-200 hover:bg-red-900 rounded-lg font-bold"
                    >
                      ABANDON MISSION
                    </button>
                  </div>
                  
                  {/* Render active playable game */}
                  <div className="flex-1">
                    {activePlayableMission.id === 1 && (
                      <ForestRunner
                        onWin={(score, stars) => handleGameWin(1, score, stars)}
                        onLose={handleGameLose}
                      />
                    )}
                    {activePlayableMission.id === 2 && (
                      <BabyAnimalMaze
                        onWin={(score, stars) => handleGameWin(2, score, stars)}
                        onLose={handleGameLose}
                      />
                    )}
                    {activePlayableMission.id === 3 && (
                      <NatureCollection
                        onWin={(score, stars) => handleGameWin(3, score, stars)}
                        onLose={handleGameLose}
                      />
                    )}
                    {activePlayableMission.id === 4 && (
                      <ProtectPlant
                        onWin={(score, stars) => handleGameWin(4, score, stars)}
                        onLose={handleGameLose}
                      />
                    )}
                    {activePlayableMission.id === 5 && (
                      <FireFighter
                        onWin={(score, stars) => handleGameWin(5, score, stars)}
                        onLose={handleGameLose}
                      />
                    )}
                    {activePlayableMission.id === 6 && (
                      <StopLoggers
                        onWin={(score, stars) => handleGameWin(6, score, stars)}
                        onLose={handleGameLose}
                      />
                    )}
                    {activePlayableMission.id === 7 && (
                      <HabitatMatch
                        onWin={(score, stars) => handleGameWin(7, score, stars)}
                        onLose={handleGameLose}
                      />
                    )}
                    {activePlayableMission.id === 8 && (
                      <RiverCleanup
                        onWin={(score, stars) => handleGameWin(8, score, stars)}
                        onLose={handleGameLose}
                      />
                    )}
                    {activePlayableMission.id === 9 && (
                      <WildlifePhotographer
                        onWin={(score, stars) => handleGameWin(9, score, stars)}
                        onLose={handleGameLose}
                      />
                    )}
                    {activePlayableMission.id === 10 && (
                      <FinalChallenge
                        onWin={(score, stars) => handleGameWin(10, score, stars)}
                        onLose={handleGameLose}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* GUARDIAN LOBBY ISLAND */}
                  {activeTab === "lobby" && (
                    <GuardianIsland
                      progress={progress}
                      onUpdateProgress={(newProgress) => saveProgressState(newProgress)}
                      onNavigateToWorld={() => setActiveTab("world")}
                    />
                  )}

                  {/* WORLD MAP VIEWPORT VIEW */}
                  {activeTab === "world" && (
                    <div className="flex flex-col h-full justify-between">
                      <div className="flex justify-between items-center border-b border-emerald-800 pb-4 mb-4">
                        <div className="flex flex-col">
                          <h2 className="text-3xl font-black italic uppercase text-lime-400">Evergreen Sanctuary Map</h2>
                          <p className="text-xs text-emerald-300 font-semibold">Select and launch nodes to heal regional ecosystems</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={handleDevUnlockAll}
                            className="bg-amber-400 hover:bg-amber-350 active:scale-95 text-amber-950 hover:text-amber-900 py-1 px-2.5 text-[10px] font-black uppercase rounded-sm transition-all flex items-center gap-1 cursor-pointer border border-amber-350 shadow"
                            title="Unlock all missions instantly for testing"
                          >
                            🔓 UNLOCK ALL
                          </button>
                          <span className="bg-lime-400 text-emerald-950 py-1 px-2.5 text-[11px] font-black uppercase rounded-sm whitespace-nowrap">
                            {totalCompletes} / 10 Restored
                          </span>
                        </div>
                      </div>

                      {/* Map Nodes component */}
                      <WorldMap
                        unlockedMissions={progress.unlockedMissions}
                        missionStars={progress.missionStars}
                        onSelectMission={(mission) => {
                          if (mission.id === 1) {
                            setPendingMissionAfterIntro(mission);
                            setIsFromPlayAdventure(false);
                            setIsIntroPlaying(true);
                          } else {
                            setSelectedMission(mission);
                          }
                        }}
                        onBackToMenu={() => {}} // bypassed as menu is now on the permanent sidebar
                      />

                      {/* Click helper hint when no mission is active */}
                      {!selectedMission && (
                        <div className="mt-4 border-2 border-emerald-800 border-dashed rounded-xl p-4 text-center text-emerald-300 text-xs font-semibold bg-emerald-950/20">
                          🌲 Click any unlocked circular node in the map above to view goals & start its restoration mission!
                        </div>
                      )}

                      {/* Overlap Floating Modal for Starting Missions (0 scrolling needed!) */}
                      {selectedMission && (
                        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
                          <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 border-2 border-lime-450 p-6 rounded-3xl max-w-lg w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative animate-scaleUp">
                            
                            {/* Close cross indicator */}
                            <button
                              onClick={() => { playSound("select"); setSelectedMission(null); }}
                              className="absolute top-4 right-4 text-emerald-400 hover:text-white text-lg font-bold w-8 h-8 rounded-full bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center cursor-pointer transition-colors"
                            >
                              ✕
                            </button>

                            <div className="flex items-center gap-4 mb-4">
                              <span className="text-5xl bg-emerald-950/60 p-3 rounded-2xl border border-emerald-800/40 shadow-inner leading-none flex items-center justify-center">
                                {selectedMission.bannerEmoji}
                              </span>
                              <div>
                                <span className="bg-amber-400/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[8px] font-black uppercase rounded tracking-wider animate-pulse">
                                  Regional Objective {selectedMission.id}
                                </span>
                                <h3 className="text-2xl font-black uppercase text-lime-400 tracking-tight leading-none mt-1">
                                  {selectedMission.title}
                                </h3>
                              </div>
                            </div>

                            <div className="mb-4">
                              <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400">Context Story:</span>
                              <p className="text-xs text-emerald-100/90 leading-relaxed bg-emerald-950/80 p-3 rounded-xl border border-emerald-800/30 font-serif italic mt-1">
                                "{selectedMission.story}"
                              </p>
                            </div>

                            <div className="mb-6 bg-slate-900/60 border border-emerald-800 p-3.5 rounded-xl">
                              <span className="text-[9px] uppercase tracking-wider font-extrabold text-yellow-400 flex items-center gap-1">
                                ⚙️ How to play & Win:
                              </span>
                              <p className="text-xs text-emerald-250 font-bold mt-1 leading-normal text-emerald-200">
                                {selectedMission.instructions}
                              </p>
                            </div>

                            <div className="flex gap-3 justify-end">
                              <button
                                onClick={() => { playSound("select"); setSelectedMission(null); }}
                                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-emerald-800 hover:bg-slate-800 hover:text-white transition-all text-xs font-bold text-emerald-300 uppercase tracking-wider cursor-pointer"
                              >
                                CLOSE
                              </button>
                              <button
                                onClick={() => { 
                                  playSound("select");
                                  const mission = selectedMission;
                                  setSelectedMission(null); 
                                  handleLaunchMission(mission); 
                                }}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 text-emerald-950 font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
                              >
                                START MISSION 🚀
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ENCYCLOPEDIA ANIMAL COLLECTION DECK */}
                  {activeTab === "encyclopedia" && (
                    <div>
                      <div className="flex flex-col border-b border-emerald-800 pb-4 mb-6">
                        <h2 className="text-3xl font-black italic uppercase text-lime-400">FAUNA DECK</h2>
                        <p className="text-xs text-emerald-300 font-semibold">Study returning woodland creatures and expand national geographic files</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {ENCYCLOPEDIA_DATA.map((animal) => {
                          const isUnlocked = progress.naturePoints >= animal.pointsToUnlock || progress.unlockedAnimals.includes(animal.id);
                          return (
                            <div
                              key={animal.id}
                              className={`p-4 rounded-xl border relative transition-all ${
                                isUnlocked
                                  ? "bg-slate-900/60 border-emerald-800 hover:border-lime-400 shadow-md flex flex-col justify-between"
                                  : "bg-emerald-950/20 border-emerald-900/40 text-emerald-700 select-none grayscale"
                              }`}
                            >
                              {!isUnlocked && (
                                <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-3 rounded-xl z-20">
                                  <span className="text-2xl">🔒</span>
                                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider mt-1.5">Locked</span>
                                  <span className="text-[9px] font-semibold text-emerald-300 mt-1">{animal.pointsToUnlock} Points needed</span>
                                </div>
                              )}

                              <div className="flex items-center gap-3.5 mb-2">
                                <div className="w-12 h-12 bg-emerald-950 border border-emerald-800 text-3xl rounded-lg flex items-center justify-center">
                                  {animal.image}
                                </div>
                                <div>
                                  <h3 className="font-extrabold text-sm text-lime-400 uppercase tracking-tight">{animal.name}</h3>
                                  <p className="text-[9px] italic text-emerald-400 opacity-70 leading-none">{animal.scientificName}</p>
                                </div>
                              </div>

                              <div className="text-xs space-y-1.5 text-emerald-100 flex-1 my-2 border-t border-emerald-900/40 pt-2.5">
                                <p><span className="font-black text-lime-500 uppercase text-[9px] tracking-wide block">🏡 Habitat</span> {animal.habitat}</p>
                                <p><span className="font-black text-lime-500 uppercase text-[9px] tracking-wide block">🌽 Nutrition</span> {animal.diet}</p>
                                <p className="text-[11px] opacity-80 leading-relaxed italic mt-1 bg-slate-950/40 p-2 rounded-md">"{animal.fact}"</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ACHIEVEMENTS GRID */}
                  {activeTab === "achievements" && (
                    <div>
                      <div className="flex flex-col border-b border-emerald-800 pb-4 mb-6">
                        <h2 className="text-3xl font-black italic uppercase text-lime-400">Guardian Achievements</h2>
                        <p className="text-xs text-emerald-300 font-semibold">Certificates of valor issued by the Spirit of Nature</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ACHIEVEMENTS_LIST.map((ach) => {
                          const isUnlocked = progress.unlockedAchievements.includes(ach.id);
                          return (
                            <div
                              key={ach.id}
                              className={`p-4 rounded-xl border flex gap-4 items-center transition-all ${
                                isUnlocked
                                  ? "bg-gradient-to-r from-emerald-950 to-slate-950 border-lime-400 shadow-md shadow-lime-500/10"
                                  : "bg-emerald-950/10 border-emerald-900 text-emerald-700/60 grayscale"
                              }`}
                            >
                              <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-3xl shrink-0 ${
                                isUnlocked ? "bg-lime-400 border-lime-500 text-emerald-950" : "bg-emerald-950 border-emerald-900 text-emerald-800"
                              }`}>
                                {ach.emoji}
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className={`font-black text-sm uppercase ${isUnlocked ? "text-lime-300" : "text-emerald-800"}`}>{ach.title}</h3>
                                  <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase rounded ${
                                    isUnlocked ? "bg-amber-500 text-white" : "bg-emerald-950 text-emerald-800"
                                  }`}>
                                    +{ach.points} XP
                                  </span>
                                </div>
                                <p className="text-xs text-emerald-200 mt-1 leading-relaxed">{ach.description}</p>
                                <p className="text-[9.5px] text-emerald-400 font-mono mt-1 uppercase text-[8px] opacity-70">Goal: {ach.condition}</p>
                              </div>

                              {isUnlocked && (
                                <div className="text-lime-400">
                                  <CheckCircle2 className="w-6 h-6 fill-lime-950" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SETTINGS CONTROL BOARD */}
                  {activeTab === "settings" && (
                    <div className="max-w-md">
                      <div className="flex flex-col border-b border-emerald-800 pb-4 mb-6">
                        <h2 className="text-3xl font-black italic uppercase text-lime-400">Settings Console</h2>
                        <p className="text-xs text-emerald-300 font-semibold">Sound syntheses and player profile utilities</p>
                      </div>

                      <div className="space-y-6 bg-slate-950/60 p-6 rounded-2xl border border-emerald-900">
                        {/* Audio Sliders mapping */}
                        <div className="space-y-4">
                          <label className="text-xs font-black uppercase text-emerald-300 tracking-wider flex justify-between items-center">
                            <span>Synthesizer Master Gain ({Math.round(musicVol * 100)}%)</span>
                            <span>{isMuted ? "MUTED" : "ACTIVE"}</span>
                          </label>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => { playSound("select"); setIsMuted(!isMuted); }}
                              className="p-2 border border-emerald-800 hover:border-lime-400 rounded-lg bg-emerald-950/40 text-lime-400"
                            >
                              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={musicVol}
                              onChange={(e) => setMusicVol(parseFloat(e.target.value))}
                              disabled={isMuted}
                              className="flex-1 accent-lime-400 bg-emerald-950 h-2 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Story Replay Option */}
                        <div className="border-t border-emerald-900/60 pt-6">
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-400 mb-1">Story Mode</h4>
                          <p className="text-xs text-emerald-200 mb-3 leading-relaxed">
                            Relive the history of Evergreen Island and view the ancient warning from the Spirit of Nature.
                          </p>
                          <button
                            onClick={() => { playSound("select"); setIsFromPlayAdventure(false); setIsIntroPlaying(true); }}
                            className="text-xs px-4 py-2 bg-emerald-900 hover:bg-emerald-800/80 text-lime-300 border border-emerald-800 hover:border-lime-400 rounded-lg font-black uppercase transition-all flex items-center gap-1.5"
                          >
                            <Compass className="w-4 h-4" /> Replay Intro Cutscene
                          </button>
                        </div>

                        {/* Standalone Chrome Game Download */}
                        <div className="border-t border-emerald-900/60 pt-6">
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" /> Chrome Web Game Package
                          </h4>
                          <p className="text-xs text-emerald-200 mb-3 leading-relaxed">
                            Download the standalone single HTML file to play offline in Google Chrome anytime without internet.
                          </p>
                          <button
                            onClick={handleDownloadChromeGame}
                            className="text-xs px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black uppercase hover:brightness-110 active:scale-95 transition-all rounded-lg flex items-center gap-2 cursor-pointer shadow-md"
                          >
                            <Download className="w-4 h-4" /> Download Chrome Offline Edition (.html)
                          </button>
                        </div>

                        {/* Developer & Testing Tools */}
                        <div className="border-t border-emerald-900/60 pt-6">
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-400 mb-1">Developer Testing Panel</h4>
                          <p className="text-xs text-emerald-200 mb-3 leading-relaxed">
                            Instantly unlock all 10 missions (including Mission 10: Save the Tree of Life) and populate all animals into the Fauna Deck for verification.
                          </p>
                          <button
                            onClick={handleDevUnlockAll}
                            className="text-xs px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black uppercase hover:brightness-110 active:scale-95 transition-all rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            🔓 Instantly Unlock All Missions
                          </button>
                        </div>

                        {/* Reset warning action */}
                        <div className="border-t border-emerald-900/60 pt-6">
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-red-400 mb-1">DANGER AREA</h4>
                          <p className="text-xs text-emerald-200/80 mb-3 leading-relaxed">
                            Resetting deletes all scores, stars, unlocked fauna, and achievements instantly. This cannot be undone.
                          </p>
                          {showResetConfirm ? (
                            <div className="bg-red-950/40 p-4 border border-red-900/60 rounded-xl max-w-md animate-pulse">
                              <p className="text-xs font-bold text-red-300 mb-3 uppercase tracking-wider">Are you absolutely sure structure? This CANNOT be undone.</p>
                              <div className="flex gap-3">
                                <button
                                  onClick={executeResetProgress}
                                  className="text-xs px-3 py-1.5 bg-red-600 hover:bg-red-500 hover:scale-105 active:scale-95 text-white rounded-lg font-black uppercase transition-all"
                                >
                                  Yes, reset all
                                </button>
                                <button
                                  onClick={() => { playSound("select"); setShowResetConfirm(false); }}
                                  className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 hover:scale-105 active:scale-95 text-slate-300 rounded-lg font-bold uppercase transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { playSound("select"); setShowResetConfirm(true); }}
                              className="text-xs px-4 py-2.5 bg-red-950 border border-red-900 text-red-200 hover:bg-red-900 hover:text-white rounded-lg font-black uppercase transition-all"
                            >
                              RESET GUARDIAN DATA
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CREDITS AND ECOLOGICAL MISSION GUIDE */}
                  {activeTab === "credits" && (
                    <div className="max-w-2xl">
                      <div className="flex flex-col border-b border-emerald-800 pb-4 mb-6">
                        <h2 className="text-3xl font-black italic uppercase text-lime-400">Credits & Eco-Patrol Guide</h2>
                        <p className="text-xs text-emerald-300 font-semibold">Sustain real ecosystems off-screen</p>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-slate-950/60 p-5 rounded-2xl border border-emerald-900 space-y-3">
                          <h3 className="font-bold text-sm text-lime-400 uppercase tracking-wider">Guardian Developers</h3>
                          <p className="text-xs text-emerald-200 leading-relaxed">
                            This application was built in React and Tailwind CSS. All synthesizer frequencies, ambient arpeggiators, and audio components are compiled procedurally via standard Web Audio API oscillators.
                          </p>
                          <p className="text-[11px] text-emerald-400/80 font-semibold italic">
                            "May we protect Evergreen, both inside the frame and in our real world."
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-900">
                            <span className="text-2xl">💧</span>
                            <h4 className="font-extrabold text-sm text-lime-400 uppercase tracking-tight mt-2">River Cleanup</h4>
                            <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                              90% of plastic trash floating in sea currents originated from rivers inland. Always recycle bottles, opt for paper straws, and secure loose waste.
                            </p>
                          </div>
                          
                          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-900">
                            <span className="text-2xl">⚡</span>
                            <h4 className="font-extrabold text-sm text-lime-400 uppercase tracking-tight mt-2">Power Saving</h4>
                            <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                              Fossil power generation produces smoke stacks and sparks wildfires. Turn off home computers, unplug unused extension cords, and dry clothes beneath the natural wind and sun.
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-lime-400/10 border-2 border-lime-400 rounded-xl text-center">
                          <span className="text-xl">🌳</span>
                          <p className="text-xs text-lime-300 font-bold mt-1 uppercase tracking-tight">Active Reforestation</p>
                          <p className="text-[11px] text-emerald-100 max-w-md mx-auto mt-1 leading-relaxed">
                            Consider joining a local eco-patrol club, supporting national reserves, or planting dynamic seed-bombs in your neighborhood to cultivate bees and wild butterflies!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CHROME WEB GAME COMPATIBILITY HUB */}
                  {activeTab === "chrome" && (
                    <div className="max-w-3xl animate-fadeIn space-y-6">
                      <div className="flex flex-col border-b border-emerald-800 pb-4">
                        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-widest font-black">
                          <Globe className="w-4 h-4 animate-spin shrink-0" style={{ animationDuration: "12s" }} />
                          <span>Google Chrome Engine Verified</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black italic uppercase text-lime-400 mt-1">Chrome Web Game Edition</h2>
                        <p className="text-xs text-emerald-200 mt-1">Optimized for Google Chrome, Edge, Brave, Android Chrome, and Safari</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-slate-950/80 p-6 rounded-3xl border-2 border-emerald-500/40 shadow-xl space-y-4 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                              <Laptop className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight text-white">⚡ Chrome 60 FPS Engine</h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              Call of Nature utilizes pure HTML5 Canvas and Web Audio API oscillators. It requires zero external plugins, Flash, or installation files to run at silky smooth 60 frames per second.
                            </p>
                            <ul className="text-xs space-y-2 text-emerald-200 font-medium">
                              <li className="flex items-center gap-2">✅ <span className="text-white font-bold">Hardware Acceleration:</span> Enabled</li>
                              <li className="flex items-center gap-2">✅ <span className="text-white font-bold">Procedural Web Audio:</span> Native</li>
                              <li className="flex items-center gap-2">✅ <span className="text-white font-bold">Responsive Controls:</span> Keyboard & Touch</li>
                            </ul>
                          </div>
                          <div className="pt-3 border-t border-emerald-900/60 text-[10px] font-mono text-emerald-400 uppercase">
                            Status: 100% Chrome Browser Compatible
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-teal-950 via-emerald-950 to-slate-950 p-6 rounded-3xl border-2 border-lime-400/50 shadow-2xl space-y-4 flex flex-col justify-between relative overflow-hidden">
                          <div className="absolute -right-10 -top-10 w-40 h-40 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />
                          
                          <div className="space-y-3 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-lime-400/10 border border-lime-400/40 flex items-center justify-center text-lime-300 animate-bounce" style={{ animationDuration: "2s" }}>
                              <Download className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight text-lime-300">💾 Play Offline in Chrome</h3>
                            <p className="text-xs text-emerald-100 leading-relaxed">
                              Want to play on an airplane, classroom Chromebook, or mobile device without internet? Download the bundled single HTML game file. Double-click it in Chrome anytime!
                            </p>
                          </div>

                          <div className="pt-4 relative z-10">
                            <button
                              onClick={handleDownloadChromeGame}
                              className="w-full py-4 px-6 bg-gradient-to-r from-lime-400 via-emerald-400 to-lime-400 text-emerald-950 font-black text-sm tracking-widest uppercase rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                              <Download className="w-4 h-4 stroke-[3]" />
                              <span>DOWNLOAD CHROME GAME (.HTML)</span>
                            </button>
                            <p className="text-center text-[10px] text-emerald-300/70 mt-2">Works standalone in any modern browser</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-emerald-900/20 border border-emerald-800 rounded-2xl p-5 flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 text-lime-400 shrink-0 mt-0.5" />
                        <div className="space-y-1 text-xs text-emerald-100">
                          <h4 className="font-bold text-lime-300 uppercase tracking-wide">💡 Chromebook & Desktop Tip</h4>
                          <p className="leading-relaxed">
                            When opened in Google Chrome, your progress (Stars, High Scores, Unlocked Animals) is automatically saved directly to your browser's secure LocalStorage vault. You can safely close the tab and return later!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          </section>

        </main>

        {/* FOOTER BAR WITH ONLINE USERS */}
        <footer className="mt-3 flex flex-col sm:flex-row justify-between items-center pt-2.5 border-t border-emerald-900 gap-3 mb-1">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] font-bold uppercase tracking-widest text-emerald-400/70">
            <span>Version v1.4.2-stable</span>
            <span className="text-lime-400">Island Health: {islandHealth}% Restored</span>
            <span>Cloud Sync: Active</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-800 border-2 border-emerald-950 flex items-center justify-center text-[10px] font-black text-white">GD</div>
              <div className="w-8 h-8 rounded-full bg-lime-600 border-2 border-emerald-950 flex items-center justify-center text-[10px] font-black text-emerald-950">SH</div>
              <div className="w-8 h-8 rounded-full bg-orange-600 border-2 border-emerald-950 flex items-center justify-center text-[10px] font-black text-white">+8</div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400/80">Guardians Active Online</span>
          </div>
        </footer>

        {/* Cinematic Restoration Process Cutscene */}
        {activeRestorationCutscene && (
          <RestorationCutscene
            missionId={activeRestorationCutscene.missionId}
            score={activeRestorationCutscene.score}
            stars={activeRestorationCutscene.stars}
            onComplete={() => {
              const res = activeRestorationCutscene;
              setActiveRestorationCutscene(null);
              setActiveOutcome({
                status: "win",
                missionId: res.missionId,
                score: res.score,
                stars: res.stars,
              });
            }}
          />
        )}

        {/* Fullscreen Interactive Outcome Overlay Modal */}
        {activeOutcome && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-[9999] animate-fadeIn">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={`max-w-md w-full rounded-3xl border-2 p-8 text-center shadow-[0_25px_60px_-10px_rgba(0,0,0,0.95)] ${
                activeOutcome.status === "win"
                  ? "bg-gradient-to-b from-emerald-950 to-zinc-950 border-lime-400"
                  : "bg-gradient-to-b from-red-950 to-zinc-950 border-red-500"
              }`}
            >
              {activeOutcome.status === "win" ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-b from-yellow-300 to-yellow-500 text-white border border-yellow-300/30 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-yellow-500/20">
                     ✨
                  </div>
                  <span className="text-[10px] bg-lime-400 text-emerald-950 font-black uppercase px-3.5 py-1 rounded-full tracking-widest leading-none shadow">
                    Mission Complete
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black mt-4 text-white uppercase tracking-tight">
                    Ecosystem Healed! 🌿
                  </h3>
                  <p className="text-xs text-emerald-200 mt-2.5 leading-relaxed">
                    Splendid job, Guard! Your direct conservation efforts on Mission {activeOutcome.missionId} successfully restored biological harmony.
                  </p>
                  
                  {/* Points & Stars */}
                  <div className="my-5 py-3 px-5 bg-emerald-900/30 border border-emerald-800/40 rounded-2xl flex justify-around items-center">
                    <div>
                      <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider block">Score Awarded</span>
                      <span className="text-xl font-black text-yellow-400 font-mono">+{activeOutcome.score} pts</span>
                    </div>
                    <div className="h-8 w-px bg-emerald-800/40" />
                    <div>
                      <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider block">Ranger Stars</span>
                      <div className="flex gap-1 mt-1 justify-center">
                        {Array.from({ length: activeOutcome.stars || 0 }).map((_, i) => (
                          <span key={i} className="text-lg text-yellow-500 drop-shadow animate-bounce" style={{ animationDelay: `${i * 150}ms` }}>⭐</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      playSound("select");
                      setActiveOutcome(null);
                      setActiveTab("world");
                    }}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 text-emerald-950 hover:brightness-115 active:scale-95 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-lime-400/20"
                  >
                    RETURN TO WORLD MAP 🧭
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-b from-red-500 to-rose-600 text-white border border-red-500/30 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-red-500/20">
                     🍂
                  </div>
                  <span className="text-[10px] bg-red-500 text-white font-black uppercase px-3 py-1 rounded-full tracking-widest leading-none shadow">
                    Mission Incomplete
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black mt-4 text-white uppercase tracking-tight animate-pulse">
                    Crisis Escalated ⚠️
                  </h3>
                  <p className="text-xs text-red-200 mt-2.5 leading-relaxed">
                    Ecosystem conditions exceeded security tolerances. However, nature keepers are defined by persistent restoration!
                  </p>

                  <div className="my-5 p-3 rounded-xl bg-red-950/30 border border-red-900/30 text-[10px] text-red-350 italic font-mono">
                     "Each setback teaches us about the fine balance of our soil, air, and streams."
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        playSound("select");
                        setActiveOutcome(null);
                        setActiveTab("world");
                      }}
                      className="flex-1 py-3 px-4 rounded-xl border border-emerald-800 text-emerald-300 hover:bg-emerald-900 hover:text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      MAP
                    </button>
                    <button
                      onClick={() => {
                        playSound("select");
                        const m = MISSIONS_LIST.find((x) => x.id === activeOutcome.missionId);
                        setActiveOutcome(null);
                        if (m) {
                          setActivePlayableMission(m);
                        }
                      }}
                      className="flex-[2] py-3 px-4 rounded-xl bg-red-800 hover:bg-gradient-to-r hover:from-rose-600 hover:to-red-750 text-white text-xs font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all shadow-lg shadow-red-950"
                    >
                      RETRY MISSION 🔄
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}

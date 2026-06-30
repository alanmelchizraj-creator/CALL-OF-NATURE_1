import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playSound } from "../utils/audio";
import { PlayerProgress } from "../types";
import { 
  Sparkles, Trophy, Award, Sprout, Trees, Flame, Trash2, 
  Waves, Heart, HelpCircle, Gift, CheckCircle2, ChevronRight, 
  ArrowLeft, Star, AlertTriangle, Shield, Compass, Zap
} from "lucide-react";

// The 15 Restorable Areas as specified in user request
export interface RestorableArea {
  id: string;
  name: string;
  cost: number;
  icon: string;
  beforeState: {
    title: string;
    description: string;
    emoji: string;
  };
  afterState: {
    title: string;
    description: string;
    emoji: string;
  };
  upgradeText: string;
  islandSection: string;
}

export const RESTORABLE_AREAS: RestorableArea[] = [
  {
    id: "dead_trees",
    name: "Dead Trees",
    cost: 200,
    icon: "🪵",
    beforeState: {
      title: "Withered Wood",
      description: "Dry, barren stumps and decaying ancient wood with zero sap flow.",
      emoji: "🪵"
    },
    afterState: {
      title: "Ancient Forest Grove",
      description: "Towering green oak and pine trees with rustling leaves and birds nesting.",
      emoji: "🌳"
    },
    upgradeText: "Photosynthesis Shield (+10% score in Forest Runner)",
    islandSection: "North Ridge"
  },
  {
    id: "burned_forest",
    name: "Burned Forest Areas",
    cost: 350,
    icon: "🔥",
    beforeState: {
      title: "Charred Ashes",
      description: "Scorched branches, dark gray ash, and lifeless black coal beds.",
      emoji: "🌋"
    },
    afterState: {
      title: "Emerald Regeneration",
      description: "Vibrant grass meadows, bluebells, wild mushrooms, and butterflies.",
      emoji: "🌸"
    },
    upgradeText: "Unlocks Cutscene: 'Rebirth of the Grove'",
    islandSection: "East Valley"
  },
  {
    id: "dry_riverbeds",
    name: "Dry Riverbeds",
    cost: 450,
    icon: "💧",
    beforeState: {
      title: "Parched Clay",
      description: "Cracked mud trails, dry smooth stones, and drifting dust devils.",
      emoji: "🏜️"
    },
    afterState: {
      title: "Shimmering Stream",
      description: "Crystal-clear flowing spring water nourishing regional flora.",
      emoji: "🌊"
    },
    upgradeText: "Water Sprinkler Pro (+15% nozzle capacity in Fire Fighter)",
    islandSection: "Central Slopes"
  },
  {
    id: "polluted_lake",
    name: "Polluted Lake",
    cost: 550,
    icon: "☣️",
    beforeState: {
      title: "Toxic Sludge Reservoir",
      description: "Sooty greenish slime, grease slicks, and suffocated water plants.",
      emoji: "🧪"
    },
    afterState: {
      title: "Sapphire Water Basin",
      description: "Clean sparkling blue lake with swimming trout and ducks.",
      emoji: "💎"
    },
    upgradeText: "Super Net (+20% scoop size in River Cleanup)",
    islandSection: "South Wetland"
  },
  {
    id: "plastic_waste",
    name: "Plastic Waste Piles",
    cost: 250,
    icon: "🗑️",
    beforeState: {
      title: "Debris Heaps",
      description: "Discarded bottles, plastic bags, and chemical barrels.",
      emoji: "📦"
    },
    afterState: {
      title: "Wildflower Meadows",
      description: "Lush grassy knolls with yellow dandelions and wild daisies.",
      emoji: "🌱"
    },
    upgradeText: "Eco Collectible: 'The Recycled Crown'",
    islandSection: "South Wetland"
  },
  {
    id: "destroyed_shelters",
    name: "Destroyed Animal Shelters",
    cost: 400,
    icon: "🏚️",
    beforeState: {
      title: "Collapsed Nests",
      description: "Broken beaver dams, crushed hollows, and shattered burrows.",
      emoji: "🏚️"
    },
    afterState: {
      title: "Cozy Fauna Havens",
      description: "Safe multi-tier nests, deep dens, and thriving beaver lodges.",
      emoji: "🏠"
    },
    upgradeText: "Fauna Tracker (Highlights hidden targets in Wildlife Photographer)",
    islandSection: "West Wilderness"
  },
  {
    id: "broken_bridges",
    name: "Broken Bridges",
    cost: 300,
    icon: "🌉",
    beforeState: {
      title: "Unstable Suspension",
      description: "Splintered rotting planks and rusted sagging iron chains.",
      emoji: "⛓️"
    },
    afterState: {
      title: "Ancient Stone Archway",
      description: "A gorgeous stone bridge decorated with climbing green vines.",
      emoji: "🌉"
    },
    upgradeText: "Unlocks Island Section: 'The Whispering Gorge'",
    islandSection: "The Gorge"
  },
  {
    id: "damaged_farmland",
    name: "Damaged Farmland",
    cost: 380,
    icon: "🌾",
    beforeState: {
      title: "Overgrown Wasteland",
      description: "Strangling thorny weeds, hardened clay soil, and rusted tractor debris.",
      emoji: "🪓"
    },
    afterState: {
      title: "Golden Organic Crops",
      description: "Bountiful rows of wheat, fresh berries, and humming bumblebees.",
      emoji: "🌾"
    },
    upgradeText: "Mega Basket (+20% speed in Nature Collection)",
    islandSection: "West Wilderness"
  },
  {
    id: "drought_zones",
    name: "Drought Zones",
    cost: 420,
    icon: "☀️",
    beforeState: {
      title: "Cracked Earth",
      description: "Parched land experiencing severe heatwaves and dead grasses.",
      emoji: "🥵"
    },
    afterState: {
      title: "Dewy Clover Fields",
      description: "Lush moist pastures under gentle localized cooling rain clouds.",
      emoji: "🌧️"
    },
    upgradeText: "Cloud Seeding (Slows down falling trash in Nature Collection)",
    islandSection: "North Ridge"
  },
  {
    id: "smoke_pollution",
    name: "Smoke Pollution Areas",
    cost: 500,
    icon: "💨",
    beforeState: {
      title: "Choking Smog",
      description: "Suffocating soot clouds block the sun and harm local birds.",
      emoji: "🌫️"
    },
    afterState: {
      title: "Prismatic Skies",
      description: "Fresh clean alpine air, crystal clear blue skies, and sunshine.",
      emoji: "☀️"
    },
    upgradeText: "Unlocks Cutscene: 'The Breath of Evergreen'",
    islandSection: "East Valley"
  },
  {
    id: "flood_damaged",
    name: "Flood Damaged Regions",
    cost: 480,
    icon: "🌊",
    beforeState: {
      title: "Waterlogged Swamp",
      description: "Eroded soil mudslides and stagnant waterlogged debris pools.",
      emoji: "🐊"
    },
    afterState: {
      title: "Cattail Wetlands",
      description: "Stunning terraced wetlands with pink water lilies and dragonflies.",
      emoji: "🪷"
    },
    upgradeText: "Anti-Silt Shield (Saves players from mud traps in games)",
    islandSection: "South Wetland"
  },
  {
    id: "barren_land",
    name: "Barren Land",
    cost: 320,
    icon: "🏜️",
    beforeState: {
      title: "Desolate Badlands",
      description: "Barren sandy dunes with zero foliage cover or organic content.",
      emoji: "🌵"
    },
    afterState: {
      title: "Desert Oasis Garden",
      description: "Lush desert flowers, purple lavender, and native cacti.",
      emoji: "🏜️"
    },
    upgradeText: "Unlocks Oasis Compass accessory upgrade",
    islandSection: "Central Slopes"
  },
  {
    id: "extinct_plants",
    name: "Extinct Plant Zones",
    cost: 600,
    icon: "🌸",
    beforeState: {
      title: "Petrified Stems",
      description: "Fossilized roots of rare glowing flowers long since depleted.",
      emoji: "🥀"
    },
    afterState: {
      title: "Heart of Evergreen",
      description: "Glowing ancient giant blossoms spreading pollen particles.",
      emoji: "🌸"
    },
    upgradeText: "Eternal Blossom (+20% flower health in Protect the Plant)",
    islandSection: "The Sanctuary"
  },
  {
    id: "empty_habitats",
    name: "Empty Wildlife Habitats",
    cost: 700,
    icon: "🦌",
    beforeState: {
      title: "Silent Wilderness",
      description: "Quiet hollow fields lacking signs of native mammals or birds.",
      emoji: "🫙"
    },
    afterState: {
      title: "Bustling Sanctuary",
      description: "Deer grazing, rabbits hopping, and friendly bears searching for honey.",
      emoji: "🦌"
    },
    upgradeText: "Spirit Call (Increases speed of parent animals in Baby Animal Maze)",
    islandSection: "West Wilderness"
  },
  {
    id: "nature_shrine",
    name: "Corrupted Sacred Nature Shrine",
    cost: 1000,
    icon: "👑",
    beforeState: {
      title: "Overgrown Obelisk",
      description: "Shattered stone monolith covered in purple thorns and toxic miasma.",
      emoji: "💀"
    },
    afterState: {
      title: "Aura Shrine of the Guardian",
      description: "A fully intact crystal monument emitting healing green light beams.",
      emoji: "👑"
    },
    upgradeText: "Master Guardian Beam (+25% damage in the Final Challenge)",
    islandSection: "The Sanctuary"
  }
];

// 7 Progressive Stages of Island Growth
export const ISLAND_STAGES = [
  { stage: 1, name: "Destroyed Island", threshold: 0, description: "Desolate, covered in ash, soot, and industrial plastic.", color: "from-zinc-800 to-stone-900" },
  { stage: 2, name: "Small Areas Repaired", threshold: 1, description: "Minor sprouts emerge. The healing process has officially begun.", color: "from-amber-900 to-zinc-900" },
  { stage: 3, name: "Forests Growing Back", threshold: 4, description: "Fresh evergreen seedlings begin to shade the dry valley floor.", color: "from-emerald-950 to-stone-900" },
  { stage: 4, name: "Wildlife Returns", threshold: 7, description: "Small birds, rabbits, and butterflies have been spotted returning.", color: "from-teal-950 to-zinc-950" },
  { stage: 5, name: "Rivers Restored", threshold: 10, description: "Pure sparkling stream water washes away toxic sludge reservoirs.", color: "from-cyan-950 to-emerald-950" },
  { stage: 6, name: "Nature Thriving", threshold: 13, description: "Lush meadows are now blooming with endangered glowing blossoms.", color: "from-green-950 to-teal-950" },
  { stage: 7, name: "Guardian Island Fully Restored", threshold: 15, description: "Evergreen is saved! The island is now an ultimate glowing paradise.", color: "from-emerald-900 via-teal-950 to-emerald-950" }
];

// Eco Questions for the Quiz minigame inside Lobby to earn bonus NP
const ECO_QUIZ_QUESTIONS = [
  {
    q: "Which of the following causes the most severe damage to marine life in our oceans?",
    options: ["Single-use plastic bottles & bags", "Natural driftwood logs", "Excessive ocean rainfall", "Splashing dolphins"],
    correct: 0,
    fact: "Over 8 million tons of plastic enter our oceans every year, breaking down into microplastics that harm marine animals."
  },
  {
    q: "How does planting native regional flora help your local ecosystem?",
    options: ["It keeps local soils dry", "It supports local bees, butterflies, and wild pollinators", "It attracts industrial logging crews", "It has no environmental impact"],
    correct: 1,
    fact: "Native plants provide the perfect nectar and nesting material for indigenous insects and birds."
  },
  {
    q: "What is the primary benefit of shutting down household computers when not in use?",
    options: ["It makes the device colder", "It reduces unnecessary power plant carbon emissions", "It creates cleaner tap water", "It grows new forest saplings"],
    correct: 1,
    fact: "Reducing power use lowers the grid demand, meaning power plants burn less fossil fuel and emit less carbon."
  },
  {
    q: "Why are rivers so critical to preventing general ocean pollution?",
    options: ["They carry leaves down", "90% of plastic floating in sea currents originated inland from rivers", "Rivers are wider than oceans", "Rivers prevent wind from blowing"],
    correct: 1,
    fact: "Cleaning inland riverbanks catches trash before the fast current sweeps it out to coastal oceans."
  },
  {
    q: "What is composting?",
    options: ["Throwing bottles in streams", "Recycling natural organic scraps to enrich topsoil naturally", "Burning branches in forests", "Burying toxic tin cans"],
    correct: 1,
    fact: "Composting turns organic kitchen waste into nutrient-rich humus, feeding plants without chemicals."
  },
  {
    q: "Which species acts as an essential indicator of a fully healthy wetland ecosystem?",
    options: ["Mechanical loggers", "Frogs and dragonflies", "Dry parched grass", "Soot particles"],
    correct: 1,
    fact: "Amphibians absorb moisture through their skin, making them extremely sensitive to water contaminants."
  }
];

interface GuardianIslandProps {
  progress: PlayerProgress;
  onUpdateProgress: (newPrg: PlayerProgress) => void;
  onNavigateToWorld: () => void;
}

export default function GuardianIsland({ progress, onUpdateProgress, onNavigateToWorld }: GuardianIslandProps) {
  const restoredList = progress.restoredAreas || [];
  const restoredCount = restoredList.length;

  // Find the current stage based on restored areas count
  const currentStage = [...ISLAND_STAGES]
    .reverse()
    .find(s => restoredCount >= s.threshold) || ISLAND_STAGES[0];

  const nextStageIndex = ISLAND_STAGES.findIndex(s => s.stage === currentStage.stage) + 1;
  const nextStage = nextStageIndex < ISLAND_STAGES.length ? ISLAND_STAGES[nextStageIndex] : null;

  // UI state
  const [selectedArea, setSelectedArea] = useState<RestorableArea | null>(null);
  const [restorationSuccess, setRestorationSuccess] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizSelectedOpt, setQuizSelectedOpt] = useState<number | null>(null);
  const [quizResultMsg, setQuizResultMsg] = useState<string>("");
  const [dailyClaimed, setDailyClaimed] = useState<boolean>(false);
  const [dailyCooldown, setDailyCooldown] = useState<string>("");

  // Check and update daily claim status
  useEffect(() => {
    const lastClaim = localStorage.getItem("last_daily_eco_claim");
    if (lastClaim) {
      const diff = Date.now() - parseInt(lastClaim);
      const remaining = 24 * 60 * 60 * 1000 - diff;
      if (remaining > 0) {
        setDailyClaimed(true);
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setDailyCooldown(`${hours}h ${mins}m`);
      } else {
        setDailyClaimed(false);
      }
    }
  }, [dailyClaimed]);

  // Check if fully restored to trigger a celebration
  useEffect(() => {
    if (restoredCount === 15) {
      const celebrated = localStorage.getItem("island_completed_celebrated");
      if (!celebrated) {
        setShowCelebration(true);
        localStorage.setItem("island_completed_celebrated", "true");
        playSound("victory");
      }
    }
  }, [restoredCount]);

  const handleClaimDaily = () => {
    playSound("victory");
    const updatedProgress = {
      ...progress,
      naturePoints: progress.naturePoints + 150,
      restoredAreas: restoredList
    };
    onUpdateProgress(updatedProgress);
    localStorage.setItem("last_daily_eco_claim", Date.now().toString());
    setDailyClaimed(true);
    alert("🎁 Daily eco-blessing received! +150 Nature Points added to your balance!");
  };

  const handleRestoreArea = (area: RestorableArea) => {
    if (restoredList.includes(area.id)) {
      playSound("failure");
      return;
    }

    if (progress.naturePoints < area.cost) {
      playSound("failure");
      alert(`⚠️ Not enough Nature Points! You need ${area.cost} NP, but currently have ${progress.naturePoints} NP.\n\nPlay more regional missions to accumulate score!`);
      return;
    }

    playSound("unlock");
    const nextRestored = [...restoredList, area.id];
    
    // Check if fully completed
    const newlyUnlockedAchievements = [...(progress.unlockedAchievements || [])];
    if (nextRestored.length >= 5 && !newlyUnlockedAchievements.includes("point_collector")) {
      newlyUnlockedAchievements.push("point_collector");
    }

    const updatedProgress: PlayerProgress = {
      ...progress,
      naturePoints: progress.naturePoints - area.cost,
      restoredAreas: nextRestored,
      unlockedAchievements: newlyUnlockedAchievements
    };

    onUpdateProgress(updatedProgress);
    setRestorationSuccess(area.id);
    setSelectedArea(null);

    setTimeout(() => {
      setRestorationSuccess(null);
    }, 4000);
  };

  const handleQuizAnswer = (optIdx: number) => {
    if (quizAnswered) return;
    setQuizSelectedOpt(optIdx);
    setQuizAnswered(true);
    
    const isCorrect = optIdx === ECO_QUIZ_QUESTIONS[quizIdx].correct;
    if (isCorrect) {
      playSound("victory");
      const updatedProgress = {
        ...progress,
        naturePoints: progress.naturePoints + 50,
        restoredAreas: restoredList
      };
      onUpdateProgress(updatedProgress);
      setQuizResultMsg("Correct! 🌟 +50 Nature Points awarded! " + ECO_QUIZ_QUESTIONS[quizIdx].fact);
    } else {
      playSound("failure");
      setQuizResultMsg("Incorrect, but highly educational! 💡 Fact: " + ECO_QUIZ_QUESTIONS[quizIdx].fact);
    }
  };

  const handleNextQuiz = () => {
    setQuizIdx((prev) => (prev + 1) % ECO_QUIZ_QUESTIONS.length);
    setQuizAnswered(false);
    setQuizSelectedOpt(null);
    setQuizResultMsg("");
    playSound("select");
  };

  const totalPossibleNP = RESTORABLE_AREAS.reduce((sum, a) => sum + a.cost, 0);
  const totalRestoredPercent = Math.min(100, Math.round((restoredCount / 15) * 100));

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col min-h-[85vh] animate-fadeIn text-slate-100">
      
      {/* GLOWING HERO HEADING BOARD */}
      <div className={`rounded-3xl p-6 sm:p-8 bg-gradient-to-r ${currentStage.color} border-2 border-emerald-500/30 shadow-2xl relative overflow-hidden transition-all duration-1000`}>
        
        {/* Shimmering particle ambient glow overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_60%)] pointer-events-none" />
        {restoredCount === 15 && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(234,179,8,0.2),transparent_70%)] animate-pulse pointer-events-none" />
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-400/30 rounded-full text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse" /> Lobby Sanctuary Hub
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-sans text-white tracking-tight flex items-center gap-2">
              Guardian Island <span className="text-lime-400">Restoration</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Every regional mission you complete rewards Nature Points. Use your accumulated points to cleanse soil, repair withered woods, purge oil leaks, and witness the direct botanical rebirth of Guardian Island!
            </p>
          </div>

          {/* QUICK CONTROLS AREA */}
          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            {/* Daily Gift claim */}
            <button
              onClick={handleClaimDaily}
              disabled={dailyClaimed}
              className={`flex-1 md:flex-none px-4 py-3 rounded-xl border font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                dailyClaimed
                  ? "bg-stone-900/40 border-stone-800 text-stone-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 active:scale-95 text-amber-950 border-amber-400 cursor-pointer animate-pulse"
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>{dailyClaimed ? `Claimed (${dailyCooldown})` : "Claim +150 NP"}</span>
            </button>

            {/* Eco Quiz Toggle */}
            <button
              onClick={() => { playSound("select"); setShowQuiz(!showQuiz); }}
              className="flex-1 md:flex-none px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs uppercase tracking-wider border border-cyan-400/40 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{showQuiz ? "Close Quiz" : "Guardian Quiz (+50 NP)"}</span>
            </button>
          </div>
        </div>

        {/* PROGRESS AND STAGE STATUS BAR */}
        <div className="mt-8 pt-6 border-t border-slate-700/40 space-y-3 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 text-xs font-bold">
            <div>
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest block">CURRENT GROWTH STATUS</span>
              <span className="text-lg font-black text-lime-300 uppercase flex items-center gap-1.5 mt-0.5">
                🌳 {currentStage.name} (Stage {currentStage.stage}/7)
              </span>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-slate-400 text-[10px] uppercase block">TOTAL REBORN SECTORS</span>
              <span className="text-sm font-extrabold text-white">
                {restoredCount} / 15 Areas Repaired <span className="text-lime-400">({totalRestoredPercent}%)</span>
              </span>
            </div>
          </div>

          {/* Elegant Progress bar of Restoration */}
          <div className="h-3 bg-zinc-900/80 rounded-full border border-slate-800 p-0.5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${totalRestoredPercent}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-400 shadow-[0_0_12px_rgba(132,204,22,0.6)]"
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-medium text-slate-300">
            <span className="italic">"{currentStage.description}"</span>
            {nextStage && (
              <span className="text-emerald-400 font-bold">
                Next Stage: {nextStage.name} (Need {nextStage.threshold} areas)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* INTERACTIVE ECO QUIZ OVERLAY INSIDE THE LOBBY */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-cyan-950 to-slate-900 border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative">
              <div className="flex justify-between items-center border-b border-cyan-900 pb-3 mb-4">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  🎓 Guardian Eco-Scholar Quiz
                </span>
                <span className="text-[10px] font-mono bg-cyan-950 px-2 py-0.5 border border-cyan-800 text-cyan-300 rounded">
                  Question {quizIdx + 1} / {ECO_QUIZ_QUESTIONS.length}
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-extrabold text-white mb-4">
                {ECO_QUIZ_QUESTIONS[quizIdx].q}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                {ECO_QUIZ_QUESTIONS[quizIdx].options.map((option, idx) => {
                  const isSelected = quizSelectedOpt === idx;
                  const isCorrectAnswer = idx === ECO_QUIZ_QUESTIONS[quizIdx].correct;
                  
                  let btnStyle = "bg-slate-900/60 border-cyan-900 hover:border-cyan-400 text-slate-100 hover:bg-slate-800/40";
                  if (quizAnswered) {
                    if (isCorrectAnswer) {
                      btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-300 font-extrabold shadow-lg";
                    } else if (isSelected) {
                      btnStyle = "bg-red-950/80 border-red-500 text-red-300 font-extrabold";
                    } else {
                      btnStyle = "bg-stone-900/30 border-stone-950 text-stone-600 cursor-not-allowed";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(idx)}
                      disabled={quizAnswered}
                      className={`p-3 text-left rounded-xl border text-xs tracking-wide leading-relaxed font-semibold transition-all flex items-center justify-between gap-2 ${btnStyle} ${!quizAnswered ? "cursor-pointer active:scale-[0.98]" : ""}`}
                    >
                      <span>{option}</span>
                      {quizAnswered && isCorrectAnswer && <span className="text-emerald-400">✓</span>}
                      {quizAnswered && isSelected && !isCorrectAnswer && <span className="text-red-400">✕</span>}
                    </button>
                  );
                })}
              </div>

              {quizAnswered && (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-cyan-900/40 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <p className="text-cyan-100 leading-relaxed font-medium">
                    {quizResultMsg}
                  </p>
                  <button
                    onClick={handleNextQuiz}
                    className="whitespace-nowrap px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-[11px] uppercase tracking-wider rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md"
                  >
                    Next Question ➡️
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 15 DAMAGED / RESTORED SECTIONS LIST */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-xl font-bold uppercase tracking-tight text-white flex items-center gap-1.5">
              <span>🗂️ Guardian Sectors</span>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900/60 border border-slate-800 px-2 py-0.5 rounded-full">15 SITES</span>
            </h3>
            <p className="text-xs text-slate-400">Click any sector card to restore or view passive upgrade benefits</p>
          </div>
          <button
            onClick={() => { playSound("select"); onNavigateToWorld(); }}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-lime-500 hover:brightness-110 active:scale-95 text-emerald-950 font-black text-xs uppercase tracking-widest rounded-xl shadow flex items-center gap-1 cursor-pointer self-stretch sm:self-auto text-center justify-center"
          >
            <span>🧭</span> LAUNCH ADVENTURE MAP
          </button>
        </div>

        {/* Dynamic 15 grid items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RESTORABLE_AREAS.map((area) => {
            const isRestored = restoredList.includes(area.id);
            const isJustRestored = restorationSuccess === area.id;

            return (
              <div
                key={area.id}
                onClick={() => {
                  playSound("select");
                  setSelectedArea(area);
                }}
                className={`p-4 rounded-2xl border-2 transition-all relative overflow-hidden flex flex-col justify-between h-[165px] group select-none cursor-pointer ${
                  isRestored
                    ? isJustRestored
                      ? "bg-gradient-to-br from-emerald-950 to-lime-950 border-lime-400 ring-4 ring-lime-400/20 scale-[1.03] animate-pulse"
                      : "bg-slate-900/80 border-emerald-500/30 hover:border-emerald-400 hover:scale-[1.02]"
                    : "bg-zinc-950/90 border-stone-800/80 hover:border-amber-500/40"
                }`}
              >
                {/* Background water reflection/smog shadow */}
                {!isRestored && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                )}

                {/* Shimmer overlay for restored items */}
                {isRestored && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none" />
                )}

                <div className="relative z-10">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2 py-0.5 bg-stone-900/60 border border-slate-800/50 rounded-full text-[9px] font-bold text-slate-400 tracking-wide">
                      📍 {area.islandSection}
                    </span>
                    {isRestored ? (
                      <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-950" /> REBORN
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-amber-500 flex items-center gap-1 font-mono animate-pulse">
                        ⚠️ CRITICAL
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl border ${
                      isRestored 
                        ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300" 
                        : "bg-stone-900/50 border-stone-800/80 text-stone-600 grayscale"
                    }`}>
                      {isRestored ? area.afterState.emoji : area.beforeState.emoji}
                    </div>
                    <div>
                      <h4 className={`text-sm font-black uppercase tracking-tight ${isRestored ? "text-slate-100" : "text-stone-400"}`}>
                        {area.name}
                      </h4>
                      <p className={`text-[10px] line-clamp-2 mt-0.5 leading-relaxed font-semibold ${isRestored ? "text-emerald-250 text-emerald-300/80" : "text-stone-500"}`}>
                        {isRestored ? area.afterState.title : area.beforeState.title}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 border-t border-slate-800/40 pt-2 flex justify-between items-center">
                  <div className="truncate pr-1">
                    <span className="text-[8px] font-black text-lime-400 uppercase tracking-widest block">PASSIVE UPGRADE</span>
                    <span className={`text-[10px] font-extrabold truncate block ${isRestored ? "text-emerald-400" : "text-stone-600"}`}>
                      🛡️ {area.upgradeText}
                    </span>
                  </div>

                  <div className="shrink-0">
                    {isRestored ? (
                      <span className="text-[9px] font-mono bg-emerald-950/60 border border-emerald-900 text-emerald-400 px-2.5 py-1 rounded-lg">
                        UNLOCKED
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSound("select");
                          setSelectedArea(area);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-emerald-950 font-black text-[10px] uppercase tracking-widest rounded-lg cursor-pointer flex items-center gap-1 shadow hover:shadow-emerald-500/20 active:scale-95 transition-all"
                      >
                        ⚡ RESTORE
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAIL DRAWER / POPUP BOX FOR RESTORATION */}
      <AnimatePresence>
        {selectedArea && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[1000] animate-fadeIn">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-gradient-to-b from-slate-900 to-zinc-950 border-2 border-emerald-500 p-6 rounded-3xl max-w-lg w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] relative"
            >
              {/* Close Button */}
              <button
                onClick={() => { playSound("select"); setSelectedArea(null); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold w-8 h-8 rounded-full bg-slate-900/40 border border-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>

              <div className="flex items-center gap-3.5 mb-4 pb-4 border-b border-slate-800/50">
                <span className="text-4xl bg-slate-950 p-2.5 rounded-2xl border border-slate-800 leading-none">
                  {selectedArea.icon}
                </span>
                <div>
                  <span className="text-[9px] font-black text-emerald-400 uppercase bg-emerald-950 border border-emerald-900 px-2 py-0.5 rounded-full tracking-wide">
                    📍 Sector: {selectedArea.islandSection}
                  </span>
                  <h3 className="text-xl font-black uppercase text-white mt-0.5">
                    {selectedArea.name}
                  </h3>
                </div>
              </div>

              {/* BEFORE VS AFTER VIEWPORT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {/* Damaged State Column */}
                <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                  restoredList.includes(selectedArea.id) 
                    ? "bg-stone-900/20 border-stone-950 opacity-40" 
                    : "bg-red-950/20 border-red-900/40"
                }`}>
                  <div>
                    <span className="text-[8px] bg-red-900/25 text-red-400 px-2 py-0.5 rounded font-black uppercase tracking-wider block w-fit">
                      🛑 DAMAGED STATE
                    </span>
                    <h5 className="text-xs font-black text-red-300 uppercase mt-2">
                      {selectedArea.beforeState.emoji} {selectedArea.beforeState.title}
                    </h5>
                    <p className="text-[11px] text-red-200/80 mt-1 leading-relaxed">
                      {selectedArea.beforeState.description}
                    </p>
                  </div>
                </div>

                {/* Restored State Column */}
                <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                  restoredList.includes(selectedArea.id)
                    ? "bg-emerald-950/30 border-emerald-500/50 shadow"
                    : "bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-100 transition-opacity"
                }`}>
                  <div>
                    <span className="text-[8px] bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded font-black uppercase tracking-wider block w-fit">
                      🌿 HEALED STATE
                    </span>
                    <h5 className="text-xs font-black text-emerald-300 uppercase mt-2">
                      {selectedArea.afterState.emoji} {selectedArea.afterState.title}
                    </h5>
                    <p className="text-[11px] text-emerald-200/80 mt-1 leading-relaxed">
                      {selectedArea.afterState.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* UPGRADE SUMMARY */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl mb-6">
                <span className="text-[8px] text-lime-400 font-extrabold uppercase tracking-widest block">🔒 PERMANENT REWARD BENEFIT</span>
                <p className="text-xs text-slate-100 font-extrabold mt-1.5 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-lime-400 shrink-0" />
                  <span>{selectedArea.upgradeText}</span>
                </p>
              </div>

              {/* ACTION ROW */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { playSound("select"); setSelectedArea(null); }}
                  className="px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wider cursor-pointer transition-all"
                >
                  Close
                </button>

                {restoredList.includes(selectedArea.id) ? (
                  <button
                    disabled
                    className="px-6 py-3 rounded-xl bg-emerald-950/50 border border-emerald-900 text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-not-allowed"
                  >
                    ✓ Sector Reborn
                  </button>
                ) : (
                  <button
                    onClick={() => handleRestoreArea(selectedArea)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:brightness-110 active:scale-95 text-emerald-950 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>⚡ RESTORE SENSITIVE AREA ({selectedArea.cost} NP)</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 100% COMPLETE CELEBRATION MODAL OVERLAY */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 z-[99999] animate-fadeIn">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full bg-gradient-to-b from-emerald-900 via-zinc-950 to-zinc-950 border-2 border-yellow-400 p-8 text-center rounded-3xl shadow-[0_30px_70px_rgba(234,179,8,0.3)] relative overflow-hidden"
            >
              {/* Falling leaves / particle background overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(132,204,22,0.1),transparent_75%)] pointer-events-none" />
              <div className="text-6xl mb-4 animate-bounce">👑</div>

              <span className="text-[10px] bg-yellow-400 text-slate-950 font-black px-4 py-1 rounded-full tracking-widest uppercase shadow">
                PARADISE RESTORED
              </span>

              <h2 className="text-3xl font-black mt-4 text-white tracking-tight uppercase leading-none">
                Nature Has Been Saved! 🌿
              </h2>

              <p className="text-xs text-emerald-100 mt-4 leading-relaxed font-serif italic">
                "The shadows of smog and sludge have evaporated into crystal clear skies. The ancient Tree of Life blooms. Deer, foxes, bears, and pandas run freely along pure winding streams. Peaceful flute arpeggios echo across Evergreen. You have proven yourself as the Ultimate Eco Guardian!"
              </p>

              {/* Paradise details checklist */}
              <div className="my-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-left space-y-2 text-[11px] font-semibold text-emerald-200">
                <p>🌳 Green flourishing forests restored successfully</p>
                <p>🌊 Sparking mountain rivers clean and flowing</p>
                <p>🦌 Active deer, rabbits, owls, and bears returned</p>
                <p>🌺 Shimmering giant endangered flowers blooming</p>
                <p>🎵 Peaceful sacred shrine energy restored</p>
              </div>

              <button
                onClick={() => { playSound("select"); setShowCelebration(false); }}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                DISMISS CELEBRATION 💚
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

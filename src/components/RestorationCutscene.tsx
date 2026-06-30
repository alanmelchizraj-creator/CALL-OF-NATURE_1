import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playSound } from "../utils/audio";
import { 
  Sparkles, ShieldCheck, CheckCircle2, Trees, Waves, Flame, 
  Trash2, Ban, Compass, Camera, Heart, Zap, RefreshCw, Trophy
} from "lucide-react";

interface RestorationCutsceneProps {
  missionId: number;
  score: number;
  stars: number;
  onComplete: () => void;
}

interface RestorationConfig {
  title: string;
  subtitle: string;
  threatLabel: string;
  restoredLabel: string;
  description: string;
  beforeEmoji: string;
  afterEmoji: string;
  beforeBg: string; // picsum seed or gradient
  afterBg: string; // picsum seed or gradient
  stats: { label: string; value: string; icon: string }[];
  hazeColor: string; // Tailwind class for threat overlay
  bloomColor: string; // Tailwind class for restoration theme
}

const RESTORATION_DATA: Record<number, RestorationConfig> = {
  1: {
    title: "Canopy Reforestation",
    subtitle: "Mission 1: Forest Runner",
    threatLabel: "Deforested & Fragmented Woods",
    restoredLabel: "Ancient Redwood Sanctuary",
    description: "The tree canopy is safely connected again! Forest corridors have been restored, allowing deer and other small mammals to migrate, feed, and shelter without fear of industrial roads.",
    beforeEmoji: "🪓🪵🏚️",
    afterEmoji: "🦌🌲🌳✨",
    beforeBg: "/src/assets/images/industrial_pollution_1782201478450.jpg",
    afterBg: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80",
    stats: [
      { label: "Saplings Planted", value: "+850 Redwoods", icon: "🌱" },
      { label: "Canopy Connectivity", value: "98% Connected", icon: "🌳" },
      { label: "Fauna Safety Index", value: "Secure (Class A)", icon: "🛡️" }
    ],
    hazeColor: "from-stone-900/90 to-amber-950/70",
    bloomColor: "from-emerald-500 to-green-600"
  },
  2: {
    title: "Woodland Maze Clearing",
    subtitle: "Mission 2: Baby Animal Maze",
    threatLabel: "Smog-choked Winding Trails",
    restoredLabel: "Reunited Animal Sanctuaries",
    description: "Dense toxic smog has dissipated from the winding forest floor. With guide paths fully visible and clean, lost baby bear cubs, foxes, and rabbits have been returned to their family nests.",
    beforeEmoji: "🌫️🛑🐾❓",
    afterEmoji: "🐻🦊🐰🌻💖",
    beforeBg: "/src/assets/images/industrial_pollution_1782201478450.jpg",
    afterBg: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    stats: [
      { label: "Fog Concentration", value: "0.02% (Neutralized)", icon: "🌫️" },
      { label: "Families Reunited", value: "3 Key Species", icon: "👨‍👩‍👧" },
      { label: "Trail Visibility", value: "Infinite Range", icon: "👁️" }
    ],
    hazeColor: "from-slate-900/90 to-zinc-800/80",
    bloomColor: "from-amber-500 to-amber-600"
  },
  3: {
    title: "Meadow Organic Re-seeding",
    subtitle: "Mission 3: Nature Collection",
    threatLabel: "Plastics & Industrial Waste Field",
    restoredLabel: "Blooming Eco-Meadow",
    description: "Trash and microplastics have been sifted out of the topsoil. Organic wild berry seeds and fresh water drops have re-infused the landscape, feeding beneficial pollinators and local fox clans.",
    beforeEmoji: "🗑️☠️🥫⚠️",
    afterEmoji: "🦊🍓🌸🐝✨",
    beforeBg: "/src/assets/images/industrial_pollution_1782201478450.jpg",
    afterBg: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&q=80",
    stats: [
      { label: "Plastics Extracted", value: "142 kilograms", icon: "🗑️" },
      { label: "Native Flora Seeded", value: "+1,200 Blooms", icon: "🌸" },
      { label: "Pollinator Activity", value: "Excellent (+200%)", icon: "🐝" }
    ],
    hazeColor: "from-teal-950/90 to-slate-900/80",
    bloomColor: "from-teal-500 to-cyan-500"
  },
  4: {
    title: "Flower of Life Awakening",
    subtitle: "Mission 4: Protect the Plant",
    threatLabel: "Swarming Parasite Infestation",
    restoredLabel: "Radiant Ancient Bloom",
    description: "The rare bioluminescent Heart of Evergreen has blossomed! With swarming pests neutralized, the flower is releasing glowing seed spores into the air, triggering a chain-reaction of forest growth.",
    beforeEmoji: "🕷️🪲🍂🥀",
    afterEmoji: "🌸🦉✨💫🔮",
    beforeBg: "/src/assets/images/industrial_pollution_1782201478450.jpg",
    afterBg: "/src/assets/images/harmony_1782201450092.jpg",
    stats: [
      { label: "Parasites Repelled", value: "100% Cleared", icon: "🛡️" },
      { label: "Spore Radiance", value: "+450 Lux", icon: "✨" },
      { label: "Mycelial Network", value: "Vibrant & Active", icon: "🍄" }
    ],
    hazeColor: "from-purple-950/90 to-indigo-950/70",
    bloomColor: "from-indigo-500 to-purple-600"
  },
  5: {
    title: "Wildfire Suppression",
    subtitle: "Mission 5: Fire Fighter Hero",
    threatLabel: "Blazing Forest Inferno",
    restoredLabel: "Regenerated Moist Woodlands",
    description: "The terrifying wildfire has been completely doused. Cooling mist and restorative moisture have cooled the charcoal ground, triggering instant germination of ash-fertilized pine cones.",
    beforeEmoji: "🔥🌲🚒💨",
    afterEmoji: "🐺🌿🌧️🍃💧",
    beforeBg: "/src/assets/images/industrial_pollution_1782201478450.jpg",
    afterBg: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    stats: [
      { label: "Fires Extinguished", value: "8 Main Blazes", icon: "🔥" },
      { label: "Ground Temperature", value: "Normal (18°C)", icon: "🌡️" },
      { label: "Moisture Retention", value: "High (82%)", icon: "💧" }
    ],
    hazeColor: "from-red-950/95 to-orange-950/80",
    bloomColor: "from-red-500 to-orange-600"
  },
  6: {
    title: "Redwood Sanctuary Defense",
    subtitle: "Mission 6: Stop the Loggers",
    threatLabel: "Chainsaw Machinery Invasion",
    restoredLabel: "Protected Forest Reserve",
    description: "Illegal logging machinery has been securely tangled and halted. The border is heavily reinforced, and the quiet redwood groves are once again filled with the safe songs of territorial birds.",
    beforeEmoji: "🪓🚜⚙️💥",
    afterEmoji: "🪵🐯🛡️🏡🐦",
    beforeBg: "/src/assets/images/industrial_pollution_1782201478450.jpg",
    afterBg: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
    stats: [
      { label: "Intruders Neutralized", value: "All Loggers Repelled", icon: "👮" },
      { label: "Old-Growth Protected", value: "350-Year Redwoods", icon: "🌳" },
      { label: "Acoustic Silence", value: "Pure Forest Sound", icon: "🎵" }
    ],
    hazeColor: "from-stone-900/95 to-zinc-950/90",
    bloomColor: "from-lime-500 to-emerald-600"
  },
  7: {
    title: "Ecosystem Biome Alignment",
    subtitle: "Mission 7: Habitat Matcher",
    threatLabel: "Displaced & Stranded Species",
    restoredLabel: "Harmonious Ecological Grid",
    description: "Creatures displaced by ecological chaos have been safely matches to their evolutionary niches. Salmon are back in pristine streams, bears roam deep woods, and eagles soar mountain crags.",
    beforeEmoji: "🐫🏜️⛰️💧❌",
    afterEmoji: "🗺️🦅🐻🐪🐋🌟",
    beforeBg: "/src/assets/images/industrial_pollution_1782201478450.jpg",
    afterBg: "/src/assets/images/ecology_map_1782201714180.jpg",
    stats: [
      { label: "Ecosystem Re-balance", value: "Perfect Resonance", icon: "⚖️" },
      { label: "Species Repatriated", value: "10 Key Taxa", icon: "🧬" },
      { label: "Survival Probability", value: "+300% Boost", icon: "📈" }
    ],
    hazeColor: "from-blue-950/90 to-sky-950/80",
    bloomColor: "from-blue-500 to-indigo-600"
  },
  8: {
    title: "River Basin Purification",
    subtitle: "Mission 8: River Cleanup",
    threatLabel: "Toxic Sludge & Plastic Flow",
    restoredLabel: "Crystalline Shimmering Streams",
    description: "The toxic chemicals, oil slicks, and heavy plastic garbage choking the central riverbed have been filtered away. Oxygen levels are restored, and fish are leaping in the sparkling waters.",
    beforeEmoji: "☠️🛢️🥤🐟💔",
    afterEmoji: "💧🐼🐟🏞️🌊✨",
    beforeBg: "/src/assets/images/industrial_pollution_1782201478450.jpg",
    afterBg: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?auto=format&fit=crop&w=1200&q=80",
    stats: [
      { label: "Water Purity", value: "99.8% Pure", icon: "🧪" },
      { label: "Floating Debris Sifted", value: "240 Pieces", icon: "🗑️" },
      { label: "Dissolved Oxygen", value: "12 mg/L (Ideal)", icon: "🫧" }
    ],
    hazeColor: "from-cyan-950/95 to-slate-900/85",
    bloomColor: "from-cyan-500 to-blue-500"
  },
  9: {
    title: "National Reserve Legal Declaration",
    subtitle: "Mission 9: Wildlife Photographer",
    threatLabel: "Industrial Speculation Threat",
    restoredLabel: "Legally Protected Biosphere",
    description: "With photographic evidence of returning endangered tigers, owls, and massive elephants, courts have declared Evergreen a National Wildlife Reserve. Commercial exploitation is banned forever!",
    beforeEmoji: "💼🏗️🏭🛑",
    afterEmoji: "📷🐘🐘🗺️🛡️🌟",
    beforeBg: "/src/assets/images/industrial_pollution_1782201478450.jpg",
    afterBg: "/src/assets/images/guardian_awaken_1782201535249.jpg",
    stats: [
      { label: "Photo Evidence Logs", value: "12 Rare Sightings", icon: "📸" },
      { label: "Sanctuary Perimeter", value: "4,500 Hectares", icon: "🗺️" },
      { label: "Legal Status", value: "100% Protected", icon: "📜" }
    ],
    hazeColor: "from-rose-950/90 to-zinc-900/80",
    bloomColor: "from-fuchsia-500 to-pink-500"
  },
  10: {
    title: "Celestial Healing of Tree of Life",
    subtitle: "Mission 10: Save the Tree of Life",
    threatLabel: "Dark Sludge Monster Siege",
    restoredLabel: "Eternal Cosmic Resonance",
    description: "The Dark Pollution Spirit has been vaporized! The mother Tree of Life has burst into cosmic, eternal blossoms, showering Evergreen with sparkling particles that heal every single stone, leaf, and bird.",
    beforeEmoji: "👿☠️🌑🌪️🖤",
    afterEmoji: "🌟🌳🌺👑✨♾️",
    beforeBg: "/src/assets/images/industrial_pollution_1782201478450.jpg",
    afterBg: "/src/assets/images/tree_of_life_1782201568074.jpg",
    stats: [
      { label: "Spirit Banished", value: "100% Banishment", icon: "👿" },
      { label: "Island Harmony Resonance", value: "Perfect (100%)", icon: "♾️" },
      { label: "Ranger Rank Achieved", value: "👑 Master Guardian", icon: "🏆" }
    ],
    hazeColor: "from-neutral-950/95 to-slate-950/90",
    bloomColor: "from-amber-400 via-emerald-400 to-violet-500"
  }
};

export default function RestorationCutscene({ missionId, score, stars, onComplete }: RestorationCutsceneProps) {
  const [progressPct, setProgressPct] = useState(0);
  const [currentStage, setCurrentStage] = useState<"corrupted" | "transforming" | "healed">("corrupted");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const data = RESTORATION_DATA[missionId] || RESTORATION_DATA[1];

  // Run restoration simulation progress bar & logs
  useEffect(() => {
    // Play initial victory chime
    try {
      playSound("victory");
    } catch(e){}

    const timer = setTimeout(() => {
      setCurrentStage("transforming");
      try { playSound("unlock"); } catch(e){}
    }, 1500);

    const logList = [
      "📡 Calibrating Guardian restoration beam...",
      "⚡ Injecting bio-energetic ecological triggers...",
      "🧬 Neutralizing heavy metal soot & toxic elements...",
      "🌱 Re-seeding damaged cellular plant mycelium...",
      "💖 Opening regional migration safe passages...",
      "🌟 Balance restored. Regional Harmony achieved!"
    ];

    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < logList.length) {
        setTerminalLogs(prev => [...prev, logList[logIndex]]);
        try { playSound("collect"); } catch(e){}
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 700);

    const progressInterval = setInterval(() => {
      setProgressPct((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setCurrentStage("healed");
          try { playSound("victory"); } catch(e){}
          return 100;
        }
        return prev + 1.25;
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, [missionId]);

  return (
    <div className="fixed inset-0 bg-neutral-950 text-white font-sans flex flex-col justify-center items-center z-[99999] p-3 md:p-6 select-none overflow-y-auto">
      <div className="max-w-3xl w-full flex flex-col items-center bg-slate-900/90 border-2 border-emerald-500/50 rounded-3xl p-5 md:p-8 shadow-[0_0_80px_rgba(16,185,129,0.2)] backdrop-blur-md">
        
        {/* TOP STATUS ROW */}
        <div className="w-full flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase font-mono">
              Eco-Restoration Monitor
            </span>
          </div>
          <div className="text-[10px] bg-slate-800 text-slate-400 font-mono py-1 px-3 rounded-lg border border-slate-700">
            System Status: {progressPct < 100 ? "Active Restoration" : "Fully Calibrated"}
          </div>
        </div>

        {/* ECO-DRAMA VIDEO CANVAS CONTAINER */}
        <div className="relative w-full aspect-[16/9] max-h-[360px] bg-black rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl mb-6">
          
          {/* BACKGROUND FADE TRANSITIONS */}
          <div className="absolute inset-0 w-full h-full">
            {currentStage === "corrupted" && (
              <motion.div 
                initial={{ opacity: 1 }} 
                animate={{ opacity: 1 }} 
                className="absolute inset-0 bg-cover bg-center grayscale contrast-125 saturate-50 transition-all duration-1000"
                style={{ backgroundImage: `url(${data.beforeBg})` }}
                referrerPolicy="no-referrer"
              />
            )}

            {currentStage !== "corrupted" && (
              <motion.div 
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2 }}
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                style={{ backgroundImage: `url(${data.afterBg})` }}
                referrerPolicy="no-referrer"
              />
            )}
          </div>

          {/* DYNAMIC SMOG & ASH OVERLAYS (CORRUPTED) */}
          <AnimatePresence>
            {progressPct < 100 && (
              <motion.div 
                exit={{ opacity: 0, transition: { duration: 1.5 } }}
                className={`absolute inset-0 bg-gradient-to-t ${data.hazeColor} pointer-events-none z-10`}
              >
                {/* Floating Ash/Smoke Particles */}
                <div className="absolute inset-0 opacity-40 mix-blend-color-dodge">
                  <div className="absolute top-1/4 left-1/4 text-4xl animate-pulse">🌫️</div>
                  <div className="absolute top-1/2 left-2/3 text-2xl animate-pulse" style={{ animationDelay: "500ms" }}>🗑️</div>
                  <div className="absolute bottom-1/4 left-1/2 text-3xl animate-pulse" style={{ animationDelay: "1s" }}>⚠️</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DYNAMIC SHOWER OF SPARKLING LIGHTS (HEALED) */}
          {progressPct > 10 && (
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
              {/* Green/Gold healing sparks */}
              <div className="absolute bottom-4 left-1/4 text-2xl animate-bounce">🌱</div>
              <div className="absolute top-1/3 right-1/4 text-2xl animate-pulse" style={{ animationDelay: "600ms" }}>✨</div>
              <div className="absolute bottom-1/3 left-1/2 text-xl animate-bounce" style={{ animationDelay: "300ms" }}>🌸</div>
              <div className="absolute top-4 left-1/3 text-2xl animate-pulse" style={{ animationDelay: "1.2s" }}>🦋</div>
              <div className="absolute bottom-10 right-1/3 text-2xl animate-bounce" style={{ animationDelay: "900ms" }}>🌻</div>
            </div>
          )}

          {/* BEFORE-AFTER DYNAMIC SLIDER EMOJI BANNER */}
          <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-center pointer-events-none">
            <div className="bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-red-500/30 text-xs font-black uppercase text-red-400 flex items-center gap-1.5">
              <span>BEFORE:</span> <span className="text-base leading-none">{data.beforeEmoji}</span>
            </div>
            <div className="bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-emerald-500/30 text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
              <span>REBIRTH:</span> <span className="text-base leading-none animate-bounce">{data.afterEmoji}</span>
            </div>
          </div>

          {/* THE RESTORATION ENERGY BEAM OVERLAY */}
          {currentStage === "transforming" && (
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
              className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-lime-400/50 to-transparent skew-x-12 z-25 pointer-events-none"
            />
          )}

          {/* SUCCESS BANNER IN CANVAS */}
          {progressPct >= 100 && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md p-3.5 rounded-xl border-2 border-lime-400 flex items-center gap-3.5 z-30 shadow-2xl"
            >
              <div className="w-10 h-10 rounded-full bg-lime-400 text-emerald-950 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-lime-400 tracking-wider">ECOSYSTEM REBALANCED</h4>
                <p className="text-[10px] text-emerald-200 mt-0.5 font-medium">{data.restoredLabel} declared fully functional.</p>
              </div>
            </motion.div>
          )}

        </div>

        {/* PROGRESS BLOCK */}
        <div className="w-full mb-6">
          <div className="flex justify-between items-center text-xs text-emerald-400 font-bold mb-1.5 uppercase font-mono tracking-wider">
            <span>{data.subtitle}</span>
            <span>Restoring Balance: {Math.floor(progressPct)}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-4 p-1 border border-slate-800 overflow-hidden relative shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-lime-400 via-emerald-400 to-green-500 rounded-full flex items-center justify-end pr-2"
              style={{ width: `${progressPct}%` }}
              transition={{ ease: "easeOut" }}
            >
              {progressPct > 15 && (
                <span className="text-[7.5px] font-black text-emerald-950 uppercase font-mono tracking-widest animate-pulse">
                  Restoring...
                </span>
              )}
            </motion.div>
          </div>
        </div>

        {/* ECO DETAILS AND TEXT DESCRIPTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full text-left">
          
          {/* Restored Facts Summary */}
          <div className="bg-slate-950/70 p-4.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xl">🏆</span>
                <h3 className="text-sm font-black uppercase text-lime-300 tracking-tight leading-none">
                  {data.title}
                </h3>
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                {data.description}
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-bold font-mono">Restoration Score</span>
                <span className="text-lg font-black text-yellow-400">+{score} Nature XP</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: stars }).map((_, i) => (
                  <span key={i} className="text-base text-yellow-500 animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>⭐</span>
                ))}
              </div>
            </div>
          </div>

          {/* Simulated Science Terminal Logging */}
          <div className="bg-black/80 p-4.5 rounded-2xl border border-slate-800 font-mono text-[10.5px] text-emerald-300 flex flex-col justify-between min-h-[160px] shadow-inner">
            <div>
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest mb-2 border-b border-slate-900 pb-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Science Output Logs
              </span>
              <div className="space-y-1.5 overflow-y-auto max-h-[120px] pr-1 scrollbar-thin">
                {terminalLogs.map((log, i) => (
                  <div key={i} className="flex gap-1.5 items-start">
                    <span className="text-emerald-500 font-black shrink-0">&gt;</span>
                    <p className="leading-snug">{log}</p>
                  </div>
                ))}
                {progressPct < 100 && (
                  <div className="text-lime-400 font-black animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Analyzing cellular data matrices...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Micro Eco KPI stats */}
            {progressPct >= 100 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 border-t border-slate-900 pt-3.5 grid grid-cols-3 gap-2.5"
              >
                {data.stats.map((stat, i) => (
                  <div key={i} className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
                    <span className="text-xs block leading-none mb-1">{stat.icon}</span>
                    <span className="text-[8px] uppercase font-bold text-slate-400 leading-none truncate block">{stat.label}</span>
                    <span className="text-[10px] font-black text-emerald-400 mt-1 truncate block">{stat.value}</span>
                  </div>
                ))}
              </motion.div>
            )}

          </div>

        </div>

        {/* BOTTOM ACTION BUTTON */}
        <div className="w-full mt-6 border-t border-slate-800 pt-5 flex justify-end gap-3">
          <button
            onClick={() => {
              try { playSound("select"); } catch(e){}
              onComplete();
            }}
            disabled={progressPct < 15}
            className={`px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer transition-all flex items-center gap-2 shadow-lg ${
              progressPct >= 100 
                ? "bg-gradient-to-r from-lime-400 to-emerald-500 text-emerald-950 hover:brightness-115 active:scale-95 hover:shadow-lime-400/20"
                : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-60"
            }`}
          >
            <span>{progressPct >= 100 ? "CLAIM RESTORATION REWARDS 🌟" : "RESTORING... (SKIP)"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { playSound } from "../utils/audio";
import { speakNarrator, stopNarrator } from "../utils/narration";
import { Compass, Sparkles, Volume2, VolumeX, Eye, ArrowRight, ArrowLeft, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Asset imports
import beautyHarmony from "../assets/images/harmony_1782201450092.jpg";
import industrialPollution from "../assets/images/industrial_pollution_1782201478450.jpg";
import motherNatureSad from "../assets/images/mother_nature_sad_1782201510305.jpg";
import guardianAwaken from "../assets/images/guardian_awaken_1782201535249.jpg";
import treeOfLife from "../assets/images/tree_of_life_1782201568074.jpg";

interface IntroProps {
  onStartGame: () => void;
  isFromPlayAdventure?: boolean;
}

interface Slide {
  emoji: string;
  title: string;
  text: string;
  image: string;
  speaker: string;
  badge: string;
}

export default function IntroCutscene({ onStartGame, isFromPlayAdventure = false }: IntroProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isNarratorMuted, setIsNarratorMuted] = useState(false);
  const [isNarratorSpeaking, setIsNarratorSpeaking] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [autoplayProgress, setAutoplayProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const SLIDES: Slide[] = [
    {
      emoji: "🌲",
      speaker: "Narrator",
      badge: "CREATION",
      title: "Nature In Harmony",
      text: "Long ago, the magical island of Evergreen flourished in serene natural harmony... Deep pristine forests grew, riverways ran crystal-clear, and animals in thousands lived in complete green paradise.",
      image: beautyHarmony,
    },
    {
      emoji: "⚙️",
      speaker: "Narrator",
      badge: "DESTRUCTION",
      title: "Humans Forgot Responsibility",
      text: "But humans forgot their responsibility... Over-industrialization, heavy chainsaws, and toxic chemical chimneys spread across the land. Beautiful forests were cleared, as a choking fog of smog began to bleed the Earth.",
      image: industrialPollution,
    },
    {
      emoji: "🌸",
      speaker: "Mother Nature",
      badge: "THE FALLEN QUEEN",
      title: "The Balance Is Breaking",
      text: "\"The ancient balance is breaking... My leaves wither, my pure rivers run black with plastics, and my children of the wild are crying in agony. I cannot hold the darkness back alone for much longer...\"",
      image: motherNatureSad,
    },
    {
      emoji: "🔮",
      speaker: "Mother Nature",
      badge: "PROPHECY",
      title: "Nature's Last Hope",
      text: "\"Behold, a chosen human child! I bestow upon you the Emerald Sanctuary Staff. You are Nature's last hope. You must defend rare saplings, put out wild brushfires, net rogue sawmen, and bring back natural balance!\"",
      image: guardianAwaken,
    },
    {
      emoji: "🌟",
      speaker: "Narrator",
      badge: "EVERGREEN DESTINY",
      title: "Answer the Call of Nature",
      text: "The island of Evergreen has pleaded. Choose your destination, save the camouflaged creatures, restore the ten critical habitats, and awaken the core sanctuary spirit. Your legendary journey begins now!",
      image: treeOfLife,
    }
  ];

  const current = SLIDES[slideIndex];

  // Particle Leaf Simulation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let leaves: Array<{
      x: number;
      y: number;
      r: number;
      d: number;
      color: string;
      speed: number;
      swing: number;
      swingSpeed: number;
    }> = [];

    const colors = [
      "rgba(74, 222, 128, 0.45)",  // bright emerald
      "rgba(132, 204, 22, 0.4)",   // lime green
      "rgba(34, 197, 94, 0.4)",    // standard green
      "rgba(234, 179, 8, 0.35)",   // golden autumn leaf
      "rgba(20, 83, 45, 0.35)"     // dark forest green
    ];

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize leaves
    for (let i = 0; i < 24; i++) {
      leaves.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4, // leaf radius
        d: Math.random() * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 1.5 + 0.8,
        swing: Math.random() * 20 + 10,
        swingSpeed: Math.random() * 0.02 + 0.01
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now();

      leaves.forEach((l) => {
        l.y += l.speed;
        // Swing movement mimicking wind sway
        const swingX = Math.sin(time * l.swingSpeed) * l.swing;
        const drawX = l.x + swingX;

        // Draw leaf diamond shape
        ctx.fillStyle = l.color;
        ctx.beginPath();
        ctx.moveTo(drawX, l.y - l.r); // top
        ctx.lineTo(drawX + l.r * 1.4, l.y); // right
        ctx.lineTo(drawX, l.y + l.r); // bottom
        ctx.lineTo(drawX - l.r * 1.4, l.y); // left
        ctx.closePath();
        ctx.fill();

        // Draw leaf rib line
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(drawX, l.y - l.r);
        ctx.lineTo(drawX, l.y + l.r);
        ctx.stroke();

        // Recycle leaf if passed bottom
        if (l.y > canvas.height + 20) {
          l.y = -20;
          l.x = Math.random() * canvas.width;
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [slideIndex]);

  // Typerwriter Text Speed Effect & TTS triggers
  useEffect(() => {
    if (isFromPlayAdventure) return;
    let charIdx = 0;
    setTypedText("");
    const targetString = current.text;

    // Speak narrator text automatically if not muted
    if (!isNarratorMuted) {
      setIsNarratorSpeaking(true);
      speakNarrator(
        targetString,
        () => setIsNarratorSpeaking(true),
        () => setIsNarratorSpeaking(false)
      );
    }

    const interval = setInterval(() => {
      if (charIdx < targetString.length) {
        setTypedText(targetString.substring(0, charIdx + 1));
        charIdx++;
      } else {
        clearInterval(interval);
      }
    }, 12); // Fast, organic cinematic typing

    return () => {
      clearInterval(interval);
      stopNarrator();
    };
  }, [slideIndex, isNarratorMuted, isFromPlayAdventure]);

  // Reset autoplay progress when user manual navigates
  useEffect(() => {
    if (isFromPlayAdventure) return;
    setAutoplayProgress(0);
  }, [slideIndex, isFromPlayAdventure]);

  // Video Autoplay slideshow timeline tick
  useEffect(() => {
    if (isFromPlayAdventure || !isAutoplay) return;

    const timer = setInterval(() => {
      setAutoplayProgress((prev) => {
        if (prev >= 100) {
          // Trigger next frame automatically on timeline completion
          if (slideIndex < SLIDES.length - 1) {
            setSlideIndex((i) => i + 1);
          } else {
            stopNarrator();
            onStartGame();
          }
          return 0;
        }
        return prev + 1.25; // 8 seconds per narrative scene (1.25% * 80 ticks of 100ms)
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isAutoplay, slideIndex, SLIDES.length, isFromPlayAdventure]);

  const handleNext = () => {
    playSound("select");
    if (slideIndex < SLIDES.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      stopNarrator();
      onStartGame();
    }
  };

  const handlePrev = () => {
    playSound("select");
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
    }
  };

  const skipAndStart = () => {
    playSound("select");
    stopNarrator();
    onStartGame();
  };

  if (isFromPlayAdventure) {
    return (
      <div className="relative min-h-[92vh] w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border border-emerald-900/40 bg-zinc-950 flex flex-col justify-between shadow-[0_24px_70px_-15px_rgba(0,0,0,0.9)] p-6 md:p-10 font-sans">
        <div className="flex justify-between items-center w-full pb-4 border-b border-emerald-500/10">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black tracking-widest text-emerald-400 font-mono uppercase bg-emerald-950/50 border border-emerald-800/30 px-3 py-1 rounded-full">
              CINEMATIC PROLOGUE
            </span>
          </div>
          <button
            onClick={onStartGame}
            className="text-xs text-slate-400 hover:text-emerald-450 transition-colors font-extrabold uppercase tracking-widest cursor-pointer"
          >
            SKIP VIDEO
          </button>
        </div>

        <div className="my-auto max-w-4xl mx-auto w-full flex flex-col items-center py-6">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-emerald-400/40 bg-black shadow-2xl flex items-center justify-center">
            {videoError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-emerald-300 p-6 text-center z-10 backdrop-blur-sm animate-fade-in">
                <span className="text-4xl mb-3">🌿</span>
                <h3 className="text-xl font-black mb-2 text-white">Island of Evergreen Awaits</h3>
                <p className="text-xs text-slate-300 max-w-md mb-6 leading-relaxed">
                  "Once a vibrant paradise, the island of Evergreen is counting on you to restore harmony. The introductory video is offline — your adventure begins now!"
                </p>
                <button
                  onClick={onStartGame}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
                >
                  Start Game Now ▶
                </button>
              </div>
            ) : null}
            <video
              autoPlay
              controls
              onEnded={onStartGame}
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover"
            >
              <source src="/assets/intro.mp4" type="video/mp4" />
              <source src="/src/assets/intro.mp4" type="video/mp4" />
              <source src="/intro.mp4" type="video/mp4" />
              <source src="/src/assets/video.mp4" type="video/mp4" />
              <source src="https://assets.mixkit.co/videos/preview/mixkit-beautiful-aerial-view-of-a-forest-41618-large.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-xs text-center text-emerald-300 font-semibold italic mt-4 max-w-lg leading-relaxed">
            "Once a vibrant paradise, the island of Evergreen is now counting on you. Watch closely to answer the Call of Nature!"
          </p>
        </div>

        <div className="flex justify-between items-center border-t border-emerald-500/10 pt-4 mt-2">
          <button
            onClick={onStartGame}
            className="text-xs text-slate-400 hover:text-emerald-450 transition-colors font-extrabold uppercase tracking-widest cursor-pointer"
          >
            SKIP VIDEO INTRO
          </button>
          
          <button
            onClick={onStartGame}
            className="relative overflow-hidden group px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-emerald-950 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.5)] active:scale-95 transition-all"
          >
            CONTINUE TO MAP <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[92vh] w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border border-emerald-900/40 bg-zinc-950 flex flex-col justify-between shadow-[0_24px_70px_-15px_rgba(0,0,0,0.9)]">
      {/* Cinematic Autoplay Video progress bar indicator */}
      {isAutoplay && (
        <div className="absolute top-0 inset-x-0 h-1 bg-zinc-950/40 z-50">
          <div 
            className="h-full bg-gradient-to-r from-lime-400 to-emerald-500 transition-all duration-100 ease-linear"
            style={{ width: `${autoplayProgress}%` }}
          />
        </div>
      )}

      {/* Immersive background backdrop image representing each scene */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slideIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.5, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ backgroundImage: `url(${current.image})` }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        />
      </AnimatePresence>

      {/* Shadow gradient overlays for cinematic mood */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none" />

      {/* Dynamic Leaf Particle Canvas on top of bg, below content */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10 opacity-70" />

      {/* Main Interface */}
      <div className="flex flex-col flex-1 justify-between p-6 md:p-10 z-20 relative">
        {/* Top Header Controls */}
        <div className="flex justify-between items-center w-full pb-4 border-b border-emerald-500/10">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black tracking-widest text-emerald-400 font-mono uppercase bg-emerald-950/50 border border-emerald-800/30 px-3 py-1 rounded-full">
              {current.badge}
            </span>
            <span className="text-[10px] font-bold text-yellow-500 bg-yellow-950/40 border border-yellow-800/30 px-2 py-0.5 rounded-full uppercase animate-pulse">
              {isAutoplay ? "🎥 AUTO-PLAY" : "⏸️ PAUSED"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* AutoPlay Toggle */}
            <button
              onClick={() => {
                playSound("select");
                setIsAutoplay(!isAutoplay);
              }}
              title={isAutoplay ? "Pause Cinematic Autoplay" : "Resume Cinematic Autoplay"}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/20 text-xs font-bold font-mono text-lime-400 hover:bg-emerald-950 hover:text-white transition-all cursor-pointer"
            >
              {isAutoplay ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>PAUSE STREAM</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-lime-400" />
                  <span>PLAY STREAM</span>
                </>
              )}
            </button>

            {/* TTS Narrator Sound Toggle */}
            <button
              onClick={() => {
                playSound("select");
                setIsNarratorMuted(!isNarratorMuted);
              }}
              title={isNarratorMuted ? "Enable Voice Assistant Narrator" : "Mute Voice Assistant Narrator"}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/20 text-xs font-bold font-mono text-emerald-400 hover:bg-emerald-950 hover:text-emerald-200 transition-all cursor-pointer"
            >
              {isNarratorMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>VOICE: MUTED</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 animate-bounce" style={{ animationDuration: "1.5s" }} />
                  <span className={isNarratorSpeaking ? "text-yellow-400" : ""}>
                    {isNarratorSpeaking ? "SPEAKING..." : "VOICE: ON"}
                  </span>
                </>
              )}
            </button>
            <span className="text-xs font-bold text-slate-400 font-mono">{slideIndex + 1} / {SLIDES.length}</span>
          </div>
        </div>

        {/* Narrative core panel */}
        <div className="my-auto max-w-3xl mx-auto flex flex-col md:flex-row gap-8 items-center py-6">
          {/* Circular Cinematic Lens */}
          <div className="relative flex-shrink-0 animate-pulse" style={{ animationDuration: "8s" }}>
            <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500 to-yellow-400 rounded-2xl blur-md opacity-35" />
            <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-2xl border-2 border-emerald-400/40 overflow-hidden bg-emerald-950/40 backdrop-blur-sm shadow-inner flex items-center justify-center">
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-full object-cover select-none filter brightness-95 contrast-105"
              />
              <span className="absolute bottom-2 right-2 text-3xl bg-zinc-950/80 w-10 h-10 rounded-xl flex items-center justify-center border border-emerald-500/30">
                {current.emoji}
              </span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left flex flex-col gap-3">
            <span className="text-xs font-extrabold tracking-widest text-lime-400 uppercase font-mono">
              [ {current.speaker} ]
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2 leading-none uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] font-sans">
              {current.title}
            </h2>
            <div className="min-h-[110px] md:min-h-[90px]">
              <p className="text-sm md:text-lg font-medium text-emerald-100/90 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] italic bg-zinc-900/30 px-4 py-3 rounded-xl border border-emerald-500/5 backdrop-blur-xs font-serif">
                {typedText || "..."}
                <span className="inline-block w-2.5 h-4 ml-1 bg-emerald-400 animate-pulse" />
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex justify-between items-center border-t border-emerald-500/10 pt-4 mt-2">
          {/* Back btn */}
          <button
            onClick={handlePrev}
            disabled={slideIndex === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-400 transition-all font-bold tracking-wider uppercase cursor-pointer hover:bg-slate-900 hover:text-white hover:border-slate-700 disabled:opacity-0 disabled:pointer-events-none`}
          >
            <ArrowLeft className="w-4 h-4" /> BACK
          </button>

          {/* Skip story */}
          <button
            onClick={skipAndStart}
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors font-extrabold uppercase tracking-widest cursor-pointer"
          >
            SKIP INTRODUCTION
          </button>

          {/* Next Chapter / Begin button */}
          <button
            onClick={handleNext}
            className="relative overflow-hidden group px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-emerald-950 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.5)] active:scale-95 transition-all"
          >
            {/* Glow sweep layer */}
            <span className="absolute inset-0 w-full h-full bg-white/20 transform -slide-x-full group-hover:animate-none transition-transform" />
            
            {slideIndex === SLIDES.length - 1 ? (
              <>
                BEGIN JOURNEY <Compass className="w-4 h-4" />
              </>
            ) : (
              <>
                NEXT SCENE <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

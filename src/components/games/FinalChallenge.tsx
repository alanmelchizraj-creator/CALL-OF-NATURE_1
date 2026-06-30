import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playSound } from "../../utils/audio";
import {
  Heart,
  Zap,
  Shield,
  Sparkles,
  Trophy,
  Award,
  RefreshCw,
  Gamepad2,
  ChevronRight,
  ChevronLeft,
  Skull
} from "lucide-react";

interface GameProps {
  onWin: (score: number, stars: number) => void;
  onLose: () => void;
}

// Particle structure for premium animations
interface LeafParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  angle: number;
  spin: number;
  color: string;
}

interface ExplosionParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

// Entity types
interface GameBullet {
  x: number;
  y: number;
  vy: number;
  vx: number;
  damage: number;
  color: string;
  size: number;
}

interface BossBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface Enemy {
  id: string;
  x: number;
  y: number;
  type: "drone" | "robot" | "bomber";
  hp: number;
  maxHP: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;
  emoji: string;
}

interface PowerUp {
  x: number;
  y: number;
  type: "heart" | "shield" | "rapid";
  emoji: string;
  size: number;
}

export default function FinalChallenge({ onWin, onLose }: GameProps) {
  // Game Setup States
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">("normal");
  const [showVictory, setShowVictory] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalStars, setFinalStars] = useState(3);

  // HUD and Live counters synced with high frequency
  const [hudHearts, setHudHearts] = useState(5);
  const [hudEnergy, setHudEnergy] = useState(0);
  const [hudShield, setHudShield] = useState(false);
  const [hudWeaponLevel, setHudWeaponLevel] = useState(1);
  const [hudWaveName, setHudWaveName] = useState("Selecting Stage...");
  const [hudBossHP, setHudBossHP] = useState<number | null>(null);
  const [hudBossMaxHP, setHudBossMaxHP] = useState(150);
  const [hudBossPhase, setHudBossPhase] = useState<number | null>(null);

  // Canvas context reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Key tracking
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // High frequency reactive value refs to decouple interval loops from react re-renders
  const stateRef = useRef({
    isPlaying: false,
    playerX: 240,
    playerY: 330,
    playerWidth: 40,
    playerHeight: 40,
    hearts: 5,
    shieldEnabled: false,
    rapidFireTimer: 0,
    natureEnergy: 0,
    score: 0,
    difficulty: "normal" as "easy" | "normal" | "hard",
    
    bullets: [] as GameBullet[],
    bossBullets: [] as BossBullet[],
    enemies: [] as Enemy[],
    powerUps: [] as PowerUp[],
    leafParticles: [] as LeafParticle[],
    explosionParticles: [] as ExplosionParticle[],

    // Game progress parameters
    currentWave: 1, // 1: Drones, 2: Robots, 3: Bombers, 4: Boss Cinematic, 5: Boss Fight
    waveItemCounter: 0, // Spawn limit counters per wave
    bossActive: false,
    bossMaxHP: 150,
    bossHP: 150,
    bossPhase: 1, // Phase 1: Engines active, Phase 2: Core protected, Phase 3: Vulnerable
    bossLeftEngineHP: 30,
    bossRightEngineHP: 30,
    bossLeftEngineAlive: true,
    bossRightEngineAlive: true,
    bossX: 240,
    bossY: -100, // Enters smoothly from top

    shootCooldown: 0,
    bombTimer: 0
  });

  // Keep stateRef synced with initial selections
  useEffect(() => {
    stateRef.current.difficulty = difficulty;
    if (difficulty === "easy") {
      stateRef.current.bossMaxHP = 100;
      stateRef.current.bossLeftEngineHP = 20;
      stateRef.current.bossRightEngineHP = 20;
    } else if (difficulty === "normal") {
      stateRef.current.bossMaxHP = 150;
      stateRef.current.bossLeftEngineHP = 30;
      stateRef.current.bossRightEngineHP = 30;
    } else {
      stateRef.current.bossMaxHP = 250;
      stateRef.current.bossLeftEngineHP = 50;
      stateRef.current.bossRightEngineHP = 50;
    }
    stateRef.current.bossHP = stateRef.current.bossMaxHP;
  }, [difficulty]);

  // Handle Canvas mouse / touch controllers
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!stateRef.current.isPlaying || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    // clamp player within space bounds safely
    stateRef.current.playerX = Math.max(20, Math.min(canvasRef.current.width - 20, canvasX));
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!stateRef.current.isPlaying || !canvasRef.current || e.touches.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = (e.touches[0].clientX - rect.left) * (canvasRef.current.width / rect.width);
    stateRef.current.playerX = Math.max(20, Math.min(canvasRef.current.width - 20, canvasX));
  };

  // Keyboard registers listener hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      keysPressed.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
      keysPressed.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleStartGame = () => {
    const s = stateRef.current;
    s.isPlaying = true;
    s.hearts = 5;
    s.shieldEnabled = false;
    s.rapidFireTimer = 0;
    s.natureEnergy = 0;
    s.score = 0;
    s.bullets = [];
    s.bossBullets = [];
    s.enemies = [];
    s.powerUps = [];
    s.explosionParticles = [];
    s.currentWave = 1;
    s.waveItemCounter = 0;
    s.bossActive = false;
    s.bossY = -120;
    s.bossX = 240;
    s.bossPhase = 1;
    s.bossLeftEngineAlive = true;
    s.bossRightEngineAlive = true;

    // Set engine health values contextually
    if (difficulty === "easy") {
      s.bossMaxHP = 100;
      s.bossLeftEngineHP = 20;
      s.bossRightEngineHP = 20;
    } else if (difficulty === "normal") {
      s.bossMaxHP = 150;
      s.bossLeftEngineHP = 30;
      s.bossRightEngineHP = 30;
    } else {
      s.bossMaxHP = 250;
      s.bossLeftEngineHP = 50;
      s.bossRightEngineHP = 50;
    }
    s.bossHP = s.bossMaxHP;

    // Populate ambient particles
    s.leafParticles = [];
    for (let i = 0; i < 20; i++) {
      s.leafParticles.push({
        x: Math.random() * 480,
        y: Math.random() * 360,
        size: 3 + Math.random() * 6,
        speedY: 1 + Math.random() * 2,
        angle: Math.random() * Math.PI,
        spin: Math.random() * 0.05 - 0.025,
        color: Math.random() < 0.6 ? "#4ade80" : "#22c55e"
      });
    }

    setIsPlaying(true);
    setShowVictory(false);
    playSound("select");
  };

  // Auto-start on mount (bypassing manual launch overlay start button)
  useEffect(() => {
    handleStartGame();
  }, []);

  // Main Canvas game engine loop
  useEffect(() => {
    if (!isPlaying) return;

    let animFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = stateRef.current;

    const gameLoop = () => {
      if (!s.isPlaying) return;

      // 1. CLEAR CANVAS & DRAW BACKGROUND GRIDS
      ctx.fillStyle = "#020617"; // Rich deep slate space
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber grid lines for a lovely tactile scroll feeling
      ctx.strokeStyle = "rgba(16, 185, 129, 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = (Date.now() / 15) % 30; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 2. PROCESS KEYBOARD CONTROLS FOR SHIP LOCOMOTION
      const moveSpeed = 6;
      if (keysPressed.current["ArrowLeft"] || keysPressed.current["KeyA"]) {
        s.playerX = Math.max(20, s.playerX - moveSpeed);
      }
      if (keysPressed.current["ArrowRight"] || keysPressed.current["KeyD"]) {
        s.playerX = Math.min(canvas.width - 20, s.playerX + moveSpeed);
      }

      // Update rapid fire modifier timer
      if (s.rapidFireTimer > 0) {
        s.rapidFireTimer--;
      }

      // 3. AUTOMATIC SHOOTING SYSTEM
      s.shootCooldown--;
      if (s.shootCooldown <= 0) {
        // Set weapon speed cooldown (rapid fire fires twice as fast!)
        s.shootCooldown = s.rapidFireTimer > 0 ? 10 : 18;

        // Determine current weapon level
        let wLevel = 1;
        if (s.natureEnergy >= 150) {
          wLevel = 3;
        } else if (s.natureEnergy >= 50) {
          wLevel = 2;
        }

        // Fire projectiles
        if (wLevel === 1) {
          // Single seed bullet 🌱
          playSound("zap");
          s.bullets.push({
            x: s.playerX,
            y: s.playerY - 15,
            vx: 0,
            vy: -8,
            damage: 1,
            color: "#4ade80", // lime fluorescent
            size: 4
          });
        } else if (wLevel === 2) {
          // Double water blasts 💧
          playSound("water");
          s.bullets.push({
            x: s.playerX - 10,
            y: s.playerY - 15,
            vx: -0.5,
            vy: -9,
            damage: 1.2,
            color: "#38bdf8", // gorgeous sky blue
            size: 5
          });
          s.bullets.push({
            x: s.playerX + 10,
            y: s.playerY - 15,
            vx: 0.5,
            vy: -9,
            damage: 1.2,
            color: "#38bdf8",
            size: 5
          });
        } else {
          // Fire Blossom triple scatter cannon 🔥🌸
          playSound("zap");
          playSound("water");
          s.bullets.push({
            x: s.playerX - 15,
            y: s.playerY - 12,
            vx: -1.5,
            vy: -10,
            damage: 1.5,
            color: "#f43f5e", // hot pink blossom glow
            size: 6
          });
          s.bullets.push({
            x: s.playerX,
            y: s.playerY - 20,
            vx: 0,
            vy: -11,
            damage: 2.0,
            color: "#f59e0b", // fiery orange-yellow blossom rocket core
            size: 7
          });
          s.bullets.push({
            x: s.playerX + 15,
            y: s.playerY - 12,
            vx: 1.5,
            vy: -10,
            damage: 1.5,
            color: "#f43f5e",
            size: 6
          });
        }
      }

      // 4. DRAW & SCROLL AMBIENT FLOATING LEAVES (PARALLAX)
      s.leafParticles.forEach((lp) => {
        lp.y += lp.speedY;
        lp.angle += lp.spin;
        if (lp.y > canvas.height) {
          lp.y = -10;
          lp.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(lp.x, lp.y);
        ctx.rotate(lp.angle);
        ctx.fillStyle = lp.color;
        // Draw standard petal oval
        ctx.beginPath();
        ctx.ellipse(0, 0, lp.size, lp.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 5. UPDATE AND DRAW BULLETS
      s.bullets = s.bullets.filter((b) => {
        b.x += b.vx;
        b.y += b.vy;

        // Draw bullet core glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow immediately

        return b.y > -20 && b.x > -20 && b.x < canvas.width + 20;
      });

      // 6. PROCESS ENEMY SPAWNS & WAVE MECHANICS
      let waveName = "Clearing Sector...";
      if (s.currentWave === 3 && s.enemies.length === 0 && s.waveItemCounter >= 8) {
        // Safe transition to Boss stage
        s.currentWave = 4;
        s.bossActive = true;
        s.waveItemCounter = 0;
      } else if (s.currentWave === 2 && s.enemies.length === 0 && s.waveItemCounter >= 10) {
        s.currentWave = 3;
        s.waveItemCounter = 0;
      } else if (s.currentWave === 1 && s.enemies.length === 0 && s.waveItemCounter >= 10) {
        s.currentWave = 2;
        s.waveItemCounter = 0;
      }

      if (s.currentWave === 1) {
        waveName = "Wave 1: Pollution Drones 🛸";
        if (s.waveItemCounter < 10 && s.enemies.length < 4 && Math.random() < 0.02) {
          s.enemies.push({
            id: Math.random().toString(),
            x: 40 + Math.random() * (canvas.width - 80),
            y: -30,
            type: "drone",
            hp: 1,
            maxHP: 1,
            width: 32,
            height: 32,
            speedX: Math.random() * 2 - 1,
            speedY: 1.2,
            emoji: "🛸"
          });
          s.waveItemCounter++;
        }
      } else if (s.currentWave === 2) {
        waveName = "Wave 2: Logging Robots 🤖";
        if (s.waveItemCounter < 10 && s.enemies.length < 3 && Math.random() < 0.02) {
          s.enemies.push({
            id: Math.random().toString(),
            x: 40 + Math.random() * (canvas.width - 80),
            y: -30,
            type: "robot",
            hp: 2,
            maxHP: 2,
            width: 34,
            height: 34,
            speedX: Math.random() * 1 - 0.5,
            speedY: 1.5,
            emoji: "🤖"
          });
          s.waveItemCounter++;
        }
      } else if (s.currentWave === 3) {
        waveName = "Wave 3: Waste Bombers 🏗️";
        if (s.waveItemCounter < 8 && s.enemies.length < 2 && Math.random() < 0.015) {
          s.enemies.push({
            id: Math.random().toString(),
            x: 60 + Math.random() * (canvas.width - 120),
            y: -40,
            type: "bomber",
            hp: 3,
            maxHP: 3,
            width: 38,
            height: 38,
            speedX: Math.random() * 3 - 1.5,
            speedY: 0.8,
            emoji: "🏗️"
          });
          s.waveItemCounter++;
        }
      } else if (s.currentWave === 4) {
        waveName = "⚠️ WARNING: BOSS APPROACHING!";
        // Drag boss to standard top position
        if (s.bossY < 60) {
          s.bossY += 1.5;
        } else {
          s.currentWave = 5;
        }
      } else if (s.currentWave === 5) {
        waveName = "FINAL FIGHT: ECO DESTROYER CORE AI 🏢";
      }

      // 7. UPDATE & DRAW ENEMY ENTITIES
      s.enemies = s.enemies.filter((enemy) => {
        enemy.x += enemy.speedX;
        enemy.y += enemy.speedY;

        // Bounce horizontally off borders
        if (enemy.x < 15 || enemy.x > canvas.width - 15) {
          enemy.speedX *= -1;
        }

        // Bomber drops toxic barrels periodically
        if (enemy.type === "bomber" && Math.random() < 0.015) {
          s.bossBullets.push({
            x: enemy.x,
            y: enemy.y + 15,
            vx: 0,
            vy: 3,
            size: 6
          });
        }

        // Draw enemy emoji
        ctx.save();
        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(enemy.emoji, enemy.x, enemy.y);

        // Draw small floating HP bar for 2+ HP enemies
        if (enemy.maxHP > 1 && enemy.hp < enemy.maxHP) {
          const barW = 20;
          const barH = 3;
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(enemy.x - barW / 2, enemy.y - 20, barW, barH);
          ctx.fillStyle = "#22c55e";
          ctx.fillRect(enemy.x - barW / 2, enemy.y - 20, barW * (enemy.hp / enemy.maxHP), barH);
        }
        ctx.restore();

        // Check crash overlay with Player
        const pDist = Math.hypot(enemy.x - s.playerX, enemy.y - s.playerY);
        if (pDist < 25) {
          // Trigger collision hit!
          if (s.shieldEnabled) {
            s.shieldEnabled = false;
            playSound("failure");
          } else {
            s.hearts = Math.max(0, s.hearts - 1);
            playSound("failure");
          }
          // Particle burst
          for (let i = 0; i < 15; i++) {
            s.explosionParticles.push({
              x: enemy.x,
              y: enemy.y,
              vx: Math.random() * 6 - 3,
              vy: Math.random() * 6 - 3,
              size: 2 + Math.random() * 4,
              life: 0,
              maxLife: 20,
              color: "#f87171"
            });
          }
          return false; // remove enemy
        }

        // Bullet collisions check with enemies
        s.bullets.forEach((bullet) => {
          const bDist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
          if (bDist < 20) {
            // Damage enemy
            enemy.hp -= bullet.damage;
            bullet.y = -100; // flag to clean up bullet

            // Spawn bright hit sparks!
            for (let i = 0; i < 4; i++) {
              s.explosionParticles.push({
                x: bullet.x,
                y: bullet.y,
                vx: Math.random() * 4 - 2,
                vy: Math.random() * 4 - 2,
                size: 2,
                life: 0,
                maxLife: 10,
                color: bullet.color
              });
            }

            if (enemy.hp <= 0) {
              s.score += enemy.type === "drone" ? 100 : enemy.type === "robot" ? 200 : 350;
              s.natureEnergy += enemy.type === "drone" ? 10 : enemy.type === "robot" ? 15 : 25;
              playSound("collect");

              // Spawn dynamic powerup drop randomly (15% chance)
              if (Math.random() < 0.25) {
                const choices: ("heart" | "shield" | "rapid")[] = ["heart", "shield", "rapid"];
                const pType = choices[Math.floor(Math.random() * choices.length)];
                let pEmoji = "❤️";
                if (pType === "shield") pEmoji = "🍃";
                else if (pType === "rapid") pEmoji = "⚡";

                s.powerUps.push({
                  x: enemy.x,
                  y: enemy.y,
                  type: pType,
                  emoji: pEmoji,
                  size: 15
                });
              }

              // Visual magnificent natural leaf explosion burst
              for (let i = 0; i < 18; i++) {
                s.explosionParticles.push({
                  x: enemy.x,
                  y: enemy.y,
                  vx: Math.random() * 8 - 4,
                  vy: Math.random() * 8 - 4,
                  size: 3 + Math.random() * 4,
                  life: 0,
                  maxLife: 30,
                  color: "#4ade80"
                });
              }
            }
          }
        });

        // Clean if slips below viewport
        if (enemy.y > canvas.height + 30) {
          s.hearts = Math.max(0, s.hearts - 1);
          playSound("failure");
          return false;
        }

        return enemy.hp > 0;
      });

      // 8. UPDATE AND DRAW POWER-UPS
      s.powerUps = s.powerUps.filter((pu) => {
        pu.y += 2.2; // Float downwards slowly

        ctx.save();
        ctx.font = "18px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pu.emoji, pu.x, pu.y);
        ctx.restore();

        // Check collection collision with player
        const collDist = Math.hypot(pu.x - s.playerX, pu.y - s.playerY);
        if (collDist < 25) {
          playSound("collect");
          if (pu.type === "heart") {
            s.hearts = Math.min(5, s.hearts + 1);
          } else if (pu.type === "shield") {
            s.shieldEnabled = true;
          } else if (pu.type === "rapid") {
            s.rapidFireTimer = 600; // 10 seconds of pure fire joy!
          }
          s.score += 150;
          return false; // remove
        }

        return pu.y < canvas.height + 20;
      });

      // 9. UPDATE AND DRAW ENEMY BARRELS/BULLETS
      s.bossBullets = s.bossBullets.filter((bb) => {
        bb.x += bb.vx;
        bb.y += bb.vy;

        // Draw hazardous barrel or laser sphere
        ctx.fillStyle = "#ef4444";
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#f87171";
        ctx.beginPath();
        ctx.arc(bb.x, bb.y, bb.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw custom skull inside boss barrels for hazard visibility
        if (bb.size >= 6) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "8px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("☣️", bb.x, bb.y);
        }

        // Damage calculation
        const dist = Math.hypot(bb.x - s.playerX, bb.y - s.playerY);
        if (dist < 20) {
          if (s.shieldEnabled) {
            s.shieldEnabled = false;
            playSound("failure");
          } else {
            s.hearts = Math.max(0, s.hearts - 1);
            playSound("failure");
          }
          return false; // clean bullet
        }

        return bb.y < canvas.height + 20 && bb.x > -20 && bb.x < canvas.width + 20;
      });

      // 10. ADVANCED FINAL BOSS CONTROLLER (WAVE 5)
      // Check boss HP parameters on rendering
      if (s.bossActive) {
        // Enforce horizontal floating movement for the boss AI when active
        if (s.currentWave === 5) {
          s.bossX += Math.sin(Date.now() / 600) * 1.5;

          // Perform periodic boss firing based on Phase
          s.bombTimer--;
          if (s.bombTimer <= 0) {
            let fireDelay = 60;
            if (s.bossPhase === 2) fireDelay = 40;
            if (s.bossPhase === 3) fireDelay = 25;
            s.bombTimer = fireDelay;

            if (s.bossPhase === 1) {
              // Left / Right engine cannons firing
              if (s.bossLeftEngineAlive) {
                s.bossBullets.push({ x: s.bossX - 45, y: s.bossY + 20, vx: -0.5, vy: 3, size: 5 });
              }
              if (s.bossRightEngineAlive) {
                s.bossBullets.push({ x: s.bossX + 45, y: s.bossY + 20, vx: 0.5, vy: 3, size: 5 });
              }
            } else if (s.bossPhase === 2) {
              // Core targeting fast bullets
              s.bossBullets.push({ x: s.bossX, y: s.bossY + 30, vx: -1, vy: 4, size: 6 });
              s.bossBullets.push({ x: s.bossX, y: s.bossY + 30, vx: 0, vy: 4.5, size: 6 });
              s.bossBullets.push({ x: s.bossX, y: s.bossY + 30, vx: 1, vy: 4, size: 6 });
            } else {
              // Phase 3 erratic desperation fire!
              const angleOffset = Math.sin(Date.now() / 200) * 1.5;
              s.bossBullets.push({ x: s.bossX, y: s.bossY + 30, vx: Math.sin(angleOffset) * 4, vy: Math.cos(angleOffset) * 4, size: 5 });
              if (Math.random() < 0.4) {
                s.bossBullets.push({ x: s.bossX, y: s.bossY + 30, vx: Math.random() * 4 - 2, vy: 2 + Math.random() * 3, size: 7 }); // heavy scrap
              }
            }
          }
        }

        // Draw Boss components visually on canvas
        // Save Context
        ctx.save();

        // 1. Draw connecting arms of engines
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(s.bossX - 55, s.bossY);
        ctx.lineTo(s.bossX + 55, s.bossY);
        ctx.stroke();

        // 2. Engines themselves
        // Left Engine Model
        if (s.bossLeftEngineAlive) {
          ctx.fillStyle = "#334155";
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 3;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(s.bossX - 65, s.bossY - 10, 20, 40, 5);
          } else {
            ctx.rect(s.bossX - 65, s.bossY - 10, 20, 40);
          }
          ctx.fill();
          ctx.stroke();

          // draw engine glowing thrust core
          ctx.fillStyle = "#f97316";
          ctx.fillRect(s.bossX - 61, s.bossY + 30, 12, Math.sin(Date.now() / 50) * 8 + 12);
        } else {
          // Dead engine wreckage
          ctx.fillStyle = "#1e293b";
          ctx.font = "14px Arial";
          ctx.fillText("💥", s.bossX - 55, s.bossY + 10);
        }

        // Right Engine Model
        if (s.bossRightEngineAlive) {
          ctx.fillStyle = "#334155";
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 3;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(s.bossX + 45, s.bossY - 10, 20, 40, 5);
          } else {
            ctx.rect(s.bossX + 45, s.bossY - 10, 20, 40);
          }
          ctx.fill();
          ctx.stroke();

          // glowing thrust core
          ctx.fillStyle = "#f97316";
          ctx.fillRect(s.bossX + 49, s.bossY + 30, 12, Math.sin(Date.now() / 50 + 2) * 8 + 12);
        } else {
          ctx.fillStyle = "#1e293b";
          ctx.font = "14px Arial";
          ctx.fillText("💥", s.bossX + 55, s.bossY + 10);
        }

        // 3. Main Center factory Core Module
        ctx.fillStyle = s.bossPhase === 3 ? "#7f1d1d" : "#0f172a"; // red vulnerability in phase 3
        ctx.strokeStyle = s.bossPhase === 2 ? "#eab308" : "#475569";
        ctx.lineWidth = 4;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(s.bossX - 30, s.bossY - 20, 60, 55, 10);
        } else {
          ctx.rect(s.bossX - 30, s.bossY - 20, 60, 55);
        }
        ctx.fill();
        ctx.stroke();

        // Glowing reactor ring
        ctx.strokeStyle = s.bossPhase === 1 ? "#3b82f6" : "#f43f5e";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(s.bossX, s.bossY + 10, 12, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Boss Face emoji
        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🏭", s.bossX, s.bossY - 4);

        // draw Phase 1 invulnerable glowing force field ring (blue hex shield dome)
        if (s.bossPhase === 1) {
          ctx.strokeStyle = "rgba(59, 130, 246, 0.45)";
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(s.bossX, s.bossY + 8, 38, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();

        // Check bullet overlap hits on boss parts
        s.bullets.forEach((bullet) => {
          // Left engine collision
          if (s.bossLeftEngineAlive && bullet.x > s.bossX - 70 && bullet.x < s.bossX - 40 && Math.abs(bullet.y - s.bossY) < 30) {
            s.bossLeftEngineHP -= bullet.damage;
            bullet.y = -100; // recycle bullet
            playSound("bosshit");

            if (s.bossLeftEngineHP <= 0) {
              s.bossLeftEngineAlive = false;
              s.score += 1000;
              playSound("victory");
              // explosive splash
              for (let i = 0; i < 20; i++) {
                s.explosionParticles.push({
                  x: s.bossX - 55,
                  y: s.bossY + 10,
                  vx: Math.random() * 8 - 4,
                  vy: Math.random() * 8 - 4,
                  size: 4,
                  life: 0,
                  maxLife: 25,
                  color: "#ef4444"
                });
              }
              // Check if both engines are dead
              if (!s.bossRightEngineAlive) {
                s.bossPhase = 2;
                playSound("unlock");
              }
            }
          }

          // Right engine collision
          if (s.bossRightEngineAlive && bullet.x > s.bossX + 40 && bullet.x < s.bossX + 70 && Math.abs(bullet.y - s.bossY) < 30) {
            s.bossRightEngineHP -= bullet.damage;
            bullet.y = -100;
            playSound("bosshit");

            if (s.bossRightEngineHP <= 0) {
              s.bossRightEngineAlive = false;
              s.score += 1000;
              playSound("victory");
              for (let i = 0; i < 20; i++) {
                s.explosionParticles.push({
                  x: s.bossX + 55,
                  y: s.bossY + 10,
                  vx: Math.random() * 8 - 4,
                  vy: Math.random() * 8 - 4,
                  size: 4,
                  life: 0,
                  maxLife: 25,
                  color: "#ef4444"
                });
              }
              if (!s.bossLeftEngineAlive) {
                s.bossPhase = 2;
                playSound("unlock");
              }
            }
          }

          // Main Core module hit (Central body)
          if (bullet.x > s.bossX - 35 && bullet.x < s.bossX + 35 && Math.abs(bullet.y - s.bossY) < 35) {
            bullet.y = -100;

            if (s.bossPhase === 1) {
              // Shields absorb completely! Draw visual spark ripple!
              playSound("failure");
              for (let i = 0; i < 8; i++) {
                s.explosionParticles.push({
                  x: bullet.x,
                  y: bullet.y + 10,
                  vx: Math.random() * 4 - 2,
                  vy: -Math.random() * 4,
                  size: 2,
                  life: 0,
                  maxLife: 15,
                  color: "#3b82f6" // shield energy color
                });
              }
            } else {
              // Direct core damage!
              s.bossHP -= bullet.damage;
              playSound("bosshit");

              // Spawn metallic flying sparks
              for (let i = 0; i < 5; i++) {
                s.explosionParticles.push({
                  x: bullet.x,
                  y: bullet.y,
                  vx: Math.random() * 6 - 3,
                  vy: Math.random() * 6 - 3,
                  size: 2,
                  life: 0,
                  maxLife: 15,
                  color: "#f59e0b"
                });
              }

              // Phase transitions
              if (s.bossPhase === 2 && s.bossHP <= s.bossMaxHP * 0.4) {
                s.bossPhase = 3;
                playSound("unlock");
              }

              if (s.bossHP <= 0) {
                s.bossHP = 0;
                s.isPlaying = false;
                s.score += 5000;
                handleFinalWinSequence();
              }
            }
          }
        });
      }

      // 11. DRAW PLAYER GUARDIAN glides
      ctx.save();

      // Draw active shield leaf orbit ring if shielded
      if (s.shieldEnabled) {
        ctx.strokeStyle = "rgba(74, 222, 128, 0.6)";
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#4ade80";
        ctx.beginPath();
        ctx.arc(s.playerX, s.playerY, 28, (Date.now() / 150) % (Math.PI * 2), ((Date.now() / 150) % (Math.PI * 2)) + Math.PI * 1.5);
        ctx.stroke();

        ctx.strokeStyle = "rgba(34, 197, 94, 0.4)";
        ctx.beginPath();
        ctx.arc(s.playerX, s.playerY, 28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw player visual model (An eco flight vessel shape - customized geometry drawing!)
      ctx.shadowBlur = 12;
      ctx.shadowColor = s.rapidFireTimer > 0 ? "#facc15" : "#10b981"; // yellow fire glow if rapid, otherwise emerald
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.moveTo(s.playerX, s.playerY - 18);
      ctx.lineTo(s.playerX - 16, s.playerY + 12);
      ctx.lineTo(s.playerX - 8, s.playerY + 6);
      ctx.lineTo(s.playerX + 8, s.playerY + 6);
      ctx.lineTo(s.playerX + 16, s.playerY + 12);
      ctx.closePath();
      ctx.fill();

      // Glider wing tips highlights
      ctx.fillStyle = s.rapidFireTimer > 0 ? "#eab308" : "#34d399";
      ctx.fillRect(s.playerX - 18, s.playerY + 6, 4, 6);
      ctx.fillRect(s.playerX + 14, s.playerY + 6, 4, 6);

      // Player core battery cell
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(s.playerX, s.playerY - 2, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.restore();

      // 12. RUN SPARKLING AND DETONATIVE PARTICLES
      s.explosionParticles = s.explosionParticles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return p.life < p.maxLife;
      });

      // 13. RETRO GRADE HUD STATE RIPPLES BACK TO REACTIVE UI
      // Keep state metrics synchronized with local React component counters at 4fps rate to prevent react overloading
      if (Date.now() % 4 === 0) {
        setHudHearts(s.hearts);
        setHudEnergy(s.natureEnergy);
        setHudShield(s.shieldEnabled);
        setHudWeaponLevel(s.natureEnergy >= 150 ? 3 : s.natureEnergy >= 50 ? 2 : 1);
        setHudWaveName(waveName);
        if (s.bossActive) {
          setHudBossHP(s.bossHP);
          setHudBossPhase(s.bossPhase);
          setHudBossMaxHP(s.bossMaxHP);
        } else {
          setHudBossHP(null);
          setHudBossPhase(null);
        }
      }

      // Check failure trigger
      if (s.hearts <= 0) {
        s.isPlaying = false;
        setIsPlaying(false);
        playSound("failure");
        onLose();
        return;
      }

      animFrameId = requestAnimationFrame(gameLoop);
    };

    animFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrameId);
  }, [isPlaying]);

  // Handle final epic win sequence
  const handleFinalWinSequence = () => {
    const s = stateRef.current;
    playSound("victory");
    
    // Calculate final scored stats
    const points = s.score + 5000; // Wave bonus
    let starsGained = 3;
    if (s.hearts <= 2) starsGained = 1;
    else if (s.hearts <= 4) starsGained = 2;

    setFinalScore(points);
    setFinalStars(starsGained);
    setShowVictory(true);
  };

  const submitVictoryAndRank = () => {
    onWin(finalScore, finalStars);
  };

  return (
    <div 
      className="flex flex-col items-center bg-slate-900 border border-emerald-800 rounded-3xl p-6 text-white overflow-hidden max-w-xl mx-auto shadow-2xl relative"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('/src/assets/images/tree_of_life_1782201568074.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      
      {/* Visual Header Grid HUD bar */}
      <div className="w-full flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800 mb-4 font-mono">
        <div className="flex items-center gap-1.5">
          <Gamepad2 className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-extrabold text-blue-400 tracking-wider">M10: TREE OF LIFE Restorer</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-sm transition-transform duration-300 ${
                i < hudHearts ? "text-red-500 scale-100" : "text-gray-700 scale-75"
              }`}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* Main Sandbox Box Screen Viewport */}
      <div className="relative bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 w-full flex items-center justify-center shadow-inner">
        
        {/* Canvas viewport for high frame rendering */}
        <canvas
          ref={canvasRef}
          width={480}
          height={360}
          onMouseMove={handleCanvasMouseMove}
          onTouchMove={handleCanvasTouchMove}
          className="w-full h-auto block select-none bg-slate-950"
          style={{ maxWidth: "480px" }}
        />

        {/* Start Game overlay view */}
        {!isPlaying && !showVictory && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-10 font-sans">
            <span className="text-5xl mb-3 animate-pulse">🌳🌸</span>
            <h4 className="text-xl font-extrabold text-lime-400 tracking-tight">Mission 10: Save the Tree of Life</h4>
            <p className="text-xs text-gray-300 max-w-sm mt-2 leading-relaxed">
              Fly at the bottom, move left/right, and shoot automatically. Safely protect the sacred Tree of Life from the rogue Eco Destroyer machine army!
            </p>

            {/* Choose Game Mode difficulty */}
            <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 my-4">
              <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase block mb-2">Select Boss Difficulty:</span>
              <div className="grid grid-cols-3 gap-2">
                {(["easy", "normal", "hard"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setDifficulty(mode); playSound("select"); }}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg border uppercase tracking-wider transition-all ${
                      difficulty === mode
                        ? "bg-emerald-500 text-slate-950 border-emerald-300 scale-105"
                        : "bg-slate-950 border-slate-800 text-gray-400"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-emerald-400 mt-2 font-mono">
                {difficulty === "easy" ? "👾 ECO DESTROYER CORE: 100 HP" : difficulty === "normal" ? "👾 ECO DESTROYER CORE: 150 HP" : "🚨 EMERGENCY CRUSADE: 250 HP"}
              </div>
            </div>

            {/* Controls Info guide */}
            <div className="p-3 bg-emerald-950/30 border border-emerald-900/30 rounded-xl max-w-sm text-left mb-4">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Game Manual:</span>
              <p className="text-[11px] text-gray-300 mt-0.5 leading-normal">
                • <strong>Desktop</strong>: Use <kbd className="bg-slate-800 px-1 rounded">←</kbd> <kbd className="bg-slate-800 px-1 rounded">→</kbd> or <kbd className="bg-slate-800 px-1 rounded">A</kbd> <kbd className="bg-slate-800 px-1 rounded">D</kbd> keys.
                <br />
                • <strong>Mobile / Mouse</strong>: Simply slide cursor or drag touch left/right to glide.
                <br /> • Weapon shoots automatically.
              </p>
              <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block mt-2">Weapon Upgrades:</span>
              <p className="text-[11px] text-gray-300 mt-0.5 leading-normal">
                🌱 <strong>Lvl 1 Seed Shooter</strong>: Fast single leaf-seed
                <br />
                💧 <strong>Lvl 2 Water Blaster</strong>: 2 water bullets (50 Energy)
                <br />
                🔥🌸 <strong>Lvl 3 Fire Blossom Cannon</strong>: 3 spread bullets (150 Energy)
              </p>
            </div>

            <button
              onClick={handleStartGame}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-lime-500 hover:brightness-110 rounded-xl text-xs font-extrabold uppercase text-slate-950 tracking-wider shadow-lg transition-transform active:scale-95"
            >
              LAUNCH INTERCEPTOR SHIP 🚀
            </button>
          </div>
        )}

        {/* Victory Epic cinematic end sequence */}
        {showVictory && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-10 overflow-y-auto animate-fadeIn font-sans">
            <Trophy className="w-16 h-16 text-yellow-400 animate-bounce mb-2" />
            <span className="text-xs text-yellow-400 font-mono tracking-widest uppercase block animate-pulse">MISSION COMPLETED SUCCESSFULLY</span>
            <h4 className="text-2xl font-black text-lime-400">Evergreen Sanctuary Saved!</h4>
            
            {/* Real estate animation restoration blocks list */}
            <div className="my-4 max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left text-xs text-gray-200 space-y-1.5 leading-normal">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wide block mb-1">🌍 ISLAND RESTORATION DICTIONARY:</span>
              <p>✅ <strong>Eco Destroyer Core Shuts Down</strong>: Rogue AI deactivated forever.</p>
              <p>✅ <strong>Pollution Clouds Cleared</strong>: Clean crystal atmosphere restored.</p>
              <p>✅ <strong>Tree of Life Blooms</strong>: Rich floral life streams bloom everywhere!</p>
              <p>✅ <strong>Rivers Flow Sparking Clean</strong>: Toxins successfully neutralized.</p>
            </div>

            {/* Cinematic dialogue from mother nature */}
            <div className="bg-emerald-950/30 border border-emerald-900/30 rounded-xl p-3 max-w-sm flex gap-3 items-start select-none mb-4 text-left">
              <span className="text-2xl">🌿</span>
              <div>
                <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest block">Mother of Nature says:</span>
                <p className="text-[11px] text-gray-200 font-medium italic mt-0.5 leading-relaxed">
                  "Guardian, your magnificent courage has saved our world. The sacred Tree of Life lives because you chose to stand and defend it!"
                </p>
              </div>
            </div>

            <div className="mb-5">
              <div className="text-sm font-bold text-gray-300">Stars Earned:</div>
              <div className="flex justify-center gap-1 my-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-2xl transition-transform duration-300 ${
                      i < finalStars ? "text-yellow-400 scale-110 drop-shadow" : "text-gray-700 scale-90"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="text-lg font-black text-white font-mono mt-1">Score: {finalScore} pts</div>
              <div className="flex gap-2 justify-center mt-2 text-[10px] font-mono text-emerald-400 uppercase">
                <span>🏆 5000 Points</span>
                <span>💎 500 Crystals</span>
                <span>🏅 Legendary Badge</span>
              </div>
            </div>

            <button
              onClick={submitVictoryAndRank}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 hover:brightness-110 rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-transform active:scale-95 flex items-center gap-2"
            >
              COLLECT REWARDS & COMPLETE RESTORATION <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Dynamic HUD Details Info bar matching high frequency state changes */}
      {isPlaying && (
        <div className="w-full flex justify-between items-center mt-3 bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 text-[11px] font-mono select-none">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-400 block uppercase">Active Task Directive</span>
            <span className="font-extrabold text-emerald-400 animate-pulse">{hudWaveName}</span>
          </div>
          
          {/* Weapon energy indicators */}
          <div className="flex flex-col items-end text-right">
            <span className="text-[9px] text-gray-400 block uppercase">
              {hudWeaponLevel === 1 ? "Seed Shooter 🌱" : hudWeaponLevel === 2 ? "Water Blaster 💧" : "Fire Blossom 🔥🌸"} (Lvl {hudWeaponLevel})
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-emerald-300 font-bold font-mono">⚡ {hudEnergy} Energy</span>
            </div>
          </div>
        </div>
      )}

      {/* Boss specific HP bar when active */}
      {isPlaying && hudBossHP !== null && (
        <div className="w-full bg-slate-950 border border-slate-800 p-3 rounded-2xl mt-3 animate-fadeIn select-none">
          <div className="flex justify-between items-center text-[10px] font-mono text-red-400 font-bold mb-1">
            <span className="flex items-center gap-1 uppercase font-black"><Skull className="w-3 h-3 text-red-500" /> BOSS PHASE: {hudBossPhase}</span>
            <span>{hudBossHP} / {hudBossMaxHP} HP</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-red-950">
            <div
              className="bg-gradient-to-r from-red-500 via-orange-500 to-rose-600 h-full transition-all duration-150"
              style={{ width: `${(hudBossHP / hudBossMaxHP) * 100}%` }}
            />
          </div>
          <p className="text-[9px] text-gray-400 mt-1 leading-normal text-center">
            {hudBossPhase === 1 
              ? "🛡️ Main Core Protected! Explode Left & Right Engine modules first!" 
              : hudBossPhase === 2 
              ? "⚡ Engines deactivated! Main Core Reactor Shield is vulnerable - FIRE!" 
              : "💥 Extreme desperation mode! Reactor core is overheating - destroy it!"
            }
          </p>
        </div>
      )}

      {/* Global gameplay tip */}
      <div className="mt-3.5 text-center text-[11.5px] text-gray-450 leading-relaxed max-w-sm">
         🚀 Move your mouse or drag your touch left/right. Watch out for dropping toxic barrels ☣️ and scrap debris! Collecting falling leaves 🍃 yields a shield, and hearts ❤️ recover health!
      </div>
    </div>
  );
}

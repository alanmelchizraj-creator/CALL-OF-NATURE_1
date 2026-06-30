import React, { useState } from "react";
import { playSound } from "../../utils/audio";
import { Check, Info, Smile } from "lucide-react";

interface GameProps {
  onWin: (score: number, stars: number) => void;
  onLose: () => void;
}

interface AnimalCard {
  id: string;
  name: string;
  emoji: string;
  correctHabitat: string;
  fact: string; // Educational fact clue
}

interface HabitatSlot {
  id: string;
  name: string;
  emoji: string;
  bgColor: string; // Tailwind bg class
}

export default function HabitatMatch({ onWin, onLose }: GameProps) {
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalCard | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({}); // maps animal.id to habitat.id
  const [isPlaying, setIsPlaying] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const ANIMALS: AnimalCard[] = [
    { id: "salmon", name: "Salmon", emoji: "🐟", correctHabitat: "river", fact: "Spawns in cool freshwater cascades, swimming back home against violent rapids." },
    { id: "eagle", name: "Eagle", emoji: "🦅", correctHabitat: "mountain", fact: "Builds giant nests atop sheer rocky peaks with outstanding vantage viewpoints." },
    { id: "camel", name: "Camel", emoji: "🐫", correctHabitat: "desert", fact: "Stores fats in hump tissues to survive hyper-arid sandy areas for weeks without water." },
    { id: "monkey", name: "Monkey", emoji: "🐒", correctHabitat: "rainforest", fact: "Leaps among lush canopy foliage and broad vines in wet rainforest jungles." },
    { id: "panda", name: "Panda", emoji: "🐼", correctHabitat: "bamboo", fact: "Feeds on woody bamboo stalks native to moist cloud-covered mountain gorges." },
    { id: "penguin", name: "Penguin", emoji: "🐧", correctHabitat: "polar", fact: "Huddles against freezing polar winds, utilizing thick insulating down feathers." },
    { id: "kangaroo", name: "Kangaroo", emoji: "🦘", correctHabitat: "outback", fact: "Hops across expansive dry bushes and red dirt soils seeking wild green grass." },
    { id: "whale", name: "Blue Whale", emoji: "🐋", correctHabitat: "ocean", fact: "Requires profound deep ocean currents to hum, travel, and catch plankton feeds." },
  ];

  const HABITATS: HabitatSlot[] = [
    { id: "river", name: "Cold River", emoji: "💧", bgColor: "from-blue-900 to-indigo-950 border-blue-500" },
    { id: "mountain", name: "Rocky Peaks", emoji: "🏔️", bgColor: "from-stone-800 to-stone-900 border-stone-500" },
    { id: "desert", name: "Sandy Desert", emoji: "🏜️", bgColor: "from-amber-900 to-yellow-950 border-yellow-500" },
    { id: "rainforest", name: "Rainforest", emoji: "🌴", bgColor: "from-emerald-950 to-green-950 border-emerald-500" },
    { id: "bamboo", name: "Bamboo Forest", emoji: "🎋", bgColor: "from-teal-900 to-emerald-950 border-teal-500" },
    { id: "polar", name: "Arctic Ice", emoji: "❄️", bgColor: "from-cyan-900 to-sky-950 border-sky-500" },
    { id: "outback", name: "Arid Outback", emoji: "🌾", bgColor: "from-amber-850 to-orange-950 border-orange-500" },
    { id: "ocean", name: "Deep Ocean", emoji: "🌊", bgColor: "from-blue-950 to-slate-950 border-cyan-500" },
  ];

  const handleSelectAnimal = (animal: AnimalCard) => {
    if (!isPlaying) return;
    if (matchedPairs[animal.id]) return; // already slotted
    playSound("select");
    setSelectedAnimal(animal);
  };

  const handleMatchHabitat = (habitat: HabitatSlot) => {
    if (!isPlaying) return;
    if (!selectedAnimal) return;

    if (selectedAnimal.correctHabitat === habitat.id) {
      playSound("collect");
      const nextMatched = { ...matchedPairs, [selectedAnimal.id]: habitat.id };
      setMatchedPairs(nextMatched);
      setSelectedAnimal(null);

      // Check if all matched
      if (Object.keys(nextMatched).length === ANIMALS.length) {
        setIsPlaying(false);
        playSound("victory");
        let stars = 3;
        if (mistakes >= 4) stars = 1;
        else if (mistakes >= 1) stars = 2;
        onWin(500 - mistakes * 40, stars);
      }
    } else {
      playSound("failure");
      setMistakes((m) => m + 1);
    }
  };

  const startMatcher = () => {
    setSelectedAnimal(null);
    setMatchedPairs({});
    setMistakes(0);
    setIsPlaying(true);
    playSound("select");
  };

  return (
    <div 
      className="flex flex-col items-center bg-slate-900 border border-green-800 rounded-2xl p-6 text-white overflow-hidden max-w-xl mx-auto shadow-xl relative"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('/src/assets/images/ecology_map_1782201714180.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="w-full flex justify-between items-center mb-3">
        <span className="text-sm font-semibold tracking-wide text-blue-400 font-sans uppercase">
          MISSION 7: HABITAT MATCHING
        </span>
        <div className="text-xs font-mono text-stone-300 bg-slate-800/80 px-2.5 py-1 rounded-md">
          Mistakes: {mistakes}
        </div>
      </div>

      {/* Dynamic Ecosystem Stability Level Meter */}
      {isPlaying && (
        <div className="w-full bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 mb-4 animate-fadeIn">
          <div className="flex justify-between text-[11px] font-bold font-mono text-teal-400 mb-1">
            <span>MUTUAL STABILIZATION STATE</span>
            <span>{Math.round((Object.keys(matchedPairs).length / ANIMALS.length) * 100)}% Completed</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-400 to-blue-500 h-full transition-all duration-300"
              style={{ width: `${(Object.keys(matchedPairs).length / ANIMALS.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {!isPlaying ? (
        <div className="w-full bg-slate-950 p-6 flex flex-col items-center justify-center text-center rounded-xl border border-blue-900/40">
          <span className="text-5xl mb-4 animate-bounce">🗺️</span>
          <h4 className="text-lg font-bold text-blue-300">Relocate Displaced Wildlife</h4>
          <p className="text-xs text-gray-300 max-w-sm mt-2 leading-relaxed">
            Severe ecological instability has driven wildlife away from their safe roots. Direct all these lost ones back to the environmental biomes they require to thrive!
          </p>
          <p className="text-[10px] text-teal-400 font-bold mt-2 uppercase">
            🌱 EXTRA ELEMENTS ACTIVATED: 8 Species, Stability Progress Index & Field Clue Deck!
          </p>
          <button
            onClick={startMatcher}
            className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-sky-600 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/30 active:scale-95 transition-transform"
          >
            START MATCHING
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-5">
          {/* Deck of displaced animals */}
          <div>
            <h5 className="text-xs text-slate-400 font-mono mb-2 uppercase">Displaced Animals (Tap/Click to Select)</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ANIMALS.map((animal) => {
                const isSlotted = matchedPairs[animal.id];
                const isChosen = selectedAnimal?.id === animal.id;
                return (
                  <button
                    key={animal.id}
                    onClick={() => handleSelectAnimal(animal)}
                    disabled={!!isSlotted}
                    className={`p-2 bg-gradient-to-br from-slate-800 to-slate-900 border rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs focus:outline-none ${
                      isSlotted
                        ? "opacity-30 border-emerald-500 grayscale text-slate-450 cursor-not-allowed"
                        : isChosen
                        ? "border-amber-400 text-amber-300 scale-102 shadow-md shadow-amber-500/15 bg-slate-800/80"
                        : "border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <span className="text-lg">{animal.emoji}</span>
                    <span className="font-semibold font-sans">{animal.name}</span>
                    {isSlotted && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Educational Log Fact Box clue */}
          {selectedAnimal && (
            <div className="bg-slate-950 p-3 rounded-xl border border-blue-900/35 flex items-start gap-3 animate-fadeIn">
              <span className="text-2xl bg-blue-950/60 p-2 rounded-lg border border-blue-900/20">{selectedAnimal.emoji}</span>
              <div>
                <span className="text-[10px] text-blue-400 font-black uppercase tracking-wider block">Field Log Record</span>
                <p className="text-[11px] text-gray-200 mt-0.5 leading-relaxed italic">
                  "{selectedAnimal.fact}"
                </p>
              </div>
            </div>
          )}

          {/* Habitat Slots */}
          <div>
            <h5 className="text-xs text-slate-400 font-mono mb-2 uppercase">Ecosystem Reserves (Choose Target Location)</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {HABITATS.map((habitat) => {
                // Find what animal is placed here, if any
                const animalMatched = Object.entries(matchedPairs).find(([aniId, habId]) => habId === habitat.id);
                const animalEmoji = animalMatched ? ANIMALS.find((a) => a.id === animalMatched[0])?.emoji : null;

                return (
                  <button
                    key={habitat.id}
                    onClick={() => handleMatchHabitat(habitat)}
                    className={`p-2.5 bg-gradient-to-b ${habitat.bgColor} border-2 rounded-xl flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] focus:outline-none relative group h-22`}
                    disabled={!!animalMatched}
                  >
                    <span className="text-xl mb-1">{habitat.emoji}</span>
                    <span className="text-[9px] font-extrabold font-sans tracking-wide uppercase leading-none">{habitat.name}</span>

                    {/* Show correct creature if matched */}
                    {animalMatched ? (
                      <div className="absolute inset-0 bg-emerald-950/85 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-3xl animate-bounce">{animalEmoji}</span>
                        <span className="text-[8px] text-emerald-400 font-black tracking-wider font-mono">SAFE</span>
                      </div>
                    ) : (
                      selectedAnimal && (
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                          <span className="text-[9px] font-semibold text-amber-250">Place {selectedAnimal.emoji}?</span>
                        </div>
                      )
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-center text-xs text-slate-400 font-sans">
        💡 Tap an **animal card** from the deck above to read its ecological fact logs, then click its corresponding **Ecosystem biome slot** below!
      </div>
    </div>
  );
}

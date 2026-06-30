export interface PlayerProgress {
  unlockedMissions: number[]; // e.g. [1] initially, unlocks up to 10
  missionStars: Record<number, number>; // maps missionId (1-10) to stars (0-3)
  missionHighScores: Record<number, number>; // maps missionId to score
  naturePoints: number;
  unlockedAnimals: string[]; // keys of animals unlocked in encyclopedia
  unlockedAchievements: string[]; // achievement IDs
  restoredAreas?: string[]; // list of restored area IDs on Guardian Island
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // name from lucide-react or custom category
  condition: string;
  unlocked: boolean;
}

export interface AnimalFact {
  id: string;
  name: string;
  scientificName: string;
  image: string; // Lucide icon name or emoji representation
  color: string; // tailwind gradient or solid
  habitat: string;
  diet: string;
  fact: string;
  pointsToUnlock: number;
}

export interface MissionConfig {
  id: number;
  title: string;
  subtitle: string;
  story: string;
  instructions: string;
  rewardText: string;
  accentColor: string; // Tailwind class
  bannerEmoji: string;
}

export const MISSIONS_LIST: MissionConfig[] = [
  {
    id: 1,
    title: "Forest Runner",
    subtitle: "Help the young deer escape to a safe sanctuary",
    story: "Deforestation has fragmented the ancient woods. A frightened deer is trying to reach a quiet, safe nature sanctuary. Jump over obstacles and gather food tokens along the way to fuel the journey!",
    instructions: "Press SPACEBAR or CLICK/TAP anywhere on the game screen to JUMP over fallen logs, boulders, and deep pits. Grab glowing green leaves and nature tokens to boost your score!",
    rewardText: "Unlocks the Deer entry in the animal deck and begins restoring the island's tree cover.",
    accentColor: "from-emerald-500 to-green-600",
    bannerEmoji: "🦌"
  },
  {
    id: 2,
    title: "Baby Animal Maze",
    subtitle: "Guide lost baby woodland animals back to their parents",
    story: "Thick haze and scattered debris have disoriented a baby bear cub, rabbit, and fox. They are lost in deep, winding paths and crying out for their mothers. Guide them through the maze safely.",
    instructions: "Use the KEYBOARD ARROWS, WASD keys, or ON-SCREEN CONTROLS to move the baby animal through the maze grid to the parent waiting at the exit. Avoid dead ends!",
    rewardText: "Unlocks Bear and Rabbit cards. Reunites animals and restores forest peacefulness.",
    accentColor: "from-amber-600 to-amber-700",
    bannerEmoji: "🐻"
  },
  {
    id: 3,
    title: "Nature Collection",
    subtitle: "Harvest seeds, wild berries, and clean spring water",
    story: "Evergreen's soils are nutrient-starved, and flowers are fading. We must collect wild elements to re-fertilize the forest floor. Filter out plastic water bottles and industrial waste from your basket!",
    instructions: "Drag or move the basket using your MOUSE, TOUCH, or LEFT/RIGHT ARROW keys. Collect falling Seeds, Berries, Water Drops, and Flowers. Avoid falling toxic trash, lightbulbs, and tin cans!",
    rewardText: "Unlocks the Fox entry in the deck. Plants beautiful new saplings.",
    accentColor: "from-teal-500 to-cyan-600",
    bannerEmoji: "🦊"
  },
  {
    id: 4,
    title: "Protect the Plant",
    subtitle: "Defend a rare glowing blossom from invasive pests",
    story: "The Heart of Evergreen is a single ancient, glowing blossom. Disrupted ecosystems have caused invasive, swarming bugs to attack the plant's delicate stems. Protect the blossom!",
    instructions: "Swarms of pests are marching toward the glowing flower at the center. CLICK or TAP on approaching insects (beetles, spiders) to zap them before they nibble on the leaves. Maintain the flower's health bar!",
    rewardText: "Unlocks the Owl card. Restores the legendary flower, bringing glowing seeds back into the soil.",
    accentColor: "from-indigo-500 to-purple-600",
    bannerEmoji: "🌸"
  },
  {
    id: 5,
    title: "Fire Fighter Hero",
    subtitle: "Douse spreading brushfires and rescue trapped fauna",
    story: "Extremely dry brush, worsened by climate neglect, has ignited into a fierce forest fire! The woods are blazing, trapping defenseless critters in smoky hollows. Grab the fire douser!",
    instructions: "CLICK or TAP and DRAG your mouse to aim the water nozzle. Spray water directly on burning trees and fires to extinguish them before the water reservoir runs dry. Rescue trapped animals by spraying the fire around them!",
    rewardText: "Unlocks the Wolf card. Re-grows charred branches and stops the smoke clouds.",
    accentColor: "from-red-500 to-orange-600",
    bannerEmoji: "🔥"
  },
  {
    id: 6,
    title: "Stop the Loggers",
    subtitle: "Arrest greedy illegal woodcutters using net launchers",
    story: "Noisy, massive machines have rolled into the reserve. Loggers are actively aiming chain saws at ancient redwood trunks. Defend the forest boundary with eco-patrol gear!",
    instructions: "Loggers are popping up from behind trees. Tap/click on them to launch your eco-neutralizing NETS before they complete cutting down the trees (indicated by their progress bars). Avoid clicking harmless park rangers!",
    rewardText: "Unlocks the Tiger card. Stops industrial machinery from advancing.",
    accentColor: "from-lime-600 to-emerald-700",
    bannerEmoji: "🪵"
  },
  {
    id: 7,
    title: "Habitat Matcher",
    subtitle: "Relocate animals to their correct, thriving ecosystems",
    story: "Severe pollution has forced creatures to flee. Now, they are scattered in hostile environments. Help them find their natural niches where they can gather food and shelter.",
    instructions: "DRAG animal cards from the deck on the left and DROP them into their appropriate habitats on the right (e.g. Salmon to River, Bear to Forest, Camel to Desert, Eagle to Mountain peak). Achieve a perfect streak!",
    rewardText: "Unlocks the Eagle card. Animals re-establish and build natural nests.",
    accentColor: "from-blue-500 to-sky-600",
    bannerEmoji: "🗺️"
  },
  {
    id: 8,
    title: "River Cleanup",
    subtitle: "Clean up plastics and industrial pollutants from the stream",
    story: "A toxic spill upstream has littered our pure river with bags, oil drums, and heavy plastics, choking the riverbed and putting fish in severe distress. We need to comb the river!",
    instructions: "Use your net to scoop up floating plastic cups, tin cans, and laundry bottles. Simply CLICK/TAP the pieces of debris as they drift down the fast stream. Make sure you don't spook or strike the swimming fish!",
    rewardText: "Unlocks Panda entries in the deck. Clears river water, making it shimmering and safe.",
    accentColor: "from-cyan-500 to-blue-600",
    bannerEmoji: "💧"
  },
  {
    id: 9,
    title: "Wildlife Photographer",
    subtitle: "Document rare and returning wildlife in the sanctuary",
    story: "With Evergreen healing, shy, majestic species have started populating the reserves. To petition for legally protected national park status, we need photographic proof of life!",
    instructions: "Watch the brush, sky, and rocks closely. When an animal hops, flies, or rustles out from hiding, click the CAMERA Shutter, or tap directly on the animal to capture an active photo. Frame them perfectly!",
    rewardText: "Unlocks Elephant. Legally declares the island a Protected Sanctuary.",
    accentColor: "from-fuchsia-500 to-pink-600",
    bannerEmoji: "📷"
  },
  {
    id: 10,
    title: "Save the Tree of Life",
    subtitle: "Defeat the Dark Pollution Spirit in an ultimate showdown",
    story: "All of Evergreen's environmental problems have synthesized into a massive, looming monster — the Dark Pollution Spirit. Direct all your skills as a Guardian to banish this sludge beast forever!",
    instructions: "The Pollution Monster launches dirty soot bombs. CLICK to zap the sludge balls, spray restorative water drops onto burning sectors to heal yourself, and collect clean light seeds when they appear to charge your Nature Beam. Release a full blast of eco-energy!",
    rewardText: "Restores Evergreen to ultimate beauty! Spirit of Nature crowns you Master Guardian.",
    accentColor: "from-slate-700 to-zinc-900",
    bannerEmoji: "🌟"
  }
];

import { AnimalFact } from "../types";

export const ENCYCLOPEDIA_DATA: AnimalFact[] = [
  {
    id: "deer",
    name: "White-Tailed Deer",
    scientificName: "Odocoileus virginianus",
    image: "🦌",
    color: "from-green-100 to-emerald-200 text-emerald-800",
    habitat: "Forests, meadows, and brushy woodlands.",
    diet: "Herbivore: grass, leaves, shoots, fruit, and acorns.",
    fact: "Deer can jump up to 8 feet high and run at speeds of up to 30 miles per hour to evade predators. They behave as indicator species for healthy forest ecosystems.",
    pointsToUnlock: 0 // Free with Mission 1
  },
  {
    id: "bear",
    name: "Grizzly Bear",
    scientificName: "Ursus arctos",
    image: "🐻",
    color: "from-amber-100 to-yellow-200 text-amber-800",
    habitat: "Temperate dense forests, mountains, and river valleys.",
    diet: "Omnivore: salmon, wild berries, honey, roots, and insects.",
    fact: "Bears play an integral role in seed dispersal by eating wild fruit and spreading seeds across vast forested regions. Their digging also aerates soil.",
    pointsToUnlock: 100 // Unlocked after Mission 2
  },
  {
    id: "rabbit",
    name: "Cottontail Rabbit",
    scientificName: "Sylvilagus",
    image: "🐰",
    color: "from-slate-100 to-zinc-200 text-zinc-800",
    habitat: "Fields, meadows, and thick brush piles.",
    diet: "Herbivore: green plants, clover, wildflowers, and tree bark.",
    fact: "Rabbits are crucial primary consumers in the food chain. They build complex tunnel systems called warrens, which double as shelters for other small animals.",
    pointsToUnlock: 150
  },
  {
    id: "fox",
    name: "Red Fox",
    scientificName: "Vulpes vulpes",
    image: "🦊",
    color: "from-orange-100 to-amber-200 text-orange-900",
    habitat: "Forest edges, grasslands, and mixed scrubland.",
    diet: "Omnivore: small rodents, fruits, berries, and beetles.",
    fact: "Red foxes have exceptional hearing. They can hear small mammals tunneling under dense leaves or snow and leap high into the air to catch them with pinpoint accuracy.",
    pointsToUnlock: 250
  },
  {
    id: "owl",
    name: "Great Horned Owl",
    scientificName: "Bubo virginianus",
    image: "🦉",
    color: "from-indigo-100 to-purple-200 text-indigo-900",
    habitat: "Forest canopies, swamps, and agricultural edges.",
    diet: "Carnivore: mice, voles, small birds, and insects.",
    fact: "Owls are silent flyers because of special serrations on their wing feathers that break up turbulence. They keep agricultural pests in check naturally.",
    pointsToUnlock: 400
  },
  {
    id: "wolf",
    name: "Timber Wolf",
    scientificName: "Canis lupus",
    image: "🐺",
    color: "from-blue-100 to-slate-200 text-slate-800",
    habitat: "Broad woodlands, taiga, and cold tundras.",
    diet: "Carnivore: deer, elk, rabbits, and small mammals.",
    fact: "Wolves are apex predators that shape entire ecosystems. By managing grazing populations, they prevent soil erosion and allow streamside vegetation to regrow.",
    pointsToUnlock: 550
  },
  {
    id: "tiger",
    name: "Bengal Tiger",
    scientificName: "Panthera tigris",
    image: "🐯",
    color: "from-yellow-100 to-orange-200 text-orange-950",
    habitat: "Tropical rainforests, evergreen forests, and marshes.",
    diet: "Carnivore: wild boars, deer, and large herbivores.",
    fact: "Each tiger has a completely unique pattern of stripes—no two tigers share the same coat. They require enormous habitats to survive and are highly endangered.",
    pointsToUnlock: 750
  },
  {
    id: "eagle",
    name: "Bald Eagle",
    scientificName: "Haliaeetus leucocephalus",
    image: "🦅",
    color: "from-sky-100 to-blue-200 text-blue-900",
    habitat: "High trees adjacent to rivers, large lakes, and sea coasts.",
    diet: "Carnivore: fresh fish, waterfowl, and small mammals.",
    fact: "Bald eagles build the largest nests of any North American bird—sometimes up to 10 feet wide and weighing several tons! They symbolize healthy aquatic systems.",
    pointsToUnlock: 950
  },
  {
    id: "panda",
    name: "Giant Panda",
    scientificName: "Ailuropoda melanoleuca",
    image: "🐼",
    color: "from-stone-100 to-emerald-100 text-stone-800",
    habitat: "High, misty mountain bamboo forests.",
    diet: "Herbivore: almost exclusively bamboo shoots and leaves.",
    fact: "Pandas spend up to 12 hours a day eating bamboo to meet their daily nutritional needs. They have a unique 'pseudo-thumb' that helps them grip bamboo stalks.",
    pointsToUnlock: 1200
  },
  {
    id: "elephant",
    name: "Asian Elephant",
    scientificName: "Elephas maximus",
    image: "🐘",
    color: "from-neutral-100 to-zinc-300 text-zinc-900",
    habitat: "Grasslands, scrub, and tropical evergreen forests.",
    diet: "Herbivore: grass, bark, roots, foliage, and crops.",
    fact: "Elephants are 'ecosystem engineers.' They carve pathways in dense woods that act as firebreaks, dig water holes used by other species, and disperse seeds.",
    pointsToUnlock: 1500
  }
];

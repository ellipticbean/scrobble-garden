export type FloraSpecies =
  | 'bioluminescent-mushroom'
  | 'ancient-fern'
  | 'moonflower'
  | 'crystal-moss'
  | 'canopy-tree';

export type GrowthStage =
  | 'Spore'
  | 'Sprout'
  | 'Blooming'
  | ' flourishing'
  | 'Ancient Spirit';

export interface GardenPlant {
  id: string;
  artistName: string;
  species: FloraSpecies;
  speciesLabel: string;
  stage: GrowthStage;
  level: number;
  scrobbles: number;
  nextLevelScrobbles: number;
  recentGrowth: string;
  topTrack: string;
  genreBiome: string;
  botanicalNote: string;
  accentColor: string;
}

export interface RecentScrobble {
  id: string;
  track: string;
  artist: string;
  timeAgo: string;
  effect: string;
}

// Clearly labeled demo data for Phase 1 visual prototype
export const demoGardenPlants: GardenPlant[] = [
  {
    id: 'plant-1',
    artistName: 'Pink Floyd',
    species: 'canopy-tree',
    speciesLabel: 'Elder Canopy Tree',
    stage: 'Ancient Spirit',
    level: 8,
    scrobbles: 1877,
    nextLevelScrobbles: 2000,
    recentGrowth: '+14 scrobbles this week',
    topTrack: 'Wish You Were Here',
    genreBiome: 'Psychedelic Grove',
    botanicalNote:
      'Towering above the moss bed, its branches hum with atmospheric frequencies and prism-like light.',
    accentColor: '#6ee7b7',
  },
  {
    id: 'plant-2',
    artistName: 'Arkells',
    species: 'moonflower',
    speciesLabel: 'Lantern Moonflower',
    stage: 'Ancient Spirit',
    level: 7,
    scrobbles: 1614,
    nextLevelScrobbles: 1800,
    recentGrowth: '+22 scrobbles this week',
    topTrack: 'Leather Jacket',
    genreBiome: 'Indie Clearing',
    botanicalNote:
      'Radiates a warm amber glow along the main forest path, thriving during high-energy listening streaks.',
    accentColor: '#fcd34d',
  },
  {
    id: 'plant-3',
    artistName: 'Кино',
    species: 'bioluminescent-mushroom',
    speciesLabel: 'Nightfall Ghost Cap',
    stage: 'Blooming',
    level: 6,
    scrobbles: 1340,
    nextLevelScrobbles: 1500,
    recentGrowth: '+38 scrobbles this week',
    topTrack: 'Группа крови',
    genreBiome: 'Post-Punk Hollow',
    botanicalNote:
      'Blooms brightest after midnight. Its neon-cyan spores pulse in rhythm with late-night sessions.',
    accentColor: '#67e8f9',
  },
  {
    id: 'plant-4',
    artistName: '$uicideboy$',
    species: 'bioluminescent-mushroom',
    speciesLabel: 'Shadow Mycelium Cluster',
    stage: 'Blooming',
    level: 6,
    scrobbles: 1290,
    nextLevelScrobbles: 1500,
    recentGrowth: '+9 scrobbles this week',
    topTrack: '...And to Those I Love, Thanks for Sticking Around',
    genreBiome: 'Underground Cavern',
    botanicalNote:
      'Deep violet caps rooted in the shaded cavern floor, feeding on heavy basslines.',
    accentColor: '#c084fc',
  },
  {
    id: 'plant-5',
    artistName: 'Chris Stapleton',
    species: 'ancient-fern',
    speciesLabel: 'Copperwood Bracken',
    stage: 'Blooming',
    level: 5,
    scrobbles: 1206,
    nextLevelScrobbles: 1300,
    recentGrowth: '+6 scrobbles this week',
    topTrack: 'Tennessee Whiskey',
    genreBiome: 'Southern Timberland',
    botanicalNote:
      'Hardy, deep-rooted fronds with a rich golden-oak tint that never withers between seasons.',
    accentColor: '#fdba74',
  },
  {
    id: 'plant-6',
    artistName: 'The Smiths',
    species: 'moonflower',
    speciesLabel: 'Weeping Bellflower',
    stage: 'Blooming',
    level: 5,
    scrobbles: 980,
    nextLevelScrobbles: 1100,
    recentGrowth: '+19 scrobbles this week',
    topTrack: 'There Is a Light That Never Goes Out',
    genreBiome: 'Misty Bog',
    botanicalNote:
      'Delicate silver-blue petals that thrive in overcast weather and dramatic melancholy.',
    accentColor: '#93c5fd',
  },
  {
    id: 'plant-7',
    artistName: 'Arctic Monkeys',
    species: 'ancient-fern',
    speciesLabel: 'Velvet Night Fern',
    stage: 'Sprout',
    level: 4,
    scrobbles: 745,
    nextLevelScrobbles: 900,
    recentGrowth: '+31 scrobbles this week',
    topTrack: '505',
    genreBiome: 'Indie Clearing',
    botanicalNote:
      'Rapidly unfurling new fronds this month after a sudden surge in nocturnal listening.',
    accentColor: '#86efac',
  },
  {
    id: 'plant-8',
    artistName: 'Cocteau Twins',
    species: 'crystal-moss',
    speciesLabel: 'Ethereal Dew Moss',
    stage: 'Sprout',
    level: 3,
    scrobbles: 420,
    nextLevelScrobbles: 600,
    recentGrowth: '+12 scrobbles this week',
    topTrack: 'Cherry-Coloured Funk',
    genreBiome: 'Dream Pop Glade',
    botanicalNote:
      'A shimmering carpet of iridescent moss that coats the stones in a dreamlike mist.',
    accentColor: '#f9a8d4',
  },
];

export const demoRecentScrobbles: RecentScrobble[] = [
  {
    id: 'scrobble-1',
    track: 'Группа крови',
    artist: 'Кино',
    timeAgo: '4 mins ago',
    effect: 'Watered Nightfall Ghost Cap (+1 XP)',
  },
  {
    id: 'scrobble-2',
    track: '505',
    artist: 'Arctic Monkeys',
    timeAgo: '18 mins ago',
    effect: 'Velvet Night Fern unfurled a new leaf',
  },
  {
    id: 'scrobble-3',
    track: 'Wish You Were Here',
    artist: 'Pink Floyd',
    timeAgo: '42 mins ago',
    effect: 'Canopy resonance increased',
  },
  {
    id: 'scrobble-4',
    track: 'There Is a Light That Never Goes Out',
    artist: 'The Smiths',
    timeAgo: '1 hr ago',
    effect: 'Misty Bog humidity rose to 84%',
  },
];

export const demoInsights: string[] = [
  '🌿 Rapid Growth Detected: Кино and Arctic Monkeys gained the most XP over the last 7 days.',
  '🍄 Nocturnal Pattern: 68% of your recent scrobbles occurred after 9:00 PM, boosting bioluminescent fungi.',
  '💧 Thirsty Flora: Chris Stapleton is only 94 scrobbles away from evolving to Level 6.',
];
import type {
  FloraSpecies,
  GardenPlant,
  GrowthStage,
  RecentScrobble,
} from '../data/demoArtists';
import type { RawLastFmArtist, RawRecentTrack } from './lastfm';

export interface UndergroundSpore {
  id: string;
  artistName: string;
  scrobbles: number;
  rank: number;
  accentColor: string;
  dormantNote: string;
}

export interface GardenMilestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const SPECIES_POOL: {
  species: FloraSpecies;
  labels: string[];
  biomes: string[];
  colors: string[];
  notes: string[];
}[] = [
  {
    species: 'canopy-tree',
    labels: ['Elder Canopy Tree', 'Resonant Ironwood', 'Starlight Redwood'],
    biomes: ['Psychedelic Grove', 'Ancient Timberland', 'Canopy Heights'],
    colors: ['#6ee7b7', '#34d399', '#a7f3d0'],
    notes: [
      'Towering above the moss bed, its branches hum with deep frequencies and prism-like light.',
      'An anchor of the forest whose rings record hundreds of hours of devoted listening.',
    ],
  },
  {
    species: 'moonflower',
    labels: ['Lantern Moonflower', 'Weeping Bellflower', 'Astral Nightshade'],
    biomes: ['Indie Clearing', 'Misty Bog', 'Twilight Meadow'],
    colors: ['#fcd34d', '#93c5fd', '#f472b6'],
    notes: [
      'Radiates a warm glow along the main forest path, thriving during high-energy listening streaks.',
      'Delicate luminescent petals that open wider with every replay.',
    ],
  },
  {
    species: 'bioluminescent-mushroom',
    labels: ['Nightfall Ghost Cap', 'Shadow Mycelium Cluster', 'Neon Spore Ring'],
    biomes: ['Post-Punk Hollow', 'Underground Cavern', 'Mycelium Depths'],
    colors: ['#67e8f9', '#c084fc', '#38bdf8'],
    notes: [
      'Blooms brightest after midnight. Its neon spores pulse in rhythm with late-night sessions.',
      'Deep-rooted caps connected to the underground network of your music taste.',
    ],
  },
  {
    species: 'ancient-fern',
    labels: ['Copperwood Bracken', 'Velvet Night Fern', 'Whispering Frond'],
    biomes: ['Southern Timberland', 'Indie Clearing', 'Mossy Ravine'],
    colors: ['#fdba74', '#86efac', '#bef264'],
    notes: [
      'Hardy, deep-rooted fronds that unfurl new leaves whenever revisited.',
      'Thrives in shaded clearings, absorbing steady rhythms across the seasons.',
    ],
  },
  {
    species: 'crystal-moss',
    labels: ['Ethereal Dew Moss', 'Prism Lichen', 'Starlit Velvet Moss'],
    biomes: ['Dream Pop Glade', 'Misty Bog', 'Crystal Grotto'],
    colors: ['#f9a8d4', '#a5b4fc', '#5eead4'],
    notes: [
      'A shimmering carpet of iridescent moss that coats the stones in a dreamlike mist.',
      'Softly illuminates the forest floor whenever atmospheric tracks play.',
    ],
  },
];

function hashString(str: string): number {
  let hash = 17;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function calculateLevelAndStage(scrobbles: number): {
  level: number;
  stage: GrowthStage;
  nextLevelScrobbles: number;
} {
  const thresholds = [50, 150, 300, 600, 1000, 1500, 2200, 3000, 5000, 10000];
  let level = 1;

  for (let i = 0; i < thresholds.length; i++) {
    if (scrobbles >= thresholds[i]) {
      level = i + 2;
    } else {
      break;
    }
  }

  const nextBase = thresholds[Math.min(level - 1, thresholds.length - 1)];
  const nextLevelScrobbles =
    scrobbles >= nextBase
      ? Math.ceil((scrobbles + 100) / 500) * 500
      : nextBase;

  let stage: GrowthStage = 'Spore';
  if (level >= 7) stage = 'Ancient Spirit';
  else if (level >= 5) stage = 'Blooming';
  else if (level >= 3) stage = 'Sprout';

  return { level, stage, nextLevelScrobbles };
}

function formatTimeAgo(utsSeconds?: string): string {
  if (!utsSeconds) return 'Playing now ✨';
  const diffMinutes = Math.max(
    1,
    Math.floor((Date.now() - Number(utsSeconds) * 1000) / 60000)
  );
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function buildGardenFromLastFm(
  topArtists: RawLastFmArtist[],
  weeklyArtists: RawLastFmArtist[],
  recentTracks: RawRecentTrack[]
): {
  plants: GardenPlant[];
  undergroundSpores: UndergroundSpore[];
  milestones: GardenMilestone[];
  recentScrobbles: RecentScrobble[];
  insights: string[];
  weather: string;
} {
  const weeklyMap = new Map<string, number>();
  for (const w of weeklyArtists) {
    if (w?.name) {
      weeklyMap.set(w.name.toLowerCase(), Number(w.playcount) || 0);
    }
  }

  const recentTrackByArtist = new Map<string, string>();
  for (const t of recentTracks) {
    if (!t) continue;
    const artistName =
      typeof t.artist === 'string' ? t.artist : t.artist?.['#text'] ?? '';
    if (
      artistName &&
      t.name &&
      !recentTrackByArtist.has(artistName.toLowerCase())
    ) {
      recentTrackByArtist.set(artistName.toLowerCase(), t.name);
    }
  }

  const mainArtists = topArtists.slice(0, 12);
  const vaultArtists = topArtists.slice(12, 36);

  const plants: GardenPlant[] = mainArtists.map((artist, index) => {
    const safeName = artist?.name || `Mystery Flora #${index + 1}`;
    const scrobbles = Number(artist?.playcount) || 0;
    const hash = hashString(safeName);

    const poolIndex =
      index === 0 && scrobbles >= 500 ? 0 : hash % SPECIES_POOL.length;
    const group = SPECIES_POOL[poolIndex] ?? SPECIES_POOL[0];

    const speciesLabel =
      group.labels[hash % group.labels.length] ?? group.labels[0];
    const genreBiome =
      group.biomes[(hash >>> 3) % group.biomes.length] ?? group.biomes[0];
    const accentColor =
      group.colors[(hash >>> 5) % group.colors.length] ?? group.colors[0];
    const botanicalNote =
      group.notes[hash % group.notes.length] ?? group.notes[0];

    const { level, stage, nextLevelScrobbles } =
      calculateLevelAndStage(scrobbles);

    const weeklyPlays = weeklyMap.get(safeName.toLowerCase()) ?? 0;
    const recentGrowth =
      weeklyPlays > 0
        ? `+${weeklyPlays.toLocaleString()} scrobbles this week`
        : 'Resting in dormant soil';

    const topTrack =
      recentTrackByArtist.get(safeName.toLowerCase()) ??
      `Rank #${index + 1} Resonant Frequency`;

    return {
      id: `plant-${index}-${safeName}`,
      artistName: safeName,
      species: group.species,
      speciesLabel,
      stage,
      level,
      scrobbles,
      nextLevelScrobbles,
      recentGrowth,
      topTrack,
      genreBiome,
      botanicalNote,
      accentColor,
    };
  });

  const sporeColors = ['#67e8f9', '#c084fc', '#f472b6', '#34d399', '#fcd34d'];
  const undergroundSpores: UndergroundSpore[] = vaultArtists.map(
    (artist, idx) => {
      const safeName = artist?.name || `Deep Spore #${idx + 13}`;
      const scrobbles = Number(artist?.playcount) || 0;
      const hash = hashString(safeName);
      return {
        id: `spore-${idx + 13}-${safeName}`,
        artistName: safeName,
        scrobbles,
        rank: idx + 13,
        accentColor: sporeColors[hash % sporeColors.length],
        dormantNote:
          weeklyMap.get(safeName.toLowerCase())
            ? `Stirring underground (+${weeklyMap.get(safeName.toLowerCase())} this week)`
            : 'Preserved in deep mycelium',
      };
    }
  );

  const recentScrobbles: RecentScrobble[] = recentTracks
    .filter(Boolean)
    .slice(0, 5)
    .map((track, idx) => {
      const artistName =
        typeof track.artist === 'string'
          ? track.artist
          : track.artist?.['#text'] ?? 'Unknown Artist';
      const isNowPlaying = track['@attr']?.nowplaying === 'true';

      return {
        id: `recent-${idx}-${track.name || idx}`,
        track: track.name || 'Untitled Track',
        artist: artistName,
        timeAgo: isNowPlaying
          ? 'Now Scrobbling ✨'
          : formatTimeAgo(track.date?.uts),
        effect: isNowPlaying
          ? `Actively photosynthesizing ${artistName} (+Live Boost)`
          : `Nourished ${artistName} roots (+1 XP)`,
      };
    });

  let nightCount = 0;
  let timestampedCount = 0;
  for (const t of recentTracks) {
    if (t?.date?.uts) {
      timestampedCount++;
      const hour = new Date(Number(t.date.uts) * 1000).getHours();
      if (hour >= 20 || hour < 5) {
        nightCount++;
      }
    }
  }

  const nightPercent =
    timestampedCount > 0 ? Math.round((nightCount / timestampedCount) * 100) : 0;

  const insights: string[] = [];

  if (weeklyArtists.length > 0 && weeklyArtists[0]?.name) {
    const topWeekly = weeklyArtists[0];
    const count = Number(topWeekly.playcount || 0);
    const unit = count === 1 ? 'scrobble' : 'scrobbles';
    insights.push(
      `🌿 Rapid Growth Detected: ${topWeekly.name} is leading your garden this week with +${count.toLocaleString()} new ${unit}.`
    );
  } else {
    insights.push(
      `🌱 Calm Season: No weekly surge detected yet—scrobble music to awaken dormant spores.`
    );
  }

  insights.push(
    nightPercent >= 45
      ? `🍄 Nocturnal Ecosystem: ${nightPercent}% of your recent listens happened at night, supercharging bioluminescent fungi.`
      : `☀️ Sunlit Canopy: ${100 - nightPercent}% of your recent scrobbles occurred during daylight hours.`
  );

  const closestToLevel = [...plants].sort(
    (a, b) =>
      a.nextLevelScrobbles - a.scrobbles - (b.nextLevelScrobbles - b.scrobbles)
  )[0];

  if (closestToLevel) {
    const remaining =
      closestToLevel.nextLevelScrobbles - closestToLevel.scrobbles;
    const unit = remaining === 1 ? 'scrobble' : 'scrobbles';
    insights.push(
      `💧 Evolution Imminent: ${closestToLevel.artistName} needs only ${remaining.toLocaleString()} more ${unit} to reach Level ${
        closestToLevel.level + 1
      }.`
    );
  }

  const totalTopScrobbles = plants.reduce((s, p) => s + p.scrobbles, 0);
  const ancientCount = plants.filter((p) => p.level >= 7).length;

  const milestones: GardenMilestone[] = [
    {
      id: 'elder-grove',
      title: 'Elder Grove Keeper',
      description: 'Cultivate at least one Level 7+ Ancient Spirit plant.',
      icon: '🌳',
      unlocked: ancientCount >= 1,
    },
    {
      id: 'mycelium-network',
      title: 'Deep Mycelium Network',
      description: 'Accumulate over 10,000 XP across your top sanctuary flora.',
      icon: '🍄',
      unlocked: totalTopScrobbles >= 10000,
    },
    {
      id: 'night-bloomer',
      title: 'Nocturnal Botanist',
      description: 'Have over 50% of your recent scrobbles occur after nightfall.',
      icon: '🌙',
      unlocked: nightPercent >= 50,
    },
    {
      id: 'spore-collector',
      title: 'Underground Archivist',
      description: 'Unlock 15+ dormant species in the Underground Spore Vault.',
      icon: '🔮',
      unlocked: undergroundSpores.length >= 15,
    },
  ];

  const weather =
    nightPercent >= 50 ? '🌙 Bioluminescent Mist' : '🌤️ Sunbeam Dew';

  return {
    plants,
    undergroundSpores,
    milestones,
    recentScrobbles,
    insights,
    weather,
  };
}
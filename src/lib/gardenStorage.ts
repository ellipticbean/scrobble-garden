import type { GardenPlant } from '../data/demoArtists';
import type { LastFmGardenPeriod } from './lastfm';

const STORAGE_PREFIX = 'scrobble-garden-memory-v2:';

interface StoredPlantSnapshot {
  artistName: string;
  scrobbles: number;
  level: number;
}

interface StoredGardenMemory {
  username: string;
  period: LastFmGardenPeriod;
  savedAt: number;
  plants: Record<string, StoredPlantSnapshot>;
}

export interface GrowthEvent {
  artistName: string;
  gainedScrobbles: number;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
}

export interface MemoryComparison {
  lastVisitedAt: number | null;
  growthEvents: GrowthEvent[];
  newSpeciesUnlocked: string[];
}

function getStorageKey(username: string, period: LastFmGardenPeriod): string {
  return `${STORAGE_PREFIX}${username.trim().toLowerCase()}:${period}`;
}

export function compareAndSaveGardenMemory(
  username: string,
  period: LastFmGardenPeriod,
  currentPlants: GardenPlant[]
): MemoryComparison {
  const key = getStorageKey(username, period);
  const growthEvents: GrowthEvent[] = [];
  const newSpeciesUnlocked: string[] = [];
  let lastVisitedAt: number | null = null;

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const previous = JSON.parse(raw) as Partial<StoredGardenMemory> | null;
      if (previous && previous.plants && typeof previous.plants === 'object') {
        lastVisitedAt = previous.savedAt ?? null;

        for (const plant of currentPlants) {
          const artistKey = plant.artistName.toLowerCase();
          const oldPlant = previous.plants[artistKey];

          if (!oldPlant) {
            newSpeciesUnlocked.push(plant.artistName);
          } else if (plant.scrobbles > oldPlant.scrobbles) {
            growthEvents.push({
              artistName: plant.artistName,
              gainedScrobbles: plant.scrobbles - oldPlant.scrobbles,
              previousLevel: oldPlant.level,
              newLevel: plant.level,
              leveledUp: plant.level > oldPlant.level,
            });
          }
        }
      }
    }

    const shouldSaveNewSnapshot =
      !raw || growthEvents.length > 0 || newSpeciesUnlocked.length > 0;

    if (shouldSaveNewSnapshot) {
      const plantMap: Record<string, StoredPlantSnapshot> = {};
      for (const p of currentPlants) {
        plantMap[p.artistName.toLowerCase()] = {
          artistName: p.artistName,
          scrobbles: p.scrobbles,
          level: p.level,
        };
      }

      const snapshot: StoredGardenMemory = {
        username,
        period,
        savedAt: Date.now(),
        plants: plantMap,
      };
      localStorage.setItem(key, JSON.stringify(snapshot));
    }
  } catch (err) {
    console.warn('Could not access garden localStorage:', err);
  }

  return {
    lastVisitedAt,
    growthEvents,
    newSpeciesUnlocked,
  };
}
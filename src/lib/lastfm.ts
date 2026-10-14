const API_KEY = import.meta.env.VITE_LASTFM_API_KEY;
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

export type LastFmGardenPeriod = 'overall' | '12month' | '3month' | '7day';

export const GARDEN_PERIOD_LABELS: Record<LastFmGardenPeriod, string> = {
    overall: '🌲 All-Time Forest',
    '12month': '🍂 Past Year',
    '3month': '🌸 Past 3 Months',
    '7day': '✨ Past 7 Days',
};

export interface RawLastFmArtist {
    name: string;
    playcount: string;
    url?: string;
    '@attr'?: {
        rank: string;
    };
}

export interface RawRecentTrack {
    name: string;
    artist: { '#text': string } | string;
    date?: { uts: string; '#text': string };
    '@attr'?: { nowplaying?: string };
}

async function fetchLastFm<T>(params: Record<string, string>): Promise<T> {
    if (!API_KEY) {
        throw new Error('Missing VITE_LASTFM_API_KEY in .env file.');
    }

    const query = new URLSearchParams({
        ...params,
        api_key: API_KEY,
        format: 'json',
    });

    const response = await fetch(`${BASE_URL}?${query.toString()}`);

    if (!response.ok) {
        throw new Error(`Last.fm request failed (${response.status})`);
    }

    const data = (await response.json()) as T & {
        error?: number;
        message?: string;
    };

    if (data.error) {
        throw new Error(data.message || 'Last.fm returned an error.');
    }

    return data;
}

export async function getUserGardenData(
    username: string,
    period: LastFmGardenPeriod = 'overall'
) {
    const cleanUser = username.trim();

    const [overallRes, weeklyRes, recentRes] = await Promise.all([
        fetchLastFm<{ topartists?: { artist?: RawLastFmArtist[] } }>({
            method: 'user.gettopartists',
            user: cleanUser,
            period,
            limit: '36',
        }),
        fetchLastFm<{ topartists?: { artist?: RawLastFmArtist[] } }>({
            method: 'user.gettopartists',
            user: cleanUser,
            period: '7day',
            limit: '25',
        }),
        fetchLastFm<{ recenttracks?: { track?: RawRecentTrack[] | RawRecentTrack } }>({
            method: 'user.getrecenttracks',
            user: cleanUser,
            limit: '20',
        }),
    ]);

    const topArtists = overallRes.topartists?.artist ?? [];
    const weeklyArtists = weeklyRes.topartists?.artist ?? [];
    const rawRecent = recentRes.recenttracks?.track ?? [];
    const recentTracks = Array.isArray(rawRecent) ? rawRecent : [rawRecent];

    if (topArtists.length === 0) {
        throw new Error(
            `No listening history found for "${cleanUser}" in this time season.`
        );
    }

    return {
        username: cleanUser,
        topArtists,
        weeklyArtists,
        recentTracks,
    };
}
export async function getFriendTopArtists(
  username: string,
  period: LastFmGardenPeriod = 'overall'
): Promise<RawLastFmArtist[]> {
  const cleanUser = username.trim();
  const res = await fetchLastFm<{ topartists?: { artist?: RawLastFmArtist[] } }>({
    method: 'user.gettopartists',
    user: cleanUser,
    period,
    limit: '50',
  });

  const artists = res.topartists?.artist ?? [];
  if (artists.length === 0) {
    throw new Error(`No public artists found for "${cleanUser}".`);
  }
  return artists;
}
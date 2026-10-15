import { useEffect, useState } from 'react';
import type { RawRecentTrack } from '../lib/lastfm';

interface ForestBeaconProps {
  isDemo: boolean;
  recentTracks: RawRecentTrack[];
  onRefresh: () => void;
  loading: boolean;
}

export default function ForestBeacon({
  isDemo,
  recentTracks,
  onRefresh,
  loading,
}: ForestBeaconProps) {
  const [pulse, setPulse] = useState(false);

  const latest = recentTracks[0];
  const isNowPlaying = latest?.['@attr']?.nowplaying === 'true';
  const artistName =
    typeof latest?.artist === 'string'
      ? latest.artist
      : latest?.artist?.['#text'] ?? 'Unknown Artist';
  const trackName = latest?.name ?? 'Quiet Forest';

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setPulse(true));
    const t = window.setTimeout(() => setPulse(false), 1000);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(t);
    };
  }, [latest]);

  return (
    <div className={`forest-beacon ${pulse ? 'pulse-glow' : ''}`}>
      <div className="beacon-left">
        <span className={`beacon-status-dot ${isNowPlaying ? 'live' : 'idle'}`} />
        <div className="beacon-info">
          <span className="beacon-eyebrow">
            {isNowPlaying ? '✨ LIVE FOREST BEACON • NOW PLAYING' : '🌙 LAST RECORDED SCROBBLE'}
          </span>
          <strong>
            {isDemo ? 'Pink Floyd — Wish You Were Here' : `${artistName} — ${trackName}`}
          </strong>
        </div>
      </div>

      <button
        type="button"
        className="beacon-refresh-btn"
        onClick={onRefresh}
        disabled={loading || isDemo}
        title="Check for new scrobbles"
      >
        {loading ? '⏳ Listening...' : '📡 Tune Antenna'}
      </button>
    </div>
  );
}
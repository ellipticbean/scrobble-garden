import { useState, type FormEvent } from 'react';
import type { GardenPlant } from '../data/demoArtists';
import {
  getFriendTopArtists,
  type LastFmGardenPeriod,
} from '../lib/lastfm';

interface CrossPollinationModalProps {
  hostUsername: string;
  hostPlants: GardenPlant[];
  period: LastFmGardenPeriod;
  onClose: () => void;
}

interface SharedFlora {
  artistName: string;
  hostScrobbles: number;
  guestScrobbles: number;
}

export default function CrossPollinationModal({
  hostUsername,
  hostPlants,
  period,
  onClose,
}: CrossPollinationModalProps) {
  const [guestInput, setGuestInput] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [sharedFlora, setSharedFlora] = useState<SharedFlora[] | null>(null);
  const [harmonyScore, setHarmonyScore] = useState<number>(0);
  const [guestExclusive, setGuestExclusive] = useState<string[]>([]);

  async function handleCompare(e: FormEvent) {
    e.preventDefault();
    const cleaned = guestInput.trim();
    if (!cleaned) return;

    if (cleaned.toLowerCase() === hostUsername.toLowerCase()) {
      setError('Enter a different Last.fm username to cross-pollinate!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const guestArtists = await getFriendTopArtists(cleaned, period);

      const guestMap = new Map<string, { name: string; plays: number }>();
      for (const a of guestArtists) {
        if (a?.name) {
          guestMap.set(a.name.toLowerCase(), {
            name: a.name,
            plays: Number(a.playcount) || 0,
          });
        }
      }

      const matches: SharedFlora[] = [];
      for (const plant of hostPlants) {
        const match = guestMap.get(plant.artistName.toLowerCase());
        if (match) {
          matches.push({
            artistName: plant.artistName,
            hostScrobbles: plant.scrobbles,
            guestScrobbles: match.plays,
          });
        }
      }

      const hostSet = new Set(
        hostPlants.map((p) => p.artistName.toLowerCase())
      );
      const guestOnly = guestArtists
        .filter((a) => a?.name && !hostSet.has(a.name.toLowerCase()))
        .slice(0, 5)
        .map((a) => a.name);

      const score = Math.min(
        100,
        Math.round((matches.length / Math.max(1, hostPlants.length)) * 100)
      );

      setGuestName(cleaned);
      setSharedFlora(matches);
      setGuestExclusive(guestOnly);
      setHarmonyScore(score);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load friend garden.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="pollination-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pollination-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="pollination-header">
          <div>
            <span className="panel-eyebrow">🦋 Botanical Cross-Pollination Lab</span>
            <h2 id="pollination-title">Compare Two Music Forests</h2>
            <p>
              See which artist species thrive in both{' '}
              <strong>{hostUsername}</strong>’s garden and a friend’s garden.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close Cross-Pollination Lab"
          >
            ✕
          </button>
        </header>

        <form className="pollination-form" onSubmit={handleCompare}>
          <input
            type="text"
            placeholder="Enter friend's Last.fm username..."
            value={guestInput}
            onChange={(e) => setGuestInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="grow-btn" disabled={loading}>
            {loading ? '🌱 Pollinating...' : '🦋 Compare Gardens'}
          </button>
        </form>

        {error && <p className="garden-error">⚠️ {error}</p>}

        {sharedFlora !== null && (
          <div className="pollination-results">
            <div className="harmony-banner">
              <div>
                <span>ECOSYSTEM HARMONY SCORE</span>
                <strong>{harmonyScore}% Symbiosis</strong>
                <p>
                  {sharedFlora.length} of {hostUsername}’s top clearing species
                  also grow in {guestName}’s forest!
                </p>
              </div>
            </div>

            <div className="pollination-columns">
              <div className="pollination-box">
                <h4>🌿 Shared Symbiotic Species ({sharedFlora.length})</h4>
                {sharedFlora.length === 0 ? (
                  <p className="muted-note">
                    Two completely distinct ecosystems! No overlapping top
                    species in this season.
                  </p>
                ) : (
                  <ul className="shared-species-list">
                    {sharedFlora.map((item) => (
                      <li key={item.artistName}>
                        <strong>{item.artistName}</strong>
                        <span>
                          {hostUsername}: {item.hostScrobbles.toLocaleString()}{' '}
                          XP • {guestName}:{' '}
                          {item.guestScrobbles.toLocaleString()} XP
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pollination-box">
                <h4>✨ Exotic Seeds from {guestName}</h4>
                <p className="muted-note">
                  Top species thriving in {guestName}’s garden that haven't
                  sprouted in {hostUsername}’s clearing yet:
                </p>
                <div className="exotic-seed-tags">
                  {guestExclusive.map((name) => (
                    <span key={name} className="seed-pill">
                      🌱 {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
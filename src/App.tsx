import { useState, type CSSProperties, type FormEvent } from 'react';
import './App.css';
import FloraSprite from './components/FloraSprite';
import CrossPollinationModal from './components/CrossPollinationModal';
import ForestBeacon from './components/ForestBeacon';
import { syncGardenWithPython, type PythonSyncResponse } from './lib/pythonBridge';
import PrivacyModal from './components/PrivacyModal';
import {
  demoGardenPlants,
  demoInsights,
  demoRecentScrobbles,
  type GardenPlant,
  type RecentScrobble,
} from './data/demoArtists';
import {
  GARDEN_PERIOD_LABELS,
  getUserGardenData,
  type LastFmGardenPeriod,
} from './lib/lastfm';
import {
  buildGardenFromLastFm,
  type GardenMilestone,
  type UndergroundSpore,
} from './lib/gardenGenerator';
import {
  compareAndSaveGardenMemory,
  type MemoryComparison,
} from './lib/gardenStorage';

export default function App() {
  const [usernameInput, setUsernameInput] = useState('');
  const [activeUsername, setActiveUsername] = useState('');
  const [selectedPeriod, setSelectedPeriod] =
    useState<LastFmGardenPeriod>('overall');
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const [plants, setPlants] = useState<GardenPlant[]>([]);
  const [undergroundSpores, setUndergroundSpores] = useState<
    UndergroundSpore[]
  >([]);
  const [milestones, setMilestones] = useState<GardenMilestone[]>([]);
  const [recentScrobbles, setRecentScrobbles] = useState<RecentScrobble[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [weather, setWeather] = useState('🌙 Bioluminescent Mist');
  const [memoryReport, setMemoryReport] = useState<MemoryComparison | null>(
    null
  );
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  const [selectedPlant, setSelectedPlant] = useState<GardenPlant | null>(null);
  const [biomeFilter, setBiomeFilter] = useState<string>('ALL');
  const [vaultOpen, setVaultOpen] = useState(false);
  const [pollinationOpen, setPollinationOpen] = useState(false);
  const [pythonLog, setPythonLog] = useState<PythonSyncResponse | null>(null);
  const [pythonLoading, setPythonLoading] = useState(false);
  const [pythonError, setPythonError] = useState('');

  async function handleRunPythonSync() {
    if (isDemo) {
      setPythonError('Switch to a real Last.fm username to run Python automation.');
      return;
    }

    const apiKey = import.meta.env.VITE_LASTFM_API_KEY;
    if (!apiKey) {
      setPythonError('Missing VITE_LASTFM_API_KEY in .env file.');
      return;
    }

    setPythonLoading(true);
    setPythonError('');

    try {
      const result = await syncGardenWithPython(activeUsername, apiKey);
      setPythonLog(result);
    } catch (err) {
      setPythonError(
        err instanceof Error
          ? err.message
          : 'Could not reach Python FastAPI backend.'
      );
    } finally {
      setPythonLoading(false);
    }
  }

  async function loadUserGarden(
    targetUser: string,
    period: LastFmGardenPeriod = selectedPeriod
  ) {
    const cleaned = targetUser.trim();
    if (!cleaned) return;

    setLoading(true);
    setError('');

    try {
      const data = await getUserGardenData(cleaned, period);
      const generated = buildGardenFromLastFm(
        data.topArtists,
        data.weeklyArtists,
        data.recentTracks
      );

      const memory = compareAndSaveGardenMemory(
        data.username,
        period,
        generated.plants
      );

      setPlants(generated.plants);
      setUndergroundSpores(generated.undergroundSpores);
      setMilestones(generated.milestones);
      setRecentScrobbles(generated.recentScrobbles);
      setInsights(generated.insights);
      setWeather(generated.weather);
      setMemoryReport(memory);
      setSelectedPlant(generated.plants[0] ?? null);
      setBiomeFilter('ALL');
      setActiveUsername(data.username);
      setSelectedPeriod(period);
      setIsDemo(false);
      setLastRefreshed(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load Last.fm data. Showing current garden.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSwitchToDemo() {
    setError('');
    setPlants(demoGardenPlants);
    setUndergroundSpores([]);
    setMilestones([]);
    setRecentScrobbles(demoRecentScrobbles);
    setInsights(demoInsights);
    setWeather('🌙 Bioluminescent Mist');
    setMemoryReport(null);
    setSelectedPlant(demoGardenPlants[0] ?? null);
    setBiomeFilter('ALL');
    setActiveUsername('MintyCorpse');
    setIsDemo(true);
  }

  function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    void loadUserGarden(usernameInput, selectedPeriod);
  }

  function handleTuneAntenna() {
    if (!isDemo) {
      void loadUserGarden(activeUsername, selectedPeriod);
    }
  }

  function handlePeriodChange(newPeriod: LastFmGardenPeriod) {
    if (isDemo) {
      setSelectedPeriod(newPeriod);
      return;
    }
    void loadUserGarden(activeUsername, newPeriod);
  }

  const biomes = [
    'ALL',
    ...Array.from(
      new Set(plants.map((p) => (p.genreBiome ?? '').trim()).filter(Boolean))
    ),
  ];

  const visiblePlants =
    biomeFilter === 'ALL'
      ? plants
      : plants.filter(
        (plant) => (plant.genreBiome ?? '').trim() === biomeFilter
      );

  const totalScrobbles = plants.reduce(
    (sum, plant) => sum + plant.scrobbles,
    0
  );

  return (
    <div className="garden-shell">
      <header className="garden-header">
        <div className="header-brand">
          <span className="biome-badge">
            {isDemo
              ? '🌱 Scrobble Garden • Sample Prototype Mode'
              : `🌿 Scrobble Garden • Connected to Last.fm • Watered ${lastRefreshed}`}
          </span>
          <h1>
            {activeUsername ? `${activeUsername}’s` : 'Empty'} Living Music Forest
          </h1>
          <p>
            Every scrobble nourishes your ecosystem. Artists grow from spores
            into ancient forest spirits.
          </p>

          <a
            className="scrobble-world-link"
            href="https://ellipticbean.github.io/scrobble-world/"
            target="_blank"
            rel="noopener noreferrer"
          >
            🌍 Visit the Community Atlas ↗
          </a>

          <form className="explorer-form" onSubmit={handleFormSubmit}>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Enter any Last.fm username..."
              aria-label="Last.fm username"
              disabled={loading}
            />
            <button type="submit" className="grow-btn" disabled={loading}>
              {loading ? '🌱 Cultivating...' : '🌿 Grow Garden'}
            </button>
            <button
              type="button"
              className="pollinate-btn"
              onClick={() => setPollinationOpen(true)}
              disabled={loading || !activeUsername}
            >
              🦋 Cross-Pollinate (Compare Friend)
            </button>
            {!isDemo && (
              <button
                type="button"
                className="demo-mode-btn"
                onClick={handleSwitchToDemo}
                disabled={loading}
              >
                Reset to Demo
              </button>
            )}
          </form>

          <div className="season-bar" aria-label="Garden Time Season">
            <span className="season-label">SEASON:</span>
            {(Object.keys(GARDEN_PERIOD_LABELS) as LastFmGardenPeriod[]).map(
              (periodKey) => (
                <button
                  key={periodKey}
                  type="button"
                  disabled={loading}
                  className={`season-btn ${selectedPeriod === periodKey ? 'active' : ''
                    }`}
                  onClick={() => handlePeriodChange(periodKey)}
                >
                  {GARDEN_PERIOD_LABELS[periodKey]}
                </button>
              )
            )}
          </div>

          {error && (
            <p className="garden-error" role="alert">
              ⚠️ {error}
            </p>
          )}
        </div>

        <div className="header-metrics">
          <div className="metric-pill">
            <span>Active Flora</span>
            <strong>
              {plants.length} Canopy + {undergroundSpores.length} Spores
            </strong>
          </div>
          <div className="metric-pill">
            <span>Garden Energy</span>
            <strong>{totalScrobbles.toLocaleString()} XP</strong>
          </div>
          <div className="metric-pill">
            <span>Forest Weather</span>
            <strong>{weather}</strong>
          </div>
        </div>
      </header>

      <ForestBeacon
        isDemo={isDemo}
        recentTracks={recentScrobbles.map((r) => ({
          name: r.track,
          artist: r.artist,
        }))}
        onRefresh={handleTuneAntenna}
        loading={loading}
      />

      {!isDemo && memoryReport && (
        <section className="memory-banner" aria-live="polite">
          <div className="memory-banner-left">
            <span className="memory-dot" />
            <div>
              <strong>
                {memoryReport.growthEvents.length > 0
                  ? `🌱 Ecosystem Growth Recorded Since Last Visit!`
                  : memoryReport.lastVisitedAt
                    ? `🍃 Ecosystem Memory Active`
                    : `✨ First Visit Recorded in Garden Memory`}
              </strong>
              <p>
                {memoryReport.growthEvents.length > 0
                  ? memoryReport.growthEvents
                    .map(
                      (e) =>
                        `${e.artistName} (+${e.gainedScrobbles} XP${e.leveledUp
                          ? ` 🎉 Leveled up to Lv.${e.newLevel}!`
                          : ''
                        })`
                    )
                    .join(' • ')
                  : `Your current plant levels and scrobbles are saved in browser memory. Listen to music on Last.fm and refresh to watch them grow!`}
              </p>
            </div>
          </div>
        </section>
      )}

      <main className="garden-workspace">
        <div className="garden-left-column">
          <section className="forest-clearing" aria-label="Artist Flora">
            <div className="clearing-toolbar">
              <div>
                <h2>The Sanctuary Clearing</h2>
                <p>
                  {plants.length > 0
                    ? 'Select a plant specimen to inspect its musical roots and growth stage.'
                    : 'Your forest is waiting for a Last.fm username to awaken.'}
                </p>
              </div>

              {plants.length > 0 && (
                <div className="filter-pills">
                  {biomes.map((biome) => (
                    <button
                      key={biome}
                      type="button"
                      className={`filter-btn ${biomeFilter === biome ? 'active' : ''
                        }`}
                      onClick={() => setBiomeFilter(biome)}
                    >
                      {biome === 'ALL' ? '🌲 All Biomes' : biome}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {plants.length === 0 ? (
              <div className="empty-clearing-state" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '2.5rem', margin: '0 0 10px' }}>🌱</p>
                <h3 style={{ color: '#fff', margin: '0 0 6px' }}>Your clearing is dormant...</h3>
                <p style={{ fontSize: '0.9rem', margin: 0 }}>Type any public Last.fm username above and click <strong>Grow Garden</strong> to sprout your first plants!</p>
              </div>
            ) : (
              <div className="Terrarium-grid">
                {visiblePlants.map((plant) => {
                  const progressPercent = Math.min(
                    100,
                    Math.round((plant.scrobbles / plant.nextLevelScrobbles) * 100)
                  );

                  return (
                    <button
                      key={plant.id}
                      type="button"
                      className={`plant-card ${selectedPlant?.id === plant.id ? 'selected' : ''
                        }`}
                      style={
                        {
                          '--plant-accent': plant.accentColor,
                        } as CSSProperties
                      }
                      onClick={() => setSelectedPlant(plant)}
                    >
                      <span className="plant-level-tag">Lv. {plant.level}</span>

                      <FloraSprite
                        species={plant.species}
                        accentColor={plant.accentColor}
                        level={plant.level}
                      />

                      <h3 className="plant-artist-name">{plant.artistName}</h3>
                      <span className="plant-species-name">
                        {plant.speciesLabel}
                      </span>

                      <div className="xp-bar-track" aria-hidden="true">
                        <div
                          className="xp-bar-fill"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <span className="plant-scrobble-meta">
                        {plant.scrobbles.toLocaleString()} /{' '}
                        {plant.nextLevelScrobbles.toLocaleString()} XP
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Underground Spore Vault (Deep-Cut Artists #13–#36) */}
          {undergroundSpores.length > 0 && (
            <section
              className="underground-vault"
              aria-label="Underground Spore Vault"
            >
              <div className="vault-header">
                <div>
                  <span className="panel-eyebrow">
                    🔮 Subterranean Mycelium Archive
                  </span>
                  <h3>
                    The Underground Spore Vault ({undergroundSpores.length}{' '}
                    Dormant Species)
                  </h3>
                  <p>
                    Deeper cuts and emerging artists (#13–#36) incubating
                    beneath the forest floor until they break into your top
                    clearing.
                  </p>
                </div>
                <button
                  type="button"
                  className="vault-toggle-btn"
                  onClick={() => setVaultOpen((prev) => !prev)}
                >
                  {vaultOpen ? '▲ Seal Vault' : '▼ Descend into Vault'}
                </button>
              </div>

              {vaultOpen && (
                <div className="spore-grid">
                  {undergroundSpores.map((spore) => (
                    <div
                      key={spore.id}
                      className="spore-pod"
                      style={
                        {
                          '--spore-color': spore.accentColor,
                        } as CSSProperties
                      }
                    >
                      <div className="spore-pod-top">
                        <span className="spore-rank">#{spore.rank}</span>
                        <span className="spore-dot" />
                      </div>
                      <strong>{spore.artistName}</strong>
                      <span className="spore-plays">
                        {spore.scrobbles.toLocaleString()} scrobbles
                      </span>
                      <small>{spore.dormantNote}</small>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <section
            className="python-automation-panel"
            aria-label="Python Automation Hub"
          >
            <div className="python-panel-header">
              <div>
                <span className="panel-eyebrow">
                  🐍 Full-Stack Python Automation Engine
                </span>
                <h3>FastAPI & SQLite Sync Log</h3>
                <p>
                  Trigger background intelligence processing on your local Python
                  server.
                </p>
              </div>
              <button
                type="button"
                className="python-sync-btn"
                onClick={() => void handleRunPythonSync()}
                disabled={pythonLoading || isDemo || !activeUsername}
              >
                {pythonLoading ? '⚡ Logging to SQLite...' : '🐍 Run Python Sync'}
              </button>
            </div>

            {pythonError && <p className="garden-error">⚠️ {pythonError}</p>}

            {pythonLog && (
              <div className="python-log-results">
                <div className="python-log-meta">
                  <span>
                    Status: <strong>Success</strong>
                  </span>
                  <span>
                    Total XP Logged:{' '}
                    <strong>{pythonLog.calculated_xp.toLocaleString()}</strong>
                  </span>
                  <span>
                    Primary Spore:{' '}
                    <strong>{pythonLog.current_top_artist}</strong>
                  </span>
                </div>
                <p className="python-note">{pythonLog.automation_note}</p>
                <div className="sync-history-table">
                  <strong>Recent SQLite Database Snapshots:</strong>
                  <ul>
                    {pythonLog.sync_history.map((h, i) => (
                      <li key={i}>
                        <span>{h.synced_at}</span> • Top:{' '}
                        <strong>{h.top_artist}</strong> ({h.total_xp.toLocaleString()}{' '}
                        XP)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>

          <section
            className="intelligence-panel"
            aria-label="Forest Intelligence"
          >
            <h3>🔮 Forest Intelligence & Pattern Observations</h3>
            <ul className="insight-list">
              {insights.length === 0 ? (
                <li className="insight-item">
                  🌱 Grow your garden above to unlock intelligent forest observations and pattern analysis.
                </li>
              ) : (
                insights.map((insight, index) => (
                  <li key={index} className="insight-item">
                    {insight}
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        <aside className="garden-sidebar">
          <section className="inspector-card" aria-live="polite">
            <span className="panel-eyebrow">
              🔬 Botanical Specimen Inspector
            </span>
            {selectedPlant ? (
              <>
                <h3>{selectedPlant.artistName}</h3>
                <p className="inspector-subtitle">
                  {selectedPlant.speciesLabel} • {selectedPlant.stage}
                </p>

                <div className="inspector-note">
                  {selectedPlant.botanicalNote}
                </div>

                <div className="inspector-stats">
                  <div className="stat-box">
                    <span>Biome</span>
                    <strong>{selectedPlant.genreBiome}</strong>
                  </div>
                  <div className="stat-box">
                    <span>Growth Level</span>
                    <strong>Level {selectedPlant.level}</strong>
                  </div>
                  <div className="stat-box">
                    <span>Total Scrobbles</span>
                    <strong>{selectedPlant.scrobbles.toLocaleString()}</strong>
                  </div>
                  <div className="stat-box">
                    <span>Recent Growth</span>
                    <strong>{selectedPlant.recentGrowth}</strong>
                  </div>
                  <div className="stat-box" style={{ gridColumn: '1 / -1' }}>
                    <span>Signature Nutrient (Recent / Rank)</span>
                    <strong>♪ {selectedPlant.topTrack}</strong>
                  </div>
                </div>
              </>
            ) : (
              <div
                className="inspector-empty"
                style={{
                  textAlign: 'center',
                  padding: '40px 10px',
                  color: 'var(--text-secondary)',
                }}
              >
                <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>🌿</p>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                  No specimen selected. Grow a garden and click a plant to inspect
                  its roots.
                </p>
              </div>
            )}
          </section>

          {milestones.length > 0 && (
            <section className="activity-card">
              <span className="panel-eyebrow">
                🏆 Sanctuary Ecological Milestones
              </span>
              <div className="milestone-list">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className={`milestone-item ${m.unlocked ? 'unlocked' : 'locked'
                      }`}
                  >
                    <span className="milestone-icon">{m.icon}</span>
                    <div>
                      <strong>
                        {m.title} {m.unlocked ? '✓' : '🔒'}
                      </strong>
                      <p>{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="activity-card">
            <span className="panel-eyebrow">
              ⚡ Command Center • Live Nutrient Feed
            </span>
            <div className="activity-list">
              {recentScrobbles.length === 0 ? (
                <p className="muted-note" style={{ fontSize: '0.82rem', padding: '10px 0' }}>
                  Awaiting recent scrobble feed...
                </p>
              ) : (
                recentScrobbles.map((item) => (
                  <div key={item.id} className="activity-row">
                    <div className="activity-row-top">
                      <strong>
                        {item.artist} — {item.track}
                      </strong>
                      <span>{item.timeAgo}</span>
                    </div>
                    <p className="activity-effect">{item.effect}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </main>

      {pollinationOpen && activeUsername && (
        <CrossPollinationModal
          hostUsername={activeUsername}
          hostPlants={plants}
          period={selectedPeriod}
          onClose={() => setPollinationOpen(false)}
        />
      )}

      <footer className="site-legal-footer">
        <p>
          <a
            href="https://www.last.fm"
            target="_blank"
            rel="noreferrer"
          >
            Powered by Last.fm ↗
          </a>{' '}
          • Public listening data used with permission. Scrobble Garden is an
          independent, unofficial fan project and is not endorsed by Last.fm[cite: 64].
        </p>
        <p>
          <button
            type="button"
            className="footer-link-btn"
            onClick={() => setPrivacyOpen(true)}
          >
            Privacy & data usage
          </button>{' '}
          •{' '}
          <a
            href="https://www.last.fm"
            target="_blank"
            rel="noreferrer"
          >
            Visit Last.fm ↗
          </a>
        </p>
      </footer>

      {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />}
    </div>
  );
}
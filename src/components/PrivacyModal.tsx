import { useEffect } from 'react';

interface PrivacyModalProps {
  onClose: () => void;
}

export default function PrivacyModal({ onClose }: PrivacyModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="pollination-modal privacy-window"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="pollination-header">
          <div>
            <span className="panel-eyebrow">🌱 SCROBBLE GARDEN INFORMATION DESK</span>
            <h2>Privacy & Data Usage</h2>
            <p>How this living music ecosystem works behind the scenes.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="privacy-body">
          <h4>♪ What we request</h4>
          <p>
            When you enter a Last.fm username, your browser requests public top artists and recent tracks from Last.fm's public API. No Last.fm password or account login is required.
          </p>

          <h4>🏡 Where your progress lives</h4>
          <p>
            Plant growth stages, XP, and ecosystem memory snapshots are stored locally in your browser's localStorage. This application does not operate its own centralized user database.
          </p>

          <h4>🔒 API transparency</h4>
          <p>
            Scrobble Garden is an independent, unofficial fan project and is not endorsed by, directly affiliated with, or sponsored by Last.fm. Powered by Last.fm listening data[cite: 64].
          </p>
        </div>
      </section>
    </div>
  );
}
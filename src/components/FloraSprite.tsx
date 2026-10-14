import type { FloraSpecies } from '../data/demoArtists';

interface FloraSpriteProps {
  species: FloraSpecies;
  accentColor: string;
  level: number;
}

export default function FloraSprite({
  species,
  accentColor,
  level,
}: FloraSpriteProps) {
  // Subtle scale boost for higher-level plants
  const scale = Math.min(1.18, 0.86 + level * 0.04);

  return (
    <div
      className="flora-stage"
      style={{ transform: `scale(${scale})` }}
      aria-hidden="true"
    >
      <span
        className="flora-glow"
        style={{ background: accentColor }}
      />

      <svg
        className="flora-svg"
        viewBox="0 0 80 80"
        width="76"
        height="76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Floating Bioluminescent Spores (More spores at higher levels) */}
        <circle cx="20" cy="24" r="2" fill={accentColor} opacity="0.85" />
        <circle cx="62" cy="20" r="1.8" fill="#ffffff" opacity="0.75" />
        {level >= 5 && (
          <>
            <circle cx="15" cy="42" r="1.5" fill={accentColor} opacity="0.7" />
            <circle cx="65" cy="38" r="2.2" fill={accentColor} opacity="0.8" />
          </>
        )}
        {level >= 7 && (
          <circle cx="40" cy="10" r="2.5" fill="#ffffff" opacity="0.9" />
        )}

        {species === 'canopy-tree' && (
          <g>
            {/* Trunk & Roots */}
            <path
              d="M35 66 C36 52, 37 44, 37 36 L43 36 C43 44, 44 52, 45 66 Z"
              fill="#5c4033"
              stroke="#3e2723"
              strokeWidth="1.5"
            />
            {/* Layered Glowing Canopy */}
            <circle cx="40" cy="28" r="16" fill="#065f46" />
            <circle cx="29" cy="33" r="11" fill="#047857" />
            <circle cx="51" cy="33" r="11" fill="#047857" />
            <circle cx="40" cy="24" r="12" fill={accentColor} opacity="0.85" />
            <circle cx="33" cy="29" r="7" fill="#ecfdf5" opacity="0.35" />
          </g>
        )}

        {species === 'bioluminescent-mushroom' && (
          <g>
            {/* Secondary Small Mushroom */}
            <path
              d="M24 65 Q23 55 25 49 L29 49 Q30 55 29 65 Z"
              fill="#cbd5e1"
            />
            <path
              d="M16 50 C16 42, 36 42, 36 50 Z"
              fill={accentColor}
              opacity="0.85"
            />
            {/* Main Mushroom Stem */}
            <path
              d="M38 66 Q37 48 40 36 L46 36 Q49 48 47 66 Z"
              fill="#e2e8f0"
            />
            {/* Glowing Gills & Cap */}
            <ellipse cx="43" cy="37" rx="17" ry="4" fill="#0f172a" />
            <path
              d="M23 37 C23 18, 63 18, 63 37 Z"
              fill={accentColor}
            />
            {/* Cap Spots */}
            <circle cx="36" cy="28" r="3" fill="#ffffff" opacity="0.65" />
            <circle cx="48" cy="26" r="2.2" fill="#ffffff" opacity="0.65" />
            <circle cx="53" cy="32" r="2" fill="#ffffff" opacity="0.55" />
          </g>
        )}

        {species === 'moonflower' && (
          <g>
            {/* Curved Stem & Leaves */}
            <path
              d="M40 66 Q36 48 42 32"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M39 54 Q26 48 28 42 Q36 44 39 54 Z"
              fill="#059669"
            />
            <path
              d="M40 48 Q53 42 51 36 Q43 38 40 48 Z"
              fill="#10b981"
            />
            {/* Glowing Petals */}
            <circle cx="42" cy="22" r="8" fill={accentColor} opacity="0.9" />
            <circle cx="34" cy="28" r="8" fill={accentColor} opacity="0.85" />
            <circle cx="50" cy="28" r="8" fill={accentColor} opacity="0.85" />
            <circle cx="37" cy="36" r="7.5" fill={accentColor} opacity="0.8" />
            <circle cx="47" cy="36" r="7.5" fill={accentColor} opacity="0.8" />
            {/* Radiant Core */}
            <circle cx="42" cy="29" r="5.5" fill="#fef08a" />
          </g>
        )}

        {species === 'ancient-fern' && (
          <g>
            {/* Central & Side Fronds */}
            <path
              d="M40 66 Q32 45 22 26"
              stroke={accentColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M40 66 Q40 42 40 18"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M40 66 Q48 45 58 26"
              stroke={accentColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Frond Leaves */}
            <ellipse cx="34" cy="34" rx="6" ry="3" transform="rotate(-30 34 34)" fill={accentColor} />
            <ellipse cx="46" cy="34" rx="6" ry="3" transform="rotate(30 46 34)" fill={accentColor} />
            <ellipse cx="35" cy="25" rx="5" ry="2.5" transform="rotate(-30 35 25)" fill="#6ee7b7" />
            <ellipse cx="45" cy="25" rx="5" ry="2.5" transform="rotate(30 45 25)" fill="#6ee7b7" />
            <ellipse cx="26" cy="42" rx="5.5" ry="2.5" transform="rotate(-40 26 42)" fill="#34d399" />
            <ellipse cx="54" cy="42" rx="5.5" ry="2.5" transform="rotate(40 54 42)" fill="#34d399" />
          </g>
        )}

        {species === 'crystal-moss' && (
          <g>
            {/* Bioluminescent Crystal Shards */}
            <polygon
              points="40,16 33,42 40,64 47,42"
              fill={accentColor}
              opacity="0.92"
            />
            <polygon
              points="26,28 22,48 31,64 34,46"
              fill="#ffffff"
              opacity="0.6"
            />
            <polygon
              points="54,26 46,46 49,64 58,46"
              fill={accentColor}
              opacity="0.75"
            />
            {/* Moss Cushion Base */}
            <ellipse cx="40" cy="60" rx="20" ry="7" fill="#047857" />
            <ellipse cx="34" cy="59" rx="12" ry="5" fill="#10b981" />
          </g>
        )}
      </svg>

      <span className="moss-mound" />
    </div>
  );
}
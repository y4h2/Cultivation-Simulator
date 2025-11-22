import React from 'react';

interface SkillTreeBackgroundProps {
  treeType: string;
}

// Generate different background colors based on tree type
const getTreeColors = (treeType: string) => {
  const colors: Record<string, { primary: string; secondary: string; glow: string }> = {
    // Main skill trees
    sword: { primary: '#94a3b8', secondary: '#64748b', glow: '#e2e8f0' },
    spell: { primary: '#a855f7', secondary: '#7c3aed', glow: '#c4b5fd' },
    body: { primary: '#f97316', secondary: '#ea580c', glow: '#fdba74' },
    mind: { primary: '#06b6d4', secondary: '#0891b2', glow: '#67e8f9' },
    commerce: { primary: '#eab308', secondary: '#ca8a04', glow: '#fde047' },
    // Element trees
    fire: { primary: '#ef4444', secondary: '#dc2626', glow: '#fca5a5' },
    water: { primary: '#3b82f6', secondary: '#2563eb', glow: '#93c5fd' },
    wood: { primary: '#22c55e', secondary: '#16a34a', glow: '#86efac' },
    metal: { primary: '#a1a1aa', secondary: '#71717a', glow: '#e4e4e7' },
    earth: { primary: '#a16207', secondary: '#854d0e', glow: '#fcd34d' },
  };
  return colors[treeType] || colors.sword;
};

export const SkillTreeBackground: React.FC<SkillTreeBackgroundProps> = ({ treeType }) => {
  const colors = getTreeColors(treeType);

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Main gradient background */}
        <radialGradient id={`bgGradient-${treeType}`} cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.08" />
          <stop offset="50%" stopColor={colors.secondary} stopOpacity="0.04" />
          <stop offset="100%" stopColor="#1f2937" stopOpacity="0" />
        </radialGradient>

        {/* Glow effect */}
        <filter id={`glow-${treeType}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Pattern for mystical effect */}
        <pattern id={`mysticalPattern-${treeType}`} x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          {/* Qi flow lines */}
          <path
            d="M0,50 Q25,30 50,50 T100,50"
            fill="none"
            stroke={colors.primary}
            strokeWidth="0.5"
            opacity="0.15"
          />
          <path
            d="M0,70 Q25,50 50,70 T100,70"
            fill="none"
            stroke={colors.secondary}
            strokeWidth="0.5"
            opacity="0.1"
          />
          <path
            d="M0,30 Q25,10 50,30 T100,30"
            fill="none"
            stroke={colors.primary}
            strokeWidth="0.5"
            opacity="0.1"
          />
        </pattern>

        {/* Circular Bagua-style pattern */}
        <pattern id={`baguaPattern-${treeType}`} x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          <circle cx="100" cy="100" r="80" fill="none" stroke={colors.primary} strokeWidth="0.5" opacity="0.1" />
          <circle cx="100" cy="100" r="60" fill="none" stroke={colors.secondary} strokeWidth="0.3" opacity="0.08" />
          <circle cx="100" cy="100" r="40" fill="none" stroke={colors.primary} strokeWidth="0.3" opacity="0.06" />
          {/* Eight trigram positions */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x = 100 + 70 * Math.cos(rad);
            const y = 100 + 70 * Math.sin(rad);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill={colors.primary}
                opacity="0.1"
              />
            );
          })}
        </pattern>
      </defs>

      {/* Background gradient */}
      <rect width="100%" height="100%" fill={`url(#bgGradient-${treeType})`} />

      {/* Mystical flow pattern */}
      <rect width="100%" height="100%" fill={`url(#mysticalPattern-${treeType})`} />

      {/* Bagua circles pattern */}
      <rect width="100%" height="100%" fill={`url(#baguaPattern-${treeType})`} />

      {/* Central energy pillar effect */}
      <ellipse
        cx="50%"
        cy="50%"
        rx="30%"
        ry="60%"
        fill="none"
        stroke={colors.glow}
        strokeWidth="1"
        opacity="0.05"
      />
      <ellipse
        cx="50%"
        cy="50%"
        rx="20%"
        ry="40%"
        fill="none"
        stroke={colors.glow}
        strokeWidth="0.5"
        opacity="0.08"
      />

      {/* Corner decorative elements - like cultivation formation corners */}
      {/* Top left */}
      <g opacity="0.15">
        <path
          d="M20,20 L20,60 M20,20 L60,20"
          stroke={colors.primary}
          strokeWidth="1"
          fill="none"
        />
        <circle cx="20" cy="20" r="4" fill={colors.primary} opacity="0.5" />
      </g>

      {/* Top right */}
      <g opacity="0.15" transform="translate(100%, 0) scale(-1, 1)">
        <path
          d="M20,20 L20,60 M20,20 L60,20"
          stroke={colors.primary}
          strokeWidth="1"
          fill="none"
        />
        <circle cx="20" cy="20" r="4" fill={colors.primary} opacity="0.5" />
      </g>

      {/* Bottom left */}
      <g opacity="0.15" transform="translate(0, 100%) scale(1, -1)">
        <path
          d="M20,20 L20,60 M20,20 L60,20"
          stroke={colors.primary}
          strokeWidth="1"
          fill="none"
        />
        <circle cx="20" cy="20" r="4" fill={colors.primary} opacity="0.5" />
      </g>

      {/* Bottom right */}
      <g opacity="0.15" transform="translate(100%, 100%) scale(-1, -1)">
        <path
          d="M20,20 L20,60 M20,20 L60,20"
          stroke={colors.primary}
          strokeWidth="1"
          fill="none"
        />
        <circle cx="20" cy="20" r="4" fill={colors.primary} opacity="0.5" />
      </g>

      {/* Floating particles effect - small dots representing spiritual energy */}
      {Array.from({ length: 20 }, (_, i) => (
        <circle
          key={i}
          cx={`${10 + (i * 37) % 80}%`}
          cy={`${15 + (i * 23) % 70}%`}
          r={1 + (i % 2)}
          fill={colors.glow}
          opacity={0.1 + (i % 3) * 0.05}
        >
          <animate
            attributeName="opacity"
            values={`${0.05 + (i % 3) * 0.03};${0.15 + (i % 3) * 0.05};${0.05 + (i % 3) * 0.03}`}
            dur={`${3 + (i % 4)}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
};

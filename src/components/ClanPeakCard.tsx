import React from 'react';
import type { ClanPeak, PeakType } from '../types/clan';
import { getPeakColor } from '../constants/clan';

interface ClanPeakCardProps {
  peak: ClanPeak;
  isZh: boolean;
  onClick: () => void;
  isSelected: boolean;
}

export const ClanPeakCard: React.FC<ClanPeakCardProps> = ({
  peak,
  isZh,
  onClick,
  isSelected,
}) => {
  const color = getPeakColor(peak.id);

  // Icon based on peak type
  const getIcon = (peakId: PeakType) => {
    switch (peakId) {
      case 'sword_peak':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      case 'alchemy_peak':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'beast_garden':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'scripture_cliff':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'commerce_hall':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
        isSelected
          ? 'border-amber-500 bg-amber-900/30'
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {getIcon(peak.id)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white">
            {isZh ? peak.chineseName : peak.name}
          </h4>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
            {isZh ? peak.chineseDescription : peak.description}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 pt-3 border-t border-gray-700/50">
        <div className="flex justify-between text-xs">
          <div>
            <span className="text-gray-500">{isZh ? '声望' : 'Reputation'}</span>
            <span className="ml-2 text-white">{peak.reputation}/100</span>
          </div>
          <div>
            <span className="text-gray-500">{isZh ? '贡献' : 'Contributions'}</span>
            <span className="ml-2 text-amber-400">{peak.contributions}</span>
          </div>
        </div>

        {/* Reputation Bar */}
        <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${peak.reputation}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* Element Badge */}
      {peak.element && (
        <div className="mt-2">
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {isZh ? getElementNameZh(peak.element) : peak.element.toUpperCase()}
          </span>
        </div>
      )}
    </button>
  );
};

// Helper function for Chinese element names
const getElementNameZh = (element: string): string => {
  const names: Record<string, string> = {
    fire: '火',
    water: '水',
    wood: '木',
    metal: '金',
    earth: '土',
    wind: '风',
  };
  return names[element] || element;
};

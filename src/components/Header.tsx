import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';
import { formatTimeDetailed } from '../utils/time';
import { HelpModal } from './HelpModal';
import { SettingsPanel } from './SettingsPanel';

export const Header: React.FC = () => {
  const { state, actions } = useGame();
  const { time, isPaused, character } = state;
  const { t, language } = useLanguage();
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Gear Icon SVG component
  const GearIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

  return (
    <header className="bg-gray-900/80 border-b border-amber-900/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        {/* Main Header Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Game Title */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-shrink-0">
            <h1 className="text-lg sm:text-2xl font-bold text-amber-400 whitespace-nowrap">
              {t.app.title}
            </h1>
            <span className="text-gray-500 text-xs sm:text-sm hidden md:inline">{t.app.subtitle}</span>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-3 xl:gap-6">
            {/* Time Display */}
            <div className="text-center">
              <div className="text-amber-300 font-medium text-sm xl:text-base whitespace-nowrap">
                {formatTimeDetailed(time, language)}
              </div>
            </div>

            {/* Spirit Stones */}
            <div className="flex items-center gap-2 px-2 xl:px-3 py-1 bg-gray-800 rounded-lg">
              <span className="text-yellow-400">&#9670;</span>
              <span className="text-yellow-300 font-medium text-sm xl:text-base">
                {character.spiritStones.toLocaleString()}
              </span>
              <span className="text-gray-400 text-xs xl:text-sm hidden xl:inline">{t.header.spiritStones}</span>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={actions.togglePause}
              className={`px-3 xl:px-4 py-2 rounded-lg font-medium transition-colors text-sm xl:text-base min-w-[44px] min-h-[44px] ${
                isPaused
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              {isPaused ? t.header.continue : t.header.pause}
            </button>

            {/* Settings Gear Icon - Desktop */}
            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 xl:w-11 xl:h-11 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={t.settings.title}
            >
              <GearIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Controls - Essential info only */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Time Display - Compact */}
            <div className="text-amber-300 font-medium text-xs whitespace-nowrap">
              {formatTimeDetailed(time, language)}
            </div>

            {/* Spirit Stones - Compact */}
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-lg">
              <span className="text-yellow-400 text-xs">&#9670;</span>
              <span className="text-yellow-300 font-medium text-xs">
                {character.spiritStones >= 1000
                  ? `${(character.spiritStones / 1000).toFixed(1)}k`
                  : character.spiritStones.toLocaleString()}
              </span>
            </div>

            {/* Pause Button - Icon only on mobile */}
            <button
              onClick={actions.togglePause}
              className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                isPaused
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
              aria-label={isPaused ? t.header.continue : t.header.pause}
            >
              {isPaused ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenHelp={() => setShowHelp(true)}
      />

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </header>
  );
};

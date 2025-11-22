import React from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';
import { formatTimeDetailed } from '../utils/time';

export const Header: React.FC = () => {
  const { state, actions } = useGame();
  const { time, isPaused, gameSpeed, character } = state;
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <header className="bg-gray-900/80 border-b border-amber-900/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Game Title */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-amber-400">
              {t.app.title}
            </h1>
            <span className="text-gray-500 text-sm">{t.app.subtitle}</span>
          </div>

          {/* Time Display */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-amber-300 font-medium">
                {formatTimeDetailed(time, language)}
              </div>
            </div>

            {/* Spirit Stones */}
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-lg">
              <span className="text-yellow-400">&#9670;</span>
              <span className="text-yellow-300 font-medium">
                {character.spiritStones.toLocaleString()}
              </span>
              <span className="text-gray-400 text-sm">{t.header.spiritStones}</span>
            </div>

            {/* Game Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={actions.togglePause}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isPaused
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {isPaused ? t.header.continue : t.header.pause}
              </button>

              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                {[1, 2, 5, 10].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => actions.setGameSpeed(speed)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      gameSpeed === speed
                        ? 'bg-amber-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
              title={t.header.language}
            >
              <span className="text-lg">{language === 'zh' ? '中' : 'EN'}</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-400">{language === 'zh' ? 'EN' : '中'}</span>
            </button>

            {/* Save/Load */}
            <div className="flex items-center gap-2">
              <button
                onClick={actions.saveGame}
                className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                {t.header.save}
              </button>
              <button
                onClick={actions.loadGame}
                className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                {t.header.load}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

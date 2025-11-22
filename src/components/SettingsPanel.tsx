import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onOpenHelp,
}) => {
  const { state, actions } = useGame();
  const { gameSpeed } = state;
  const { t, language, toggleLanguage } = useLanguage();

  // Handle escape key to close panel
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleHelpClick = () => {
    onClose();
    onOpenHelp();
  };

  // Desktop modal content
  const desktopContent = (
    <div className="hidden md:flex fixed inset-0 z-[9999] items-start justify-end p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dropdown Panel */}
      <div className="relative z-10 mt-14 mr-2 bg-gray-900 rounded-xl border border-amber-900/50 p-4 w-80 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
          <h2 className="text-lg font-bold text-amber-400">{t.settings.title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label={t.settings.close}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Game Speed */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">{t.settings.gameSpeed}</label>
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            {[1, 2, 5, 10].map((speed) => (
              <button
                key={speed}
                onClick={() => actions.setGameSpeed(speed)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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

        {/* Language Toggle */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">{t.settings.language}</label>
          <button
            onClick={toggleLanguage}
            className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between"
          >
            <span className="text-white">{language === 'zh' ? '中文' : 'English'}</span>
            <span className="text-gray-400">{language === 'zh' ? 'EN' : '中'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-4" />

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleHelpClick}
            className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3 text-left"
          >
            <span className="text-amber-400 text-lg">?</span>
            <span className="text-white">{t.settings.help}</span>
          </button>

          <button
            onClick={() => {
              actions.saveGame();
              onClose();
            }}
            className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3 text-left"
          >
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span className="text-white">{t.settings.saveGame}</span>
          </button>

          <button
            onClick={() => {
              actions.loadGame();
              onClose();
            }}
            className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3 text-left"
          >
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-white">{t.settings.loadGame}</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Mobile slide-up sheet (iOS action sheet style)
  const mobileContent = (
    <div className="md:hidden fixed inset-0 z-[9999] flex items-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-up Sheet */}
      <div className="relative z-10 w-full bg-gray-900 rounded-t-3xl border-t border-amber-900/50 shadow-2xl shadow-black/50 animate-in slide-in-from-bottom duration-300 pb-safe">
        {/* Handle indicator */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-amber-400 text-center">{t.settings.title}</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {/* Game Speed */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-3">{t.settings.gameSpeed}</label>
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-1.5">
              {[1, 2, 5, 10].map((speed) => (
                <button
                  key={speed}
                  onClick={() => actions.setGameSpeed(speed)}
                  className={`flex-1 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
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

          {/* Language Toggle */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-3">{t.settings.language}</label>
            <button
              onClick={toggleLanguage}
              className="w-full px-5 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors flex items-center justify-between"
            >
              <span className="text-white text-base">{language === 'zh' ? '中文' : 'English'}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{language === 'zh' ? 'Switch to EN' : '切换到中文'}</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 my-4" />

          {/* Action Buttons - iOS style grouped */}
          <div className="space-y-3">
            <button
              onClick={handleHelpClick}
              className="w-full px-5 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors flex items-center gap-4"
            >
              <span className="w-10 h-10 flex items-center justify-center bg-amber-600/20 rounded-full text-amber-400 text-xl font-bold">?</span>
              <span className="text-white text-base">{t.settings.help}</span>
              <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => {
                actions.saveGame();
                onClose();
              }}
              className="w-full px-5 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors flex items-center gap-4"
            >
              <span className="w-10 h-10 flex items-center justify-center bg-green-600/20 rounded-full">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </span>
              <span className="text-white text-base">{t.settings.saveGame}</span>
              <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => {
                actions.loadGame();
                onClose();
              }}
              className="w-full px-5 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors flex items-center gap-4"
            >
              <span className="w-10 h-10 flex items-center justify-center bg-blue-600/20 rounded-full">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </span>
              <span className="text-white text-base">{t.settings.loadGame}</span>
              <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Close Button - iOS style */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="w-full py-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium text-base transition-colors"
          >
            {t.settings.close}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <>
      {desktopContent}
      {mobileContent}
    </>,
    document.body
  );
};

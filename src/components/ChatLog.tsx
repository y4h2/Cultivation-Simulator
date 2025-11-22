import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';
import type { GameLog } from '../types/game';

export const ChatLog: React.FC = () => {
  const { state } = useGame();
  const { logs } = state;
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed on mobile
  const [filter, setFilter] = useState<GameLog['type'] | 'all'>('all');

  const LOG_TYPE_COLORS: Record<GameLog['type'], string> = {
    cultivation: 'text-cyan-400',
    market: 'text-yellow-400',
    combat: 'text-red-400',
    event: 'text-purple-400',
    system: 'text-gray-400',
  };

  type LogTypeKey = keyof typeof t.logTypes;

  const FILTER_OPTIONS: Array<{ value: GameLog['type'] | 'all'; labelKey: LogTypeKey }> = [
    { value: 'all', labelKey: 'all' },
    { value: 'cultivation', labelKey: 'cultivation' },
    { value: 'market', labelKey: 'market' },
    { value: 'combat', labelKey: 'combat' },
    { value: 'event', labelKey: 'event' },
    { value: 'system', labelKey: 'system' },
  ];

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.type === filter);

  // Auto-scroll to bottom when new logs appear
  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length, isExpanded]);

  // Minimized state - small bar at bottom left
  if (!isExpanded) {
    return (
      <div className="fixed bottom-2 sm:bottom-4 left-2 sm:left-4 z-40">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-black/80 backdrop-blur-sm border border-amber-900/50 rounded-lg hover:bg-black/90 transition-colors group min-h-[44px]"
        >
          <span className="text-amber-400 font-medium text-sm sm:text-base">
            {t.log.title}
          </span>
          <span className="text-gray-500 text-xs sm:text-sm">
            ({logs.length})
          </span>
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-amber-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    );
  }

  // Expanded state - chat window
  return (
    <div className="fixed bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-auto z-40 sm:w-80 md:w-96 sm:max-w-[calc(100vw-2rem)]">
      <div className="bg-black/85 backdrop-blur-sm border border-amber-900/50 rounded-lg overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-2 sm:px-3 py-2 border-b border-amber-900/30 bg-black/50">
          {/* Filter dropdown */}
          <div className="flex items-center gap-1">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as GameLog['type'] | 'all')}
              className="bg-transparent text-amber-400 text-sm font-medium border-none outline-none cursor-pointer appearance-none pr-4 min-h-[36px]"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23d97706\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '16px' }}
            >
              {FILTER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-gray-900">
                  {t.logTypes[opt.labelKey]}
                </option>
              ))}
            </select>
          </div>

          {/* Settings & Minimize */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-amber-400 transition-colors p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
              title={t.common.minimize}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Log Content - Shorter on mobile */}
        <div
          ref={scrollRef}
          className="h-40 sm:h-48 md:h-64 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-amber-900/50 scrollbar-track-transparent"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
              {t.log.empty}
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={index} className="text-xs sm:text-sm leading-relaxed">
                <span className={`${LOG_TYPE_COLORS[log.type]}`}>
                  {t.logTypes[log.type as LogTypeKey]}:
                </span>
                {' '}
                <span className="text-gray-300">{log.message}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer - Global label */}
        <div className="flex items-center px-2 sm:px-3 py-1.5 border-t border-amber-900/30 bg-black/50">
          <span className="text-gray-500 text-xs">
            {t.common.global}
          </span>
          <svg className="w-3 h-3 text-gray-500 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

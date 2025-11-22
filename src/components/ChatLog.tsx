import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';
import type { GameLog } from '../types/game';

export const ChatLog: React.FC = () => {
  const { state } = useGame();
  const { logs } = state;
  const { language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [filter, setFilter] = useState<GameLog['type'] | 'all'>('all');

  const LOG_TYPE_COLORS: Record<GameLog['type'], string> = {
    cultivation: 'text-cyan-400',
    market: 'text-yellow-400',
    combat: 'text-red-400',
    event: 'text-purple-400',
    system: 'text-gray-400',
  };

  const LOG_TYPE_LABELS: Record<GameLog['type'], { zh: string; en: string }> = {
    cultivation: { zh: '修炼', en: 'Cult' },
    market: { zh: '交易', en: 'Trade' },
    combat: { zh: '战斗', en: 'Combat' },
    event: { zh: '事件', en: 'Event' },
    system: { zh: '系统', en: 'Sys' },
  };

  const FILTER_OPTIONS: Array<{ value: GameLog['type'] | 'all'; label: { zh: string; en: string } }> = [
    { value: 'all', label: { zh: '全部', en: 'ALL' } },
    { value: 'cultivation', label: { zh: '修炼', en: 'Cult' } },
    { value: 'market', label: { zh: '交易', en: 'Trade' } },
    { value: 'combat', label: { zh: '战斗', en: 'Combat' } },
    { value: 'event', label: { zh: '事件', en: 'Event' } },
    { value: 'system', label: { zh: '系统', en: 'Sys' } },
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
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-sm border border-amber-900/50 rounded-lg hover:bg-black/80 transition-colors group"
        >
          <span className="text-amber-400 font-medium">
            {language === 'zh' ? '修炼日志' : 'Log'}
          </span>
          <span className="text-gray-500 text-sm">
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
    <div className="fixed bottom-4 left-4 z-40 w-96 max-w-[calc(100vw-2rem)]">
      <div className="bg-black/70 backdrop-blur-sm border border-amber-900/50 rounded-lg overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-amber-900/30 bg-black/50">
          {/* Filter dropdown */}
          <div className="flex items-center gap-1">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as GameLog['type'] | 'all')}
              className="bg-transparent text-amber-400 text-sm font-medium border-none outline-none cursor-pointer appearance-none pr-4"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23d97706\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '16px' }}
            >
              {FILTER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-gray-900">
                  {opt.label[language]}
                </option>
              ))}
            </select>
          </div>

          {/* Settings & Minimize */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-amber-400 transition-colors p-1"
              title={language === 'zh' ? '最小化' : 'Minimize'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Log Content */}
        <div
          ref={scrollRef}
          className="h-64 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-amber-900/50 scrollbar-track-transparent"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              {language === 'zh' ? '暂无日志...' : 'No logs...'}
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={index} className="text-sm leading-relaxed">
                <span className={`${LOG_TYPE_COLORS[log.type]}`}>
                  {LOG_TYPE_LABELS[log.type][language]}:
                </span>
                {' '}
                <span className="text-gray-300">{log.message}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer - Global label */}
        <div className="flex items-center px-3 py-1.5 border-t border-amber-900/30 bg-black/50">
          <span className="text-gray-500 text-xs">
            {language === 'zh' ? '全局' : 'Global'}
          </span>
          <svg className="w-3 h-3 text-gray-500 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

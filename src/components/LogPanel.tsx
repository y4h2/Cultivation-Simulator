import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';
import { formatTimeDetailed } from '../utils/time';
import type { GameLog } from '../types/game';

export const LogPanel: React.FC = () => {
  const { state } = useGame();
  const { logs } = state;
  const { t, language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const LOG_TYPE_COLORS: Record<GameLog['type'], string> = {
    cultivation: 'text-cyan-400',
    market: 'text-yellow-400',
    combat: 'text-red-400',
    event: 'text-purple-400',
    system: 'text-gray-400',
  };

  const LOG_TYPE_LABELS: Record<GameLog['type'], { zh: string; en: string }> = {
    cultivation: { zh: '修炼', en: 'Cultivation' },
    market: { zh: '交易', en: 'Trade' },
    combat: { zh: '战斗', en: 'Combat' },
    event: { zh: '事件', en: 'Event' },
    system: { zh: '系统', en: 'System' },
  };

  // Auto-scroll to bottom when new logs appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-6">
      <h2 className="text-xl font-bold text-amber-400 mb-4">{t.log.title}</h2>

      <div
        ref={scrollRef}
        className="h-64 overflow-y-auto space-y-2 pr-2"
      >
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">{t.log.empty}</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="p-2 bg-gray-800/30 rounded text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-500 text-xs">
                  {formatTimeDetailed(log.timestamp, language)}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${LOG_TYPE_COLORS[log.type]} bg-gray-800`}
                >
                  {LOG_TYPE_LABELS[log.type][language]}
                </span>
              </div>
              <div className="text-gray-300">{log.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

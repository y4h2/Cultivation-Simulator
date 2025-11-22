import React from 'react';
import type { EventNewsEntry } from '../types/worldEvent';
import {
  getEventById,
  getSourceName,
} from '../constants/worldEvents';

interface EventNewsModalProps {
  news: EventNewsEntry[];
  filter: 'all' | 'unread';
  onFilterChange: (filter: 'all' | 'unread') => void;
  onClose: () => void;
  isZh: boolean;
}

export const EventNewsModal: React.FC<EventNewsModalProps> = ({
  news,
  filter,
  onFilterChange,
  onClose,
  isZh,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-gray-600"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-amber-400">
            {isZh ? '天下情报' : 'World Intel'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isZh ? '全部' : 'All'}
          </button>
          <button
            onClick={() => onFilterChange('unread')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isZh ? '未读' : 'Unread'}
          </button>
        </div>

        {/* News List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {news.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 opacity-50">
                <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-gray-400">
                {isZh ? '暂无情报' : 'No intel available'}
              </p>
            </div>
          ) : (
            news.map(newsEntry => (
              <NewsCard key={newsEntry.id} news={newsEntry} isZh={isZh} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            {isZh
              ? '情报来源不同，可靠性也各异。天机阁情报最为准确，但需付费。'
              : 'Intel reliability varies by source. Tianji Oracle is most accurate but requires payment.'}
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// News Card Component
// ============================================

interface NewsCardProps {
  news: EventNewsEntry;
  isZh: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, isZh }) => {
  const eventDef = getEventById(news.eventId);
  const sourceName = getSourceName(news.source, isZh);
  const reliability = news.reliability;

  // Get reliability color
  const getReliabilityColor = (rel: number): string => {
    if (rel >= 90) return 'text-green-400';
    if (rel >= 70) return 'text-yellow-400';
    if (rel >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  // Get source icon
  const getSourceIcon = (source: string): string => {
    switch (source) {
      case 'rumor':
        return 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z';
      case 'sect_notice':
        return 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z';
      case 'tianji':
        return 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z';
      case 'black_market':
        return 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  };

  // Format timestamp
  const formatTimestamp = (time: typeof news.timestamp): string => {
    if (isZh) {
      return `${time.year}年${time.month}月${time.day}日`;
    }
    return `Year ${time.year}, Month ${time.month}, Day ${time.day}`;
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        news.isRead
          ? 'bg-gray-900/30 border-gray-700/50'
          : 'bg-gray-900/70 border-amber-700/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getSourceIcon(news.source)} />
          </svg>
          <span className="text-sm font-medium text-amber-300">{sourceName}</span>
          {!news.isRead && (
            <span className="px-1.5 py-0.5 bg-amber-600 text-white text-xs rounded">
              {isZh ? '新' : 'NEW'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={getReliabilityColor(reliability)}>
            {reliability}% {isZh ? '可信' : 'reliable'}
          </span>
          {news.cost && (
            <span className="text-yellow-400">
              {news.cost} {isZh ? '灵石' : 'stones'}
            </span>
          )}
        </div>
      </div>

      {/* Event Reference */}
      {eventDef && (
        <div className="text-xs text-gray-500 mb-2">
          {isZh ? '相关事件: ' : 'Related Event: '}
          <span className="text-gray-400">
            {isZh ? eventDef.chineseName : eventDef.name}
          </span>
        </div>
      )}

      {/* Message */}
      <p className="text-sm text-gray-200 leading-relaxed">
        {isZh ? news.chineseMessage : news.message}
      </p>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{formatTimestamp(news.timestamp)}</span>
        <ReliabilityBar reliability={reliability} />
      </div>
    </div>
  );
};

// ============================================
// Reliability Bar Component
// ============================================

interface ReliabilityBarProps {
  reliability: number;
}

const ReliabilityBar: React.FC<ReliabilityBarProps> = ({ reliability }) => {
  const getBarColor = (rel: number): string => {
    if (rel >= 90) return 'bg-green-500';
    if (rel >= 70) return 'bg-yellow-500';
    if (rel >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-1">
      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor(reliability)} transition-all`}
          style={{ width: `${reliability}%` }}
        />
      </div>
    </div>
  );
};

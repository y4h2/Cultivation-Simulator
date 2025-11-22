import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';
import type { ActiveWorldEvent } from '../types/worldEvent';
import {
  getEventById,
  getScopeName,
  getCategoryName,
  getRegionName,
  getScopeColor,
  getCategoryColor,
  getPhaseProgress,
  getTotalProgress,
  formatDaysRemaining,
  computeEventModifiers,
} from '../constants/worldEvents';
import { EventNewsModal } from './EventNewsModal';

export const WorldEventPanel: React.FC = () => {
  const { state } = useGame();
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsFilter, setNewsFilter] = useState<'all' | 'unread'>('all');

  // Get world event state from game state
  const worldEvents = state.worldEvents;

  // Compute active modifiers
  const modifiers = useMemo(() => {
    if (!worldEvents) return null;
    return computeEventModifiers(worldEvents.activeEvents);
  }, [worldEvents?.activeEvents]);

  // Filter news based on filter setting
  const filteredNews = useMemo(() => {
    if (!worldEvents) return [];
    const news = worldEvents.eventNews || [];
    if (newsFilter === 'unread') {
      return news.filter(n => !n.isRead);
    }
    return news;
  }, [worldEvents?.eventNews, newsFilter]);

  // Empty state - no world events system yet
  if (!worldEvents || worldEvents.activeEvents.length === 0) {
    return (
      <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-amber-400 mb-4">
          {isZh ? '天下大势' : 'World Events'}
        </h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">
            <svg className="w-24 h-24 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg">
            {isZh ? '天下太平，暂无大事' : 'The world is at peace. No major events.'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {isZh ? '继续修炼，等待风云变幻...' : 'Continue cultivating, await changes...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-amber-400">
          {isZh ? '天下大势' : 'World Events'}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {isZh ? '活动事件: ' : 'Active: '}{worldEvents.activeEvents.length}
          </span>
          <button
            onClick={() => setShowNewsModal(true)}
            className="px-3 py-1 bg-amber-900/50 hover:bg-amber-800/50 text-amber-400 rounded-lg text-sm transition-colors"
          >
            {isZh ? '情报' : 'Intel'} ({filteredNews.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Events List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">
            {isZh ? '进行中的事件' : 'Active Events'}
          </h3>
          {worldEvents.activeEvents.map(activeEvent => (
            <ActiveEventCard
              key={activeEvent.definitionId}
              activeEvent={activeEvent}
              isSelected={selectedEventId === activeEvent.definitionId}
              onClick={() => setSelectedEventId(
                selectedEventId === activeEvent.definitionId ? null : activeEvent.definitionId
              )}
              isZh={isZh}
            />
          ))}
        </div>

        {/* Event Details / Effects Summary */}
        <div className="space-y-4">
          {selectedEventId ? (
            <EventDetails
              eventId={selectedEventId}
              activeEvent={worldEvents.activeEvents.find(e => e.definitionId === selectedEventId)}
              isZh={isZh}
            />
          ) : (
            <EffectsSummary modifiers={modifiers} isZh={isZh} />
          )}
        </div>
      </div>

      {/* News Modal */}
      {showNewsModal && (
        <EventNewsModal
          news={filteredNews}
          filter={newsFilter}
          onFilterChange={setNewsFilter}
          onClose={() => setShowNewsModal(false)}
          isZh={isZh}
        />
      )}
    </div>
  );
};

// ============================================
// Active Event Card Component
// ============================================

interface ActiveEventCardProps {
  activeEvent: ActiveWorldEvent;
  isSelected: boolean;
  onClick: () => void;
  isZh: boolean;
}

const ActiveEventCard: React.FC<ActiveEventCardProps> = ({
  activeEvent,
  isSelected,
  onClick,
  isZh,
}) => {
  const eventDef = getEventById(activeEvent.definitionId);
  if (!eventDef) return null;

  const currentPhase = eventDef.phases[activeEvent.currentPhaseIndex];
  const scopeColor = getScopeColor(eventDef.scope);
  const categoryColor = getCategoryColor(eventDef.category);
  const progress = getTotalProgress(activeEvent, eventDef);

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
        isSelected
          ? 'border-amber-500 bg-amber-900/30'
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white truncate">
              {isZh ? eventDef.chineseName : eventDef.name}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${scopeColor}20`, color: scopeColor }}
            >
              {getScopeName(eventDef.scope, isZh)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <span style={{ color: categoryColor }}>
              {getCategoryName(eventDef.category, isZh)}
            </span>
            <span>|</span>
            <span>{getRegionName(eventDef.region, isZh)}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-gray-400">
            {isZh ? '剩余' : 'Left'}
          </div>
          <div className="text-sm font-medium text-amber-400">
            {formatDaysRemaining(activeEvent.totalDaysRemaining, isZh)}
          </div>
        </div>
      </div>

      {/* Current Phase */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-gray-500">
          {isZh ? '阶段: ' : 'Phase: '}
        </span>
        <span className="text-xs text-amber-300">
          {currentPhase ? (isZh ? currentPhase.chineseName : currentPhase.name) : '-'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Discovery indicator */}
      {!activeEvent.isDiscovered && (
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{isZh ? '尚未发现详情' : 'Details unknown'}</span>
        </div>
      )}
    </button>
  );
};

// ============================================
// Event Details Component
// ============================================

interface EventDetailsProps {
  eventId: string;
  activeEvent?: ActiveWorldEvent;
  isZh: boolean;
}

const EventDetails: React.FC<EventDetailsProps> = ({ eventId, activeEvent, isZh }) => {
  const eventDef = getEventById(eventId);
  if (!eventDef || !activeEvent) return null;

  const currentPhase = eventDef.phases[activeEvent.currentPhaseIndex];
  const phaseProgress = getPhaseProgress(activeEvent, eventDef);

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white">
          {isZh ? eventDef.chineseName : eventDef.name}
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          {isZh ? eventDef.chineseDescription : eventDef.description}
        </p>
      </div>

      {/* Phase Timeline */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-2">
          {isZh ? '事件进程' : 'Event Progress'}
        </h4>
        <div className="space-y-2">
          {eventDef.phases.map((phase, index) => {
            const isCurrentPhase = index === activeEvent.currentPhaseIndex;
            const isPastPhase = index < activeEvent.currentPhaseIndex;

            return (
              <div
                key={phase.id}
                className={`flex items-center gap-2 p-2 rounded ${
                  isCurrentPhase
                    ? 'bg-amber-900/30 border border-amber-700/50'
                    : isPastPhase
                    ? 'bg-gray-700/30 opacity-60'
                    : 'bg-gray-900/30 opacity-40'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isCurrentPhase
                      ? 'bg-amber-400'
                      : isPastPhase
                      ? 'bg-green-500'
                      : 'bg-gray-600'
                  }`}
                />
                <span className="text-sm text-white flex-1">
                  {isZh ? phase.chineseName : phase.name}
                </span>
                <span className="text-xs text-gray-400">
                  {phase.durationDays} {isZh ? '天' : 'days'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Phase Progress */}
      {currentPhase && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">
              {isZh ? '当前阶段进度' : 'Current Phase Progress'}
            </span>
            <span className="text-xs text-amber-400">
              {activeEvent.phaseDaysRemaining} {isZh ? '天剩余' : 'days left'}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
              style={{ width: `${phaseProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Active Effects */}
      {activeEvent.effects.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2">
            {isZh ? '当前效果' : 'Active Effects'}
          </h4>
          <div className="space-y-1">
            {activeEvent.effects.map((effect, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs bg-gray-900/50 rounded p-2"
              >
                <span className="text-gray-400">
                  {effect.target} ({effect.effectType})
                </span>
                <span className={effect.value >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {effect.value >= 0 ? '+' : ''}{effect.value}{effect.isPercentage ? '%' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// Effects Summary Component
// ============================================

interface EffectsSummaryProps {
  modifiers: ReturnType<typeof computeEventModifiers> | null;
  isZh: boolean;
}

const EffectsSummary: React.FC<EffectsSummaryProps> = ({ modifiers, isZh }) => {
  if (!modifiers) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">
          {isZh ? '世界效果总览' : 'World Effects Overview'}
        </h3>
        <p className="text-sm text-gray-500">
          {isZh ? '点击事件查看详情' : 'Click an event to view details'}
        </p>
      </div>
    );
  }

  const priceEffects = Object.entries(modifiers.priceModifiers).filter(([, v]) => v !== 0);
  const encounterEffects = Object.entries(modifiers.encounterRateModifiers).filter(([, v]) => v !== 0);
  const dropEffects = Object.entries(modifiers.dropRateBonus).filter(([, v]) => v !== 0);
  const elementEffects = Object.entries(modifiers.elementDamageBonus).filter(([, v]) => v !== 0);

  const hasAnyEffects =
    priceEffects.length > 0 ||
    encounterEffects.length > 0 ||
    dropEffects.length > 0 ||
    elementEffects.length > 0 ||
    modifiers.cultivationBonus !== 0 ||
    modifiers.captureRateBonus !== 0;

  if (!hasAnyEffects) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">
          {isZh ? '世界效果总览' : 'World Effects Overview'}
        </h3>
        <p className="text-sm text-gray-500">
          {isZh ? '当前无活动效果' : 'No active effects'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-300">
        {isZh ? '世界效果总览' : 'World Effects Overview'}
      </h3>

      {/* Price Modifiers */}
      {priceEffects.length > 0 && (
        <EffectCategory
          title={isZh ? '价格变动' : 'Price Changes'}
          effects={priceEffects}
          suffix="%"
          color="text-yellow-400"
        />
      )}

      {/* Encounter Rate */}
      {encounterEffects.length > 0 && (
        <EffectCategory
          title={isZh ? '遭遇率' : 'Encounter Rates'}
          effects={encounterEffects}
          suffix="%"
          color="text-red-400"
        />
      )}

      {/* Drop Rates */}
      {dropEffects.length > 0 && (
        <EffectCategory
          title={isZh ? '掉落率' : 'Drop Rates'}
          effects={dropEffects}
          suffix="%"
          color="text-blue-400"
        />
      )}

      {/* Element Damage */}
      {elementEffects.length > 0 && (
        <EffectCategory
          title={isZh ? '元素伤害' : 'Element Damage'}
          effects={elementEffects}
          suffix="%"
          color="text-purple-400"
        />
      )}

      {/* Single Value Effects */}
      {(modifiers.cultivationBonus !== 0 || modifiers.captureRateBonus !== 0) && (
        <div>
          <div className="text-xs font-medium text-green-400 mb-1">
            {isZh ? '其他效果' : 'Other Effects'}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {modifiers.cultivationBonus !== 0 && (
              <div className="flex justify-between text-xs bg-gray-900/50 rounded p-2">
                <span className="text-gray-400">{isZh ? '修炼效率' : 'Cultivation'}</span>
                <span className={modifiers.cultivationBonus >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {modifiers.cultivationBonus >= 0 ? '+' : ''}{modifiers.cultivationBonus}%
                </span>
              </div>
            )}
            {modifiers.captureRateBonus !== 0 && (
              <div className="flex justify-between text-xs bg-gray-900/50 rounded p-2">
                <span className="text-gray-400">{isZh ? '捕获率' : 'Capture Rate'}</span>
                <span className={modifiers.captureRateBonus >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {modifiers.captureRateBonus >= 0 ? '+' : ''}{modifiers.captureRateBonus}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unlocked Areas */}
      {modifiers.unlockedAreas.length > 0 && (
        <div>
          <div className="text-xs font-medium text-cyan-400 mb-1">
            {isZh ? '开放区域' : 'Unlocked Areas'}
          </div>
          <div className="flex flex-wrap gap-1">
            {modifiers.unlockedAreas.map(area => (
              <span
                key={area}
                className="px-2 py-0.5 bg-cyan-900/30 text-cyan-300 rounded text-xs"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// Effect Category Component
// ============================================

interface EffectCategoryProps {
  title: string;
  effects: [string, number][];
  suffix: string;
  color: string;
}

const EffectCategory: React.FC<EffectCategoryProps> = ({ title, effects, suffix, color }) => (
  <div>
    <div className={`text-xs font-medium ${color} mb-1`}>{title}</div>
    <div className="grid grid-cols-2 gap-1">
      {effects.map(([key, value]) => (
        <div key={key} className="flex justify-between text-xs bg-gray-900/50 rounded p-2">
          <span className="text-gray-400 truncate">{key}</span>
          <span className={value >= 0 ? 'text-green-400' : 'text-red-400'}>
            {value >= 0 ? '+' : ''}{value}{suffix}
          </span>
        </div>
      ))}
    </div>
  </div>
);

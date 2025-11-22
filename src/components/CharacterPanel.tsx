import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';
import { ActivityType } from '../types/game';
import type { Realm } from '../types/game';

export const CharacterPanel: React.FC = () => {
  const { state, actions } = useGame();
  const { character } = state;
  const { t } = useLanguage();
  const [showSecondaryStats, setShowSecondaryStats] = useState(false);

  const cultivationProgress = (character.cultivationValue / character.cultivationMax) * 100;
  const canBreakthrough = character.cultivationValue >= character.cultivationMax;

  const activityValues = Object.values(ActivityType) as Array<typeof ActivityType[keyof typeof ActivityType]>;

  const getRealmName = (realm: Realm): string => {
    const realmKeys: Record<Realm, keyof typeof t.realms> = {
      qi_refining: 'qiRefining',
      foundation: 'foundation',
      core_formation: 'coreFormation',
      nascent_soul: 'nascentSoul',
      spirit_transformation: 'spiritTransformation',
      void_refining: 'voidRefining',
      body_integration: 'bodyIntegration',
      mahayana: 'mahayana',
      tribulation: 'tribulation',
    };
    return t.realms[realmKeys[realm]];
  };

  const getStageDisplay = (realm: Realm, stage: number): string => {
    if (realm === 'qi_refining') {
      return t.stages.layer.replace('{realm}', getRealmName(realm)).replace('{n}', String(stage));
    }
    const stageNames = [t.stages.early, t.stages.mid, t.stages.late, t.stages.peak];
    return `${getRealmName(realm)} ${stageNames[stage - 1] || ''}`;
  };

  return (
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-3 sm:p-4 md:p-6">
      {/* Character Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-amber-400 mb-1">{character.name}</h2>
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg text-amber-300">
            {getStageDisplay(character.realm, character.realmStage)}
          </span>
        </div>
      </div>

      {/* Cultivation Progress */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300 text-sm sm:text-base">{t.character.cultivationProgress}</span>
        </div>
        <button
          onClick={canBreakthrough ? actions.attemptBreakthrough : undefined}
          disabled={!canBreakthrough}
          className={`relative w-full h-7 sm:h-8 rounded-full overflow-hidden transition-all ${
            canBreakthrough
              ? 'cursor-pointer hover:ring-2 hover:ring-amber-400 hover:ring-offset-2 hover:ring-offset-gray-900'
              : 'cursor-default'
          }`}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gray-800" />
          {/* Progress fill */}
          <div
            className={`absolute inset-y-0 left-0 transition-all duration-300 ${
              canBreakthrough
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 animate-pulse'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500'
            }`}
            style={{ width: `${Math.min(100, cultivationProgress)}%` }}
          />
          {/* Text content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {canBreakthrough ? (
              <span className="text-white text-xs sm:text-sm font-bold drop-shadow-md">
                {t.character.attemptBreakthrough}
              </span>
            ) : (
              <span className="text-white text-xs sm:text-sm font-medium drop-shadow-md">
                {character.cultivationValue.toLocaleString()} / {character.cultivationMax.toLocaleString()}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Stats Section */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-200">{t.character.attributes}</h3>
          <button
            onClick={() => setShowSecondaryStats(!showSecondaryStats)}
            className={`p-1.5 sm:p-2 rounded-lg transition-all ${
              showSecondaryStats
                ? 'bg-amber-600/50 text-amber-300'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
            }`}
            title={t.common.otherStats}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Primary Stats - Always visible: HP, SP */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* HP */}
          <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
            <div className="flex justify-between text-xs sm:text-sm mb-1">
              <span className="text-red-400">{t.stats.hp}</span>
              <span className="text-gray-300">
                {character.stats.hp}/{character.stats.maxHp}
              </span>
            </div>
            <div className="h-1.5 sm:h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500"
                style={{ width: `${(character.stats.hp / character.stats.maxHp) * 100}%` }}
              />
            </div>
          </div>

          {/* Spiritual Power */}
          <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
            <div className="flex justify-between text-xs sm:text-sm mb-1">
              <span className="text-blue-400">{t.stats.spiritualPower}</span>
              <span className="text-gray-300">
                {character.stats.spiritualPower}/{character.stats.maxSpiritualPower}
              </span>
            </div>
            <div className="h-1.5 sm:h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${(character.stats.spiritualPower / character.stats.maxSpiritualPower) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Secondary Stats - Collapsible */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showSecondaryStats ? 'max-h-[500px] opacity-100 mt-2 sm:mt-3' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <StatItem label={t.stats.divineSense} value={character.stats.divineSense} color="text-purple-400" />
            <StatItem label={t.stats.comprehension} value={character.stats.comprehension} color="text-green-400" />
            <StatItem label={t.stats.luck} value={character.stats.luck} color="text-yellow-400" />
            <StatItem label={t.stats.speed} value={character.stats.speed} color="text-cyan-400" />
            <StatItem label={t.stats.attack} value={character.stats.attack} color="text-red-400" />
            <StatItem label={t.stats.defense} value={character.stats.defense} color="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Current Activity */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-2 sm:mb-3">{t.character.currentActivity}</h3>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {activityValues.map((activity) => {
            const activityKeys: Record<string, keyof typeof t.activities> = {
              closed_door: 'closedDoor',
              market_station: 'marketStation',
              travel: 'travel',
              idle: 'idle',
            };
            const info = t.activities[activityKeys[activity]];
            const isActive = character.currentActivity === activity;
            const multipliers: Record<string, number> = {
              closed_door: 1.5,
              market_station: 0.5,
              travel: 0.8,
              idle: 0.3,
            };
            return (
              <button
                key={activity}
                onClick={() => actions.changeActivity(activity)}
                className={`p-2 sm:p-3 rounded-lg text-left transition-all min-h-[60px] sm:min-h-[auto] ${
                  isActive
                    ? 'bg-amber-900/50 border-2 border-amber-500'
                    : 'bg-gray-800/50 border-2 border-transparent hover:border-gray-600'
                }`}
              >
                <div className={`font-medium text-sm sm:text-base ${isActive ? 'text-amber-300' : 'text-gray-300'}`}>
                  {info.name}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                  {t.character.cultivationEfficiency}: {Math.round(multipliers[activity] * 100)}%
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface StatItemProps {
  label: string;
  value: number;
  color: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, color }) => (
  <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 flex justify-between items-center">
    <span className={`${color} text-xs sm:text-sm`}>{label}</span>
    <span className="text-gray-200 font-medium text-xs sm:text-sm">{value}</span>
  </div>
);

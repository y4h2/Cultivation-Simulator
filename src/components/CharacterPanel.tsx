import React from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';
import { ActivityType } from '../types/game';
import type { Realm } from '../types/game';

export const CharacterPanel: React.FC = () => {
  const { state, actions } = useGame();
  const { character } = state;
  const { t, language } = useLanguage();

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
      return language === 'zh'
        ? `${getRealmName(realm)}第${stage}层`
        : `${getRealmName(realm)} Layer ${stage}`;
    }
    const stageNames = [t.stages.early, t.stages.mid, t.stages.late, t.stages.peak];
    return `${getRealmName(realm)} ${stageNames[stage - 1] || ''}`;
  };

  return (
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-6">
      {/* Character Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-amber-400 mb-1">{character.name}</h2>
        <div className="flex items-center gap-2">
          <span className="text-lg text-amber-300">
            {getStageDisplay(character.realm, character.realmStage)}
          </span>
        </div>
      </div>

      {/* Cultivation Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">{t.character.cultivationProgress}</span>
          <span className="text-amber-300">
            {character.cultivationValue.toLocaleString()} / {character.cultivationMax.toLocaleString()}
          </span>
        </div>
        <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              canBreakthrough
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 animate-pulse'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500'
            }`}
            style={{ width: `${Math.min(100, cultivationProgress)}%` }}
          />
        </div>
        {canBreakthrough && (
          <button
            onClick={actions.attemptBreakthrough}
            className="mt-3 w-full py-2 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-amber-900/50"
          >
            {t.character.attemptBreakthrough}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-3">{t.character.attributes}</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* HP */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-red-400">{t.stats.hp}</span>
              <span className="text-gray-300">
                {character.stats.hp}/{character.stats.maxHp}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500"
                style={{ width: `${(character.stats.hp / character.stats.maxHp) * 100}%` }}
              />
            </div>
          </div>

          {/* Spiritual Power */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-blue-400">{t.stats.spiritualPower}</span>
              <span className="text-gray-300">
                {character.stats.spiritualPower}/{character.stats.maxSpiritualPower}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${(character.stats.spiritualPower / character.stats.maxSpiritualPower) * 100}%` }}
              />
            </div>
          </div>

          {/* Other Stats */}
          <StatItem label={t.stats.divineSense} value={character.stats.divineSense} color="text-purple-400" />
          <StatItem label={t.stats.comprehension} value={character.stats.comprehension} color="text-green-400" />
          <StatItem label={t.stats.luck} value={character.stats.luck} color="text-yellow-400" />
          <StatItem label={t.stats.speed} value={character.stats.speed} color="text-cyan-400" />
          <StatItem label={t.stats.attack} value={character.stats.attack} color="text-red-400" />
          <StatItem label={t.stats.defense} value={character.stats.defense} color="text-gray-400" />
        </div>
      </div>

      {/* Current Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-3">{t.character.currentActivity}</h3>
        <div className="grid grid-cols-2 gap-2">
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
                className={`p-3 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-amber-900/50 border-2 border-amber-500'
                    : 'bg-gray-800/50 border-2 border-transparent hover:border-gray-600'
                }`}
              >
                <div className={`font-medium ${isActive ? 'text-amber-300' : 'text-gray-300'}`}>
                  {info.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
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
  <div className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center">
    <span className={color}>{label}</span>
    <span className="text-gray-200 font-medium">{value}</span>
  </div>
);

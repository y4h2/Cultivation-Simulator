import React, { useState, useMemo, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';
import type {
  BeastTier,
  BeastMood,
  BeastPersonality,
  SpiritBeastRole,
} from '../types/game';
import {
  getTemplateById,
  getRarityColor,
  getMoodColor,
  getTierColor,
  TRAIT_INFO,
} from '../constants/spiritBeasts';
import { canAttemptBreakthrough } from '../utils/spiritBeast';

export const SpiritBeastPanel: React.FC = () => {
  const { state, actions } = useGame();
  const { t, language } = useLanguage();
  const { spiritBeasts } = state.character;
  const isZh = language === 'zh';

  const [selectedBeastId, setSelectedBeastId] = useState<string | null>(
    spiritBeasts.beasts.length > 0 ? spiritBeasts.beasts[0].id : null
  );
  const [showFeedModal, setShowFeedModal] = useState(false);

  const selectedBeast = useMemo(() => {
    if (!selectedBeastId) return null;
    return spiritBeasts.beasts.find(b => b.id === selectedBeastId) || null;
  }, [selectedBeastId, spiritBeasts.beasts]);

  const selectedTemplate = useMemo(() => {
    if (!selectedBeast) return null;
    return getTemplateById(selectedBeast.templateId);
  }, [selectedBeast]);

  // Helper functions for display
  const getTierName = (tier: BeastTier): string => {
    return t.spiritBeast.tiers[tier as keyof typeof t.spiritBeast.tiers];
  };

  const getMoodName = (mood: BeastMood): string => {
    return t.spiritBeast.moods[mood as keyof typeof t.spiritBeast.moods];
  };

  const getPersonalityName = (personality: BeastPersonality): string => {
    return t.spiritBeast.personalities[personality as keyof typeof t.spiritBeast.personalities];
  };

  const getRoleName = (role: SpiritBeastRole): string => {
    return t.spiritBeast.roles[role as keyof typeof t.spiritBeast.roles];
  };

  const getElementName = (element: string): string => {
    const elementMap: Record<string, string> = isZh
      ? { fire: '火', water: '水', wood: '木', metal: '金', earth: '土' }
      : { fire: 'Fire', water: 'Water', wood: 'Wood', metal: 'Metal', earth: 'Earth' };
    return elementMap[element] || element;
  };

  const handleSetActive = useCallback(() => {
    if (selectedBeast) {
      if (selectedBeast.isActive) {
        actions.setActiveBeast(null);
      } else {
        actions.setActiveBeast(selectedBeast.id);
      }
    }
  }, [selectedBeast, actions]);

  const handleFeed = useCallback((feedItemId: string) => {
    if (selectedBeast) {
      actions.feedBeast(selectedBeast.id, feedItemId);
      setShowFeedModal(false);
    }
  }, [selectedBeast, actions]);

  const handleTrain = useCallback(() => {
    if (selectedBeast) {
      actions.trainBeast(selectedBeast.id, 2); // Normal training intensity
    }
  }, [selectedBeast, actions]);

  const handleBreakthrough = useCallback(() => {
    if (selectedBeast) {
      actions.beastBreakthrough(selectedBeast.id);
    }
  }, [selectedBeast, actions]);

  const breakthroughStatus = useMemo(() => {
    if (!selectedBeast) return { canBreakthrough: false };
    return canAttemptBreakthrough(selectedBeast);
  }, [selectedBeast]);

  // Render empty state
  if (spiritBeasts.beasts.length === 0) {
    return (
      <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-amber-400 mb-4">{t.spiritBeast.title}</h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">
            <svg className="w-24 h-24 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg">{t.spiritBeast.empty}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-3 sm:p-4 md:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-amber-400 mb-4">{t.spiritBeast.title}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Beast Collection Grid */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">
            {t.spiritBeast.collection} ({spiritBeasts.beasts.length}/{spiritBeasts.maxSlots})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
            {spiritBeasts.beasts.map(beast => {
              const template = getTemplateById(beast.templateId);
              if (!template) return null;

              const isSelected = selectedBeastId === beast.id;
              const rarityColor = getRarityColor(template.rarity);
              const moodColor = getMoodColor(beast.mood);

              return (
                <button
                  key={beast.id}
                  onClick={() => setSelectedBeastId(beast.id)}
                  className={`relative p-2 sm:p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-amber-500 bg-amber-900/30'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  {/* Active indicator */}
                  {beast.isActive && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
                  )}

                  {/* Rarity indicator */}
                  <div
                    className="text-xs font-bold mb-1"
                    style={{ color: rarityColor }}
                  >
                    {template.rarity}
                  </div>

                  {/* Beast name */}
                  <div className="text-sm font-medium text-white truncate">
                    {beast.nickname || (isZh ? template.chineseName : template.name)}
                  </div>

                  {/* Level and tier */}
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-400">Lv.{beast.level}</span>
                    <span
                      className="text-xs px-1 rounded"
                      style={{ backgroundColor: getTierColor(beast.tier), color: 'white' }}
                    >
                      {getTierName(beast.tier)}
                    </span>
                  </div>

                  {/* Mood indicator */}
                  <div className="flex items-center gap-1 mt-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: moodColor }}
                    />
                    <span className="text-xs text-gray-500">{getMoodName(beast.mood)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Beast Details */}
        <div className="lg:col-span-2">
          {selectedBeast && selectedTemplate ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedBeast.nickname || (isZh ? selectedTemplate.chineseName : selectedTemplate.name)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span
                      className="text-sm font-bold px-2 py-0.5 rounded"
                      style={{ color: getRarityColor(selectedTemplate.rarity) }}
                    >
                      {selectedTemplate.rarity}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: getTierColor(selectedBeast.tier) }}
                    >
                      {getTierName(selectedBeast.tier)}
                    </span>
                    <span className="text-sm text-gray-400">
                      {getElementName(selectedTemplate.element)} | {getRoleName(selectedTemplate.role)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSetActive}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedBeast.isActive
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {selectedBeast.isActive ? t.spiritBeast.removeActive : t.spiritBeast.setActive}
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-400">
                {isZh ? selectedTemplate.chineseDescription : selectedTemplate.description}
              </p>

              {/* Level and EXP Bar */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">
                    {t.spiritBeast.level} {selectedBeast.level}
                  </span>
                  <span className="text-xs text-gray-500">
                    {t.spiritBeast.exp}: {selectedBeast.exp} / {selectedBeast.expToNextLevel}
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300"
                    style={{
                      width: selectedBeast.expToNextLevel > 0
                        ? `${(selectedBeast.exp / selectedBeast.expToNextLevel) * 100}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">{t.spiritBeast.stats}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <StatItem label="HP" value={selectedBeast.currentStats.hp} color="text-red-400" />
                  <StatItem label="ATK" value={selectedBeast.currentStats.atk} color="text-orange-400" />
                  <StatItem label="DEF" value={selectedBeast.currentStats.def} color="text-blue-400" />
                  <StatItem label="SPD" value={selectedBeast.currentStats.spd} color="text-cyan-400" />
                  <StatItem label="WIS" value={selectedBeast.currentStats.wis} color="text-purple-400" />
                  <StatItem label="SENSE" value={selectedBeast.currentStats.sense} color="text-yellow-400" />
                </div>
              </div>

              {/* Affinity and Mood */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">{t.spiritBeast.affinity}</span>
                    <span className="text-sm text-pink-400">{selectedBeast.affinity}/100</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-600 to-red-400 transition-all"
                      style={{ width: `${selectedBeast.affinity}%` }}
                    />
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{t.spiritBeast.mood}</span>
                    <span
                      className="text-sm font-medium px-2 py-0.5 rounded"
                      style={{ color: getMoodColor(selectedBeast.mood) }}
                    >
                      {getMoodName(selectedBeast.mood)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {t.spiritBeast.personality}: {getPersonalityName(selectedBeast.personality)}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">{t.spiritBeast.skills}</h4>
                <div className="space-y-2">
                  {selectedBeast.skills.map(skill => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between bg-gray-900/50 rounded p-2"
                    >
                      <div>
                        <div className="text-sm text-white font-medium">
                          {isZh ? skill.chineseName : skill.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isZh ? skill.chineseDescription : skill.description}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        MP: {skill.costMp} | CD: {skill.cooldown}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traits */}
              {selectedTemplate.traits.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">{t.spiritBeast.traits}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.traits.map(traitId => {
                      const trait = TRAIT_INFO[traitId];
                      if (!trait) return null;
                      return (
                        <div
                          key={traitId}
                          className="px-2 py-1 bg-amber-900/30 text-amber-300 rounded text-xs"
                          title={isZh ? trait.chineseDescription : trait.description}
                        >
                          {isZh ? trait.chineseName : trait.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowFeedModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-all"
                >
                  {t.spiritBeast.feed}
                </button>
                <button
                  onClick={handleTrain}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all"
                >
                  {t.spiritBeast.train}
                </button>
                <button
                  onClick={handleBreakthrough}
                  disabled={!breakthroughStatus.canBreakthrough}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    breakthroughStatus.canBreakthrough
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                  title={breakthroughStatus.canBreakthrough ? '' : (isZh ? breakthroughStatus.reasonChinese : breakthroughStatus.reason)}
                >
                  {t.spiritBeast.breakthrough}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isZh ? '选择一只灵兽查看详情' : 'Select a beast to view details'}
            </div>
          )}
        </div>
      </div>

      {/* Feed Modal */}
      {showFeedModal && selectedBeast && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setShowFeedModal(false)}
        >
          <div
            className="bg-gray-800 rounded-xl p-4 sm:p-6 max-w-sm mx-4 border border-gray-600"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-amber-400 mb-4">
              {t.spiritBeast.feed}
            </h3>
            <div className="space-y-2">
              {/* Feed items from inventory */}
              {state.character.inventory.items
                .filter(item => ['spirit_grass', 'spirit_fruit', 'rare_material'].includes(item.itemId))
                .map(item => (
                  <button
                    key={item.itemId}
                    onClick={() => handleFeed(item.itemId)}
                    className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white">
                        {isZh ? (item.itemId === 'spirit_grass' ? '灵草' : item.itemId === 'spirit_fruit' ? '灵果' : '珍稀材料') : item.itemId.replace('_', ' ')}
                      </span>
                      <span className="text-gray-400">x{item.quantity}</span>
                    </div>
                  </button>
                ))}
              {state.character.inventory.items.filter(item =>
                ['spirit_grass', 'spirit_fruit', 'rare_material'].includes(item.itemId)
              ).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  {isZh ? '没有可用的喂养物品' : 'No feed items available'}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowFeedModal(false)}
              className="mt-4 w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {isZh ? '取消' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat item component
interface StatItemProps {
  label: string;
  value: number;
  color: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, color }) => (
  <div className="flex justify-between items-center bg-gray-900/50 rounded p-2">
    <span className={`text-xs ${color}`}>{label}</span>
    <span className="text-sm text-white font-medium">{value}</span>
  </div>
);

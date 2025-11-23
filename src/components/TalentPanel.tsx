import React, { useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';
import type { TalentDefinition, TalentType } from '../types/talent';
import {
  getTalentById,
  getRarityColor,
  getTalentTypeColor,
  getScopeName,
  computeTalentBonuses,
} from '../constants/talents';

// Refresh talent cost in spirit stones
const REFRESH_TALENT_COST = 1000;

export const TalentPanel: React.FC = () => {
  const { state, actions } = useGame();
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);

  const { talents } = state.character;
  const spiritStones = state.character.spiritStones;

  // Compute current bonuses
  const bonuses = useMemo(() => computeTalentBonuses(talents), [talents]);

  // Check if can afford refresh
  const canRefresh = spiritStones >= REFRESH_TALENT_COST;

  // Handle refresh talents
  const handleRefreshTalents = () => {
    if (canRefresh) {
      actions.refreshTalents(REFRESH_TALENT_COST);
      setShowRefreshConfirm(false);
    }
  };

  // Get all talent details
  const majorTalentDetails = useMemo(() =>
    talents.majorTalents.map(t => ({
      ...t,
      definition: getTalentById(t.talentId),
    })).filter(t => t.definition),
    [talents.majorTalents]
  );

  const minorTalentDetails = useMemo(() =>
    talents.minorTalents.map(t => ({
      ...t,
      definition: getTalentById(t.talentId),
    })).filter(t => t.definition),
    [talents.minorTalents]
  );

  const flawDetails = useMemo(() =>
    talents.flaws.map(t => ({
      ...t,
      definition: getTalentById(t.talentId),
    })).filter(t => t.definition),
    [talents.flaws]
  );

  // Empty state - offer to get random talents
  if (majorTalentDetails.length === 0 && minorTalentDetails.length === 0 && flawDetails.length === 0) {
    return (
      <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-amber-400 mb-4">
          {isZh ? '天赋系统' : 'Talent System'}
        </h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">
            <svg className="w-24 h-24 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg mb-4">
            {isZh ? '尚无天赋' : 'No talents yet'}
          </p>
          <button
            onClick={() => actions.refreshTalents(0)}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-all"
          >
            {isZh ? '获取随机天赋' : 'Get Random Talents'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-amber-400">
          {isZh ? '天赋系统' : 'Talent System'}
        </h2>
        <div className="text-sm text-gray-400">
          {isZh ? '灵石: ' : 'Spirit Stones: '}{spiritStones.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Talents List */}
        <div className="space-y-4">
          {/* Major Talents */}
          {majorTalentDetails.length > 0 && (
            <TalentSection
              title={isZh ? '先天气运' : 'Innate Destiny'}
              talents={majorTalentDetails}
              type="major"
              isZh={isZh}
            />
          )}

          {/* Minor Talents */}
          {minorTalentDetails.length > 0 && (
            <TalentSection
              title={isZh ? '后天悟性' : 'Acquired Insight'}
              talents={minorTalentDetails}
              type="minor"
              isZh={isZh}
            />
          )}

          {/* Flaws */}
          {flawDetails.length > 0 && (
            <TalentSection
              title={isZh ? '阴影缺陷' : 'Shadow Flaws'}
              talents={flawDetails}
              type="flaw"
              isZh={isZh}
            />
          )}
        </div>

        {/* Bonuses Summary */}
        <div className="space-y-4">
          <BonusesSummary bonuses={bonuses} isZh={isZh} />

          {/* Refresh Talents Section */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">
              {isZh ? '刷新天赋' : 'Refresh Talents'}
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              {isZh
                ? '消耗灵石重新随机天赋，将获得全新的天赋组合。'
                : 'Spend spirit stones to re-roll talents. You will get a completely new talent set.'}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">
                {isZh ? '费用: ' : 'Cost: '}{REFRESH_TALENT_COST.toLocaleString()} {isZh ? '灵石' : 'Spirit Stones'}
              </span>
              <button
                onClick={() => setShowRefreshConfirm(true)}
                disabled={!canRefresh}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  canRefresh
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isZh ? '刷新天赋' : 'Refresh'}
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {isZh ? '当前灵石: ' : 'Current Spirit Stones: '}{spiritStones.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Confirmation Modal */}
      {showRefreshConfirm && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setShowRefreshConfirm(false)}
        >
          <div
            className="bg-gray-800 rounded-xl p-4 sm:p-6 max-w-sm mx-4 border border-gray-600"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-cyan-400 mb-3">
              {isZh ? '确认刷新天赋' : 'Confirm Talent Refresh'}
            </h3>
            <p className="text-gray-300 text-sm mb-2">
              {isZh
                ? '确定要刷新天赋吗？当前所有天赋将被替换为新的随机天赋。'
                : 'Are you sure you want to refresh talents? All current talents will be replaced with new random ones.'}
            </p>
            <p className="text-amber-400 text-sm mb-4">
              {isZh ? '费用: ' : 'Cost: '}{REFRESH_TALENT_COST.toLocaleString()} {isZh ? '灵石' : 'Spirit Stones'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRefreshConfirm(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {isZh ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={handleRefreshTalents}
                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
              >
                {isZh ? '确认刷新' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Talent Section Component
interface TalentSectionProps {
  title: string;
  talents: Array<{
    talentId: string;
    acquiredAt: string;
    stacks?: number;
    definition: TalentDefinition | undefined;
  }>;
  type: TalentType;
  isZh: boolean;
}

const TalentSection: React.FC<TalentSectionProps> = ({ title, talents, type, isZh }) => {
  const typeColor = getTalentTypeColor(type);

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h3
        className="text-sm font-semibold mb-3"
        style={{ color: typeColor }}
      >
        {title} ({talents.length})
      </h3>
      <div className="space-y-2">
        {talents.map(({ talentId, stacks, definition }) => {
          if (!definition) return null;

          return (
            <TalentCard
              key={talentId}
              definition={definition}
              stacks={stacks}
              isZh={isZh}
            />
          );
        })}
      </div>
    </div>
  );
};

// Talent Card Component
interface TalentCardProps {
  definition: TalentDefinition;
  stacks?: number;
  isZh: boolean;
}

const TalentCard: React.FC<TalentCardProps> = ({ definition, stacks, isZh }) => {
  const rarityColor = getRarityColor(definition.rarity);
  const typeColor = getTalentTypeColor(definition.type);

  return (
    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white">
              {isZh ? definition.chineseName : definition.name}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${rarityColor}20`, color: rarityColor }}
            >
              {definition.rarity.toUpperCase()}
            </span>
            {stacks && stacks > 1 && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-400">
                x{stacks}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {isZh ? definition.chineseDescription : definition.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {definition.scopes.map(scope => (
              <span
                key={scope}
                className="text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-400"
              >
                {getScopeName(scope, isZh)}
              </span>
            ))}
          </div>
        </div>
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
          style={{ backgroundColor: typeColor }}
        />
      </div>
    </div>
  );
};

// Bonuses Summary Component
interface BonusesSummaryProps {
  bonuses: ReturnType<typeof computeTalentBonuses>;
  isZh: boolean;
}

const BonusesSummary: React.FC<BonusesSummaryProps> = ({ bonuses, isZh }) => {
  // Group non-zero bonuses by category
  const combatBonuses = [
    { label: isZh ? '伤害加成' : 'Damage Bonus', value: bonuses.damageBonus, suffix: '%' },
    { label: isZh ? '剑系伤害' : 'Sword Damage', value: bonuses.swordDamageBonus, suffix: '%' },
    { label: isZh ? '伤害减免' : 'Damage Reduction', value: bonuses.damageReduction, suffix: '%' },
    { label: isZh ? '暴击率' : 'Crit Rate', value: bonuses.critBonus, suffix: '%' },
    { label: isZh ? '暴击伤害' : 'Crit Damage', value: bonuses.critDamageBonus, suffix: '%' },
    { label: isZh ? '生命加成' : 'HP Bonus', value: bonuses.hpBonus, suffix: '%' },
    { label: isZh ? '气上限' : 'Qi Cap', value: bonuses.qiCapBonus, suffix: '' },
    { label: isZh ? '处决伤害' : 'Execute Damage', value: bonuses.executeDamageBonus, suffix: '%' },
    { label: isZh ? '低血护盾' : 'Low HP Shield', value: bonuses.shieldOnLowHpPercent, suffix: '%' },
  ].filter(b => b.value !== 0);

  const cultivationBonuses = [
    { label: isZh ? '修炼效率' : 'Cultivation Exp', value: bonuses.cultivationExpBonus, suffix: '%' },
    { label: isZh ? '战斗修为' : 'Combat Exp', value: bonuses.combatExpBonus, suffix: '%' },
    { label: isZh ? '闭关修炼' : 'Idle Exp', value: bonuses.idleExpBonus, suffix: '%' },
    { label: isZh ? '突破加成' : 'Breakthrough', value: bonuses.breakthroughBonus, suffix: '%' },
  ].filter(b => b.value !== 0);

  const marketBonuses = [
    { label: isZh ? '价格洞察' : 'Price Insight', value: bonuses.priceInsightLevel, suffix: '' },
    { label: isZh ? '交易利润' : 'Trade Profit', value: bonuses.tradeProfitBonus, suffix: '%' },
    { label: isZh ? '囤货加成' : 'Stockpile Bonus', value: bonuses.stockpileCombatBonus, suffix: '%' },
    { label: isZh ? '资产转修为' : 'Asset Exp', value: bonuses.assetExpRate, suffix: '%' },
  ].filter(b => b.value !== 0);

  const beastBonuses = [
    { label: isZh ? '捕获率' : 'Capture Rate', value: bonuses.captureRateBonus, suffix: '%' },
    { label: isZh ? '亲密上限' : 'Affinity Cap', value: bonuses.affinityCapBonus, suffix: '' },
    { label: isZh ? '遭遇率' : 'Encounter Rate', value: bonuses.beastEncounterBonus, suffix: '%' },
    { label: isZh ? '心情提升' : 'Mood Boost', value: bonuses.moodBoostBonus, suffix: '%' },
    { label: isZh ? '训练经验' : 'Training Exp', value: bonuses.beastTrainingExpBonus, suffix: '%' },
    { label: isZh ? '共战伤害' : 'Battle Bond', value: bonuses.beastCombatBonus, suffix: '%' },
  ].filter(b => b.value !== 0);

  const allEmpty = combatBonuses.length === 0 && cultivationBonuses.length === 0 &&
    marketBonuses.length === 0 && beastBonuses.length === 0;

  if (allEmpty) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-amber-400 mb-3">
          {isZh ? '当前加成' : 'Current Bonuses'}
        </h3>
        <p className="text-sm text-gray-500">
          {isZh ? '暂无加成效果' : 'No active bonuses'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-amber-400 mb-3">
        {isZh ? '当前加成' : 'Current Bonuses'}
      </h3>
      <div className="space-y-3">
        {combatBonuses.length > 0 && (
          <BonusCategory
            title={isZh ? '战斗' : 'Combat'}
            bonuses={combatBonuses}
            color="text-red-400"
          />
        )}
        {cultivationBonuses.length > 0 && (
          <BonusCategory
            title={isZh ? '修炼' : 'Cultivation'}
            bonuses={cultivationBonuses}
            color="text-blue-400"
          />
        )}
        {marketBonuses.length > 0 && (
          <BonusCategory
            title={isZh ? '商业' : 'Market'}
            bonuses={marketBonuses}
            color="text-yellow-400"
          />
        )}
        {beastBonuses.length > 0 && (
          <BonusCategory
            title={isZh ? '灵兽' : 'Beast'}
            bonuses={beastBonuses}
            color="text-green-400"
          />
        )}
      </div>
    </div>
  );
};

// Bonus Category Component
interface BonusCategoryProps {
  title: string;
  bonuses: Array<{ label: string; value: number; suffix: string }>;
  color: string;
}

const BonusCategory: React.FC<BonusCategoryProps> = ({ title, bonuses, color }) => (
  <div>
    <div className={`text-xs font-medium ${color} mb-1`}>{title}</div>
    <div className="grid grid-cols-2 gap-1">
      {bonuses.map((bonus, idx) => (
        <div key={idx} className="flex justify-between text-xs">
          <span className="text-gray-400">{bonus.label}</span>
          <span className={bonus.value >= 0 ? 'text-green-400' : 'text-red-400'}>
            {bonus.value >= 0 ? '+' : ''}{bonus.value}{bonus.suffix}
          </span>
        </div>
      ))}
    </div>
  </div>
);

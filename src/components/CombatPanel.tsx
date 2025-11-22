import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';
import type { Skill, CombatUnit, QiGauge } from '../types/game';
import { ENEMY_TEMPLATES, COMBAT_ITEMS, COMBAT_CONSTANTS } from '../constants/combat';
import { ITEMS } from '../constants/items';
import { hasEnoughQi } from '../utils/combat';

// HP/MP Bar Component
const StatBar: React.FC<{
  current: number;
  max: number;
  color: string;
  label: string;
  showValue?: boolean;
}> = ({ current, max, color, label, showValue = true }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        {showValue && (
          <span className="text-gray-300">
            {current}/{max}
          </span>
        )}
      </div>
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Qi Gauge Display
const QiGaugeDisplay: React.FC<{
  qiGauge: QiGauge;
  language: string;
}> = ({ qiGauge, language }) => {
  const elements = [
    { key: 'fire', color: 'bg-red-500', label: language === 'zh' ? '火' : 'Fire' },
    { key: 'water', color: 'bg-blue-500', label: language === 'zh' ? '水' : 'Water' },
    { key: 'wood', color: 'bg-green-500', label: language === 'zh' ? '木' : 'Wood' },
    { key: 'metal', color: 'bg-yellow-500', label: language === 'zh' ? '金' : 'Metal' },
    { key: 'earth', color: 'bg-amber-700', label: language === 'zh' ? '土' : 'Earth' },
    { key: 'wind', color: 'bg-cyan-400', label: language === 'zh' ? '风' : 'Wind' },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {elements.map(({ key, color, label }) => {
        const value = qiGauge[key as keyof QiGauge];
        if (value === 0) return null;
        return (
          <div key={key} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-xs text-gray-300">{label}: {value}</span>
          </div>
        );
      })}
    </div>
  );
};

// Skill Button Component
const SkillButton: React.FC<{
  skill: Skill;
  playerUnit: CombatUnit;
  onUse: () => void;
  disabled: boolean;
  language: string;
}> = ({ skill, playerUnit, onUse, disabled, language }) => {
  const isOnCooldown = (skill.currentCooldown || 0) > 0;
  const hasEnoughMp = playerUnit.combatStats.mp >= skill.costMp;
  const hasEnoughQiForUltimate = skill.type !== 'ultimate' ||
    (skill.costQi && hasEnoughQi(playerUnit.qiGauge, skill.qiElement, skill.costQi));

  const canUse = !isOnCooldown && hasEnoughMp && hasEnoughQiForUltimate && !disabled;

  const elementColors: Record<string, string> = {
    fire: 'border-red-500/50 hover:bg-red-900/30',
    water: 'border-blue-500/50 hover:bg-blue-900/30',
    wood: 'border-green-500/50 hover:bg-green-900/30',
    metal: 'border-yellow-500/50 hover:bg-yellow-900/30',
    earth: 'border-amber-700/50 hover:bg-amber-900/30',
    wind: 'border-cyan-400/50 hover:bg-cyan-900/30',
  };

  const borderColor = skill.element ? elementColors[skill.element] : 'border-gray-600 hover:bg-gray-700/50';

  return (
    <button
      onClick={onUse}
      disabled={!canUse}
      className={`p-2 rounded-lg border ${canUse ? borderColor : 'border-gray-700 opacity-50 cursor-not-allowed'}
        transition-colors text-left relative`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-medium text-gray-200">
            {language === 'zh' ? skill.chineseName : skill.name}
          </div>
          <div className="text-xs text-gray-500">
            {language === 'zh' ? skill.name : skill.chineseName}
          </div>
        </div>
        {skill.element && (
          <div className={`w-2 h-2 rounded-full ${
            skill.element === 'fire' ? 'bg-red-500' :
            skill.element === 'water' ? 'bg-blue-500' :
            skill.element === 'wood' ? 'bg-green-500' :
            skill.element === 'metal' ? 'bg-yellow-500' :
            skill.element === 'earth' ? 'bg-amber-700' :
            'bg-cyan-400'
          }`} />
        )}
      </div>
      <div className="flex gap-2 mt-1 text-xs">
        {skill.costMp > 0 && (
          <span className={hasEnoughMp ? 'text-blue-400' : 'text-red-400'}>
            MP: {skill.costMp}
          </span>
        )}
        {skill.cooldown > 0 && (
          <span className="text-gray-500">
            CD: {isOnCooldown ? skill.currentCooldown : skill.cooldown}
          </span>
        )}
        {skill.type === 'ultimate' && skill.costQi && (
          <span className={hasEnoughQiForUltimate ? 'text-purple-400' : 'text-red-400'}>
            Qi: {skill.costQi}
          </span>
        )}
      </div>
      {isOnCooldown && (
        <div className="absolute inset-0 bg-gray-900/70 rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold text-gray-400">{skill.currentCooldown}</span>
        </div>
      )}
    </button>
  );
};

// Unit Status Display
const UnitStatus: React.FC<{
  unit: CombatUnit;
  isEnemy?: boolean;
  language: string;
}> = ({ unit, isEnemy = false, language }) => {
  return (
    <div className={`p-4 rounded-lg border ${
      isEnemy ? 'bg-red-900/20 border-red-500/30' : 'bg-blue-900/20 border-blue-500/30'
    }`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className={`text-lg font-semibold ${isEnemy ? 'text-red-400' : 'text-blue-400'}`}>
          {language === 'zh' ? unit.chineseName : unit.name}
        </h3>
        {unit.isDefending && (
          <span className="text-xs px-2 py-1 bg-yellow-900/50 text-yellow-400 rounded">
            {language === 'zh' ? '防御中' : 'Defending'}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <StatBar
          current={unit.combatStats.hp}
          max={unit.combatStats.maxHp}
          color="bg-red-500"
          label={language === 'zh' ? '生命' : 'HP'}
        />
        <StatBar
          current={unit.combatStats.mp}
          max={unit.combatStats.maxMp}
          color="bg-blue-500"
          label={language === 'zh' ? '灵力' : 'MP'}
        />
        {unit.shield > 0 && (
          <StatBar
            current={unit.shield}
            max={unit.combatStats.maxHp * 0.5}
            color="bg-yellow-500"
            label={language === 'zh' ? '护盾' : 'Shield'}
          />
        )}
      </div>

      {/* Buffs/Debuffs */}
      {unit.buffs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {unit.buffs.map((buff, idx) => (
            <span
              key={idx}
              className={`text-xs px-2 py-0.5 rounded ${
                buff.isDebuff ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'
              }`}
              title={language === 'zh' ? buff.chineseDescription : buff.description}
            >
              {language === 'zh' ? buff.chineseName : buff.name}
              {buff.currentStacks && buff.currentStacks > 1 && ` x${buff.currentStacks}`}
              ({buff.remainingDuration})
            </span>
          ))}
        </div>
      )}

      {/* Player-specific displays */}
      {!isEnemy && (
        <div className="mt-3 space-y-2">
          {/* Insight Stacks */}
          {unit.insightStacks > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {language === 'zh' ? '洞察' : 'Insight'}:
              </span>
              <div className="flex gap-1">
                {Array.from({ length: COMBAT_CONSTANTS.MAX_INSIGHT_STACKS }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < unit.insightStacks ? 'bg-purple-500' : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Qi Gauge */}
          <QiGaugeDisplay qiGauge={unit.qiGauge} language={language} />
        </div>
      )}
    </div>
  );
};

// Combat Log Component
const CombatLog: React.FC<{
  logs: Array<{ message: string; chineseMessage: string; type: string }>;
  language: string;
}> = ({ logs, language }) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'damage': return 'text-red-400';
      case 'critical': return 'text-orange-400 font-bold';
      case 'heal': return 'text-green-400';
      case 'buff': return 'text-blue-400';
      case 'miss': return 'text-gray-500';
      case 'system': return 'text-yellow-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div
      ref={logRef}
      className="h-40 overflow-y-auto bg-gray-800/50 rounded-lg p-3 space-y-1"
    >
      {logs.map((log, idx) => (
        <div key={idx} className={`text-sm ${getLogColor(log.type)}`}>
          {language === 'zh' ? log.chineseMessage : log.message}
        </div>
      ))}
    </div>
  );
};

// Item Panel for combat
const ItemPanel: React.FC<{
  inventory: Array<{ itemId: string; quantity: number }>;
  onUseItem: (itemId: string) => void;
  disabled: boolean;
  language: string;
}> = ({ inventory, onUseItem, disabled, language }) => {
  const combatItems = inventory.filter(item => COMBAT_ITEMS[item.itemId]);

  if (combatItems.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        {language === 'zh' ? '没有可用的战斗物品' : 'No combat items available'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {combatItems.map(item => {
        const itemData = ITEMS[item.itemId];
        const combatItem = COMBAT_ITEMS[item.itemId];
        if (!itemData || !combatItem) return null;

        return (
          <button
            key={item.itemId}
            onClick={() => onUseItem(item.itemId)}
            disabled={disabled}
            className={`p-2 rounded-lg border border-gray-600 text-left ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700/50'
            }`}
          >
            <div className="text-sm text-gray-200">
              {language === 'zh' ? itemData.chineseName : itemData.name}
            </div>
            <div className="text-xs text-gray-500">
              x{item.quantity}
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Victory/Defeat Screen
const CombatEndScreen: React.FC<{
  victory: boolean;
  rewards?: { spiritStones: number; items: Array<{ itemId: string; quantity: number }>; cultivationExp: number };
  onCollect: () => void;
  onClose: () => void;
  language: string;
}> = ({ victory, rewards, onCollect, onClose, language }) => {
  return (
    <div className="text-center py-8">
      <div className={`text-4xl mb-4 ${victory ? 'text-yellow-400' : 'text-red-500'}`}>
        {victory ? (language === 'zh' ? '胜利!' : 'Victory!') : (language === 'zh' ? '战败...' : 'Defeat...')}
      </div>

      {victory && rewards && (
        <div className="mb-6 space-y-2">
          <p className="text-gray-300">
            {language === 'zh' ? '获得奖励:' : 'Rewards:'}
          </p>
          <p className="text-yellow-400">
            {rewards.spiritStones} {language === 'zh' ? '灵石' : 'Spirit Stones'}
          </p>
          <p className="text-cyan-400">
            {rewards.cultivationExp} {language === 'zh' ? '修为' : 'Cultivation'}
          </p>
          {rewards.items.length > 0 && (
            <div className="text-green-400">
              {rewards.items.map((item, idx) => {
                const itemData = ITEMS[item.itemId];
                return (
                  <div key={idx}>
                    {language === 'zh' ? itemData?.chineseName : itemData?.name} x{item.quantity}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <button
        onClick={victory ? onCollect : onClose}
        className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
      >
        {victory
          ? (language === 'zh' ? '收取奖励' : 'Collect Rewards')
          : (language === 'zh' ? '返回' : 'Return')
        }
      </button>
    </div>
  );
};

// Main Combat Panel
export const CombatPanel: React.FC = () => {
  const { state, actions } = useGame();
  const { combat, character } = state;
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'skills' | 'items'>('skills');

  // Auto-trigger enemy action
  useEffect(() => {
    if (combat.phase === 'enemy_turn') {
      const timer = setTimeout(() => {
        actions.enemyAction();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [combat.phase, actions]);

  const texts = language === 'zh' ? {
    title: '战斗',
    round: '回合',
    yourTurn: '你的回合',
    enemyTurn: '敌人回合',
    actions: '行动',
    skills: '技能',
    items: '物品',
    attack: '攻击',
    defend: '防御',
    observe: '观察',
    flee: '逃跑',
    testBattle: '测试战斗',
    startEncounter: '寻找敌人',
    combatGuide: {
      title: '战斗系统说明',
      items: [
        '回合制战斗，速度决定行动顺序',
        '普通攻击：消耗少，伤害稳定',
        '法术技能：消耗灵力，高伤害',
        '防御：减少50%伤害',
        '观察：积累洞察，提高暴击和伤害',
        '使用火/水/木/金/土/风系技能可积累气机',
        '气机满时可释放究极技能',
      ],
    },
    comingSoon: '前往游历可能遭遇敌人',
  } : {
    title: 'Combat',
    round: 'Round',
    yourTurn: 'Your Turn',
    enemyTurn: 'Enemy Turn',
    actions: 'Actions',
    skills: 'Skills',
    items: 'Items',
    attack: 'Attack',
    defend: 'Defend',
    observe: 'Observe',
    flee: 'Flee',
    testBattle: 'Test Battle',
    startEncounter: 'Find Enemy',
    combatGuide: {
      title: 'Combat System Guide',
      items: [
        'Turn-based combat, speed determines turn order',
        'Basic Attack: Low cost, stable damage',
        'Skills: Consume MP, higher damage',
        'Defend: Reduce damage by 50%',
        'Observe: Build insight, increase crit and damage',
        'Using elemental skills builds Qi gauge',
        'Ultimate skills unlock when Qi is full',
      ],
    },
    comingSoon: 'Travel to encounter enemies',
  };

  // Not in combat - show guide and test button
  if (!combat.inCombat) {
    return (
      <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-3 sm:p-4 md:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-amber-400 mb-3 sm:mb-4">{texts.title}</h2>

        <div className="text-center py-4 sm:py-8">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">&#9876;</div>
          <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">{texts.comingSoon}</p>

          {/* Test Battle Button */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center mb-6 sm:mb-8">
            <button
              onClick={() => {
                const enemy = ENEMY_TEMPLATES['forest_wolf'];
                if (enemy) actions.startCombat(enemy);
              }}
              className="px-3 sm:px-4 py-2.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm sm:text-base min-h-[44px]"
            >
              {texts.testBattle} (Forest Wolf)
            </button>
            <button
              onClick={() => actions.triggerRandomEncounter()}
              className="px-3 sm:px-4 py-2.5 sm:py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm sm:text-base min-h-[44px]"
            >
              {texts.startEncounter}
            </button>
          </div>
        </div>

        {/* Combat Guide */}
        <div className="p-3 sm:p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-2 sm:mb-3">{texts.combatGuide.title}</h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
            {texts.combatGuide.items.map((item, idx) => (
              <li key={idx}>- {item}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Victory or Defeat screen
  if (combat.phase === 'victory' || combat.phase === 'defeat' || combat.phase === 'fled') {
    return (
      <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-3 sm:p-4 md:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-amber-400 mb-3 sm:mb-4">{texts.title}</h2>
        <CombatEndScreen
          victory={combat.phase === 'victory'}
          rewards={combat.rewards}
          onCollect={actions.collectRewards}
          onClose={() => actions.endCombat(false)}
          language={language}
        />
      </div>
    );
  }

  // Active combat
  const playerUnit = combat.playerUnit;
  const enemyUnit = combat.enemyUnit;

  if (!playerUnit || !enemyUnit) return null;

  const isPlayerTurn = combat.phase === 'player_turn';
  const isDisabled = !isPlayerTurn;

  return (
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-amber-400">{texts.title}</h2>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-gray-400 text-sm">
            {texts.round} {combat.round}
          </span>
          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
            isPlayerTurn ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {isPlayerTurn ? texts.yourTurn : texts.enemyTurn}
          </span>
        </div>
      </div>

      {/* Battle Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
        {/* Player Status */}
        <UnitStatus unit={playerUnit} language={language} />

        {/* Enemy Status */}
        <UnitStatus unit={enemyUnit} isEnemy language={language} />
      </div>

      {/* Combat Log */}
      <div className="mb-3 sm:mb-4">
        <h4 className="text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
          {language === 'zh' ? '战斗记录' : 'Combat Log'}
        </h4>
        <CombatLog logs={combat.combatLog} language={language} />
      </div>

      {/* Action Buttons */}
      {isPlayerTurn && (
        <div className="space-y-3 sm:space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            <button
              onClick={() => actions.playerAttack('basic_attack')}
              className="p-2 sm:p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors min-h-[52px]"
            >
              <div className="text-gray-200 text-sm sm:text-base">{texts.attack}</div>
              <div className="text-[10px] sm:text-xs text-gray-500">Basic Attack</div>
            </button>
            <button
              onClick={actions.playerDefend}
              className="p-2 sm:p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors min-h-[52px]"
            >
              <div className="text-gray-200 text-sm sm:text-base">{texts.defend}</div>
              <div className="text-[10px] sm:text-xs text-gray-500">-50% DMG</div>
            </button>
            <button
              onClick={actions.playerObserve}
              className="p-2 sm:p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors min-h-[52px]"
            >
              <div className="text-gray-200 text-sm sm:text-base">{texts.observe}</div>
              <div className="text-[10px] sm:text-xs text-gray-500">+Insight</div>
            </button>
            <button
              onClick={actions.playerFlee}
              className="p-2 sm:p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors min-h-[52px]"
            >
              <div className="text-gray-200 text-sm sm:text-base">{texts.flee}</div>
              <div className="text-[10px] sm:text-xs text-gray-500">Escape</div>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base min-h-[44px] ${
                activeTab === 'skills'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {texts.skills}
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base min-h-[44px] ${
                activeTab === 'items'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {texts.items}
            </button>
          </div>

          {/* Skills Panel */}
          {activeTab === 'skills' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-2 max-h-48 sm:max-h-60 overflow-y-auto">
              {playerUnit.skills
                .filter(skill => skill.id !== 'basic_attack')
                .map(skill => (
                  <SkillButton
                    key={skill.id}
                    skill={skill}
                    playerUnit={playerUnit}
                    onUse={() => actions.playerAttack(skill.id)}
                    disabled={isDisabled}
                    language={language}
                  />
                ))}
            </div>
          )}

          {/* Items Panel */}
          {activeTab === 'items' && (
            <ItemPanel
              inventory={character.inventory.items}
              onUseItem={actions.playerUseItem}
              disabled={isDisabled}
              language={language}
            />
          )}
        </div>
      )}

      {/* Enemy Turn Indicator */}
      {!isPlayerTurn && (
        <div className="text-center py-6 sm:py-8">
          <div className="text-xl sm:text-2xl text-red-400 animate-pulse">
            {language === 'zh' ? '敌人行动中...' : 'Enemy is acting...'}
          </div>
        </div>
      )}
    </div>
  );
};

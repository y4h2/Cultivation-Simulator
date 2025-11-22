import React from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';

export const CombatPanel: React.FC = () => {
  const { state } = useGame();
  const { combat } = state;
  const { t, language } = useLanguage();

  const combatGuide = language === 'zh' ? {
    title: '战斗系统说明',
    items: [
      '回合制战斗，速度决定行动顺序',
      '普通攻击：消耗少，伤害稳定',
      '法术技能：消耗灵力，高伤害',
      '身法：闪避或位移',
      '符箓/丹药：使用物品',
      '观察：积累洞察，提高暴击',
    ],
  } : {
    title: 'Combat System Guide',
    items: [
      'Turn-based combat, speed determines turn order',
      'Normal Attack: Low cost, stable damage',
      'Techniques: Consume spiritual power, high damage',
      'Movement Skills: Dodge or reposition',
      'Talismans/Pills: Use consumable items',
      'Observe: Build insight, increase crit chance',
    ],
  };

  const actions = language === 'zh' ? {
    normalAttack: { main: '普通攻击', sub: 'Normal Attack' },
    technique: { main: '法术', sub: 'Technique' },
    defend: { main: '防御', sub: 'Defend' },
    useItem: { main: '使用物品', sub: 'Use Item' },
    observe: { main: '观察', sub: 'Observe' },
    flee: { main: '逃跑', sub: 'Flee' },
  } : {
    normalAttack: { main: 'Normal Attack', sub: '普通攻击' },
    technique: { main: 'Technique', sub: '法术' },
    defend: { main: 'Defend', sub: '防御' },
    useItem: { main: 'Use Item', sub: '使用物品' },
    observe: { main: 'Observe', sub: '观察' },
    flee: { main: 'Flee', sub: '逃跑' },
  };

  if (!combat.inCombat) {
    return (
      <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-6">
        <h2 className="text-xl font-bold text-amber-400 mb-4">{t.combat.title}</h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">&#9876;</div>
          <p className="text-gray-400 mb-2">{t.combat.comingSoon}</p>
          <p className="text-gray-500 text-sm">
            {t.combat.description}
          </p>
        </div>

        {/* Combat System Preview */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-200 mb-3">{combatGuide.title}</h3>
          <div className="space-y-2 text-sm text-gray-400">
            {combatGuide.items.map((item, idx) => (
              <p key={idx}>- {item}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Combat in progress (to be implemented)
  return (
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-6">
      <h2 className="text-xl font-bold text-amber-400 mb-4">{t.combat.title}</h2>

      {combat.enemy && (
        <div className="space-y-6">
          {/* Enemy Info */}
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <h3 className="text-lg font-semibold text-red-400">
              {language === 'zh' ? combat.enemy.chineseName : combat.enemy.name}
            </h3>
            <div className="mt-2 flex gap-4">
              <div>
                <span className="text-gray-400">{t.stats.hp}:</span>{' '}
                <span className="text-red-300">
                  {combat.enemy.stats.hp}/{combat.enemy.stats.maxHp}
                </span>
              </div>
              <div>
                <span className="text-gray-400">{t.stats.spiritualPower}:</span>{' '}
                <span className="text-blue-300">
                  {combat.enemy.stats.spiritualPower}/{combat.enemy.stats.maxSpiritualPower}
                </span>
              </div>
            </div>
          </div>

          {/* Combat Actions */}
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(actions).map(([key, { main, sub }]) => (
              <button key={key} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <div className="text-gray-200">{main}</div>
                <div className="text-xs text-gray-500">{sub}</div>
              </button>
            ))}
          </div>

          {/* Combat Log */}
          <div className="p-4 bg-gray-800/50 rounded-lg max-h-48 overflow-y-auto">
            <h4 className="text-sm text-gray-400 mb-2">
              {language === 'zh' ? '战斗记录' : 'Combat Log'}
            </h4>
            {combat.combatLog.map((log, index) => (
              <div key={index} className="text-sm text-gray-300 py-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

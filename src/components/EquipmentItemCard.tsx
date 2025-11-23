import React from 'react';
import { useLanguage } from '../i18n';
import type { EquipmentInstance, EquipmentStats } from '../types/equipment';
import {
  getTemplateById,
  getEquipmentDisplayName,
  getRarityColor,
  getAffixById,
  getSetById,
  SLOT_NAMES,
  RARITY_NAMES,
  GRADE_NAMES,
} from '../constants/equipment';

interface EquipmentItemCardProps {
  equipment: EquipmentInstance;
  onClick?: () => void;
  onEquip?: () => void;
  onUnequip?: () => void;
  isEquipped?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export const EquipmentItemCard: React.FC<EquipmentItemCardProps> = ({
  equipment,
  onClick,
  onEquip,
  onUnequip,
  isEquipped,
  showActions = true,
  compact = false,
}) => {
  const { t, language } = useLanguage();
  const isZh = language === 'zh';

  const template = getTemplateById(equipment.templateId);
  if (!template) return null;

  const displayName = getEquipmentDisplayName(equipment, isZh);
  const rarityColor = getRarityColor(template.rarity);
  const rarityName = isZh ? RARITY_NAMES[template.rarity].zh : RARITY_NAMES[template.rarity].en;
  const gradeName = isZh ? GRADE_NAMES[template.grade].zh : GRADE_NAMES[template.grade].en;
  const slotName = isZh ? SLOT_NAMES[template.slot].zh : SLOT_NAMES[template.slot].en;

  const set = template.setId ? getSetById(template.setId) : null;

  // Render stat line
  const renderStat = (key: string, value: number | undefined, isPercent: boolean = false) => {
    if (value === undefined || value === 0) return null;
    const statName = (t.equipment.statNames as Record<string, string>)[key] || key;
    return (
      <div key={key} className="flex justify-between text-xs">
        <span className="text-gray-400">{statName}</span>
        <span className="text-gray-200">
          +{value}{isPercent ? '%' : ''}
        </span>
      </div>
    );
  };

  // Render all stats
  const renderStats = (stats: EquipmentStats) => {
    const elements: React.ReactNode[] = [];

    if (stats.atk) elements.push(renderStat('atk', stats.atk));
    if (stats.def) elements.push(renderStat('def', stats.def));
    if (stats.hp) elements.push(renderStat('hp', stats.hp));
    if (stats.mp) elements.push(renderStat('mp', stats.mp));
    if (stats.spd) elements.push(renderStat('spd', stats.spd));
    if (stats.crit) elements.push(renderStat('crit', stats.crit, true));
    if (stats.critDmg) elements.push(renderStat('critDmg', stats.critDmg, true));
    if (stats.acc) elements.push(renderStat('acc', stats.acc));
    if (stats.eva) elements.push(renderStat('eva', stats.eva));
    if (stats.wis) elements.push(renderStat('wis', stats.wis));
    if (stats.sense) elements.push(renderStat('sense', stats.sense));
    if (stats.luck) elements.push(renderStat('luck', stats.luck));
    if (stats.cultivationBonus) elements.push(renderStat('cultivationBonus', stats.cultivationBonus, true));
    if (stats.atkPercent) elements.push(renderStat('atk', stats.atkPercent, true));
    if (stats.defPercent) elements.push(renderStat('def', stats.defPercent, true));
    if (stats.hpPercent) elements.push(renderStat('hp', stats.hpPercent, true));

    return elements;
  };

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all text-left"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-medium truncate"
              style={{ color: rarityColor }}
            >
              {displayName}
            </div>
            <div className="text-[10px] text-gray-500">
              {slotName} | {rarityName}
            </div>
          </div>
          {isEquipped && (
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-600/30 text-amber-400 rounded">
              {t.equipment.equipped}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div
      className={`rounded-lg bg-gray-800/70 border transition-all ${
        onClick ? 'cursor-pointer hover:bg-gray-800' : ''
      }`}
      style={{ borderColor: rarityColor + '40' }}
      onClick={onClick}
    >
      {/* Header */}
      <div
        className="px-3 py-2 rounded-t-lg"
        style={{ backgroundColor: rarityColor + '20' }}
      >
        <div className="flex items-center justify-between">
          <span
            className="font-medium text-sm"
            style={{ color: rarityColor }}
          >
            {displayName}
          </span>
          {equipment.enhanceLevel > 0 && (
            <span className="text-xs text-amber-400">+{equipment.enhanceLevel}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-gray-400">{slotName}</span>
          <span className="text-[10px]" style={{ color: rarityColor }}>{rarityName}</span>
          <span className="text-[10px] text-gray-400">{gradeName}</span>
          {isEquipped && (
            <span className="text-[10px] px-1 py-0.5 bg-amber-600/30 text-amber-400 rounded">
              {t.equipment.equipped}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-3 py-2 space-y-1">
        {renderStats(equipment.computedStats)}

        {/* Element */}
        {template.element && template.elementPower && (
          <div className="flex justify-between text-xs mt-2 pt-2 border-t border-gray-700">
            <span className="text-gray-400">{t.equipment.element}</span>
            <span className="text-purple-400">
              {template.element} +{template.elementPower}%
            </span>
          </div>
        )}

        {/* Affixes */}
        {(equipment.prefixes.length > 0 || equipment.suffixes.length > 0) && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-[10px] text-gray-500 mb-1">{t.equipment.affixes}</div>
            {equipment.prefixes.map((prefix) => {
              const affix = getAffixById(prefix.affixId);
              if (!affix) return null;
              return (
                <div key={prefix.affixId} className="text-[10px] text-green-400">
                  {isZh ? affix.chineseName : affix.name}
                </div>
              );
            })}
            {equipment.suffixes.map((suffix) => {
              const affix = getAffixById(suffix.affixId);
              if (!affix) return null;
              return (
                <div key={suffix.affixId} className="text-[10px] text-blue-400">
                  {isZh ? affix.chineseName : affix.name}
                </div>
              );
            })}
          </div>
        )}

        {/* Set Bonus */}
        {set && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-[10px] text-amber-400">
              {isZh ? set.chineseName : set.name}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-3 py-2 border-t border-gray-700 flex gap-2">
          {isEquipped ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnequip?.();
              }}
              className="flex-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              {t.equipment.unequip}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEquip?.();
              }}
              className="flex-1 px-2 py-1 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
            >
              {t.equipment.equip}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

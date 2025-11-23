import React from 'react';
import { useLanguage } from '../i18n';
import type { EquipmentInstance, EquipmentSlot } from '../types/equipment';
import {
  getTemplateById,
  getEquipmentDisplayName,
  getRarityColor,
  SLOT_NAMES,
} from '../constants/equipment';

interface EquipmentSlotCardProps {
  slot: EquipmentSlot;
  equipment?: EquipmentInstance;
  onClick?: () => void;
  isSelected?: boolean;
}

export const EquipmentSlotCard: React.FC<EquipmentSlotCardProps> = ({
  slot,
  equipment,
  onClick,
  isSelected,
}) => {
  const { t, language } = useLanguage();
  const isZh = language === 'zh';

  const slotName = isZh ? SLOT_NAMES[slot].zh : SLOT_NAMES[slot].en;

  // Get slot icon
  const getSlotIcon = (slot: EquipmentSlot): string => {
    switch (slot) {
      case 'weapon':
        return 'M6.5 3.5l7 7m-7 0l7-7M15 11l-4 4m8-4l-8 8';
      case 'armor':
        return 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z';
      case 'helmet':
        return 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z';
      case 'accessory':
        return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'boots':
        return 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12';
      case 'talisman':
        return 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z';
      default:
        return 'M4 7h16M4 12h16M4 17h16';
    }
  };

  if (!equipment) {
    return (
      <button
        onClick={onClick}
        className={`w-full p-3 rounded-lg border-2 border-dashed transition-all min-h-[80px] ${
          isSelected
            ? 'border-amber-500 bg-amber-900/30'
            : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-1">
          <svg
            className="w-6 h-6 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d={getSlotIcon(slot)}
            />
          </svg>
          <span className="text-xs text-gray-500">{slotName}</span>
          <span className="text-[10px] text-gray-600">{t.equipment.emptySlot}</span>
        </div>
      </button>
    );
  }

  const template = getTemplateById(equipment.templateId);
  if (!template) return null;

  const displayName = getEquipmentDisplayName(equipment, isZh);
  const rarityColor = getRarityColor(template.rarity);

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg border-2 transition-all min-h-[80px] ${
        isSelected
          ? 'border-amber-500 bg-amber-900/30'
          : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
      }`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-500">{slotName}</span>
          {equipment.enhanceLevel > 0 && (
            <span className="text-[10px] text-amber-400">+{equipment.enhanceLevel}</span>
          )}
        </div>
        <div
          className="text-sm font-medium truncate"
          style={{ color: rarityColor }}
        >
          {displayName}
        </div>
        {/* Quick stats preview */}
        <div className="flex flex-wrap gap-1 mt-1">
          {equipment.computedStats.atk && (
            <span className="text-[10px] text-red-400">
              {t.equipment.statNames.atk} +{equipment.computedStats.atk}
            </span>
          )}
          {equipment.computedStats.def && (
            <span className="text-[10px] text-blue-400">
              {t.equipment.statNames.def} +{equipment.computedStats.def}
            </span>
          )}
          {equipment.computedStats.hp && (
            <span className="text-[10px] text-green-400">
              {t.equipment.statNames.hp} +{equipment.computedStats.hp}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

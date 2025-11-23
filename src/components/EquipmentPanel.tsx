import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';
import { EquipmentSlotCard } from './EquipmentSlotCard';
import { EquipmentItemCard } from './EquipmentItemCard';
import { EquipmentCompareModal } from './EquipmentCompareModal';
import type { EquipmentSlot, EquipmentInstance } from '../types/equipment';
import {
  getTemplateById,
  computeTotalEquipmentBonuses,
  getSetById,
  SLOT_NAMES,
} from '../constants/equipment';

const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  'weapon',
  'helmet',
  'armor',
  'accessory',
  'boots',
  'talisman',
];

export const EquipmentPanel: React.FC = () => {
  const { state, actions } = useGame();
  const { t, language } = useLanguage();
  const isZh = language === 'zh';

  const equipment = state.character.equipment;
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
  const [selectedItem, setSelectedItem] = useState<EquipmentInstance | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  // Compute total bonuses
  const totalBonuses = computeTotalEquipmentBonuses(equipment);

  // Get available items for selected slot
  const getAvailableItems = (slot: EquipmentSlot): EquipmentInstance[] => {
    return equipment.inventory.filter((item) => {
      const template = getTemplateById(item.templateId);
      return template?.slot === slot;
    });
  };

  const handleSlotClick = (slot: EquipmentSlot) => {
    setSelectedSlot(slot === selectedSlot ? null : slot);
    setSelectedItem(null);
  };

  const handleItemClick = (item: EquipmentInstance) => {
    setSelectedItem(item);
    const template = getTemplateById(item.templateId);
    if (template) {
      setSelectedSlot(template.slot as EquipmentSlot);
    }
  };

  const handleConfirmEquip = () => {
    if (!selectedItem) return;
    actions.equipItem(selectedItem.instanceId);
    setShowCompare(false);
    setSelectedItem(null);
  };

  const handleUnequip = (slot: EquipmentSlot) => {
    actions.unequipItem(slot);
  };

  // Render stat summary
  const renderStatsSummary = () => {
    const stats = totalBonuses.totalStats;
    const entries: Array<{ key: string; value: number; color: string }> = [];

    if (stats.atk) entries.push({ key: 'atk', value: stats.atk, color: 'text-red-400' });
    if (stats.def) entries.push({ key: 'def', value: stats.def, color: 'text-blue-400' });
    if (stats.hp) entries.push({ key: 'hp', value: stats.hp, color: 'text-green-400' });
    if (stats.mp) entries.push({ key: 'mp', value: stats.mp, color: 'text-cyan-400' });
    if (stats.spd) entries.push({ key: 'spd', value: stats.spd, color: 'text-yellow-400' });
    if (stats.crit) entries.push({ key: 'crit', value: stats.crit, color: 'text-orange-400' });
    if (stats.wis) entries.push({ key: 'wis', value: stats.wis, color: 'text-purple-400' });
    if (stats.sense) entries.push({ key: 'sense', value: stats.sense, color: 'text-indigo-400' });

    if (entries.length === 0) return null;

    return (
      <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
        <div className="text-xs text-gray-500 mb-2">{t.equipment.stats}</div>
        <div className="grid grid-cols-4 gap-2">
          {entries.map(({ key, value, color }) => (
            <div key={key} className="text-center">
              <div className={`text-sm font-medium ${color}`}>+{value}</div>
              <div className="text-[10px] text-gray-500">
                {(t.equipment.statNames as Record<string, string>)[key]}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render set bonuses
  const renderSetBonuses = () => {
    if (totalBonuses.activeSetBonuses.length === 0) return null;

    return (
      <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
        <div className="text-xs text-gray-500 mb-2">{t.equipment.setBonus}</div>
        {totalBonuses.activeSetBonuses.map((setBonus) => {
          const set = getSetById(setBonus.setId);
          if (!set) return null;

          return (
            <div key={setBonus.setId} className="mb-2 last:mb-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-400">
                  {isZh ? set.chineseName : set.name}
                </span>
                <span className="text-xs text-gray-400">
                  {setBonus.activePieces}/{set.pieces.length}
                </span>
              </div>
              {setBonus.bonuses.map((bonus, idx) => (
                <div key={idx} className="text-[10px] text-gray-400 ml-2">
                  ({bonus.requiredPieces}{isZh ? '件' : 'pc'})
                  {bonus.specialEffect && (
                    <span className="text-green-400 ml-1">
                      {isZh ? bonus.specialEffect.chineseName : bonus.specialEffect.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-3 sm:p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-amber-400">{t.equipment.title}</h2>
        <span className="text-xs text-gray-500">
          {equipment.inventory.length}/{equipment.maxInventorySize}
        </span>
      </div>

      {/* Stats Summary */}
      {renderStatsSummary()}

      {/* Set Bonuses */}
      {renderSetBonuses()}

      {/* Equipment Slots Grid */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">{t.equipment.equipped}</div>
        <div className="grid grid-cols-3 gap-2">
          {EQUIPMENT_SLOTS.map((slot) => (
            <EquipmentSlotCard
              key={slot}
              slot={slot}
              equipment={equipment.equipped[slot]}
              onClick={() => handleSlotClick(slot)}
              isSelected={selectedSlot === slot}
            />
          ))}
        </div>
      </div>

      {/* Selected Slot - Available Items */}
      {selectedSlot && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">
            {isZh ? SLOT_NAMES[selectedSlot].zh : SLOT_NAMES[selectedSlot].en} - {t.equipment.inventory}
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {/* Currently equipped item for this slot */}
            {equipment.equipped[selectedSlot] && (
              <EquipmentItemCard
                equipment={equipment.equipped[selectedSlot]!}
                isEquipped={true}
                onUnequip={() => handleUnequip(selectedSlot)}
              />
            )}
            {/* Available items */}
            {getAvailableItems(selectedSlot).map((item) => (
              <EquipmentItemCard
                key={item.instanceId}
                equipment={item}
                onClick={() => handleItemClick(item)}
                onEquip={() => {
                  setSelectedItem(item);
                  const currentEquipped = equipment.equipped[selectedSlot];
                  if (currentEquipped) {
                    setShowCompare(true);
                  } else {
                    actions.equipItem(item.instanceId);
                  }
                }}
              />
            ))}
            {!equipment.equipped[selectedSlot] && getAvailableItems(selectedSlot).length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4">
                {t.equipment.noEquipment}
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Inventory Items (when no slot selected) */}
      {!selectedSlot && equipment.inventory.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-2">{t.equipment.inventory}</div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {equipment.inventory.map((item) => (
              <EquipmentItemCard
                key={item.instanceId}
                equipment={item}
                compact={true}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {equipment.inventory.length === 0 && Object.keys(equipment.equipped).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {t.equipment.empty}
        </div>
      )}

      {/* Compare Modal */}
      {showCompare && selectedItem && selectedSlot && (
        <EquipmentCompareModal
          current={equipment.equipped[selectedSlot]}
          newItem={selectedItem}
          onEquip={handleConfirmEquip}
          onCancel={() => {
            setShowCompare(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
};

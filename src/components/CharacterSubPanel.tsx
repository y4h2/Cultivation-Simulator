import React, { useState } from 'react';
import { useLanguage } from '../i18n';
import { EquipmentPanel } from './EquipmentPanel';
import { SkillTreePanel } from './SkillTreePanel';
import { SpiritBeastPanel } from './SpiritBeastPanel';
import { TalentPanel } from './TalentPanel';
import { InventoryPanel } from './InventoryPanel';

export type CharacterSubTab = 'inventory' | 'equipment' | 'skills' | 'spiritBeast' | 'talents';

export const CharacterSubPanel: React.FC = () => {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<CharacterSubTab>('inventory');

  const SUB_TABS: Array<{ id: CharacterSubTab; label: string }> = [
    { id: 'inventory', label: t.tabs.inventory },
    { id: 'equipment', label: t.equipment.title },
    { id: 'skills', label: t.tabs.skills },
    { id: 'spiritBeast', label: t.spiritBeast.title },
    { id: 'talents', label: t.talent.title },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Sub-tab Navigation */}
      <div className="flex gap-1 bg-gray-800/50 p-1 rounded-lg">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex-1 px-2 sm:px-3 py-2 rounded-md font-medium transition-all text-xs sm:text-sm min-h-[40px] ${
              activeSubTab === tab.id
                ? 'bg-amber-600/90 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span className="block whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Sub-tab Content */}
      <div className="min-h-[300px]">
        {activeSubTab === 'inventory' && <InventoryPanel />}
        {activeSubTab === 'equipment' && <EquipmentPanel />}
        {activeSubTab === 'skills' && <SkillTreePanel />}
        {activeSubTab === 'spiritBeast' && <SpiritBeastPanel />}
        {activeSubTab === 'talents' && <TalentPanel />}
      </div>
    </div>
  );
};

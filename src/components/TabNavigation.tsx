import React from 'react';
import { useLanguage } from '../i18n';

export type TabType = 'market' | 'combat' | 'character' | 'worldEvents' | 'clan' | 'storyline';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t, isZh } = useLanguage();

  const TABS: Array<{ id: TabType; label: string }> = [
    { id: 'storyline', label: t.storyline.title },
    { id: 'clan', label: t.clan.title },
    { id: 'character', label: isZh ? '角色' : 'Character' },
    { id: 'market', label: t.tabs.market },
    { id: 'combat', label: t.tabs.combat },
    { id: 'worldEvents', label: t.worldEvent.title },
  ];

  return (
    <div className="flex gap-0.5 sm:gap-1 bg-gray-900/50 p-1 rounded-lg overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm md:text-base min-w-[60px] sm:min-w-[auto] min-h-[44px] ${
            activeTab === tab.id
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <span className="block whitespace-nowrap">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

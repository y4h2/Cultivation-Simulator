import React from 'react';
import { useLanguage } from '../i18n';

export type TabType = 'market' | 'inventory' | 'combat' | 'skills';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useLanguage();

  const TABS: Array<{ id: TabType; labelKey: keyof typeof t.tabs }> = [
    { id: 'market', labelKey: 'market' },
    { id: 'inventory', labelKey: 'inventory' },
    { id: 'combat', labelKey: 'combat' },
    { id: 'skills', labelKey: 'skills' },
  ];

  return (
    <div className="flex gap-1 bg-gray-900/50 p-1 rounded-lg">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <span className="block">{t.tabs[tab.labelKey]}</span>
        </button>
      ))}
    </div>
  );
};

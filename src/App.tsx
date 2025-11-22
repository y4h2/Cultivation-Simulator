import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { LanguageProvider, useLanguage } from './i18n';
import {
  Layout,
  CharacterPanel,
  MarketPanel,
  InventoryPanel,
  LogPanel,
  CombatPanel,
  TabNavigation,
} from './components';
import type { TabType } from './components';

function GameContent() {
  const [activeTab, setActiveTab] = useState<TabType>('cultivation');

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Character Info (always visible) */}
        <div className="lg:col-span-4">
          <CharacterPanel />
        </div>

        {/* Right Column - Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'cultivation' && (
              <div className="space-y-6">
                <CultivationInfo />
                <LogPanel />
              </div>
            )}
            {activeTab === 'market' && <MarketPanel />}
            {activeTab === 'inventory' && <InventoryPanel />}
            {activeTab === 'combat' && <CombatPanel />}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Additional cultivation info component
function CultivationInfo() {
  const { language } = useLanguage();

  const content = language === 'zh' ? {
    title: '修炼指南',
    realms: {
      title: '境界体系',
      items: [
        '炼气期（9层）',
        '筑基期（4阶段）',
        '结丹期（4阶段）',
        '元婴期（4阶段）',
        '化神期',
        '……',
      ],
    },
    tips: {
      title: '修炼技巧',
      items: [
        '闭关修炼：最快提升修为',
        '驻守坊市：可以交易物品',
        '游历：可能遇到机缘或危险',
        '修为满时可尝试突破',
      ],
    },
    market: {
      title: '市场交易',
      items: [
        '价格随时间波动',
        '大量买入会推高价格',
        '大量卖出会压低价格',
        '关注世界事件影响',
      ],
    },
    attributes: {
      title: '属性说明',
      items: [
        '悟性：影响修炼速度',
        '气运：影响突破成功率',
        '神识：影响战斗准确度',
        '速度：影响战斗顺序',
      ],
    },
  } : {
    title: 'Cultivation Guide',
    realms: {
      title: 'Realm System',
      items: [
        'Qi Refining (9 layers)',
        'Foundation (4 stages)',
        'Core Formation (4 stages)',
        'Nascent Soul (4 stages)',
        'Spirit Transformation',
        '...',
      ],
    },
    tips: {
      title: 'Cultivation Tips',
      items: [
        'Closed-door: Fastest cultivation',
        'Market Station: Trade items',
        'Travel: May find opportunities or danger',
        'Attempt breakthrough when cultivation is full',
      ],
    },
    market: {
      title: 'Market Trading',
      items: [
        'Prices fluctuate over time',
        'Bulk buying raises prices',
        'Bulk selling lowers prices',
        'Watch for world events',
      ],
    },
    attributes: {
      title: 'Attribute Guide',
      items: [
        'Comprehension: Affects cultivation speed',
        'Luck: Affects breakthrough success',
        'Divine Sense: Affects combat accuracy',
        'Speed: Affects turn order in combat',
      ],
    },
  };

  return (
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-6">
      <h2 className="text-xl font-bold text-amber-400 mb-4">{content.title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">{content.realms.title}</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            {content.realms.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-lg font-semibold text-green-400 mb-2">{content.tips.title}</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            {content.tips.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">{content.market.title}</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            {content.market.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-400 mb-2">{content.attributes.title}</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            {content.attributes.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <GameProvider>
        <GameContent />
      </GameProvider>
    </LanguageProvider>
  );
}

export default App;

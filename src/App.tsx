import { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { LanguageProvider } from './i18n';
import {
  Layout,
  CharacterPanel,
  MarketPanel,
  InventoryPanel,
  ChatLog,
  CombatPanel,
  TabNavigation,
  SkillTreePanel,
  SpiritBeastPanel,
  TalentPanel,
  TalentSelectionModal,
  BreakthroughTalentModal,
  WorldEventPanel,
} from './components';
import type { TabType } from './components';

function GameContent() {
  const [activeTab, setActiveTab] = useState<TabType>('market');
  const { state, actions } = useGame();

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
        {/* Left Column - Character Info (always visible) */}
        <div className="lg:col-span-4 xl:col-span-4">
          <CharacterPanel />
        </div>

        {/* Right Column - Main Content Area */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <div className="min-h-[300px] sm:min-h-[400px]">
            {activeTab === 'market' && <MarketPanel />}
            {activeTab === 'inventory' && <InventoryPanel />}
            {activeTab === 'combat' && <CombatPanel />}
            {activeTab === 'skills' && <SkillTreePanel />}
            {activeTab === 'spiritBeast' && <SpiritBeastPanel />}
            {activeTab === 'talents' && <TalentPanel />}
            {activeTab === 'worldEvents' && <WorldEventPanel />}
          </div>
        </div>
      </div>

      {/* Floating Chat Log */}
      <ChatLog />

      {/* Talent Selection Modals */}
      {state.showTalentSelection && state.talentSelectionType === 'starting' && (
        <TalentSelectionModal
          options={state.startingTalentOptions}
          onSelect={(option) => actions.selectStartingTalents(option)}
        />
      )}

      {state.showTalentSelection && state.talentSelectionType === 'breakthrough' && (
        <BreakthroughTalentModal
          options={state.breakthroughTalentOptions}
          realmName={state.breakthroughRealmName}
          onSelect={(talentId) => actions.selectBreakthroughTalent(talentId, state.breakthroughRealmName)}
          onSkip={() => actions.clearTalentOptions()}
        />
      )}
    </Layout>
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

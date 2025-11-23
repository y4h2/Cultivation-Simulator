import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';
import {
  getChapterById,
  getNodeById,
  getChapterProgress,
  getAvailableNodes,
} from '../constants/storyline';
import type { StoryNode, ActiveStoryNode, CompletedStoryNode } from '../types/storyline';
import { StoryNodeCard } from './StoryNodeCard';
import { StoryDialogModal } from './StoryDialogModal';
import { StoryChapterView } from './StoryChapterView';

export const StoryPanel: React.FC = () => {
  const { state, actions } = useGame();
  const { language, t } = useLanguage();
  const isZh = language === 'zh';

  const [selectedTab, setSelectedTab] = useState<'current' | 'available' | 'completed' | 'chapter'>('current');
  const [activeDialogNodeId, setActiveDialogNodeId] = useState<string | null>(null);

  // All hooks must be called before conditional returns
  const storyState = state.storylineState;

  // Get current chapter info
  const currentChapter = useMemo(() => {
    if (!storyState) return null;
    return getChapterById(storyState.currentChapterId);
  }, [storyState?.currentChapterId]);

  // Get chapter progress
  const chapterProgress = useMemo(() => {
    if (!storyState) return { completed: 0, required: 0, percentage: 0 };
    return getChapterProgress(storyState, storyState.currentChapterId);
  }, [storyState]);

  // Get available nodes
  const availableNodes = useMemo(() => {
    if (!storyState) return [];
    const context = {
      character: state.character,
      storyState,
      clanState: state.clanState,
      worldEvents: state.worldEvents,
      gameTime: state.time,
    };
    return getAvailableNodes(storyState, context);
  }, [storyState, state.character, state.clanState, state.worldEvents, state.time]);

  // Get active nodes
  const activeNodes = useMemo(() => {
    if (!storyState) return [];
    return storyState.activeNodes.map(an => ({
      ...an,
      node: getNodeById(an.nodeId),
    })).filter(an => an.node !== undefined);
  }, [storyState?.activeNodes]);

  // Get completed nodes (recent first)
  const completedNodes = useMemo(() => {
    if (!storyState) return [];
    return [...storyState.completedNodes]
      .reverse()
      .slice(0, 20)
      .map(cn => ({
        ...cn,
        node: getNodeById(cn.nodeId),
      }))
      .filter(cn => cn.node !== undefined);
  }, [storyState?.completedNodes]);

  // Get the currently active dialog node
  const dialogNode = useMemo(() => {
    if (!activeDialogNodeId) return null;
    return getNodeById(activeDialogNodeId);
  }, [activeDialogNodeId]);

  const activeDialogState = useMemo(() => {
    if (!activeDialogNodeId || !storyState) return null;
    return storyState.activeNodes.find(n => n.nodeId === activeDialogNodeId);
  }, [activeDialogNodeId, storyState?.activeNodes]);

  // Handle starting a new node
  const handleStartNode = (nodeId: string) => {
    const node = getNodeById(nodeId);
    if (!node) return;

    actions.startStoryNode?.(nodeId);

    // If the node has dialogue, open the dialog modal
    if (node.dialogue && node.dialogue.length > 0) {
      setActiveDialogNodeId(nodeId);
    }
  };

  // Handle continuing a node
  const handleContinueNode = (nodeId: string) => {
    setActiveDialogNodeId(nodeId);
  };

  // Handle dialog completion
  const handleDialogComplete = () => {
    if (!activeDialogNodeId) return;
    const node = getNodeById(activeDialogNodeId);

    if (node && (!node.choices || node.choices.length === 0)) {
      // No choices, complete the node
      actions.completeStoryNode?.(activeDialogNodeId);
    }
    // If there are choices, they will be handled by the modal
    setActiveDialogNodeId(null);
  };

  // Handle choice selection
  const handleChoice = (choiceId: string) => {
    if (!activeDialogNodeId) return;
    actions.makeStoryChoice?.(activeDialogNodeId, choiceId);
    actions.completeStoryNode?.(activeDialogNodeId);
    setActiveDialogNodeId(null);
  };

  // If story system not initialized, show initialization message
  if (!storyState || !storyState.initialized) {
    return (
      <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-amber-400 mb-4">
          {t.storyline.title}
        </h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">
            <svg className="w-24 h-24 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg">{t.storyline.noQuests}</p>
          <p className="text-gray-500 text-sm mt-2">{t.storyline.noQuestsDesc}</p>
          <button
            onClick={() => actions.initStory?.()}
            className="mt-6 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
          >
            {isZh ? '开始旅程' : 'Begin Journey'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-3 sm:p-4 md:p-6">
      {/* Header with Chapter Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-amber-400">
            {t.storyline.title}
          </h2>
          {currentChapter && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-400">
                {t.storyline.chapter} {currentChapter.number}:
              </span>
              <span className="text-sm text-white">
                {isZh ? currentChapter.chineseName : currentChapter.name}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{t.storyline.progress}:</span>
          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all"
              style={{ width: `${chapterProgress.percentage}%` }}
            />
          </div>
          <span className="text-xs text-amber-400">
            {chapterProgress.completed}/{chapterProgress.required}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {(['current', 'available', 'completed', 'chapter'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              selectedTab === tab
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            {tab === 'current' && (isZh ? '进行中' : 'In Progress')}
            {tab === 'available' && (isZh ? '可接取' : 'Available')}
            {tab === 'completed' && (isZh ? '已完成' : 'Completed')}
            {tab === 'chapter' && (isZh ? '章节总览' : 'Chapter')}
            {tab === 'current' && activeNodes.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-700 rounded text-xs">
                {activeNodes.length}
              </span>
            )}
            {tab === 'available' && availableNodes.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-green-700 rounded text-xs">
                {availableNodes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {selectedTab === 'current' && (
          <CurrentNodesTab
            activeNodes={activeNodes}
            isZh={isZh}
            t={t}
            onContinue={handleContinueNode}
          />
        )}

        {selectedTab === 'available' && (
          <AvailableNodesTab
            nodes={availableNodes}
            isZh={isZh}
            t={t}
            onStart={handleStartNode}
          />
        )}

        {selectedTab === 'completed' && (
          <CompletedNodesTab
            completedNodes={completedNodes}
            isZh={isZh}
          />
        )}

        {selectedTab === 'chapter' && currentChapter && (
          <StoryChapterView
            chapter={currentChapter}
            storyState={storyState}
            isZh={isZh}
          />
        )}
      </div>

      {/* Dialog Modal */}
      {dialogNode && activeDialogState && (
        <StoryDialogModal
          node={dialogNode}
          activeState={activeDialogState}
          isZh={isZh}
          onAdvance={() => actions.advanceStoryDialogue?.(dialogNode.id)}
          onChoice={handleChoice}
          onComplete={handleDialogComplete}
          onClose={() => setActiveDialogNodeId(null)}
        />
      )}
    </div>
  );
};

// ============================================
// Current Nodes Tab
// ============================================

interface CurrentNodesTabProps {
  activeNodes: Array<{ nodeId: string; node?: StoryNode } & ActiveStoryNode>;
  isZh: boolean;
  t: ReturnType<typeof useLanguage>['t'];
  onContinue: (nodeId: string) => void;
}

const CurrentNodesTab: React.FC<CurrentNodesTabProps> = ({
  activeNodes,
  isZh,
  t,
  onContinue,
}) => {
  if (activeNodes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{isZh ? '没有进行中的任务' : 'No quests in progress'}</p>
        <p className="text-gray-600 text-sm mt-1">{isZh ? '查看"可接取"标签开始新任务' : 'Check "Available" tab to start new quests'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {activeNodes.map(({ node }) => (
        node && (
          <StoryNodeCard
            key={node.id}
            node={node}
            status="in_progress"
            isZh={isZh}
            onClick={() => onContinue(node.id)}
            actionLabel={t.storyline.continueQuest}
          />
        )
      ))}
    </div>
  );
};

// ============================================
// Available Nodes Tab
// ============================================

interface AvailableNodesTabProps {
  nodes: StoryNode[];
  isZh: boolean;
  t: ReturnType<typeof useLanguage>['t'];
  onStart: (nodeId: string) => void;
}

const AvailableNodesTab: React.FC<AvailableNodesTabProps> = ({
  nodes,
  isZh,
  t,
  onStart,
}) => {
  if (nodes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t.storyline.noQuests}</p>
        <p className="text-gray-600 text-sm mt-1">{t.storyline.noQuestsDesc}</p>
      </div>
    );
  }

  // Sort by priority (higher first), then by type (main > branch > optional)
  const sortedNodes = [...nodes].sort((a, b) => {
    const typeOrder = { main: 0, branch: 1, optional: 2 };
    const typeDiff = (typeOrder[a.type] || 2) - (typeOrder[b.type] || 2);
    if (typeDiff !== 0) return typeDiff;
    return (b.priority || 0) - (a.priority || 0);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {sortedNodes.map(node => (
        <StoryNodeCard
          key={node.id}
          node={node}
          status="available"
          isZh={isZh}
          onClick={() => onStart(node.id)}
          actionLabel={t.storyline.startQuest}
        />
      ))}
    </div>
  );
};

// ============================================
// Completed Nodes Tab
// ============================================

interface CompletedNodesTabProps {
  completedNodes: Array<{ node?: StoryNode } & CompletedStoryNode>;
  isZh: boolean;
}

const CompletedNodesTab: React.FC<CompletedNodesTabProps> = ({
  completedNodes,
  isZh,
}) => {
  if (completedNodes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{isZh ? '尚未完成任何任务' : 'No quests completed yet'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {completedNodes.map(({ node, ...completedState }) => (
        node && (
          <StoryNodeCard
            key={node.id}
            node={node}
            status="completed"
            isZh={isZh}
            completedAt={completedState.completedAt}
          />
        )
      ))}
    </div>
  );
};

import React from 'react';
import { getChapterNodes } from '../constants/storyline';
import type { StoryChapter, StoryState, StoryNode } from '../types/storyline';

interface StoryChapterViewProps {
  chapter: StoryChapter;
  storyState: StoryState;
  isZh: boolean;
}

export const StoryChapterView: React.FC<StoryChapterViewProps> = ({
  chapter,
  storyState,
  isZh,
}) => {
  const nodes = getChapterNodes(chapter.id);
  const completedNodeIds = storyState.completedNodes.map(n => n.nodeId);
  const activeNodeIds = storyState.activeNodes.map(n => n.nodeId);

  // Group nodes by type
  const mainNodes = nodes.filter(n => n.type === 'main');
  const branchNodes = nodes.filter(n => n.type === 'branch');
  const optionalNodes = nodes.filter(n => n.type === 'optional');

  const getNodeStatus = (nodeId: string): 'completed' | 'active' | 'available' | 'locked' => {
    if (completedNodeIds.includes(nodeId)) return 'completed';
    if (activeNodeIds.includes(nodeId)) return 'active';
    if (storyState.availableNodeIds.includes(nodeId)) return 'available';
    return 'locked';
  };

  return (
    <div className="space-y-6">
      {/* Chapter Header */}
      <div className="text-center border-b border-gray-700/50 pb-4">
        <h3 className="text-xl font-bold text-amber-400 mb-2">
          {isZh ? `第${chapter.number}章: ${chapter.chineseName}` : `Chapter ${chapter.number}: ${chapter.name}`}
        </h3>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          {isZh ? chapter.chineseDescription : chapter.description}
        </p>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">
            {completedNodeIds.filter(id => nodes.some(n => n.id === id)).length}
          </div>
          <div className="text-xs text-gray-500">
            {isZh ? '已完成' : 'Completed'}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">
            {activeNodeIds.filter(id => nodes.some(n => n.id === id)).length}
          </div>
          <div className="text-xs text-gray-500">
            {isZh ? '进行中' : 'In Progress'}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-400">
            {nodes.length}
          </div>
          <div className="text-xs text-gray-500">
            {isZh ? '总任务' : 'Total'}
          </div>
        </div>
      </div>

      {/* Main Quest Line */}
      <div>
        <h4 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          {isZh ? '主线任务' : 'Main Quests'}
          <span className="text-xs text-gray-500 font-normal">
            ({mainNodes.filter(n => completedNodeIds.includes(n.id)).length}/{mainNodes.length})
          </span>
        </h4>
        <div className="relative pl-6">
          {/* Connection line */}
          <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gray-700" />

          <div className="space-y-3">
            {mainNodes.map((node) => (
              <NodeListItem
                key={node.id}
                node={node}
                status={getNodeStatus(node.id)}
                isZh={isZh}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Branch Quests */}
      {branchNodes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-purple-400 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            {isZh ? '支线任务' : 'Branch Quests'}
            <span className="text-xs text-gray-500 font-normal">
              ({branchNodes.filter(n => completedNodeIds.includes(n.id)).length}/{branchNodes.length})
            </span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {branchNodes.map(node => (
              <NodeListItem
                key={node.id}
                node={node}
                status={getNodeStatus(node.id)}
                isZh={isZh}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Optional Quests */}
      {optionalNodes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            {isZh ? '可选任务' : 'Optional Quests'}
            <span className="text-xs text-gray-500 font-normal">
              ({optionalNodes.filter(n => completedNodeIds.includes(n.id)).length}/{optionalNodes.length})
            </span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {optionalNodes.map(node => (
              <NodeListItem
                key={node.id}
                node={node}
                status={getNodeStatus(node.id)}
                isZh={isZh}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Chapter Completion Rewards */}
      {chapter.completionEffects && chapter.completionEffects.length > 0 && (
        <div className="mt-4 p-4 bg-amber-900/20 rounded-lg border border-amber-900/30">
          <h4 className="text-sm font-medium text-amber-400 mb-2">
            {isZh ? '章节完成奖励' : 'Chapter Completion Rewards'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {chapter.completionEffects.map((effect, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 bg-amber-900/30 text-amber-300 rounded"
              >
                {getEffectLabel(effect, isZh)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// Node List Item Component
// ============================================

interface NodeListItemProps {
  node: StoryNode;
  status: 'completed' | 'active' | 'available' | 'locked';
  isZh: boolean;
  compact?: boolean;
}

const NodeListItem: React.FC<NodeListItemProps> = ({
  node,
  status,
  isZh,
  compact,
}) => {
  const statusStyles = {
    completed: {
      icon: 'bg-green-500',
      text: 'text-gray-400',
      bg: 'bg-green-900/20',
      border: 'border-green-900/30',
    },
    active: {
      icon: 'bg-amber-500 animate-pulse',
      text: 'text-white',
      bg: 'bg-amber-900/20',
      border: 'border-amber-900/30',
    },
    available: {
      icon: 'bg-blue-500',
      text: 'text-gray-300',
      bg: 'bg-blue-900/20',
      border: 'border-blue-900/30',
    },
    locked: {
      icon: 'bg-gray-600',
      text: 'text-gray-500',
      bg: 'bg-gray-800/50',
      border: 'border-gray-700/30',
    },
  };

  const styles = statusStyles[status];

  if (compact) {
    return (
      <div className={`p-3 rounded-lg border ${styles.bg} ${styles.border}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${styles.icon}`} />
          <span className={`text-sm ${styles.text}`}>
            {isZh ? node.chineseName : node.name}
          </span>
          {status === 'completed' && (
            <svg className="w-4 h-4 text-green-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Status dot */}
      <div className={`absolute left-[-17px] top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full ${styles.icon} z-10`} />

      <div className={`p-3 rounded-lg border ${styles.bg} ${styles.border}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h5 className={`font-medium ${styles.text}`}>
              {isZh ? node.chineseName : node.name}
            </h5>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {isZh ? node.chineseDescription : node.description}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {status === 'completed' && (
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'active' && (
              <span className="text-xs px-1.5 py-0.5 bg-amber-900/50 text-amber-400 rounded">
                {isZh ? '进行中' : 'Active'}
              </span>
            )}
            {status === 'available' && (
              <span className="text-xs px-1.5 py-0.5 bg-blue-900/50 text-blue-400 rounded">
                {isZh ? '可接' : 'Ready'}
              </span>
            )}
            {status === 'locked' && (
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to get effect label
const getEffectLabel = (effect: { type: string; value?: number | string; target?: string }, isZh: boolean): string => {
  const value = effect.value;
  switch (effect.type) {
    case 'give_spirit_stones':
      return isZh ? `+${value} 灵石` : `+${value} Spirit Stones`;
    case 'give_contribution':
      return isZh ? `+${value} 贡献` : `+${value} Contribution`;
    case 'give_wudao_points':
      return isZh ? `+${value} 悟道点` : `+${value} Dao Points`;
    case 'give_cultivation':
      return isZh ? `+${value} 修为` : `+${value} Cultivation`;
    case 'unlock_system':
      return isZh ? `解锁: ${effect.target}` : `Unlock: ${effect.target}`;
    case 'unlock_area':
      return isZh ? `解锁区域: ${effect.target}` : `Unlock Area: ${effect.target}`;
    case 'set_flag':
      return isZh ? '剧情推进' : 'Story Progress';
    default:
      return '';
  }
};

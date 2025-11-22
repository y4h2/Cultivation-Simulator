import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n';
import { useGame } from '../context/GameContext';
import type {
  SkillTreeType,
  ElementTreeType,
  SkillTreeNode,
  ElementTreeNode,
} from '../types/game';
import {
  ALL_SKILL_TREE_NODES,
  SKILL_TREE_INFO,
} from '../constants/skillTrees';
import {
  ALL_ELEMENT_TREE_NODES,
  ELEMENT_TREE_INFO,
} from '../constants/elementTrees';
import {
  canUnlockSkillNode,
  canUnlockElementNode,
  getSkillTreeProgress,
  getElementTreeProgress,
} from '../utils/skillTree';
import { SkillTreeBackground } from './SkillTreeBackground';

type TreeCategory = 'main' | 'element';

// Node dimensions for positioning
const NODE_HEIGHT = 80;
const TIER_HEIGHT = 100;
const TREE_PADDING_TOP = 40;
const TREE_PADDING_LEFT = 60;

interface NodePosition {
  x: number;
  y: number;
  node: SkillTreeNode | ElementTreeNode;
}

export const SkillTreePanel: React.FC = () => {
  const { language, t } = useLanguage();
  const { state, dispatch } = useGame();
  const { character } = state;

  const [treeCategory, setTreeCategory] = useState<TreeCategory>('main');
  const [selectedMainTree, setSelectedMainTree] = useState<SkillTreeType>('sword');
  const [selectedElementTree, setSelectedElementTree] = useState<ElementTreeType>('fire');
  const [selectedNode, setSelectedNode] = useState<SkillTreeNode | ElementTreeNode | null>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isZh = language === 'zh';

  // Track container width for responsive layout
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Get current tree nodes
  const currentNodes = useMemo(() => {
    if (treeCategory === 'main') {
      return ALL_SKILL_TREE_NODES[selectedMainTree];
    }
    return ALL_ELEMENT_TREE_NODES[selectedElementTree];
  }, [treeCategory, selectedMainTree, selectedElementTree]);

  // Get learned nodes for current tree
  const learnedNodeIds = useMemo(() => {
    if (treeCategory === 'main') {
      return character.learnedSkills.mainTree[selectedMainTree];
    }
    return character.learnedSkills.elementTree[selectedElementTree];
  }, [treeCategory, selectedMainTree, selectedElementTree, character.learnedSkills]);

  // Get tree progress
  const treeProgress = useMemo(() => {
    if (treeCategory === 'main') {
      return getSkillTreeProgress(character, selectedMainTree);
    }
    return getElementTreeProgress(character, selectedElementTree);
  }, [treeCategory, selectedMainTree, selectedElementTree, character]);

  // Calculate node positions organized by tier
  const { nodePositions, svgHeight } = useMemo(() => {
    const nodesByTier: Record<number, (SkillTreeNode | ElementTreeNode)[]> = {};
    currentNodes.forEach(node => {
      if (!nodesByTier[node.tier]) {
        nodesByTier[node.tier] = [];
      }
      nodesByTier[node.tier].push(node);
    });

    const positions: Map<string, NodePosition> = new Map();
    const NODE_WIDTH = 64; // w-16 = 64px
    const MIN_NODE_SPACING = 8; // Minimum space between nodes
    
    // Calculate available width, ensuring it's never negative
    // If container is too small, reduce padding dynamically
    const minRequiredWidth = NODE_WIDTH + MIN_NODE_SPACING;
    const effectivePadding = Math.max(
      TREE_PADDING_LEFT,
      Math.min(TREE_PADDING_LEFT, (containerWidth - minRequiredWidth) / 2)
    );
    const availableWidth = Math.max(0, containerWidth - effectivePadding * 2);

    // Calculate positions for each tier
    [1, 2, 3, 4, 5].forEach(tier => {
      const tierNodes = nodesByTier[tier] || [];
      const nodeCount = tierNodes.length;

      if (nodeCount === 0) return;

      // Calculate horizontal spacing
      // If we have enough space, distribute evenly; otherwise use minimum spacing
      const totalNodeWidth = nodeCount * NODE_WIDTH;
      const totalSpacingNeeded = (nodeCount - 1) * MIN_NODE_SPACING;
      const minRequiredSpace = totalNodeWidth + totalSpacingNeeded;
      
      let spacing: number;
      if (availableWidth >= minRequiredSpace && nodeCount > 1) {
        // Enough space: distribute evenly
        spacing = availableWidth / (nodeCount + 1);
      } else if (nodeCount === 1) {
        // Single node: center it
        spacing = availableWidth / 2;
      } else {
        // Not enough space: use minimum spacing
        spacing = MIN_NODE_SPACING;
      }

      tierNodes.forEach((node, index) => {
        let x: number;
        if (nodeCount === 1) {
          // Center single node
          x = effectivePadding + spacing;
        } else if (availableWidth >= minRequiredSpace) {
          // Even distribution
          x = effectivePadding + spacing * (index + 1);
        } else {
          // Minimum spacing layout
          x = effectivePadding + index * (NODE_WIDTH + spacing);
        }
        const y = TREE_PADDING_TOP + (tier - 1) * TIER_HEIGHT + NODE_HEIGHT / 2;

        positions.set(node.id, { x, y, node });
      });
    });

    const maxTier = Math.max(...Object.keys(nodesByTier).map(Number), 5);
    const svgHeight = TREE_PADDING_TOP + maxTier * TIER_HEIGHT + 20;

    return { nodePositions: positions, svgHeight, nodesByTier };
  }, [currentNodes, containerWidth]);

  // Handle node click
  const handleNodeClick = useCallback((node: SkillTreeNode | ElementTreeNode) => {
    setSelectedNode(node);
  }, []);

  // Handle learn node
  const handleLearnNode = useCallback(() => {
    if (!selectedNode) return;

    if (treeCategory === 'main') {
      dispatch({
        type: 'LEARN_SKILL_NODE',
        payload: { nodeId: selectedNode.id, treeType: 'main' },
      });
    } else {
      dispatch({
        type: 'LEARN_SKILL_NODE',
        payload: { nodeId: selectedNode.id, treeType: 'element' },
      });
    }
  }, [selectedNode, treeCategory, dispatch]);

  // Check if node can be learned
  const canLearnSelectedNode = useMemo(() => {
    if (!selectedNode) return { canUnlock: false };

    if (treeCategory === 'main') {
      return canUnlockSkillNode(character, selectedNode as SkillTreeNode);
    }
    return canUnlockElementNode(character, selectedNode as ElementTreeNode);
  }, [selectedNode, treeCategory, character]);

  // Get tree info
  const currentTreeInfo = useMemo(() => {
    if (treeCategory === 'main') {
      return SKILL_TREE_INFO[selectedMainTree];
    }
    return ELEMENT_TREE_INFO[selectedElementTree];
  }, [treeCategory, selectedMainTree, selectedElementTree]);

  // Get node state: 'learned', 'unlockable', 'locked'
  const getNodeState = useCallback((node: SkillTreeNode | ElementTreeNode) => {
    if (learnedNodeIds.includes(node.id)) return 'learned';

    const canUnlock = treeCategory === 'main'
      ? canUnlockSkillNode(character, node as SkillTreeNode).canUnlock
      : canUnlockElementNode(character, node as ElementTreeNode).canUnlock;

    if (canUnlock) return 'unlockable';
    return 'locked';
  }, [learnedNodeIds, treeCategory, character]);

  // Node color based on state
  const getNodeColor = useCallback((node: SkillTreeNode | ElementTreeNode) => {
    const state = getNodeState(node);
    if (state === 'learned') return 'bg-green-600 border-green-400';
    if (state === 'unlockable') return 'bg-amber-600 border-amber-400 hover:bg-amber-500';
    return 'bg-gray-700 border-gray-500 opacity-60';
  }, [getNodeState]);

  // Get connection line color
  const getConnectionColor = useCallback((fromId: string, toId: string) => {
    const fromLearned = learnedNodeIds.includes(fromId);
    const toLearned = learnedNodeIds.includes(toId);

    if (fromLearned && toLearned) {
      return '#22c55e'; // Green - both learned
    }
    if (fromLearned) {
      return '#f59e0b'; // Amber - path available
    }
    return '#4b5563'; // Gray - locked
  }, [learnedNodeIds]);

  // Render tree navigation tabs
  const renderTreeTabs = () => {
    if (treeCategory === 'main') {
      return (
        <div className="flex gap-1 flex-wrap">
          {(Object.keys(SKILL_TREE_INFO) as SkillTreeType[]).map((tree) => {
            const info = SKILL_TREE_INFO[tree];
            const progress = getSkillTreeProgress(character, tree);
            const isSelected = selectedMainTree === tree;

            return (
              <button
                key={tree}
                onClick={() => {
                  setSelectedMainTree(tree);
                  setSelectedNode(null);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex flex-col items-center min-w-[80px] ${
                  isSelected
                    ? 'text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                style={isSelected ? { backgroundColor: info.color } : undefined}
              >
                <span>{isZh ? info.chineseName : info.name}</span>
                <span className="text-xs opacity-75">{progress.learned}/{progress.total}</span>
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="flex gap-1 flex-wrap">
        {(Object.keys(ELEMENT_TREE_INFO) as ElementTreeType[]).map((element) => {
          const info = ELEMENT_TREE_INFO[element];
          const progress = getElementTreeProgress(character, element);
          const isSelected = selectedElementTree === element;
          const isPrimary = character.learnedSkills.primaryElement === element;
          const isSecondary = character.learnedSkills.secondaryElement === element;

          return (
            <button
              key={element}
              onClick={() => {
                setSelectedElementTree(element);
                setSelectedNode(null);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex flex-col items-center min-w-[80px] relative ${
                isSelected
                  ? 'text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              style={isSelected ? { backgroundColor: info.color } : undefined}
            >
              <span>{isZh ? info.chineseName : info.name}</span>
              <span className="text-xs opacity-75">{progress.learned}/{progress.total}</span>
              {isPrimary && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-xs px-1 rounded">
                  {t.skillTree.primary}
                </span>
              )}
              {isSecondary && (
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-xs px-1 rounded">
                  {t.skillTree.secondary}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // Render connection lines between nodes
  const renderConnections = () => {
    const connections: React.ReactNode[] = [];

    currentNodes.forEach(node => {
      const toPos = nodePositions.get(node.id);
      if (!toPos) return;

      node.prerequisites.forEach(prereqId => {
        const fromPos = nodePositions.get(prereqId);
        if (!fromPos) return;

        const color = getConnectionColor(prereqId, node.id);
        const isActive = learnedNodeIds.includes(prereqId);

        // Calculate control points for curved line
        const midY = (fromPos.y + toPos.y) / 2;

        connections.push(
          <g key={`${prereqId}-${node.id}`}>
            {/* Glow effect for active connections */}
            {isActive && (
              <path
                d={`M ${fromPos.x} ${fromPos.y + NODE_HEIGHT / 2 - 8}
                    Q ${fromPos.x} ${midY}, ${(fromPos.x + toPos.x) / 2} ${midY}
                    Q ${toPos.x} ${midY}, ${toPos.x} ${toPos.y - NODE_HEIGHT / 2 + 8}`}
                fill="none"
                stroke={color}
                strokeWidth="6"
                strokeOpacity="0.3"
                strokeLinecap="round"
              />
            )}
            {/* Main connection line */}
            <path
              d={`M ${fromPos.x} ${fromPos.y + NODE_HEIGHT / 2 - 8}
                  Q ${fromPos.x} ${midY}, ${(fromPos.x + toPos.x) / 2} ${midY}
                  Q ${toPos.x} ${midY}, ${toPos.x} ${toPos.y - NODE_HEIGHT / 2 + 8}`}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              className="transition-colors duration-300"
            />
            {/* Arrow head */}
            <polygon
              points={`${toPos.x},${toPos.y - NODE_HEIGHT / 2 + 8}
                       ${toPos.x - 5},${toPos.y - NODE_HEIGHT / 2 + 2}
                       ${toPos.x + 5},${toPos.y - NODE_HEIGHT / 2 + 2}`}
              fill={color}
              className="transition-colors duration-300"
            />
          </g>
        );
      });
    });

    return connections;
  };

  // Get current tree type for background
  const currentTreeType = treeCategory === 'main' ? selectedMainTree : selectedElementTree;

  // Render skill tree visualization
  const renderTree = () => {
    return (
      <div
        ref={containerRef}
        className="relative bg-gray-900/80 rounded-lg overflow-hidden"
        style={{ minHeight: `${svgHeight}px` }}
      >
        {/* Background effect */}
        <SkillTreeBackground treeType={currentTreeType} />

        {/* SVG for connection lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ height: `${svgHeight}px` }}
        >
          <defs>
            {/* Gradient definitions for connections */}
            <linearGradient id="activeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <linearGradient id="availableGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          {renderConnections()}
        </svg>

        {/* Tier labels */}
        <div className="absolute left-2 top-0 bottom-0 flex flex-col z-20" style={{ paddingTop: `${TREE_PADDING_TOP}px` }}>
          {[1, 2, 3, 4, 5].map(tier => (
            <div
              key={tier}
              className="text-xs text-gray-400 font-medium flex items-center"
              style={{ height: `${TIER_HEIGHT}px` }}
            >
              <span className="bg-gray-700/50 px-2 py-1 rounded">T{tier}</span>
            </div>
          ))}
        </div>

        {/* Nodes */}
        {currentNodes.map(node => {
          const pos = nodePositions.get(node.id);
          if (!pos) return null;

          const isSelected = selectedNode?.id === node.id;
          const nodeState = getNodeState(node);

          return (
            <button
              key={node.id}
              onClick={() => handleNodeClick(node)}
              className={`
                absolute transform -translate-x-1/2 -translate-y-1/2
                w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center
                transition-all duration-200 cursor-pointer z-20
                ${getNodeColor(node)}
                ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110 z-30' : 'hover:scale-105'}
              `}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
              }}
              title={isZh ? node.chineseName : node.name}
            >
              {/* Node type indicator */}
              <span className={`text-xs px-1 rounded absolute -top-2 ${
                node.type === 'active' ? 'bg-purple-600' : 'bg-blue-600'
              }`}>
                {isZh ? t.skillTree.nodeTypes[node.type] : node.type.charAt(0).toUpperCase()}
              </span>

              {/* Node icon or status */}
              <span className="text-lg font-bold">
                {nodeState === 'learned' ? (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : nodeState === 'unlockable' ? (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </span>

              {/* Node name (truncated) */}
              <span className="text-[9px] text-center leading-tight px-1 truncate w-full mt-1">
                {isZh ? node.chineseName : node.name}
              </span>
            </button>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-2 right-2 flex gap-3 text-xs text-gray-400 bg-gray-900/90 px-3 py-2 rounded z-20 border border-gray-700/50">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-600 border border-green-400"></div>
            <span>{isZh ? '已学习' : 'Learned'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-600 border border-amber-400"></div>
            <span>{isZh ? '可学习' : 'Available'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-700 border border-gray-500 opacity-60"></div>
            <span>{isZh ? '锁定' : 'Locked'}</span>
          </div>
        </div>
      </div>
    );
  };

  // Render node details panel
  const renderNodeDetails = () => {
    if (!selectedNode) {
      return (
        <div className="bg-gray-800/50 rounded-lg p-4 text-gray-400 text-center">
          {isZh ? '点击节点查看详情' : 'Click a node to view details'}
        </div>
      );
    }

    const isLearned = learnedNodeIds.includes(selectedNode.id);

    return (
      <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-amber-400">
              {isZh ? selectedNode.chineseName : selectedNode.name}
            </h3>
            <div className="flex gap-2 text-xs text-gray-400">
              <span className={`px-2 py-0.5 rounded ${
                selectedNode.type === 'active' ? 'bg-purple-600/50' : 'bg-blue-600/50'
              }`}>
                {t.skillTree.nodeTypes[selectedNode.type]}
              </span>
              <span className="px-2 py-0.5 rounded bg-gray-600/50">
                {t.skillTree.tier} {selectedNode.tier}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-amber-400 font-bold">
              {t.skillTree.cost}: {selectedNode.cost}
            </div>
            <div className="text-xs text-gray-400">
              {t.skillTree.wudaoPoints}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm">
          {isZh ? selectedNode.chineseDescription : selectedNode.description}
        </p>

        {/* Prerequisites */}
        {selectedNode.prerequisites.length > 0 && (
          <div className="text-xs text-gray-400">
            <span className="text-gray-500">{t.skillTree.requires}: </span>
            {selectedNode.prerequisites.map((prereqId, idx) => {
              const prereqNode = currentNodes.find(n => n.id === prereqId);
              const hasPrereq = learnedNodeIds.includes(prereqId);
              return (
                <span key={prereqId} className={hasPrereq ? 'text-green-400' : 'text-red-400'}>
                  {prereqNode ? (isZh ? prereqNode.chineseName : prereqNode.name) : prereqId}
                  {idx < selectedNode.prerequisites.length - 1 && ', '}
                </span>
              );
            })}
          </div>
        )}

        {/* Modifiers */}
        {selectedNode.modifiers && selectedNode.modifiers.length > 0 && (
          <div className="text-sm">
            <span className="text-gray-500">{isZh ? '属性加成:' : 'Stat Bonuses:'}</span>
            <ul className="text-green-400 text-xs mt-1">
              {selectedNode.modifiers.map((mod, idx) => (
                <li key={idx}>
                  {mod.stat}: {mod.value > 0 ? '+' : ''}{mod.value}{mod.isPercentage ? '%' : ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skill granted */}
        {selectedNode.skill && (
          <div className="text-sm bg-purple-900/30 rounded p-2">
            <span className="text-purple-400">{isZh ? '解锁技能:' : 'Unlocks Skill:'}</span>
            <div className="text-white font-medium">
              {isZh ? selectedNode.skill.chineseName : selectedNode.skill.name}
            </div>
            <div className="text-xs text-gray-400">
              {isZh ? selectedNode.skill.chineseDescription : selectedNode.skill.description}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="pt-2 border-t border-gray-700">
          {isLearned ? (
            <div className="text-green-400 text-center font-medium">
              {t.skillTree.learned}
            </div>
          ) : (
            <div>
              {!canLearnSelectedNode.canUnlock && (
                <div className="text-red-400 text-xs mb-2">
                  {isZh ? canLearnSelectedNode.reasonChinese : canLearnSelectedNode.reason}
                </div>
              )}
              <button
                onClick={handleLearnNode}
                disabled={!canLearnSelectedNode.canUnlock}
                className={`w-full py-2 rounded-lg font-medium transition-all ${
                  canLearnSelectedNode.canUnlock
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {t.skillTree.learn} ({selectedNode.cost} {t.skillTree.wudaoPoints})
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Calculate total spent points for current tree
  const currentTreeSpentPoints = useMemo(() => {
    const nodeIds = treeCategory === 'main'
      ? character.learnedSkills.mainTree[selectedMainTree]
      : character.learnedSkills.elementTree[selectedElementTree];

    return currentNodes
      .filter(node => nodeIds.includes(node.id))
      .reduce((sum, node) => sum + node.cost, 0);
  }, [treeCategory, selectedMainTree, selectedElementTree, character.learnedSkills, currentNodes]);

  // Handle reset skill tree
  const handleResetTree = useCallback(() => {
    if (treeCategory === 'main') {
      dispatch({
        type: 'RESET_SKILL_TREE',
        payload: { tree: selectedMainTree, treeType: 'main' },
      });
    } else {
      dispatch({
        type: 'RESET_SKILL_TREE',
        payload: { tree: selectedElementTree, treeType: 'element' },
      });
    }
    setShowResetConfirm(false);
    setSelectedNode(null);
  }, [treeCategory, selectedMainTree, selectedElementTree, dispatch]);

  // Check if current tree has any learned skills
  const canResetCurrentTree = useMemo(() => {
    const nodeIds = treeCategory === 'main'
      ? character.learnedSkills.mainTree[selectedMainTree]
      : character.learnedSkills.elementTree[selectedElementTree];
    return nodeIds.length > 0;
  }, [treeCategory, selectedMainTree, selectedElementTree, character.learnedSkills]);

  return (
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-2 sm:p-3 md:p-4 space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-amber-400">{t.skillTree.title}</h2>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-sm">
            <span className="text-gray-400">{t.skillTree.wudaoPoints}: </span>
            <span className="text-amber-400 font-bold">{character.skillPoints.wudaoPoints}</span>
            <span className="text-gray-500"> / </span>
            <span className="text-gray-400">{character.skillPoints.totalPointsEarned}</span>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            disabled={!canResetCurrentTree}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              canResetCurrentTree
                ? 'bg-red-600/80 hover:bg-red-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t.skillTree.reset}
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 max-w-sm mx-4 border border-gray-600" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-amber-400 mb-3">
              {isZh ? '重置技能树' : 'Reset Skill Tree'}
            </h3>
            <p className="text-gray-300 text-sm mb-2">
              {t.skillTree.resetConfirm}
            </p>
            <p className="text-amber-400 text-sm mb-4">
              {t.skillTree.refund}: <span className="font-bold">{Math.floor(currentTreeSpentPoints * 0.8)}</span> {t.skillTree.wudaoPoints}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {isZh ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={handleResetTree}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                {isZh ? '确定重置' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category toggle */}
      <div className="flex gap-1.5 sm:gap-2">
        <button
          onClick={() => {
            setTreeCategory('main');
            setSelectedNode(null);
          }}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base min-h-[44px] ${
            treeCategory === 'main'
              ? 'bg-amber-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {t.skillTree.mainTrees}
        </button>
        <button
          onClick={() => {
            setTreeCategory('element');
            setSelectedNode(null);
          }}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base min-h-[44px] ${
            treeCategory === 'element'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {t.skillTree.elementTrees}
        </button>
      </div>

      {/* Tree tabs */}
      {renderTreeTabs()}

      {/* Tree info */}
      <div className="text-xs sm:text-sm text-gray-400">
        <span className="font-medium" style={{ color: currentTreeInfo.color }}>
          {isZh ? currentTreeInfo.chineseName : currentTreeInfo.name}
        </span>
        <span className="hidden sm:inline">
          {' - '}
          {isZh ? currentTreeInfo.chineseDescription : currentTreeInfo.description}
        </span>
        {' | '}
        <span className="text-amber-400">
          {treeProgress.learned}/{treeProgress.total} ({treeProgress.percentage}%)
        </span>
      </div>

      {/* Main content: Tree + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Tree visualization */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          {renderTree()}
        </div>

        {/* Node details */}
        <div className="order-1 lg:order-2">
          {renderNodeDetails()}
        </div>
      </div>
    </div>
  );
};

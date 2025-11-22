import React, { useState, useMemo, useCallback } from 'react';
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

type TreeCategory = 'main' | 'element';

export const SkillTreePanel: React.FC = () => {
  const { language, t } = useLanguage();
  const { state, dispatch } = useGame();
  const { character } = state;

  const [treeCategory, setTreeCategory] = useState<TreeCategory>('main');
  const [selectedMainTree, setSelectedMainTree] = useState<SkillTreeType>('sword');
  const [selectedElementTree, setSelectedElementTree] = useState<ElementTreeType>('fire');
  const [selectedNode, setSelectedNode] = useState<SkillTreeNode | ElementTreeNode | null>(null);

  const isZh = language === 'zh';

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

  // Node color based on state
  const getNodeColor = useCallback((node: SkillTreeNode | ElementTreeNode) => {
    const isLearned = learnedNodeIds.includes(node.id);
    if (isLearned) return 'bg-green-600 border-green-400';

    const canUnlock = treeCategory === 'main'
      ? canUnlockSkillNode(character, node as SkillTreeNode).canUnlock
      : canUnlockElementNode(character, node as ElementTreeNode).canUnlock;

    if (canUnlock) return 'bg-amber-600 border-amber-400 hover:bg-amber-500';
    return 'bg-gray-700 border-gray-500 opacity-60';
  }, [learnedNodeIds, treeCategory, character]);

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

  // Render skill tree visualization
  const renderTree = () => {
    // Group nodes by tier
    const nodesByTier: Record<number, (SkillTreeNode | ElementTreeNode)[]> = {};
    currentNodes.forEach(node => {
      if (!nodesByTier[node.tier]) {
        nodesByTier[node.tier] = [];
      }
      nodesByTier[node.tier].push(node);
    });

    return (
      <div className="relative min-h-[400px] bg-gray-800/50 rounded-lg p-4">
        {/* Tier labels */}
        <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around text-xs text-gray-500">
          {[1, 2, 3, 4, 5].map(tier => (
            <div key={tier} className="py-4">T{tier}</div>
          ))}
        </div>

        {/* Nodes grid */}
        <div className="ml-8 space-y-6">
          {[1, 2, 3, 4, 5].map(tier => {
            const tierNodes = nodesByTier[tier] || [];
            return (
              <div key={tier} className="flex gap-4 justify-center flex-wrap min-h-[60px]">
                {tierNodes.map(node => {
                  const isLearned = learnedNodeIds.includes(node.id);
                  const isSelected = selectedNode?.id === node.id;

                  return (
                    <button
                      key={node.id}
                      onClick={() => handleNodeClick(node)}
                      className={`
                        relative w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center
                        transition-all cursor-pointer
                        ${getNodeColor(node)}
                        ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}
                      `}
                      title={isZh ? node.chineseName : node.name}
                    >
                      {/* Node type indicator */}
                      <span className={`text-xs px-1 rounded absolute -top-2 ${
                        node.type === 'active' ? 'bg-purple-600' : 'bg-blue-600'
                      }`}>
                        {isZh ? t.skillTree.nodeTypes[node.type] : node.type.charAt(0).toUpperCase()}
                      </span>

                      {/* Node icon or tier */}
                      <span className="text-lg font-bold">
                        {isLearned ? '!' : node.tier}
                      </span>

                      {/* Node name (truncated) */}
                      <span className="text-[10px] text-center leading-tight px-1 truncate w-full">
                        {isZh ? node.chineseName : node.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
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

  return (
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-amber-400">{t.skillTree.title}</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-gray-400">{t.skillTree.wudaoPoints}: </span>
            <span className="text-amber-400 font-bold">{character.skillPoints.wudaoPoints}</span>
          </div>
        </div>
      </div>

      {/* Category toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setTreeCategory('main');
            setSelectedNode(null);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
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
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
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
      <div className="text-sm text-gray-400">
        <span className="font-medium" style={{ color: currentTreeInfo.color }}>
          {isZh ? currentTreeInfo.chineseName : currentTreeInfo.name}
        </span>
        {' - '}
        {isZh ? currentTreeInfo.chineseDescription : currentTreeInfo.description}
        {' | '}
        <span className="text-amber-400">
          {treeProgress.learned}/{treeProgress.total} ({treeProgress.percentage}%)
        </span>
      </div>

      {/* Main content: Tree + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tree visualization */}
        <div className="lg:col-span-2">
          {renderTree()}
        </div>

        {/* Node details */}
        <div>
          {renderNodeDetails()}
        </div>
      </div>
    </div>
  );
};

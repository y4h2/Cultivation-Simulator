// ============================================
// Skill Tree Constants - Five Main Cultivation Paths
// ============================================

import type {
  SkillTreeNode,
  SkillTreeType,
  Realm,
  SkillTier,
} from '../types/game';

// Import data from JSON
import skillTreeData from '../data/skillTrees.json';

// ============================================
// Realm Requirements per Tier
// ============================================

export const TIER_REALM_REQUIREMENTS: Record<SkillTier, Realm> =
  skillTreeData.tierRealmRequirements as Record<SkillTier, Realm>;

// ============================================
// Skill Point Costs per Tier
// ============================================

export const TIER_POINT_COSTS: Record<SkillTier, number> =
  skillTreeData.tierPointCosts as Record<SkillTier, number>;

// ============================================
// Skill Tree Nodes from JSON
// ============================================

export const SWORD_TREE_NODES: SkillTreeNode[] = skillTreeData.trees.sword as SkillTreeNode[];
export const SPELL_TREE_NODES: SkillTreeNode[] = skillTreeData.trees.spell as SkillTreeNode[];
export const BODY_TREE_NODES: SkillTreeNode[] = skillTreeData.trees.body as SkillTreeNode[];
export const MIND_TREE_NODES: SkillTreeNode[] = skillTreeData.trees.mind as SkillTreeNode[];
export const COMMERCE_TREE_NODES: SkillTreeNode[] = skillTreeData.trees.commerce as SkillTreeNode[];

// ============================================
// Combined Skill Trees
// ============================================

export const ALL_SKILL_TREE_NODES: Record<SkillTreeType, SkillTreeNode[]> = {
  sword: SWORD_TREE_NODES,
  spell: SPELL_TREE_NODES,
  body: BODY_TREE_NODES,
  mind: MIND_TREE_NODES,
  commerce: COMMERCE_TREE_NODES,
};

// Helper function to get all nodes flat
export const getAllSkillTreeNodes = (): SkillTreeNode[] => {
  return [
    ...SWORD_TREE_NODES,
    ...SPELL_TREE_NODES,
    ...BODY_TREE_NODES,
    ...MIND_TREE_NODES,
    ...COMMERCE_TREE_NODES,
  ];
};

// Helper to get node by ID
export const getSkillTreeNodeById = (nodeId: string): SkillTreeNode | undefined => {
  return getAllSkillTreeNodes().find(node => node.id === nodeId);
};

// Tree display info
export const SKILL_TREE_INFO: Record<SkillTreeType, {
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;
  color: string;
}> = skillTreeData.treeInfo as Record<SkillTreeType, {
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;
  color: string;
}>;

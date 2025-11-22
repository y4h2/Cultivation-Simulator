// ============================================
// Element Tree Constants - Five Element Cultivation Paths
// ============================================

import type {
  ElementTreeNode,
  ElementTreeType,
  Realm,
  SkillTier,
} from '../types/game';

// Import data from JSON
import elementTreeData from '../data/elementTrees.json';

// ============================================
// Element Tree Tier Requirements
// ============================================

export const ELEMENT_TIER_REALM_REQUIREMENTS: Record<SkillTier, Realm> =
  elementTreeData.tierRealmRequirements as Record<SkillTier, Realm>;

// Players can only fully unlock T3-T4 for 1 primary + 1 secondary element
// Other elements are limited to T1-T2 as foundation passives

// ============================================
// Element Tree Nodes from JSON
// ============================================

export const FIRE_TREE_NODES: ElementTreeNode[] = elementTreeData.trees.fire as ElementTreeNode[];
export const WATER_TREE_NODES: ElementTreeNode[] = elementTreeData.trees.water as ElementTreeNode[];
export const WOOD_TREE_NODES: ElementTreeNode[] = elementTreeData.trees.wood as ElementTreeNode[];
export const METAL_TREE_NODES: ElementTreeNode[] = elementTreeData.trees.metal as ElementTreeNode[];
export const EARTH_TREE_NODES: ElementTreeNode[] = elementTreeData.trees.earth as ElementTreeNode[];

// ============================================
// Combined Element Trees
// ============================================

export const ALL_ELEMENT_TREE_NODES: Record<ElementTreeType, ElementTreeNode[]> = {
  fire: FIRE_TREE_NODES,
  water: WATER_TREE_NODES,
  wood: WOOD_TREE_NODES,
  metal: METAL_TREE_NODES,
  earth: EARTH_TREE_NODES,
};

// Helper function to get all element nodes flat
export const getAllElementTreeNodes = (): ElementTreeNode[] => {
  return [
    ...FIRE_TREE_NODES,
    ...WATER_TREE_NODES,
    ...WOOD_TREE_NODES,
    ...METAL_TREE_NODES,
    ...EARTH_TREE_NODES,
  ];
};

// Helper to get element node by ID
export const getElementTreeNodeById = (nodeId: string): ElementTreeNode | undefined => {
  return getAllElementTreeNodes().find(node => node.id === nodeId);
};

// Element display info
export const ELEMENT_TREE_INFO: Record<ElementTreeType, {
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;
  color: string;
  opposingElement: ElementTreeType;
}> = elementTreeData.treeInfo as Record<ElementTreeType, {
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;
  color: string;
  opposingElement: ElementTreeType;
}>;

// Element restriction rules
export const ELEMENT_RESTRICTION_RULES = elementTreeData.restrictionRules;

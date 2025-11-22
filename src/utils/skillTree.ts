// ============================================
// Skill Tree Utility Functions
// ============================================

import type {
  Character,
  SkillTreeNode,
  ElementTreeNode,
  SkillTreeType,
  ElementTreeType,
  Realm,
  LearnedSkillsState,
  SkillPointsState,
  ComputedPassives,
  StatModifier,
  PassiveTrigger,
  CombatStats,
  Element,
  SkillTier,
} from '../types/game';
import {
  ALL_SKILL_TREE_NODES,
  getSkillTreeNodeById,
} from '../constants/skillTrees';
import {
  ALL_ELEMENT_TREE_NODES,
  getElementTreeNodeById,
} from '../constants/elementTrees';
import { REALM_ORDER } from '../constants/realms';

// ============================================
// Initial State Creators
// ============================================

export const createInitialSkillPoints = (): SkillPointsState => ({
  wudaoPoints: 3, // Start with 3 points
  techniqueScrolls: [],
  totalPointsEarned: 3,
});

export const createInitialLearnedSkills = (): LearnedSkillsState => ({
  mainTree: {
    sword: [],
    spell: [],
    body: [],
    mind: [],
    commerce: [],
  },
  elementTree: {
    fire: [],
    water: [],
    wood: [],
    metal: [],
    earth: [],
  },
  primaryElement: undefined,
  secondaryElement: undefined,
});

// ============================================
// Realm Comparison Helpers
// ============================================

const getRealmIndex = (realm: Realm): number => {
  return REALM_ORDER.indexOf(realm);
};

const isRealmAtLeast = (currentRealm: Realm, requiredRealm: Realm): boolean => {
  return getRealmIndex(currentRealm) >= getRealmIndex(requiredRealm);
};

// ============================================
// Node Availability Checks
// ============================================

export const canUnlockSkillNode = (
  character: Character,
  node: SkillTreeNode
): { canUnlock: boolean; reason?: string; reasonChinese?: string } => {
  // Check realm requirement
  if (!isRealmAtLeast(character.realm, node.realmRequired)) {
    return {
      canUnlock: false,
      reason: `Requires ${node.realmRequired} realm`,
      reasonChinese: `需要达到${node.realmRequired}境界`,
    };
  }

  // Check skill points
  if (character.skillPoints.wudaoPoints < node.cost) {
    return {
      canUnlock: false,
      reason: `Requires ${node.cost} skill points`,
      reasonChinese: `需要${node.cost}悟道点`,
    };
  }

  // Check if already learned
  const learnedNodes = character.learnedSkills.mainTree[node.tree];
  if (learnedNodes.includes(node.id)) {
    return {
      canUnlock: false,
      reason: 'Already learned',
      reasonChinese: '已学习',
    };
  }

  // Check prerequisites
  for (const prereqId of node.prerequisites) {
    if (!learnedNodes.includes(prereqId)) {
      const prereqNode = getSkillTreeNodeById(prereqId);
      return {
        canUnlock: false,
        reason: `Requires: ${prereqNode?.name || prereqId}`,
        reasonChinese: `需要先学习: ${prereqNode?.chineseName || prereqId}`,
      };
    }
  }

  // Check mutually exclusive nodes
  if (node.mutuallyExclusive) {
    for (const exclusiveId of node.mutuallyExclusive) {
      // Check across all trees
      for (const tree of Object.keys(character.learnedSkills.mainTree) as SkillTreeType[]) {
        if (character.learnedSkills.mainTree[tree].includes(exclusiveId)) {
          const exclusiveNode = getSkillTreeNodeById(exclusiveId);
          return {
            canUnlock: false,
            reason: `Conflicts with: ${exclusiveNode?.name || exclusiveId}`,
            reasonChinese: `与${exclusiveNode?.chineseName || exclusiveId}冲突`,
          };
        }
      }
    }
  }

  // Check scroll requirement
  if (node.scrollRequired && !character.skillPoints.techniqueScrolls.includes(node.scrollRequired)) {
    return {
      canUnlock: false,
      reason: `Requires technique scroll: ${node.scrollRequired}`,
      reasonChinese: `需要功法残页: ${node.scrollRequired}`,
    };
  }

  return { canUnlock: true };
};

export const canUnlockElementNode = (
  character: Character,
  node: ElementTreeNode
): { canUnlock: boolean; reason?: string; reasonChinese?: string } => {
  // Check realm requirement
  if (!isRealmAtLeast(character.realm, node.realmRequired)) {
    return {
      canUnlock: false,
      reason: `Requires ${node.realmRequired} realm`,
      reasonChinese: `需要达到${node.realmRequired}境界`,
    };
  }

  // Check skill points
  if (character.skillPoints.wudaoPoints < node.cost) {
    return {
      canUnlock: false,
      reason: `Requires ${node.cost} skill points`,
      reasonChinese: `需要${node.cost}悟道点`,
    };
  }

  // Check if already learned
  const learnedNodes = character.learnedSkills.elementTree[node.tree];
  if (learnedNodes.includes(node.id)) {
    return {
      canUnlock: false,
      reason: 'Already learned',
      reasonChinese: '已学习',
    };
  }

  // Check prerequisites
  for (const prereqId of node.prerequisites) {
    if (!learnedNodes.includes(prereqId)) {
      const prereqNode = getElementTreeNodeById(prereqId);
      return {
        canUnlock: false,
        reason: `Requires: ${prereqNode?.name || prereqId}`,
        reasonChinese: `需要先学习: ${prereqNode?.chineseName || prereqId}`,
      };
    }
  }

  // Check element tier restrictions
  const { primaryElement, secondaryElement } = character.learnedSkills;

  if (node.tier >= 3) {
    // T3+ requires element designation
    if (node.tier === 4 && primaryElement !== node.tree) {
      if (primaryElement) {
        return {
          canUnlock: false,
          reason: `T4 requires ${node.tree} as primary element`,
          reasonChinese: `四阶需要${node.tree}作为主修元素`,
        };
      }
    }

    if (node.tier === 3) {
      if (primaryElement !== node.tree && secondaryElement !== node.tree) {
        if (primaryElement && secondaryElement) {
          return {
            canUnlock: false,
            reason: 'Already have primary and secondary elements',
            reasonChinese: '已有主修和副修元素',
          };
        }
      }
    }
  }

  return { canUnlock: true };
};

// ============================================
// Node Learning Functions
// ============================================

export const learnSkillNode = (
  character: Character,
  nodeId: string
): { character: Character; success: boolean; message: string; messageChinese: string } => {
  const node = getSkillTreeNodeById(nodeId);
  if (!node) {
    return {
      character,
      success: false,
      message: 'Node not found',
      messageChinese: '节点不存在',
    };
  }

  const checkResult = canUnlockSkillNode(character, node);
  if (!checkResult.canUnlock) {
    return {
      character,
      success: false,
      message: checkResult.reason || 'Cannot unlock',
      messageChinese: checkResult.reasonChinese || '无法解锁',
    };
  }

  // Deduct skill points and add node
  const updatedCharacter: Character = {
    ...character,
    skillPoints: {
      ...character.skillPoints,
      wudaoPoints: character.skillPoints.wudaoPoints - node.cost,
    },
    learnedSkills: {
      ...character.learnedSkills,
      mainTree: {
        ...character.learnedSkills.mainTree,
        [node.tree]: [...character.learnedSkills.mainTree[node.tree], node.id],
      },
    },
  };

  return {
    character: updatedCharacter,
    success: true,
    message: `Learned: ${node.name}`,
    messageChinese: `习得: ${node.chineseName}`,
  };
};

export const learnElementNode = (
  character: Character,
  nodeId: string
): { character: Character; success: boolean; message: string; messageChinese: string } => {
  const node = getElementTreeNodeById(nodeId);
  if (!node) {
    return {
      character,
      success: false,
      message: 'Node not found',
      messageChinese: '节点不存在',
    };
  }

  const checkResult = canUnlockElementNode(character, node);
  if (!checkResult.canUnlock) {
    return {
      character,
      success: false,
      message: checkResult.reason || 'Cannot unlock',
      messageChinese: checkResult.reasonChinese || '无法解锁',
    };
  }

  // Check if we need to set primary/secondary element
  let { primaryElement, secondaryElement } = character.learnedSkills;

  if (node.tier >= 3) {
    if (!primaryElement) {
      primaryElement = node.tree;
    } else if (!secondaryElement && node.tree !== primaryElement) {
      secondaryElement = node.tree;
    }
  }

  // Deduct skill points and add node
  const updatedCharacter: Character = {
    ...character,
    skillPoints: {
      ...character.skillPoints,
      wudaoPoints: character.skillPoints.wudaoPoints - node.cost,
    },
    learnedSkills: {
      ...character.learnedSkills,
      elementTree: {
        ...character.learnedSkills.elementTree,
        [node.tree]: [...character.learnedSkills.elementTree[node.tree], node.id],
      },
      primaryElement,
      secondaryElement,
    },
  };

  return {
    character: updatedCharacter,
    success: true,
    message: `Learned: ${node.name}`,
    messageChinese: `习得: ${node.chineseName}`,
  };
};

// ============================================
// Tree Progress Calculation
// ============================================

export const getSkillTreeProgress = (
  character: Character,
  tree: SkillTreeType
): { learned: number; total: number; percentage: number } => {
  const treeNodes = ALL_SKILL_TREE_NODES[tree];
  const learnedNodes = character.learnedSkills.mainTree[tree];

  return {
    learned: learnedNodes.length,
    total: treeNodes.length,
    percentage: Math.round((learnedNodes.length / treeNodes.length) * 100),
  };
};

export const getElementTreeProgress = (
  character: Character,
  tree: ElementTreeType
): { learned: number; total: number; percentage: number; maxTier: SkillTier } => {
  const treeNodes = ALL_ELEMENT_TREE_NODES[tree];
  const learnedNodes = character.learnedSkills.elementTree[tree];
  const { primaryElement, secondaryElement } = character.learnedSkills;

  let maxTier: SkillTier = 2; // Default foundation level
  if (primaryElement === tree) {
    maxTier = 4;
  } else if (secondaryElement === tree) {
    maxTier = 3;
  }

  const availableNodes = treeNodes.filter(n => n.tier <= maxTier);

  return {
    learned: learnedNodes.length,
    total: availableNodes.length,
    percentage: Math.round((learnedNodes.length / availableNodes.length) * 100),
    maxTier,
  };
};

// ============================================
// Passive Effect Calculation
// ============================================

export const computePassiveEffects = (character: Character): ComputedPassives => {
  const statModifiers: StatModifier[] = [];
  const triggers: PassiveTrigger[] = [];

  const combatBonuses = {
    swordDamageBonus: 0,
    spellDamageBonus: 0,
    elementDamageBonus: {
      fire: 0,
      water: 0,
      wood: 0,
      metal: 0,
      earth: 0,
      wind: 0,
    } as Record<Element, number>,
    critBonus: 0,
    critDamageBonus: 0,
    defenseBonus: 0,
    evasionBonus: 0,
    accuracyBonus: 0,
    lifestealPercent: 0,
    shieldOnCombatStart: 0,
  };

  const marketBonuses = {
    priceInsightLevel: 0,
    tradingBonus: 0,
  };

  const cultivationBonuses = {
    efficiencyBonus: 0,
    breakthroughBonus: 0,
  };

  // Process main skill tree nodes
  for (const tree of Object.keys(character.learnedSkills.mainTree) as SkillTreeType[]) {
    const learnedNodeIds = character.learnedSkills.mainTree[tree];
    const treeNodes = ALL_SKILL_TREE_NODES[tree];

    for (const nodeId of learnedNodeIds) {
      const node = treeNodes.find(n => n.id === nodeId);
      if (!node) continue;

      // Add stat modifiers
      if (node.modifiers) {
        statModifiers.push(...node.modifiers);
      }

      // Add triggers
      if (node.triggers) {
        triggers.push(...node.triggers);
      }

      // Calculate specific bonuses based on tree
      if (tree === 'sword') {
        node.modifiers?.forEach(mod => {
          if (mod.stat === 'atk' && mod.isPercentage) {
            combatBonuses.swordDamageBonus += mod.value;
          }
          if (mod.stat === 'critDmg') {
            combatBonuses.critDamageBonus += mod.value;
          }
        });
      }

      if (tree === 'spell') {
        node.modifiers?.forEach(mod => {
          if (mod.stat === 'atk' && mod.isPercentage) {
            combatBonuses.spellDamageBonus += mod.value;
          }
        });
      }

      if (tree === 'commerce') {
        marketBonuses.priceInsightLevel += 1;
        node.triggers?.forEach(trigger => {
          if (trigger.effect.type === 'market_insight') {
            marketBonuses.tradingBonus += trigger.effect.value;
          }
        });
      }

      if (tree === 'mind') {
        node.modifiers?.forEach(mod => {
          if (mod.stat === 'wis') {
            cultivationBonuses.efficiencyBonus += mod.value;
          }
        });
      }
    }
  }

  // Process element tree nodes
  for (const tree of Object.keys(character.learnedSkills.elementTree) as ElementTreeType[]) {
    const learnedNodeIds = character.learnedSkills.elementTree[tree];
    const treeNodes = ALL_ELEMENT_TREE_NODES[tree];

    for (const nodeId of learnedNodeIds) {
      const node = treeNodes.find(n => n.id === nodeId);
      if (!node) continue;

      // Add stat modifiers
      if (node.modifiers) {
        statModifiers.push(...node.modifiers);
      }

      // Add triggers
      if (node.triggers) {
        triggers.push(...node.triggers);
      }

      // Element-specific bonuses
      node.modifiers?.forEach(mod => {
        if (mod.stat === 'atk' && mod.isPercentage) {
          combatBonuses.elementDamageBonus[tree as Element] += mod.value;
        }
        if (mod.stat === 'def') {
          combatBonuses.defenseBonus += mod.value;
        }
        if (mod.stat === 'eva') {
          combatBonuses.evasionBonus += mod.value;
        }
        if (mod.stat === 'crit' && !mod.isPercentage) {
          combatBonuses.critBonus += mod.value;
        }
      });

      // Check for shield on combat start triggers
      node.triggers?.forEach(trigger => {
        if (trigger.type === 'on_combat_start' && trigger.effect.type === 'gain_shield') {
          combatBonuses.shieldOnCombatStart += trigger.effect.value;
        }
        if (trigger.effect.type === 'heal' && trigger.type === 'on_attack') {
          combatBonuses.lifestealPercent += trigger.effect.value;
        }
      });
    }
  }

  return {
    statModifiers,
    triggers,
    combatBonuses,
    marketBonuses,
    cultivationBonuses,
  };
};

// ============================================
// Apply Passive Effects to Combat Stats
// ============================================

export const applyPassiveModifiersToStats = (
  baseStats: CombatStats,
  passives: ComputedPassives
): CombatStats => {
  const modifiedStats = { ...baseStats };

  for (const modifier of passives.statModifiers) {
    const statKey = modifier.stat;
    if (statKey in modifiedStats) {
      if (modifier.isPercentage) {
        (modifiedStats as Record<string, number>)[statKey] = Math.floor(
          (modifiedStats as Record<string, number>)[statKey] * (1 + modifier.value / 100)
        );
      } else {
        (modifiedStats as Record<string, number>)[statKey] += modifier.value;
      }
    }
  }

  return modifiedStats;
};

// ============================================
// Skill Point Awards
// ============================================

export const awardSkillPointsForBreakthrough = (
  character: Character,
  newRealm: Realm
): Character => {
  const realmIndex = getRealmIndex(newRealm);
  const pointsAwarded = Math.max(2, realmIndex + 1); // More points for higher realms

  return {
    ...character,
    skillPoints: {
      ...character.skillPoints,
      wudaoPoints: character.skillPoints.wudaoPoints + pointsAwarded,
      totalPointsEarned: character.skillPoints.totalPointsEarned + pointsAwarded,
    },
  };
};

export const awardSkillPointsForCombat = (
  character: Character,
  isBossKill: boolean
): Character => {
  const chance = isBossKill ? 0.5 : 0.1;
  if (Math.random() > chance) {
    return character;
  }

  const pointsAwarded = isBossKill ? 2 : 1;

  return {
    ...character,
    skillPoints: {
      ...character.skillPoints,
      wudaoPoints: character.skillPoints.wudaoPoints + pointsAwarded,
      totalPointsEarned: character.skillPoints.totalPointsEarned + pointsAwarded,
    },
  };
};

// ============================================
// Reset Functions
// ============================================

export const resetSkillTree = (
  character: Character,
  tree: SkillTreeType
): Character => {
  const treeNodes = ALL_SKILL_TREE_NODES[tree];
  const learnedNodeIds = character.learnedSkills.mainTree[tree];

  // Calculate refunded points (80% refund)
  let refundedPoints = 0;
  for (const nodeId of learnedNodeIds) {
    const node = treeNodes.find(n => n.id === nodeId);
    if (node) {
      refundedPoints += Math.floor(node.cost * 0.8);
    }
  }

  return {
    ...character,
    skillPoints: {
      ...character.skillPoints,
      wudaoPoints: character.skillPoints.wudaoPoints + refundedPoints,
    },
    learnedSkills: {
      ...character.learnedSkills,
      mainTree: {
        ...character.learnedSkills.mainTree,
        [tree]: [],
      },
    },
  };
};

export const resetElementTree = (
  character: Character,
  tree: ElementTreeType
): Character => {
  const treeNodes = ALL_ELEMENT_TREE_NODES[tree];
  const learnedNodeIds = character.learnedSkills.elementTree[tree];

  // Calculate refunded points (80% refund)
  let refundedPoints = 0;
  for (const nodeId of learnedNodeIds) {
    const node = treeNodes.find(n => n.id === nodeId);
    if (node) {
      refundedPoints += Math.floor(node.cost * 0.8);
    }
  }

  // Check if we need to reset primary/secondary element
  let { primaryElement, secondaryElement } = character.learnedSkills;
  if (primaryElement === tree) {
    primaryElement = secondaryElement;
    secondaryElement = undefined;
  } else if (secondaryElement === tree) {
    secondaryElement = undefined;
  }

  return {
    ...character,
    skillPoints: {
      ...character.skillPoints,
      wudaoPoints: character.skillPoints.wudaoPoints + refundedPoints,
    },
    learnedSkills: {
      ...character.learnedSkills,
      elementTree: {
        ...character.learnedSkills.elementTree,
        [tree]: [],
      },
      primaryElement,
      secondaryElement,
    },
  };
};

// ============================================
// Get Unlocked Skills from Nodes
// ============================================

export const getUnlockedSkillsFromNodes = (character: Character): string[] => {
  const unlockedSkillIds: string[] = [];

  // Check main tree nodes
  for (const tree of Object.keys(character.learnedSkills.mainTree) as SkillTreeType[]) {
    const learnedNodeIds = character.learnedSkills.mainTree[tree];
    const treeNodes = ALL_SKILL_TREE_NODES[tree];

    for (const nodeId of learnedNodeIds) {
      const node = treeNodes.find(n => n.id === nodeId);
      if (node?.skill) {
        unlockedSkillIds.push(node.skill.id);
      }
    }
  }

  // Check element tree nodes
  for (const tree of Object.keys(character.learnedSkills.elementTree) as ElementTreeType[]) {
    const learnedNodeIds = character.learnedSkills.elementTree[tree];
    const treeNodes = ALL_ELEMENT_TREE_NODES[tree];

    for (const nodeId of learnedNodeIds) {
      const node = treeNodes.find(n => n.id === nodeId);
      if (node?.skill) {
        unlockedSkillIds.push(node.skill.id);
      }
    }
  }

  return unlockedSkillIds;
};

// ============================================
// Storyline System Constants and Helper Functions
// ============================================

import type { GameTime, Character } from '../types/game';
import type { ClanState } from '../types/clan';
import type { WorldEventState } from '../types/worldEvent';
import type {
  StoryState,
  StoryChapter,
  StoryNode,
  StoryCondition,
  StoryEffect,
  StoryChoice,
  BehaviorTag,
  ActiveStoryNode,
  CompletedStoryNode,
  StoryDefinition,
} from '../types/storyline';
import storylineData from '../data/storyline.json';

// ============================================
// Load Story Data
// ============================================

const storyDefinition: StoryDefinition = storylineData as StoryDefinition;

export const getAllChapters = (): StoryChapter[] => storyDefinition.chapters;
export const getAllNodes = (): StoryNode[] => storyDefinition.nodes;

export const getChapterById = (id: string): StoryChapter | undefined => {
  return storyDefinition.chapters.find(c => c.id === id);
};

export const getNodeById = (id: string): StoryNode | undefined => {
  return storyDefinition.nodes.find(n => n.id === id);
};

export const getChapterNodes = (chapterId: string): StoryNode[] => {
  return storyDefinition.nodes.filter(n => n.chapterId === chapterId);
};

// ============================================
// Initial State Factory
// ============================================

export const createInitialStoryState = (): StoryState => {
  return {
    currentChapterId: 'chapter_1',
    activeNodes: [],
    availableNodeIds: [],
    completedNodes: [],
    completedChapterIds: [],
    storyFlags: {},
    behaviorTags: [],
    eventTimestamps: {},
    initialized: false,
    pendingNotification: undefined,
    combatVictories: 0,
    tradeCount: 0,
  };
};

// ============================================
// Condition Checking Functions
// ============================================

interface ConditionContext {
  character: Character;
  storyState: StoryState;
  clanState?: ClanState;
  worldEvents?: WorldEventState;
  gameTime: GameTime;
}

export const checkCondition = (
  condition: StoryCondition,
  context: ConditionContext
): boolean => {
  const { character, storyState, clanState, gameTime } = context;
  const comparison = condition.comparison || 'gte';

  switch (condition.type) {
    case 'realm': {
      const realmOrder = [
        'qi_refining', 'foundation', 'core_formation', 'nascent_soul',
        'spirit_transformation', 'void_refining', 'body_integration', 'mahayana', 'tribulation'
      ];
      const currentIndex = realmOrder.indexOf(character.realm);
      const requiredIndex = realmOrder.indexOf(condition.realmRequired || 'qi_refining');
      return compare(currentIndex, requiredIndex, comparison);
    }

    case 'realm_stage': {
      const value = typeof condition.value === 'number' ? condition.value : 1;
      return compare(character.realmStage, value, comparison);
    }

    case 'time': {
      if (!condition.daysSince || !storyState.eventTimestamps[condition.daysSince]) {
        return false;
      }
      const eventTime = storyState.eventTimestamps[condition.daysSince];
      const daysPassed = calculateDaysBetween(eventTime, gameTime);
      const required = typeof condition.value === 'number' ? condition.value : 0;
      return compare(daysPassed, required, comparison);
    }

    case 'contribution': {
      const contribution = clanState?.totalContributions || 0;
      const required = typeof condition.value === 'number' ? condition.value : 0;
      return compare(contribution, required, comparison);
    }

    case 'affinity': {
      const affinity = clanState?.clanAffinity || 0;
      const required = typeof condition.value === 'number' ? condition.value : 0;
      return compare(affinity, required, comparison);
    }

    case 'story_flag': {
      const flagName = typeof condition.value === 'string' ? condition.value : '';
      const flagValue = storyState.storyFlags[flagName];
      if (comparison === 'has') {
        return flagValue !== undefined && flagValue !== false;
      }
      if (comparison === 'not_has') {
        return flagValue === undefined || flagValue === false;
      }
      return !!flagValue;
    }

    case 'node_complete': {
      const nodeId = typeof condition.value === 'string' ? condition.value : '';
      return storyState.completedNodes.some(n => n.nodeId === nodeId);
    }

    case 'chapter_complete': {
      const chapterId = typeof condition.value === 'string' ? condition.value : '';
      return storyState.completedChapterIds.includes(chapterId);
    }

    case 'spirit_stones': {
      const required = typeof condition.value === 'number' ? condition.value : 0;
      return compare(character.spiritStones, required, comparison);
    }

    case 'beast_count': {
      const beastCount = character.spiritBeasts?.beasts?.length || 0;
      const required = typeof condition.value === 'number' ? condition.value : 0;
      return compare(beastCount, required, comparison);
    }

    case 'combat_victories': {
      const required = typeof condition.value === 'number' ? condition.value : 0;
      return compare(storyState.combatVictories, required, comparison);
    }

    case 'trade_count': {
      const required = typeof condition.value === 'number' ? condition.value : 0;
      return compare(storyState.tradeCount, required, comparison);
    }

    case 'behavior_tag': {
      const tag = typeof condition.value === 'string' ? condition.value : '';
      if (comparison === 'has') {
        return storyState.behaviorTags.includes(tag as BehaviorTag);
      }
      if (comparison === 'not_has') {
        return !storyState.behaviorTags.includes(tag as BehaviorTag);
      }
      return storyState.behaviorTags.includes(tag as BehaviorTag);
    }

    case 'world_event': {
      // Check if a specific world event is active or has occurred
      // This would need to be implemented based on world event state
      return true;
    }

    default:
      return false;
  }
};

const compare = (
  actual: number,
  required: number,
  comparison: string
): boolean => {
  switch (comparison) {
    case 'eq':
      return actual === required;
    case 'gte':
      return actual >= required;
    case 'lte':
      return actual <= required;
    case 'gt':
      return actual > required;
    case 'lt':
      return actual < required;
    default:
      return actual >= required;
  }
};

export const checkAllConditions = (
  conditions: StoryCondition[],
  context: ConditionContext
): boolean => {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every(cond => checkCondition(cond, context));
};

// ============================================
// Time Utilities
// ============================================

export const calculateDaysBetween = (from: GameTime, to: GameTime): number => {
  const fromTotalDays = from.year * 360 + from.month * 30 + from.day;
  const toTotalDays = to.year * 360 + to.month * 30 + to.day;
  return toTotalDays - fromTotalDays;
};

// ============================================
// Story Progression Functions
// ============================================

export const getAvailableNodes = (
  storyState: StoryState,
  context: ConditionContext
): StoryNode[] => {
  const chapter = getChapterById(storyState.currentChapterId);
  if (!chapter) return [];

  const chapterNodes = getChapterNodes(chapter.id);
  const completedNodeIds = storyState.completedNodes.map(n => n.nodeId);
  const activeNodeIds = storyState.activeNodes.map(n => n.nodeId);

  return chapterNodes.filter(node => {
    // Skip if already completed or active
    if (completedNodeIds.includes(node.id) || activeNodeIds.includes(node.id)) {
      return false;
    }

    // Check trigger conditions
    return checkAllConditions(node.triggerConditions, context);
  });
};

export const startNode = (
  storyState: StoryState,
  nodeId: string,
  gameTime: GameTime
): StoryState => {
  const node = getNodeById(nodeId);
  if (!node) return storyState;

  const activeNode: ActiveStoryNode = {
    nodeId,
    startedAt: { ...gameTime },
    dialogueIndex: 0,
    choicesMade: [],
    isReady: !node.dialogue || node.dialogue.length === 0,
  };

  // Apply onStartEffects
  let updatedState: StoryState = {
    ...storyState,
    activeNodes: [...storyState.activeNodes, activeNode],
    availableNodeIds: storyState.availableNodeIds.filter(id => id !== nodeId),
  };

  // Set event timestamp for this node if it has time conditions later
  if (node.id.includes('joined_sect') || node.onCompleteEffects?.some(e => e.target?.includes('_day'))) {
    updatedState = {
      ...updatedState,
      eventTimestamps: {
        ...updatedState.eventTimestamps,
        [node.id]: { ...gameTime },
      },
    };
  }

  return updatedState;
};

export const advanceDialogue = (
  storyState: StoryState,
  nodeId: string
): StoryState => {
  const node = getNodeById(nodeId);
  if (!node || !node.dialogue) return storyState;

  const activeNodeIndex = storyState.activeNodes.findIndex(n => n.nodeId === nodeId);
  if (activeNodeIndex === -1) return storyState;

  const activeNode = storyState.activeNodes[activeNodeIndex];
  const newDialogueIndex = (activeNode.dialogueIndex || 0) + 1;
  const isComplete = newDialogueIndex >= node.dialogue.length;

  const updatedActiveNode: ActiveStoryNode = {
    ...activeNode,
    dialogueIndex: newDialogueIndex,
    isReady: isComplete && (!node.choices || node.choices.length === 0),
  };

  const updatedActiveNodes = [...storyState.activeNodes];
  updatedActiveNodes[activeNodeIndex] = updatedActiveNode;

  return {
    ...storyState,
    activeNodes: updatedActiveNodes,
  };
};

export const makeChoice = (
  storyState: StoryState,
  nodeId: string,
  choiceId: string
): { state: StoryState; effects: StoryEffect[] } => {
  const node = getNodeById(nodeId);
  if (!node || !node.choices) return { state: storyState, effects: [] };

  const choice = node.choices.find(c => c.id === choiceId);
  if (!choice) return { state: storyState, effects: [] };

  const activeNodeIndex = storyState.activeNodes.findIndex(n => n.nodeId === nodeId);
  if (activeNodeIndex === -1) return { state: storyState, effects: [] };

  const activeNode = storyState.activeNodes[activeNodeIndex];
  const updatedActiveNode: ActiveStoryNode = {
    ...activeNode,
    choicesMade: [...(activeNode.choicesMade || []), choiceId],
    isReady: true,
  };

  const updatedActiveNodes = [...storyState.activeNodes];
  updatedActiveNodes[activeNodeIndex] = updatedActiveNode;

  // Add behavior tags from choice
  let updatedTags = storyState.behaviorTags;
  if (choice.addsTags) {
    updatedTags = [...new Set([...storyState.behaviorTags, ...choice.addsTags])];
  }

  return {
    state: {
      ...storyState,
      activeNodes: updatedActiveNodes,
      behaviorTags: updatedTags,
    },
    effects: choice.effects,
  };
};

export const completeNode = (
  storyState: StoryState,
  nodeId: string,
  gameTime: GameTime
): { state: StoryState; effects: StoryEffect[] } => {
  const node = getNodeById(nodeId);
  if (!node) return { state: storyState, effects: [] };

  const activeNode = storyState.activeNodes.find(n => n.nodeId === nodeId);
  if (!activeNode) return { state: storyState, effects: [] };

  const completedNode: CompletedStoryNode = {
    nodeId,
    completedAt: { ...gameTime },
    choicesMade: activeNode.choicesMade,
  };

  // Determine next node based on choices and conditions
  let nextNodeId: string | undefined;
  if (node.conditionalNextNodes) {
    const context: ConditionContext = {
      character: {} as Character, // Will need actual character
      storyState,
      gameTime,
    };
    for (const conditional of node.conditionalNextNodes) {
      if (checkAllConditions(conditional.conditions, context)) {
        nextNodeId = conditional.nodeId;
        break;
      }
    }
  }
  if (!nextNodeId && node.nextNodes && node.nextNodes.length > 0) {
    nextNodeId = node.nextNodes[0];
  }

  // Process effects
  const effects = node.onCompleteEffects || [];

  // Update story flags from effects
  let updatedFlags = { ...storyState.storyFlags };
  let updatedTimestamps = { ...storyState.eventTimestamps };

  for (const effect of effects) {
    if (effect.type === 'set_flag' && effect.target) {
      updatedFlags[effect.target] = effect.value || true;
      // Also set timestamp for time-based conditions
      if (effect.target.endsWith('_day')) {
        updatedTimestamps[effect.target] = { ...gameTime };
      }
    }
    if (effect.type === 'clear_flag' && effect.target) {
      delete updatedFlags[effect.target];
    }
  }

  return {
    state: {
      ...storyState,
      activeNodes: storyState.activeNodes.filter(n => n.nodeId !== nodeId),
      completedNodes: [...storyState.completedNodes, completedNode],
      storyFlags: updatedFlags,
      eventTimestamps: updatedTimestamps,
    },
    effects,
  };
};

export const checkChapterComplete = (storyState: StoryState): boolean => {
  const chapter = getChapterById(storyState.currentChapterId);
  if (!chapter) return false;

  const completedNodeIds = storyState.completedNodes.map(n => n.nodeId);
  return chapter.requiredNodeIds.every(id => completedNodeIds.includes(id));
};

export const completeChapter = (
  storyState: StoryState,
  _gameTime: GameTime
): { state: StoryState; effects: StoryEffect[] } => {
  const chapter = getChapterById(storyState.currentChapterId);
  if (!chapter) return { state: storyState, effects: [] };

  const effects = chapter.completionEffects || [];

  // Update flags
  let updatedFlags = { ...storyState.storyFlags };
  for (const effect of effects) {
    if (effect.type === 'set_flag' && effect.target) {
      updatedFlags[effect.target] = effect.value || true;
    }
  }

  return {
    state: {
      ...storyState,
      completedChapterIds: [...storyState.completedChapterIds, chapter.id],
      currentChapterId: chapter.nextChapterId || chapter.id,
      storyFlags: updatedFlags,
    },
    effects,
  };
};

// ============================================
// Effect Application Functions
// ============================================

export interface ApplyEffectResult {
  spiritStonesChange: number;
  contributionChange: number;
  wudaoPointsChange: number;
  cultivationChange: number;
  items: Array<{ itemId: string; quantity: number }>;
  flagsToSet: Record<string, boolean | number | string>;
  flagsToClear: string[];
  systemsToUnlock: string[];
  areasToUnlock: string[];
  affinityChange: number;
  behaviorTags: BehaviorTag[];
}

export const computeEffectResults = (effects: StoryEffect[]): ApplyEffectResult => {
  const result: ApplyEffectResult = {
    spiritStonesChange: 0,
    contributionChange: 0,
    wudaoPointsChange: 0,
    cultivationChange: 0,
    items: [],
    flagsToSet: {},
    flagsToClear: [],
    systemsToUnlock: [],
    areasToUnlock: [],
    affinityChange: 0,
    behaviorTags: [],
  };

  for (const effect of effects) {
    const value = typeof effect.value === 'number' ? effect.value : 0;

    switch (effect.type) {
      case 'give_spirit_stones':
        result.spiritStonesChange += value;
        break;
      case 'give_contribution':
        result.contributionChange += value;
        break;
      case 'give_wudao_points':
        result.wudaoPointsChange += value;
        break;
      case 'give_cultivation':
        result.cultivationChange += value;
        break;
      case 'give_item':
        if (effect.itemId) {
          result.items.push({
            itemId: effect.itemId,
            quantity: effect.quantity || 1,
          });
        }
        break;
      case 'set_flag':
        if (effect.target) {
          result.flagsToSet[effect.target] = effect.value || true;
        }
        break;
      case 'clear_flag':
        if (effect.target) {
          result.flagsToClear.push(effect.target);
        }
        break;
      case 'unlock_system':
        if (effect.target) {
          result.systemsToUnlock.push(effect.target);
        }
        break;
      case 'unlock_area':
        if (effect.target) {
          result.areasToUnlock.push(effect.target);
        }
        break;
      case 'change_affinity':
        result.affinityChange += value;
        break;
      case 'add_behavior_tag':
        if (effect.target) {
          result.behaviorTags.push(effect.target as BehaviorTag);
        }
        break;
    }
  }

  return result;
};

// ============================================
// UI Helper Functions
// ============================================

export const getNodeTypeName = (type: string, isZh: boolean): string => {
  const names: Record<string, { zh: string; en: string }> = {
    main: { zh: '主线', en: 'Main' },
    branch: { zh: '支线', en: 'Branch' },
    optional: { zh: '可选', en: 'Optional' },
  };
  return names[type]?.[isZh ? 'zh' : 'en'] || type;
};

export const getNodeTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    main: '#F59E0B',     // Amber for main quests
    branch: '#8B5CF6',   // Purple for branch quests
    optional: '#10B981', // Green for optional
  };
  return colors[type] || '#6B7280';
};

export const getChapterProgress = (
  storyState: StoryState,
  chapterId: string
): { completed: number; required: number; percentage: number } => {
  const chapter = getChapterById(chapterId);
  if (!chapter) return { completed: 0, required: 0, percentage: 0 };

  const completedNodeIds = storyState.completedNodes.map(n => n.nodeId);
  const completed = chapter.requiredNodeIds.filter(id => completedNodeIds.includes(id)).length;
  const required = chapter.requiredNodeIds.length;
  const percentage = required > 0 ? Math.round((completed / required) * 100) : 0;

  return { completed, required, percentage };
};

export const getAvailableChoices = (
  node: StoryNode,
  context: ConditionContext
): StoryChoice[] => {
  if (!node.choices) return [];
  return node.choices.filter(choice => {
    if (!choice.conditions || choice.conditions.length === 0) return true;
    return checkAllConditions(choice.conditions, context);
  });
};

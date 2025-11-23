// ============================================
// Storyline/Main Quest System Types for Xiuxian (Cultivation) Game
// ============================================

import type { GameTime, Realm } from './game';

// ============================================
// Node Type Enums
// ============================================

export const StoryNodeType = {
  Main: 'main',           // Required to advance chapter
  Branch: 'branch',       // Optional but affects story direction
  Optional: 'optional',   // Completely optional side content
} as const;

export type StoryNodeType = typeof StoryNodeType[keyof typeof StoryNodeType];

// ============================================
// Condition Type Enums
// ============================================

export const StoryConditionType = {
  Realm: 'realm',                     // Player realm >= required
  RealmStage: 'realm_stage',          // Player realm stage >= required
  Time: 'time',                       // Days since event (e.g., days since joining sect)
  Contribution: 'contribution',        // Sect contribution points >= required
  Affinity: 'affinity',               // Clan affinity >= required
  WorldEvent: 'world_event',          // World event state check
  StoryFlag: 'story_flag',            // Story flag is set
  NodeComplete: 'node_complete',      // Another node is completed
  ChapterComplete: 'chapter_complete', // A chapter is completed
  SpiritStones: 'spirit_stones',      // Spirit stones >= required
  BeastCount: 'beast_count',          // Number of spirit beasts >= required
  CombatVictories: 'combat_victories', // Combat victories >= required
  TradeCount: 'trade_count',          // Trade actions >= required
  BehaviorTag: 'behavior_tag',        // Player has behavior tag (merchant, beast tamer, etc.)
} as const;

export type StoryConditionType = typeof StoryConditionType[keyof typeof StoryConditionType];

// ============================================
// Effect Type Enums
// ============================================

export const StoryEffectType = {
  UnlockSystem: 'unlock_system',      // Unlock a game system
  UnlockArea: 'unlock_area',          // Unlock a new area/dungeon
  SetFlag: 'set_flag',                // Set a story flag
  ClearFlag: 'clear_flag',            // Clear a story flag
  GiveItem: 'give_item',              // Give item to player
  GiveSpiritStones: 'give_spirit_stones', // Give spirit stones
  GiveContribution: 'give_contribution',  // Give sect contribution
  GiveWudaoPoints: 'give_wudao_points',   // Give skill points
  TriggerEvent: 'trigger_event',      // Trigger a world event
  ChangeAffinity: 'change_affinity',  // Change sect affinity
  UnlockTalent: 'unlock_talent',      // Unlock a specific talent option
  StartNextChapter: 'start_next_chapter', // Begin next chapter
  AddBehaviorTag: 'add_behavior_tag', // Add player behavior tag
  GiveCultivation: 'give_cultivation', // Give cultivation experience
} as const;

export type StoryEffectType = typeof StoryEffectType[keyof typeof StoryEffectType];

// ============================================
// Behavior Tags for Player Paths
// ============================================

export const BehaviorTag = {
  Merchant: 'merchant',           // Focus on trading
  BeastTamer: 'beast_tamer',      // Focus on spirit beasts
  SwordCultivator: 'sword_cultivator', // Combat-focused sword path
  SpellCaster: 'spell_caster',    // Magic-focused path
  BodyRefiner: 'body_refiner',    // Physical cultivation path
  SectPolitician: 'sect_politician', // Focus on sect relationships
  LoneWolf: 'lone_wolf',          // Independent path
  Alchemist: 'alchemist',         // Alchemy focus
} as const;

export type BehaviorTag = typeof BehaviorTag[keyof typeof BehaviorTag];

// ============================================
// Story Condition Interface
// ============================================

export interface StoryCondition {
  type: StoryConditionType;
  value?: string | number;        // Required value (realm name, flag name, number threshold)
  comparison?: 'eq' | 'gte' | 'lte' | 'gt' | 'lt' | 'has' | 'not_has';
  realmRequired?: Realm;          // For realm conditions
  daysSince?: string;             // For time conditions (e.g., 'joined_sect')
}

// ============================================
// Story Effect Interface
// ============================================

export interface StoryEffect {
  type: StoryEffectType;
  target?: string;                // System/area/flag/event ID
  value?: number | string;        // Amount or value
  itemId?: string;                // For item rewards
  quantity?: number;              // For item rewards
}

// ============================================
// Story Choice Interface
// ============================================

export interface StoryChoice {
  id: string;
  text: string;
  chineseText: string;
  conditions?: StoryCondition[];  // Conditions to show this choice
  effects: StoryEffect[];         // Effects when this choice is selected
  nextNodeId?: string;            // Override next node based on choice
  addsTags?: BehaviorTag[];       // Behavior tags to add
}

// ============================================
// Story Dialogue Line Interface
// ============================================

export interface StoryDialogueLine {
  speaker?: string;               // Speaker name (empty for narration)
  chineseSpeaker?: string;
  text: string;
  chineseText: string;
  emotion?: 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised' | 'serious';
}

// ============================================
// Story Node Interface
// ============================================

export interface StoryNode {
  id: string;
  chapterId: string;
  name: string;
  chineseName: string;
  type: StoryNodeType;

  // Trigger conditions
  triggerConditions: StoryCondition[];

  // Content
  description: string;
  chineseDescription: string;
  dialogue?: StoryDialogueLine[];

  // Whether this node is required to complete the chapter
  isRequired: boolean;

  // Whether this node auto-triggers or needs player action
  autoTrigger: boolean;

  // Choices for player (if any)
  choices?: StoryChoice[];

  // Effects when node is started
  onStartEffects?: StoryEffect[];

  // Effects when node is completed
  onCompleteEffects?: StoryEffect[];

  // Next nodes (can be multiple for branching)
  nextNodes?: string[];

  // Optional: specific next node based on conditions
  conditionalNextNodes?: Array<{
    conditions: StoryCondition[];
    nodeId: string;
  }>;

  // UI hints
  icon?: string;
  priority?: number;              // Higher priority nodes show first
}

// ============================================
// Story Chapter Interface
// ============================================

export interface StoryChapter {
  id: string;
  number: number;
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;

  // Conditions to unlock this chapter
  unlockConditions?: StoryCondition[];

  // Nodes in this chapter
  nodeIds: string[];

  // Required nodes to complete the chapter
  requiredNodeIds: string[];

  // Effects when chapter is completed
  completionEffects?: StoryEffect[];

  // Summary shown after chapter completion
  completionSummary?: string;
  chineseCompletionSummary?: string;

  // Next chapter ID
  nextChapterId?: string;
}

// ============================================
// Active Story Node State
// ============================================

export interface ActiveStoryNode {
  nodeId: string;
  startedAt: GameTime;
  dialogueIndex?: number;         // Current dialogue line index
  choicesMade?: string[];         // IDs of choices already made
  isReady: boolean;               // Ready to complete
}

// ============================================
// Completed Story Node Record
// ============================================

export interface CompletedStoryNode {
  nodeId: string;
  completedAt: GameTime;
  choicesMade?: string[];         // Choices player made
  pathTaken?: string;             // Which branch was taken
}

// ============================================
// Story State Interface
// ============================================

export interface StoryState {
  // Current chapter
  currentChapterId: string;

  // Active nodes (currently in progress)
  activeNodes: ActiveStoryNode[];

  // Available nodes (conditions met, not started)
  availableNodeIds: string[];

  // Completed nodes
  completedNodes: CompletedStoryNode[];

  // Completed chapters
  completedChapterIds: string[];

  // Story flags (key-value store for story state)
  storyFlags: Record<string, boolean | number | string>;

  // Player behavior tags
  behaviorTags: BehaviorTag[];

  // Days since key events (for time-based triggers)
  eventTimestamps: Record<string, GameTime>;

  // Whether story system is initialized
  initialized: boolean;

  // Pending node notification (new node available)
  pendingNotification?: string;

  // Combat victories counter for conditions
  combatVictories: number;

  // Trade count counter for conditions
  tradeCount: number;
}

// ============================================
// Story Action Types for Context
// ============================================

export type StoryAction =
  | { type: 'INIT_STORY' }
  | { type: 'START_NODE'; payload: { nodeId: string } }
  | { type: 'ADVANCE_DIALOGUE'; payload: { nodeId: string } }
  | { type: 'MAKE_CHOICE'; payload: { nodeId: string; choiceId: string } }
  | { type: 'COMPLETE_NODE'; payload: { nodeId: string } }
  | { type: 'COMPLETE_CHAPTER'; payload: { chapterId: string } }
  | { type: 'SET_STORY_FLAG'; payload: { key: string; value: boolean | number | string } }
  | { type: 'CLEAR_STORY_FLAG'; payload: { key: string } }
  | { type: 'ADD_BEHAVIOR_TAG'; payload: { tag: BehaviorTag } }
  | { type: 'CHECK_STORY_CONDITIONS' }
  | { type: 'CLEAR_NOTIFICATION' }
  | { type: 'INCREMENT_COMBAT_VICTORIES' }
  | { type: 'INCREMENT_TRADE_COUNT' };

// ============================================
// Story Definition (all chapters and nodes)
// ============================================

export interface StoryDefinition {
  chapters: StoryChapter[];
  nodes: StoryNode[];
}

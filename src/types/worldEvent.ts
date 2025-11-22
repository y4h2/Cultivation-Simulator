// ============================================
// World Event System Types for Xiuxian (Cultivation) Game
// ============================================

import type { GameTime, Element } from './game';

// ============================================
// Event Scope Types
// ============================================

export const WorldEventScope = {
  Minor: 'minor',       // Local events, 1-3 days, single market/area
  Regional: 'regional', // Region-wide events, 10 days to 2 months
  Global: 'global',     // World-wide events, several months
} as const;

export type WorldEventScope = typeof WorldEventScope[keyof typeof WorldEventScope];

// ============================================
// Event Trigger Types
// ============================================

export const EventTriggerType = {
  Time: 'time',           // Fixed calendar events (annual competitions)
  Random: 'random',       // Probability-based during stable periods
  Conditional: 'conditional', // Based on world state variables
  Chain: 'chain',         // Events triggering subsequent events
} as const;

export type EventTriggerType = typeof EventTriggerType[keyof typeof EventTriggerType];

// ============================================
// Event Category Types
// ============================================

export const EventCategory = {
  Market: 'market',         // Alchemy competitions, mine depletion, merchant arrivals
  War: 'war',               // Sect competitions, sect wars, tournaments
  Natural: 'natural',       // Fire vein eruption, spirit rain, elemental surges
  Resource: 'resource',     // Secret realm opening, resource discoveries
  Policy: 'policy',         // Pill bans, beast protection laws
  Beast: 'beast',           // Beast tide, beast king appearances
  Personal: 'personal',     // Fate triggers, tribulations (linked to talents)
} as const;

export type EventCategory = typeof EventCategory[keyof typeof EventCategory];

// ============================================
// Event Region Types
// ============================================

export const EventRegion = {
  NorthMountains: 'north_mountains',
  SouthPlains: 'south_plains',
  EastCoast: 'east_coast',
  WestDesert: 'west_desert',
  CentralLands: 'central_lands',
  All: 'all',
} as const;

export type EventRegion = typeof EventRegion[keyof typeof EventRegion];

// ============================================
// Effect Hook Types
// ============================================

export const EffectHook = {
  MarketTick: 'market_tick',       // Affects market prices on tick
  BattleInit: 'battle_init',       // Affects combat initialization
  CultivationTick: 'cultivation_tick', // Affects cultivation efficiency
  BeastCapture: 'beast_capture',   // Affects beast capture rates
  ItemDrop: 'item_drop',           // Affects item drop rates
  Encounter: 'encounter',          // Affects encounter rates
} as const;

export type EffectHook = typeof EffectHook[keyof typeof EffectHook];

// ============================================
// Effect Types
// ============================================

export const EventEffectType = {
  PriceModifier: 'price_modifier',         // Modify market prices
  EncounterRate: 'encounter_rate',         // Modify encounter rates
  CultivationBonus: 'cultivation_bonus',   // Modify cultivation efficiency
  ElementDamageBonus: 'element_damage_bonus', // Modify element damage
  CaptureRateBonus: 'capture_rate_bonus',  // Modify beast capture rate
  DropRateBonus: 'drop_rate_bonus',        // Modify item drop rates
  UnlockArea: 'unlock_area',               // Unlock special areas/dungeons
  SpawnBoss: 'spawn_boss',                 // Spawn special boss enemies
} as const;

export type EventEffectType = typeof EventEffectType[keyof typeof EventEffectType];

// ============================================
// Intel Source Types
// ============================================

export const IntelSourceType = {
  Rumor: 'rumor',           // Vague hints with possible errors
  SectNotice: 'sect_notice', // Accurate but delayed information
  Tianji: 'tianji',          // Very accurate, early warning, expensive
  BlackMarket: 'black_market', // Policy/ban information in advance
} as const;

export type IntelSourceType = typeof IntelSourceType[keyof typeof IntelSourceType];

// ============================================
// Event Phase Interface
// ============================================

export interface EventPhase {
  id: string;
  name: string;
  chineseName: string;
  durationDays: number;
  effects: EventEffect[];
  newsKey: 'rumor' | 'official' | 'aftermath' | 'warning';
}

// ============================================
// Event Effect Interface
// ============================================

export interface EventEffect {
  hook: EffectHook;
  effectType: EventEffectType;
  target: string;          // Item category, element, region, etc.
  value: number;           // Modifier value (can be negative)
  isPercentage?: boolean;  // If true, value is percentage modifier
  element?: Element;       // For element-specific effects
}

// ============================================
// News Templates Interface
// ============================================

export interface EventNewsTemplates {
  rumor: string;
  rumorEn: string;
  official: string;
  officialEn: string;
  aftermath?: string;
  aftermathEn?: string;
  warning?: string;
  warningEn?: string;
}

// ============================================
// Trigger Condition Interface
// ============================================

export interface EventTriggerCondition {
  type: 'time_range' | 'player_realm' | 'event_active' | 'event_completed' |
        'world_state' | 'random_chance' | 'talent_check';
  value?: number | string;
  minValue?: number;
  maxValue?: number;
  eventId?: string;
  stateKey?: string;
  talentId?: string;
}

// ============================================
// World Event Definition Interface
// ============================================

export interface WorldEventDefinition {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;
  scope: WorldEventScope;
  category: EventCategory;
  region: EventRegion;
  triggerType: EventTriggerType;
  triggerConditions: EventTriggerCondition[];
  durationDays: number;
  phases: EventPhase[];
  baseEffects: EventEffect[];        // Effects active throughout event
  newsTemplates: EventNewsTemplates;
  chainEvents?: string[];            // IDs of events that can trigger after this one
  requiredTalents?: string[];        // Talents that increase encounter chance
  weight: number;                    // Base probability weight for random events
  isRepeatable: boolean;             // Can this event occur multiple times
  cooldownDays?: number;             // Days before event can repeat
}

// ============================================
// Active World Event Interface
// ============================================

export interface ActiveWorldEvent {
  definitionId: string;
  startTime: GameTime;
  currentPhaseIndex: number;
  phaseDaysRemaining: number;
  totalDaysRemaining: number;
  isDiscovered: boolean;              // Has player learned about this event
  discoverySource?: IntelSourceType;  // How player discovered the event
  effects: EventEffect[];             // Currently active effects
}

// ============================================
// Event History Entry Interface
// ============================================

export interface EventHistoryEntry {
  definitionId: string;
  startTime: GameTime;
  endTime: GameTime;
  wasDiscovered: boolean;
  playerParticipated: boolean;
  outcome?: 'success' | 'failure' | 'neutral';
}

// ============================================
// Event News Entry Interface
// ============================================

export interface EventNewsEntry {
  id: string;
  eventId: string;
  source: IntelSourceType;
  message: string;
  chineseMessage: string;
  reliability: number;              // 0-100, accuracy of information
  cost?: number;                    // Spirit stones if purchased intel
  timestamp: GameTime;
  isRead: boolean;
}

// ============================================
// World Event State Interface
// ============================================

export interface WorldEventState {
  activeEvents: ActiveWorldEvent[];
  eventHistory: EventHistoryEntry[];
  eventNews: EventNewsEntry[];
  eventCooldowns: Record<string, number>; // eventId -> days until can trigger
  worldState: Record<string, number | string>; // Generic world state variables
  lastEventCheck: GameTime;
  randomEventCooldown: number;      // Days until next random event check
}

// ============================================
// Computed Event Modifiers Interface
// ============================================

export interface ComputedEventModifiers {
  priceModifiers: Record<string, number>;        // itemCategory -> modifier
  encounterRateModifiers: Record<string, number>; // targetType -> modifier
  cultivationBonus: number;
  elementDamageBonus: Record<Element, number>;
  captureRateBonus: number;
  dropRateBonus: Record<string, number>;         // itemCategory -> modifier
  unlockedAreas: string[];
  activeBosses: string[];
}

// ============================================
// Event Action Types for Context
// ============================================

export type WorldEventAction =
  | { type: 'TICK_EVENTS' }
  | { type: 'TRIGGER_EVENT'; payload: { eventId: string } }
  | { type: 'DISCOVER_EVENT'; payload: { eventId: string; source: IntelSourceType } }
  | { type: 'END_EVENT'; payload: { eventId: string; outcome?: 'success' | 'failure' | 'neutral' } }
  | { type: 'PURCHASE_INTEL'; payload: { newsId: string } }
  | { type: 'MARK_NEWS_READ'; payload: { newsId: string } }
  | { type: 'CLEAR_OLD_NEWS' };

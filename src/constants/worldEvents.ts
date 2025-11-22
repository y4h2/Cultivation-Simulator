// ============================================
// World Event System Constants and Helpers
// ============================================

import worldEventsData from '../data/worldEvents.json';
import type {
  WorldEventDefinition,
  ActiveWorldEvent,
  WorldEventState,
  EventEffect,
  ComputedEventModifiers,
  EventNewsEntry,
  IntelSourceType,
  EventHistoryEntry,
} from '../types/worldEvent';
import type { GameTime } from '../types/game';

// ============================================
// Event Data Access
// ============================================

const eventDefinitions: WorldEventDefinition[] = worldEventsData.events as WorldEventDefinition[];
const intelConfig = worldEventsData.intelConfig;
const eventConfig = worldEventsData.eventConfig;

/**
 * Get an event definition by ID
 */
export function getEventById(eventId: string): WorldEventDefinition | undefined {
  return eventDefinitions.find(e => e.id === eventId);
}

/**
 * Get all event definitions
 */
export function getAllEvents(): WorldEventDefinition[] {
  return eventDefinitions;
}

/**
 * Get events by scope
 */
export function getEventsByScope(scope: string): WorldEventDefinition[] {
  return eventDefinitions.filter(e => e.scope === scope);
}

/**
 * Get events by category
 */
export function getEventsByCategory(category: string): WorldEventDefinition[] {
  return eventDefinitions.filter(e => e.category === category);
}

// ============================================
// Event State Management
// ============================================

/**
 * Create initial world event state
 */
export function createInitialWorldEventState(): WorldEventState {
  return {
    activeEvents: [],
    eventHistory: [],
    eventNews: [],
    eventCooldowns: {},
    worldState: {},
    lastEventCheck: { ke: 0, day: 1, tenDay: 1, month: 1, year: 1 },
    randomEventCooldown: eventConfig.minEventInterval,
  };
}

/**
 * Check if an event can be triggered
 */
export function canTriggerEvent(
  eventDef: WorldEventDefinition,
  state: WorldEventState,
  gameTime: GameTime,
  playerRealm: number = 0
): boolean {
  // Check if already active
  if (state.activeEvents.some(e => e.definitionId === eventDef.id)) {
    return false;
  }

  // Check max active events
  if (state.activeEvents.length >= eventConfig.maxActiveEvents) {
    return false;
  }

  // Check cooldown
  const cooldown = state.eventCooldowns[eventDef.id];
  if (cooldown && cooldown > 0) {
    return false;
  }

  // Check trigger conditions
  for (const condition of eventDef.triggerConditions) {
    switch (condition.type) {
      case 'player_realm':
        if (condition.minValue !== undefined && playerRealm < condition.minValue) {
          return false;
        }
        break;
      case 'event_active':
        if (condition.eventId && !state.activeEvents.some(e => e.definitionId === condition.eventId)) {
          return false;
        }
        break;
      case 'event_completed':
        if (condition.eventId && !state.eventHistory.some(e => e.definitionId === condition.eventId)) {
          return false;
        }
        break;
      case 'time_range':
        if (condition.minValue !== undefined && gameTime.month !== condition.minValue) {
          return false;
        }
        break;
    }
  }

  return true;
}

/**
 * Get random events that could trigger
 */
export function getTriggeredRandomEvents(
  state: WorldEventState,
  gameTime: GameTime,
  playerRealm: number = 0,
  talentIds: string[] = []
): WorldEventDefinition[] {
  if (state.randomEventCooldown > 0) {
    return [];
  }

  const candidates = eventDefinitions.filter(e =>
    e.triggerType === 'random' && canTriggerEvent(e, state, gameTime, playerRealm)
  );

  const triggered: WorldEventDefinition[] = [];

  for (const event of candidates) {
    let weight = event.weight;

    // Increase weight if player has required talents
    if (event.requiredTalents) {
      const matchingTalents = event.requiredTalents.filter(t => talentIds.includes(t));
      weight += matchingTalents.length * 5;
    }

    // Check random chance conditions
    const randomCondition = event.triggerConditions.find(c => c.type === 'random_chance');
    if (randomCondition && typeof randomCondition.value === 'number') {
      const roll = Math.random() * 100;
      if (roll < randomCondition.value * (weight / 10)) {
        triggered.push(event);
      }
    }
  }

  return triggered;
}

/**
 * Get time-based events that should trigger
 */
export function getTimedEvents(
  state: WorldEventState,
  gameTime: GameTime,
  playerRealm: number = 0
): WorldEventDefinition[] {
  return eventDefinitions.filter(e =>
    e.triggerType === 'time' && canTriggerEvent(e, state, gameTime, playerRealm)
  );
}

/**
 * Start a new event
 */
export function startEvent(
  eventDef: WorldEventDefinition,
  gameTime: GameTime
): ActiveWorldEvent {
  const firstPhase = eventDef.phases[0];

  return {
    definitionId: eventDef.id,
    startTime: { ...gameTime },
    currentPhaseIndex: 0,
    phaseDaysRemaining: firstPhase.durationDays,
    totalDaysRemaining: eventDef.durationDays,
    isDiscovered: false,
    effects: [...eventDef.baseEffects, ...firstPhase.effects],
  };
}

/**
 * Advance an active event by one day
 */
export function tickEvent(
  activeEvent: ActiveWorldEvent,
  eventDef: WorldEventDefinition
): { event: ActiveWorldEvent | null; completed: boolean; phaseChanged: boolean } {
  const newEvent = { ...activeEvent };
  newEvent.phaseDaysRemaining -= 1;
  newEvent.totalDaysRemaining -= 1;

  // Check if event completed
  if (newEvent.totalDaysRemaining <= 0) {
    return { event: null, completed: true, phaseChanged: false };
  }

  // Check if phase changed
  let phaseChanged = false;
  if (newEvent.phaseDaysRemaining <= 0) {
    newEvent.currentPhaseIndex += 1;
    if (newEvent.currentPhaseIndex < eventDef.phases.length) {
      const newPhase = eventDef.phases[newEvent.currentPhaseIndex];
      newEvent.phaseDaysRemaining = newPhase.durationDays;
      newEvent.effects = [...eventDef.baseEffects, ...newPhase.effects];
      phaseChanged = true;
    }
  }

  return { event: newEvent, completed: false, phaseChanged };
}

/**
 * End an event and record history
 */
export function endEvent(
  activeEvent: ActiveWorldEvent,
  gameTime: GameTime,
  outcome: 'success' | 'failure' | 'neutral' = 'neutral'
): EventHistoryEntry {
  return {
    definitionId: activeEvent.definitionId,
    startTime: activeEvent.startTime,
    endTime: { ...gameTime },
    wasDiscovered: activeEvent.isDiscovered,
    playerParticipated: activeEvent.isDiscovered,
    outcome,
  };
}

// ============================================
// Effect Computation
// ============================================

/**
 * Compute all active event modifiers
 */
export function computeEventModifiers(activeEvents: ActiveWorldEvent[]): ComputedEventModifiers {
  const modifiers: ComputedEventModifiers = {
    priceModifiers: {},
    encounterRateModifiers: {},
    cultivationBonus: 0,
    elementDamageBonus: {
      fire: 0,
      water: 0,
      wood: 0,
      metal: 0,
      earth: 0,
      wind: 0,
    },
    captureRateBonus: 0,
    dropRateBonus: {},
    unlockedAreas: [],
    activeBosses: [],
  };

  for (const activeEvent of activeEvents) {
    for (const effect of activeEvent.effects) {
      applyEffect(modifiers, effect);
    }
  }

  return modifiers;
}

/**
 * Apply a single effect to modifiers
 */
function applyEffect(modifiers: ComputedEventModifiers, effect: EventEffect): void {
  switch (effect.effectType) {
    case 'price_modifier':
      modifiers.priceModifiers[effect.target] =
        (modifiers.priceModifiers[effect.target] || 0) + effect.value;
      break;
    case 'encounter_rate':
      modifiers.encounterRateModifiers[effect.target] =
        (modifiers.encounterRateModifiers[effect.target] || 0) + effect.value;
      break;
    case 'cultivation_bonus':
      modifiers.cultivationBonus += effect.value;
      break;
    case 'element_damage_bonus':
      if (effect.element) {
        modifiers.elementDamageBonus[effect.element] += effect.value;
      }
      break;
    case 'capture_rate_bonus':
      modifiers.captureRateBonus += effect.value;
      break;
    case 'drop_rate_bonus':
      modifiers.dropRateBonus[effect.target] =
        (modifiers.dropRateBonus[effect.target] || 0) + effect.value;
      break;
    case 'unlock_area':
      if (!modifiers.unlockedAreas.includes(effect.target)) {
        modifiers.unlockedAreas.push(effect.target);
      }
      break;
    case 'spawn_boss':
      if (!modifiers.activeBosses.includes(effect.target)) {
        modifiers.activeBosses.push(effect.target);
      }
      break;
  }
}

/**
 * Get price modifier for an item category
 */
export function getPriceModifier(
  modifiers: ComputedEventModifiers,
  itemCategory: string
): number {
  let modifier = 0;

  // Check specific category
  if (modifiers.priceModifiers[itemCategory]) {
    modifier += modifiers.priceModifiers[itemCategory];
  }

  // Check "all" category
  if (modifiers.priceModifiers['all']) {
    modifier += modifiers.priceModifiers['all'];
  }

  return modifier;
}

/**
 * Get encounter rate modifier for a target type
 */
export function getEncounterModifier(
  modifiers: ComputedEventModifiers,
  targetType: string
): number {
  return modifiers.encounterRateModifiers[targetType] || 0;
}

// ============================================
// News System
// ============================================

/**
 * Generate news entry for an event
 */
export function generateEventNews(
  eventDef: WorldEventDefinition,
  activeEvent: ActiveWorldEvent,
  source: IntelSourceType,
  gameTime: GameTime,
  _isZh?: boolean // Parameter kept for API compatibility, messages generated in both languages
): EventNewsEntry {
  const phase = eventDef.phases[activeEvent.currentPhaseIndex];
  const newsKey = phase.newsKey;

  let message: string;
  let chineseMessage: string;

  switch (newsKey) {
    case 'rumor':
      message = eventDef.newsTemplates.rumorEn;
      chineseMessage = eventDef.newsTemplates.rumor;
      break;
    case 'official':
      message = eventDef.newsTemplates.officialEn;
      chineseMessage = eventDef.newsTemplates.official;
      break;
    case 'aftermath':
      message = eventDef.newsTemplates.aftermathEn || eventDef.newsTemplates.officialEn;
      chineseMessage = eventDef.newsTemplates.aftermath || eventDef.newsTemplates.official;
      break;
    case 'warning':
      message = eventDef.newsTemplates.warningEn || eventDef.newsTemplates.rumorEn;
      chineseMessage = eventDef.newsTemplates.warning || eventDef.newsTemplates.rumor;
      break;
    default:
      message = eventDef.newsTemplates.officialEn;
      chineseMessage = eventDef.newsTemplates.official;
  }

  const reliability = getSourceReliability(source);
  const cost = getSourceCost(source, eventDef.scope);

  return {
    id: `news_${eventDef.id}_${Date.now()}`,
    eventId: eventDef.id,
    source,
    message,
    chineseMessage,
    reliability,
    cost: source === 'tianji' || source === 'black_market' ? cost : undefined,
    timestamp: { ...gameTime },
    isRead: false,
  };
}

/**
 * Get reliability for an intel source
 */
export function getSourceReliability(source: IntelSourceType): number {
  switch (source) {
    case 'rumor':
      return intelConfig.rumorReliability;
    case 'sect_notice':
      return intelConfig.sectNoticeReliability;
    case 'tianji':
      return intelConfig.tianjiReliability;
    case 'black_market':
      return intelConfig.blackMarketReliability;
    default:
      return 50;
  }
}

/**
 * Get cost for an intel source
 */
export function getSourceCost(source: IntelSourceType, eventScope: string): number {
  const scopeMultiplier = eventScope === 'global' ? 3 : eventScope === 'regional' ? 2 : 1;

  switch (source) {
    case 'tianji':
      return intelConfig.tianjiBaseCost * scopeMultiplier;
    case 'black_market':
      return intelConfig.blackMarketBaseCost * scopeMultiplier;
    default:
      return 0;
  }
}

// ============================================
// Display Helpers
// ============================================

/**
 * Get scope display name
 */
export function getScopeName(scope: string, isZh: boolean): string {
  const scopeNames: Record<string, { zh: string; en: string }> = {
    minor: { zh: '局部', en: 'Local' },
    regional: { zh: '区域', en: 'Regional' },
    global: { zh: '全局', en: 'Global' },
  };
  return scopeNames[scope]?.[isZh ? 'zh' : 'en'] || scope;
}

/**
 * Get category display name
 */
export function getCategoryName(category: string, isZh: boolean): string {
  const categoryNames: Record<string, { zh: string; en: string }> = {
    market: { zh: '市场', en: 'Market' },
    war: { zh: '战争', en: 'War' },
    natural: { zh: '自然', en: 'Natural' },
    resource: { zh: '资源', en: 'Resource' },
    policy: { zh: '政策', en: 'Policy' },
    beast: { zh: '灵兽', en: 'Beast' },
    personal: { zh: '个人', en: 'Personal' },
  };
  return categoryNames[category]?.[isZh ? 'zh' : 'en'] || category;
}

/**
 * Get region display name
 */
export function getRegionName(region: string, isZh: boolean): string {
  const regionNames: Record<string, { zh: string; en: string }> = {
    north_mountains: { zh: '北域山脉', en: 'Northern Mountains' },
    south_plains: { zh: '南域平原', en: 'Southern Plains' },
    east_coast: { zh: '东海沿岸', en: 'Eastern Coast' },
    west_desert: { zh: '西域大漠', en: 'Western Desert' },
    central_lands: { zh: '中原大地', en: 'Central Lands' },
    all: { zh: '全域', en: 'All Regions' },
  };
  return regionNames[region]?.[isZh ? 'zh' : 'en'] || region;
}

/**
 * Get source display name
 */
export function getSourceName(source: IntelSourceType, isZh: boolean): string {
  const sourceNames: Record<string, { zh: string; en: string }> = {
    rumor: { zh: '市井传闻', en: 'Rumors' },
    sect_notice: { zh: '宗门公告', en: 'Sect Notice' },
    tianji: { zh: '天机阁', en: 'Tianji Oracle' },
    black_market: { zh: '黑市情报', en: 'Black Market' },
  };
  return sourceNames[source]?.[isZh ? 'zh' : 'en'] || source;
}

/**
 * Get scope color
 */
export function getScopeColor(scope: string): string {
  switch (scope) {
    case 'minor':
      return '#10b981'; // green
    case 'regional':
      return '#f59e0b'; // amber
    case 'global':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
}

/**
 * Get category color
 */
export function getCategoryColor(category: string): string {
  switch (category) {
    case 'market':
      return '#f59e0b'; // amber
    case 'war':
      return '#ef4444'; // red
    case 'natural':
      return '#10b981'; // green
    case 'resource':
      return '#3b82f6'; // blue
    case 'policy':
      return '#8b5cf6'; // purple
    case 'beast':
      return '#ec4899'; // pink
    case 'personal':
      return '#6366f1'; // indigo
    default:
      return '#6b7280'; // gray
  }
}

/**
 * Get phase progress percentage
 */
export function getPhaseProgress(activeEvent: ActiveWorldEvent, eventDef: WorldEventDefinition): number {
  const phase = eventDef.phases[activeEvent.currentPhaseIndex];
  if (!phase) return 0;
  const elapsed = phase.durationDays - activeEvent.phaseDaysRemaining;
  return (elapsed / phase.durationDays) * 100;
}

/**
 * Get total event progress percentage
 */
export function getTotalProgress(activeEvent: ActiveWorldEvent, eventDef: WorldEventDefinition): number {
  const elapsed = eventDef.durationDays - activeEvent.totalDaysRemaining;
  return (elapsed / eventDef.durationDays) * 100;
}

/**
 * Format days remaining
 */
export function formatDaysRemaining(days: number, isZh: boolean): string {
  if (days <= 0) return isZh ? '即将结束' : 'Ending soon';
  if (days === 1) return isZh ? '1天' : '1 day';
  return isZh ? `${days}天` : `${days} days`;
}

// ============================================
// Event Config Export
// ============================================

export const EVENT_CONFIG = {
  minEventInterval: eventConfig.minEventInterval,
  maxActiveEvents: eventConfig.maxActiveEvents,
  randomEventCheckInterval: eventConfig.randomEventCheckInterval,
  baseRandomEventChance: eventConfig.baseRandomEventChance,
  newsRetentionDays: intelConfig.newsRetentionDays,
};

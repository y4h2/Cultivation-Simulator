// ============================================
// Talent System Constants
// ============================================

import type {
  TalentDefinition,
  TalentType,
  TalentEffectScope,
  TalentSelectionOption,
  BreakthroughTalentOption,
  ComputedTalentBonuses,
  TalentState,
  CharacterTalent,
} from '../types/talent';

// Import data from JSON
import talentData from '../data/talents.json';

// ============================================
// Talent Definitions
// ============================================

export const TALENTS: TalentDefinition[] = talentData.talents as TalentDefinition[];

export const getTalentById = (id: string): TalentDefinition | undefined => {
  return TALENTS.find(talent => talent.id === id);
};

export const getTalentsByType = (type: TalentType): TalentDefinition[] => {
  return TALENTS.filter(talent => talent.type === type);
};

export const getTalentsByScope = (scope: TalentEffectScope): TalentDefinition[] => {
  return TALENTS.filter(talent => talent.scopes.includes(scope));
};

export const getMajorTalents = (): TalentDefinition[] => getTalentsByType('major');
export const getMinorTalents = (): TalentDefinition[] => getTalentsByType('minor');
export const getFlawTalents = (): TalentDefinition[] => getTalentsByType('flaw');

// ============================================
// Rarity Configuration
// ============================================

export const RARITY_WEIGHTS = talentData.rarityWeights as Record<string, number>;

export const getRarityColor = (rarity: string): string => {
  const colors: Record<string, string> = {
    common: '#9ca3af',     // Gray
    uncommon: '#22c55e',   // Green
    rare: '#3b82f6',       // Blue
    epic: '#a855f7',       // Purple
    legendary: '#f59e0b',  // Gold
  };
  return colors[rarity] || '#9ca3af';
};

export const getTalentTypeColor = (type: TalentType): string => {
  const colors: Record<TalentType, string> = {
    major: '#f59e0b',      // Gold
    minor: '#3b82f6',      // Blue
    flaw: '#ef4444',       // Red
  };
  return colors[type];
};

// ============================================
// Selection Configuration
// ============================================

export const STARTING_SELECTION_CONFIG = talentData.startingSelectionConfig;
export const BREAKTHROUGH_CONFIG = talentData.breakthroughConfig;
export const FATE_CHANGE_CONFIG = talentData.fateChangeConfig;

// ============================================
// Generate Starting Talent Options
// ============================================

export const generateStartingOptions = (count: number = 3): TalentSelectionOption[] => {
  const majorTalents = getMajorTalents();
  const minorTalents = getMinorTalents();
  const flawTalents = getFlawTalents();

  const options: TalentSelectionOption[] = [];
  const usedMajors = new Set<string>();
  const usedMinors = new Set<string>();

  for (let i = 0; i < count; i++) {
    // Select a random major talent that hasn't been used
    const availableMajors = majorTalents.filter(t => !usedMajors.has(t.id));
    if (availableMajors.length === 0) break;

    const majorIndex = Math.floor(Math.random() * availableMajors.length);
    const selectedMajor = availableMajors[majorIndex];
    usedMajors.add(selectedMajor.id);

    // Select a minor talent that doesn't conflict
    const availableMinors = minorTalents.filter(t =>
      !usedMinors.has(t.id) &&
      !(selectedMajor.conflictsWith?.includes(t.id)) &&
      !(t.conflictsWith?.includes(selectedMajor.id))
    );

    if (availableMinors.length === 0) continue;

    const minorIndex = Math.floor(Math.random() * availableMinors.length);
    const selectedMinor = availableMinors[minorIndex];
    usedMinors.add(selectedMinor.id);

    // Maybe add a flaw
    let selectedFlaw: string | undefined;
    if (Math.random() < STARTING_SELECTION_CONFIG.flawChance && flawTalents.length > 0) {
      const flawIndex = Math.floor(Math.random() * flawTalents.length);
      selectedFlaw = flawTalents[flawIndex].id;
    }

    // Calculate weight based on rarity
    const majorWeight = RARITY_WEIGHTS[selectedMajor.rarity] || 10;
    const minorWeight = RARITY_WEIGHTS[selectedMinor.rarity] || 10;
    const weight = (majorWeight + minorWeight) / 2;

    options.push({
      majorTalent: selectedMajor.id,
      minorTalent: selectedMinor.id,
      flaw: selectedFlaw,
      weight,
    });
  }

  return options;
};

// ============================================
// Generate Breakthrough Talent Options
// ============================================

export interface PlayerBehavior {
  combatCount: number;
  tradeCount: number;
  cultivationTicks: number;
  beastInteractions: number;
  eventsEncountered: number;
}

export const generateBreakthroughOptions = (
  currentTalents: TalentState,
  behavior: PlayerBehavior,
  count: number = 3
): BreakthroughTalentOption[] => {
  const minorTalents = getMinorTalents();
  const currentTalentIds = new Set([
    ...currentTalents.majorTalents.map(t => t.talentId),
    ...currentTalents.minorTalents.map(t => t.talentId),
    ...currentTalents.flaws.map(t => t.talentId),
  ]);

  // Filter available talents
  const availableTalents = minorTalents.filter(t => {
    if (currentTalentIds.has(t.id)) return false;

    // Check for conflicts
    for (const current of currentTalentIds) {
      const currentTalent = getTalentById(current);
      if (currentTalent?.conflictsWith?.includes(t.id)) return false;
      if (t.conflictsWith?.includes(current)) return false;
    }

    return true;
  });

  // Calculate weights based on behavior
  const weightedTalents = availableTalents.map(talent => {
    let weight = RARITY_WEIGHTS[talent.rarity] || 10;
    let reason = '';
    let chineseReason = '';

    // Combat-focused behavior
    if (behavior.combatCount > behavior.tradeCount && behavior.combatCount > behavior.cultivationTicks / 100) {
      if (talent.scopes.includes('battle')) {
        weight *= BREAKTHROUGH_CONFIG.behaviorWeightMultiplier;
        reason = 'Your combat experience resonates with this talent';
        chineseReason = '你的战斗经验与此天赋产生共鸣';
      }
    }

    // Trade-focused behavior
    if (behavior.tradeCount > behavior.combatCount && behavior.tradeCount > 10) {
      if (talent.scopes.includes('market')) {
        weight *= BREAKTHROUGH_CONFIG.behaviorWeightMultiplier;
        reason = 'Your merchant instincts awakened this potential';
        chineseReason = '你的商业直觉唤醒了这份潜力';
      }
    }

    // Cultivation-focused behavior
    if (behavior.cultivationTicks > 1000 && behavior.cultivationTicks > behavior.combatCount * 50) {
      if (talent.scopes.includes('cultivation')) {
        weight *= BREAKTHROUGH_CONFIG.behaviorWeightMultiplier;
        reason = 'Your dedication to cultivation reveals this path';
        chineseReason = '你对修炼的专注揭示了这条道路';
      }
    }

    // Beast-focused behavior
    if (behavior.beastInteractions > 20) {
      if (talent.scopes.includes('spirit_beast')) {
        weight *= BREAKTHROUGH_CONFIG.behaviorWeightMultiplier;
        reason = 'Your bond with spirit beasts unlocked this ability';
        chineseReason = '你与灵兽的羁绊解锁了这项能力';
      }
    }

    // Default reason
    if (!reason) {
      reason = 'A natural talent awakened during breakthrough';
      chineseReason = '突破时觉醒的天赋';
    }

    return {
      talentId: talent.id,
      reason,
      chineseReason,
      weight,
    };
  });

  // Sort by weight and take top options
  weightedTalents.sort((a, b) => b.weight - a.weight);

  // Add some randomization - don't always pick the highest weights
  const selected: BreakthroughTalentOption[] = [];
  const pool = [...weightedTalents];

  for (let i = 0; i < count && pool.length > 0; i++) {
    // Weighted random selection from top candidates
    const candidateCount = Math.min(5, pool.length);
    const candidates = pool.slice(0, candidateCount);
    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);

    let random = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let j = 0; j < candidates.length; j++) {
      random -= candidates[j].weight;
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }

    selected.push(candidates[selectedIndex]);
    pool.splice(selectedIndex, 1);
  }

  return selected;
};

// ============================================
// Calculate Fate Change Cost
// ============================================

export const calculateFateChangeCost = (changeCount: number): number => {
  return Math.floor(
    FATE_CHANGE_CONFIG.baseCost * Math.pow(FATE_CHANGE_CONFIG.costMultiplier, changeCount)
  );
};

export const canPerformFateChange = (changeCount: number, spiritStones: number): boolean => {
  if (changeCount >= FATE_CHANGE_CONFIG.maxChanges) return false;
  return spiritStones >= calculateFateChangeCost(changeCount);
};

// ============================================
// Compute Talent Bonuses
// ============================================

export const createEmptyTalentBonuses = (): ComputedTalentBonuses => ({
  // Combat bonuses
  damageBonus: 0,
  damageReduction: 0,
  critBonus: 0,
  critDamageBonus: 0,
  critDamageReduction: 0,
  hpBonus: 0,
  mpBonus: 0,
  qiGainBonus: 0,
  qiCapBonus: 0,
  executeThreshold: 0,
  executeDamageBonus: 0,
  shieldOnLowHpPercent: 0,
  lowHpThreshold: 0,
  swordDamageBonus: 0,

  // Cultivation bonuses
  cultivationExpBonus: 0,
  combatExpBonus: 0,
  idleExpBonus: 0,
  breakthroughBonus: 0,

  // Market bonuses
  priceInsightLevel: 0,
  tradeProfitBonus: 0,
  stockpileCombatBonus: 0,
  assetExpRate: 0,

  // Spirit Beast bonuses
  captureRateBonus: 0,
  affinityCapBonus: 0,
  beastEncounterBonus: 0,
  moodBoostBonus: 0,
  beastTrainingExpBonus: 0,
  beastCombatBonus: 0,

  // Skill Tree bonuses
  skillTreeTierBonus: {},
  elementTierBonus: {},
  spellCostReduction: 0,

  // Event bonuses
  eventFrequencyBonus: 0,
  badEventStatGain: 0,
  elementDamageByEvent: {},

  // Conditional bonuses
  longBattleThreshold: 10,
  longBattleBonus: 0,
  firstCritDamageReduction: 0,
  sameElementThreshold: 3,
  sameElementDamageBonus: 0,
});

export const computeTalentBonuses = (talentState: TalentState): ComputedTalentBonuses => {
  const bonuses = createEmptyTalentBonuses();

  const allTalents: CharacterTalent[] = [
    ...talentState.majorTalents,
    ...talentState.minorTalents,
    ...talentState.flaws,
  ];

  for (const charTalent of allTalents) {
    const definition = getTalentById(charTalent.talentId);
    if (!definition) continue;

    const stacks = charTalent.stacks || 1;

    for (const effect of definition.effects) {
      const value = effect.value * (definition.stackable ? stacks : 1);

      switch (effect.type) {
        case 'damage_bonus':
          if (effect.skillTreeType === 'sword') {
            bonuses.swordDamageBonus += value;
          } else {
            bonuses.damageBonus += value;
          }
          break;
        case 'damage_reduction':
          bonuses.damageReduction += value;
          break;
        case 'crit_bonus':
          bonuses.critBonus += value;
          break;
        case 'crit_damage_bonus':
          bonuses.critDamageBonus += value;
          break;
        case 'crit_damage_reduction':
          bonuses.critDamageReduction += value;
          break;
        case 'hp_bonus':
          bonuses.hpBonus += value;
          break;
        case 'mp_bonus':
          bonuses.mpBonus += value;
          break;
        case 'qi_gain':
          bonuses.qiGainBonus += value;
          break;
        case 'qi_cap_bonus':
          bonuses.qiCapBonus += value;
          break;
        case 'execute_damage':
          bonuses.executeDamageBonus += value;
          bonuses.executeThreshold = effect.condition?.value || 30;
          break;
        case 'shield_on_low_hp':
          bonuses.shieldOnLowHpPercent += value;
          bonuses.lowHpThreshold = effect.condition?.value || 25;
          break;
        case 'cultivation_exp_bonus':
          bonuses.cultivationExpBonus += value;
          break;
        case 'combat_exp_bonus':
          bonuses.combatExpBonus += value;
          break;
        case 'idle_exp_bonus':
          bonuses.idleExpBonus += value;
          break;
        case 'breakthrough_bonus':
          bonuses.breakthroughBonus += value;
          break;
        case 'price_insight':
          bonuses.priceInsightLevel += value;
          break;
        case 'trade_profit_bonus':
          bonuses.tradeProfitBonus += value;
          break;
        case 'stockpile_bonus':
          bonuses.stockpileCombatBonus += value;
          break;
        case 'asset_exp_gain':
          bonuses.assetExpRate += value;
          break;
        case 'capture_rate_bonus':
          bonuses.captureRateBonus += value;
          break;
        case 'affinity_cap_bonus':
          bonuses.affinityCapBonus += value;
          break;
        case 'beast_encounter_bonus':
          bonuses.beastEncounterBonus += value;
          break;
        case 'mood_boost_bonus':
          bonuses.moodBoostBonus += value;
          break;
        case 'beast_training_exp_bonus':
          bonuses.beastTrainingExpBonus += value;
          break;
        case 'beast_combat_bonus':
          bonuses.beastCombatBonus += value;
          break;
        case 'skill_tree_tier_bonus':
          if (effect.skillTreeType) {
            bonuses.skillTreeTierBonus[effect.skillTreeType] =
              (bonuses.skillTreeTierBonus[effect.skillTreeType] || 0) + value;
          }
          break;
        case 'element_tier_bonus':
          if (effect.element) {
            bonuses.elementTierBonus[effect.element] =
              (bonuses.elementTierBonus[effect.element] || 0) + value;
          }
          break;
        case 'spell_cost_reduction':
          bonuses.spellCostReduction += value;
          break;
        case 'event_frequency_bonus':
          bonuses.eventFrequencyBonus += value;
          break;
        case 'bad_event_bonus':
          bonuses.badEventStatGain += value;
          break;
        case 'element_damage_by_event':
          // This needs runtime evaluation with current event
          break;
        case 'long_battle_bonus':
          bonuses.longBattleBonus += value;
          bonuses.longBattleThreshold = effect.condition?.value || 10;
          break;
        case 'first_hit_reduction':
          bonuses.firstCritDamageReduction += value;
          break;
        case 'same_element_bonus':
          bonuses.sameElementDamageBonus += value;
          bonuses.sameElementThreshold = effect.condition?.value || 3;
          break;
      }
    }
  }

  return bonuses;
};

// ============================================
// Talent State Helpers
// ============================================

export const createInitialTalentState = (): TalentState => ({
  majorTalents: [],
  minorTalents: [],
  flaws: [],
  fateChangeCount: 0,
});

// Create initial talent state with random talents assigned
export const createRandomInitialTalents = (): TalentState => {
  const options = generateStartingOptions(1);
  if (options.length === 0) {
    return createInitialTalentState();
  }

  const option = options[0];
  let state = createInitialTalentState();
  state = addTalent(state, option.majorTalent, 'start');
  state = addTalent(state, option.minorTalent, 'start');
  if (option.flaw) {
    state = addTalent(state, option.flaw, 'start');
  }
  return state;
};

// Generate new random talents (for refresh functionality)
export const generateNewRandomTalents = (): TalentState => {
  return createRandomInitialTalents();
};

export const hasTalent = (state: TalentState, talentId: string): boolean => {
  return (
    state.majorTalents.some(t => t.talentId === talentId) ||
    state.minorTalents.some(t => t.talentId === talentId) ||
    state.flaws.some(t => t.talentId === talentId)
  );
};

export const addTalent = (
  state: TalentState,
  talentId: string,
  acquiredAt: 'start' | 'breakthrough' | 'fate_change',
  breakthroughRealm?: string
): TalentState => {
  const definition = getTalentById(talentId);
  if (!definition) return state;

  const newTalent: CharacterTalent = {
    talentId,
    acquiredAt,
    stacks: 1,
    breakthroughRealm,
  };

  const newState = { ...state };

  switch (definition.type) {
    case 'major':
      newState.majorTalents = [...state.majorTalents, newTalent];
      break;
    case 'minor':
      // Check if stackable and already exists
      if (definition.stackable && hasTalent(state, talentId)) {
        newState.minorTalents = state.minorTalents.map(t =>
          t.talentId === talentId
            ? { ...t, stacks: Math.min((t.stacks || 1) + 1, definition.maxStacks || 5) }
            : t
        );
      } else {
        newState.minorTalents = [...state.minorTalents, newTalent];
      }
      break;
    case 'flaw':
      newState.flaws = [...state.flaws, newTalent];
      break;
  }

  return newState;
};

export const removeTalent = (state: TalentState, talentId: string): TalentState => {
  return {
    ...state,
    majorTalents: state.majorTalents.filter(t => t.talentId !== talentId),
    minorTalents: state.minorTalents.filter(t => t.talentId !== talentId),
    flaws: state.flaws.filter(t => t.talentId !== talentId),
  };
};

// ============================================
// Display Helpers
// ============================================

export const getTalentTypeName = (type: TalentType, isZh: boolean): string => {
  const names: Record<TalentType, { en: string; zh: string }> = {
    major: { en: 'Innate Destiny', zh: '先天气运' },
    minor: { en: 'Acquired Insight', zh: '后天悟性' },
    flaw: { en: 'Shadow Flaw', zh: '阴影缺陷' },
  };
  return isZh ? names[type].zh : names[type].en;
};

export const getScopeName = (scope: TalentEffectScope, isZh: boolean): string => {
  const names: Record<TalentEffectScope, { en: string; zh: string }> = {
    battle: { en: 'Combat', zh: '战斗' },
    market: { en: 'Market', zh: '商业' },
    cultivation: { en: 'Cultivation', zh: '修炼' },
    spirit_beast: { en: 'Spirit Beast', zh: '灵兽' },
    world_event: { en: 'World Event', zh: '世界事件' },
  };
  return isZh ? names[scope].zh : names[scope].en;
};

// ============================================
// Talent System Types for Xiuxian (Cultivation) Game
// ============================================

import type { Element, CombatStats } from './game';

// ============================================
// Talent Category Types
// ============================================

export const TalentType = {
  Major: 'major',      // 先天气运 - Rare, powerful, 1-2 per character
  Minor: 'minor',      // 后天悟性 - Gained on breakthrough, smaller bonuses
  Flaw: 'flaw',        // 阴影缺陷 - Negative effects with potential trade-offs
} as const;

export type TalentType = typeof TalentType[keyof typeof TalentType];

// ============================================
// Effect Scope Types
// ============================================

export const TalentEffectScope = {
  Battle: 'battle',           // Combat-related effects
  Market: 'market',           // Trade and market effects
  Cultivation: 'cultivation', // Cultivation and breakthrough effects
  SpiritBeast: 'spirit_beast', // Spirit beast related effects
  WorldEvent: 'world_event',  // World event related effects
} as const;

export type TalentEffectScope = typeof TalentEffectScope[keyof typeof TalentEffectScope];

// ============================================
// Effect Types
// ============================================

export const TalentEffectType = {
  // Combat effects
  DamageBonus: 'damage_bonus',
  DamageReduction: 'damage_reduction',
  CritBonus: 'crit_bonus',
  CritDamageBonus: 'crit_damage_bonus',
  CritDamageReduction: 'crit_damage_reduction',
  HpBonus: 'hp_bonus',
  MpBonus: 'mp_bonus',
  ShieldOnLowHp: 'shield_on_low_hp',
  ExecuteDamage: 'execute_damage',
  QiGain: 'qi_gain',
  QiCapBonus: 'qi_cap_bonus',

  // Cultivation effects
  CultivationExpBonus: 'cultivation_exp_bonus',
  CombatExpBonus: 'combat_exp_bonus',
  IdleExpBonus: 'idle_exp_bonus',
  BreakthroughBonus: 'breakthrough_bonus',

  // Market effects
  PriceInsight: 'price_insight',
  TradeProfitBonus: 'trade_profit_bonus',
  StockpileBonus: 'stockpile_bonus',
  AssetExpGain: 'asset_exp_gain',

  // Spirit Beast effects
  CaptureRateBonus: 'capture_rate_bonus',
  AffinityCapBonus: 'affinity_cap_bonus',
  BeastEncounterBonus: 'beast_encounter_bonus',
  MoodBoostBonus: 'mood_boost_bonus',
  BeastTrainingExpBonus: 'beast_training_exp_bonus',
  BeastCombatBonus: 'beast_combat_bonus',

  // Skill Tree effects
  SkillTreeTierBonus: 'skill_tree_tier_bonus',
  ElementTierBonus: 'element_tier_bonus',
  SpellCostReduction: 'spell_cost_reduction',

  // World Event effects
  EventFrequencyBonus: 'event_frequency_bonus',
  BadEventBonus: 'bad_event_bonus',
  ElementDamageByEvent: 'element_damage_by_event',

  // Stat modifiers
  StatBonus: 'stat_bonus',
  StatPenalty: 'stat_penalty',

  // Conditional effects
  LongBattleBonus: 'long_battle_bonus',
  FirstHitReduction: 'first_hit_reduction',
  SameElementBonus: 'same_element_bonus',
} as const;

export type TalentEffectType = typeof TalentEffectType[keyof typeof TalentEffectType];

// ============================================
// Talent Effect Interface
// ============================================

export interface TalentCondition {
  type: 'hp_below' | 'hp_above' | 'target_hp_below' | 'target_hp_above' |
        'first_hit' | 'consecutive_same_element' | 'battle_round_above' |
        'has_stockpile' | 'on_crit' | 'always';
  value?: number;
  element?: Element;
  itemCategory?: string;
}

export interface TalentEffect {
  type: TalentEffectType;
  scope: TalentEffectScope;
  value: number;
  isPercentage?: boolean;
  stat?: keyof CombatStats;
  element?: Element;
  skillTreeType?: string;
  condition?: TalentCondition;
  description?: string;
  chineseDescription?: string;
}

// ============================================
// Talent Definition Interface
// ============================================

export interface TalentDefinition {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;
  type: TalentType;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  scopes: TalentEffectScope[];
  effects: TalentEffect[];
  stackable?: boolean;
  maxStacks?: number;
  conflictsWith?: string[];  // IDs of talents that cannot coexist
  synergizesWith?: string[]; // IDs of talents that enhance each other
}

// ============================================
// Character Talent State
// ============================================

export interface CharacterTalent {
  talentId: string;
  acquiredAt: 'start' | 'breakthrough' | 'fate_change';
  stacks?: number;
  breakthroughRealm?: string;  // For minor talents gained at breakthrough
}

export interface TalentState {
  majorTalents: CharacterTalent[];
  minorTalents: CharacterTalent[];
  flaws: CharacterTalent[];
  fateChangeCount: number;
  lastSelectionOptions?: TalentSelectionOption[];
}

// ============================================
// Talent Selection Types
// ============================================

export interface TalentSelectionOption {
  majorTalent: string;
  minorTalent: string;
  flaw?: string;
  weight: number;
}

export interface BreakthroughTalentOption {
  talentId: string;
  reason: string;
  chineseReason: string;
  weight: number;
}

// ============================================
// Computed Talent Bonuses
// ============================================

export interface ComputedTalentBonuses {
  // Combat bonuses
  damageBonus: number;
  damageReduction: number;
  critBonus: number;
  critDamageBonus: number;
  critDamageReduction: number;
  hpBonus: number;
  mpBonus: number;
  qiGainBonus: number;
  qiCapBonus: number;
  executeThreshold: number;
  executeDamageBonus: number;
  shieldOnLowHpPercent: number;
  lowHpThreshold: number;
  swordDamageBonus: number;

  // Cultivation bonuses
  cultivationExpBonus: number;
  combatExpBonus: number;
  idleExpBonus: number;
  breakthroughBonus: number;

  // Market bonuses
  priceInsightLevel: number;
  tradeProfitBonus: number;
  stockpileCombatBonus: number;
  assetExpRate: number;

  // Spirit Beast bonuses
  captureRateBonus: number;
  affinityCapBonus: number;
  beastEncounterBonus: number;
  moodBoostBonus: number;
  beastTrainingExpBonus: number;
  beastCombatBonus: number;

  // Skill Tree bonuses
  skillTreeTierBonus: Record<string, number>;
  elementTierBonus: Record<string, number>;
  spellCostReduction: number;

  // Event bonuses
  eventFrequencyBonus: number;
  badEventStatGain: number;
  elementDamageByEvent: Record<string, number>;

  // Conditional bonuses
  longBattleThreshold: number;
  longBattleBonus: number;
  firstCritDamageReduction: number;
  sameElementThreshold: number;
  sameElementDamageBonus: number;
}

// ============================================
// Talent Action Types for Context
// ============================================

export type TalentAction =
  | { type: 'SELECT_STARTING_TALENTS'; payload: TalentSelectionOption }
  | { type: 'SELECT_BREAKTHROUGH_TALENT'; payload: string }
  | { type: 'PERFORM_FATE_CHANGE'; payload: { remove: string; add: string } }
  | { type: 'CLEAR_SELECTION_OPTIONS' };

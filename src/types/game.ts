// ============================================
// Core Game Types for Xiuxian (Cultivation) Game
// ============================================

// ============================================
// Element System Types
// ============================================

export const Element = {
  Fire: 'fire',
  Water: 'water',
  Wood: 'wood',
  Metal: 'metal',
  Earth: 'earth',
  Wind: 'wind',
} as const;

export type Element = typeof Element[keyof typeof Element];

// ============================================
// Combat Unit Types
// ============================================

export interface CombatStats {
  hp: number;
  maxHp: number;
  mp: number;           // 灵力 (Spiritual Power for combat)
  maxMp: number;
  atk: number;          // Attack
  def: number;          // Defense
  spd: number;          // Speed (turn order)
  acc: number;          // Accuracy
  eva: number;          // Evasion
  crit: number;         // Critical Rate (0-100)
  critDmg: number;      // Critical Damage Multiplier (default 1.5)
  wis: number;          // 悟性 (Comprehension)
  sense: number;        // 神识 (Divine Sense)
  // Element Resistances (0-100, percentage reduction)
  resfire: number;
  reswater: number;
  reswood: number;
  resmetal: number;
  researth: number;
  reswind: number;
}

export interface QiGauge {
  fire: number;
  water: number;
  wood: number;
  metal: number;
  earth: number;
  wind: number;
  neutral: number;      // For non-elemental skills
}

// ============================================
// Skill System Types
// ============================================

export const SkillType = {
  Basic: 'basic',
  Attack: 'attack',
  Defense: 'defense',
  Support: 'support',
  Ultimate: 'ultimate',
} as const;

export type SkillType = typeof SkillType[keyof typeof SkillType];

export const SkillTarget = {
  SingleEnemy: 'single_enemy',
  AllEnemies: 'all_enemies',
  Self: 'self',
  SingleAlly: 'single_ally',
  AllAllies: 'all_allies',
} as const;

export type SkillTarget = typeof SkillTarget[keyof typeof SkillTarget];

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'shield' | 'dot' | 'hot';
  value: number;                    // Base value or percentage
  isPercentage?: boolean;          // If true, value is percentage of stat
  stat?: keyof CombatStats;        // Which stat to base on
  buffId?: string;                 // For buff/debuff effects
  duration?: number;               // Duration in turns
}

export interface Skill {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;
  type: SkillType;
  element?: Element;
  costMp: number;
  costQi?: number;                 // Qi threshold required (for ultimates)
  qiElement?: Element;             // Which element Qi to consume
  cooldown: number;                // Turns until can use again
  currentCooldown?: number;        // Current cooldown counter
  target: SkillTarget;
  powerMultiplier: number;         // Damage = ATK * powerMultiplier
  hitBonus?: number;               // Bonus to hit rate
  critBonus?: number;              // Bonus to crit rate
  effects: SkillEffect[];
}

// ============================================
// Buff/Debuff System Types
// ============================================

export interface StatModifier {
  stat: keyof CombatStats;
  value: number;
  isPercentage: boolean;           // If true, value is percentage modifier
}

export interface BuffEffect {
  type: 'damage' | 'heal' | 'stat_change' | 'shield' | 'cleanse';
  value: number;
  isPercentage?: boolean;
  stat?: keyof CombatStats;
}

export interface Buff {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;
  duration: number;                // Total duration in turns
  remainingDuration: number;       // Current remaining duration
  stackable: boolean;
  maxStacks?: number;
  currentStacks?: number;
  isDebuff: boolean;               // true = debuff, false = buff
  onApply?: BuffEffect[];          // Effects when buff is first applied
  onTurnStart?: BuffEffect[];      // Effects at start of unit's turn
  onTurnEnd?: BuffEffect[];        // Effects at end of unit's turn
  onRemove?: BuffEffect[];         // Effects when buff expires/removed
  modifiers?: StatModifier[];      // Passive stat modifications
}

// ============================================
// Combat Unit Types (Player & Enemy)
// ============================================

export interface CombatUnit {
  id: string;
  name: string;
  chineseName: string;
  isPlayer: boolean;
  combatStats: CombatStats;
  skills: Skill[];
  buffs: Buff[];
  qiGauge: QiGauge;
  insightStacks: number;           // From Observe action, max 5
  shield: number;                  // Damage absorption
  isStunned: boolean;
  isDefending: boolean;            // From Defend action
}

// ============================================
// Enemy AI Types
// ============================================

export type AIConditionType =
  | 'hp_below'           // self.hpRatio < value
  | 'hp_above'           // self.hpRatio > value
  | 'mp_below'           // self.mpRatio < value
  | 'mp_above'           // self.mpRatio > value
  | 'target_hp_below'    // target.hpRatio < value
  | 'target_hp_above'    // target.hpRatio > value
  | 'has_buff'           // self has buff with id
  | 'target_has_debuff'  // target has debuff with id
  | 'random'             // random chance
  | 'always';            // always true

export interface AICondition {
  type: AIConditionType;
  value?: number;        // Threshold value (0-1 for ratios, 0-100 for random)
  buffId?: string;       // For buff-related conditions
}

export interface AIRule {
  condition: AICondition;
  action: 'use_skill' | 'use_item' | 'defend' | 'flee';
  skillId?: string;
  itemId?: string;
  priority: number;      // Higher = evaluated first
}

// ============================================
// Enhanced Enemy Type
// ============================================

export interface CombatEnemy {
  id: string;
  name: string;
  chineseName: string;
  realm: Realm;
  combatStats: CombatStats;
  skills: Skill[];
  aiRules: AIRule[];
  loot: LootTable;
  element?: Element;     // Enemy's primary element
  isBoss?: boolean;
}

// Time System Types
export interface GameTime {
  ke: number;      // 刻 - smallest unit (1 ke = 15 minutes game time)
  day: number;     // 日 - day
  tenDay: number;  // 十日 - ten-day period
  month: number;   // 月 - month
  year: number;    // 年 - year
}

// Cultivation Realms
export const Realm = {
  QiRefining: 'qi_refining',           // 炼气期
  Foundation: 'foundation',             // 筑基期
  CoreFormation: 'core_formation',      // 结丹期
  NascentSoul: 'nascent_soul',         // 元婴期
  SpiritTransformation: 'spirit_transformation', // 化神期
  VoidRefining: 'void_refining',       // 炼虚期
  BodyIntegration: 'body_integration', // 合体期
  Mahayana: 'mahayana',                // 大乘期
  Tribulation: 'tribulation',          // 渡劫期
} as const;

export type Realm = typeof Realm[keyof typeof Realm];

export interface RealmInfo {
  name: string;
  chineseName: string;
  stages: number;        // Number of stages within realm (early, mid, late, peak)
  cultivationRequired: number;  // Base cultivation needed to breakthrough
  statsMultiplier: number;      // Multiplier for base stats
}

// Character Stats
export interface CharacterStats {
  hp: number;
  maxHp: number;
  spiritualPower: number;
  maxSpiritualPower: number;
  divineSense: number;      // 神识 - affects accuracy, crit, enemy insight
  comprehension: number;    // 悟性 - affects cultivation efficiency
  luck: number;             // 气运 - affects drop rates, market events
  speed: number;            // 速度 - affects turn order in combat
  attack: number;           // 攻击
  defense: number;          // 防御
}

// Character
export interface Character {
  name: string;
  realm: Realm;
  realmStage: number;       // 1-4 (early, mid, late, peak)
  cultivationValue: number; // Current cultivation progress
  cultivationMax: number;   // Required for next breakthrough
  stats: CharacterStats;
  inventory: Inventory;
  spiritStones: number;
  reputation: number;
  currentActivity: ActivityType;
}

// Inventory System
export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export interface Inventory {
  items: InventoryItem[];
  capacity: number;
}

// Item Types
export const ItemCategory = {
  SpiritMaterial: 'spirit_material',  // Herbs, ores, demon cores
  Pill: 'pill',                        // Consumable pills
  Artifact: 'artifact',                // Equipment/weapons
  Talisman: 'talisman',               // Single-use combat items
  Misc: 'misc',                        // Other items
} as const;

export type ItemCategory = typeof ItemCategory[keyof typeof ItemCategory];

export const ItemRarity = {
  Common: 'common',
  Uncommon: 'uncommon',
  Rare: 'rare',
  Epic: 'epic',
  Legendary: 'legendary',
} as const;

export type ItemRarity = typeof ItemRarity[keyof typeof ItemRarity];

export interface Item {
  id: string;
  name: string;
  chineseName: string;
  category: ItemCategory;
  rarity: ItemRarity;
  description: string;
  basePrice: number;
  effects?: ItemEffect[];
}

export interface ItemEffect {
  type: 'heal_hp' | 'heal_sp' | 'boost_cultivation' | 'boost_stat' | 'combat_damage';
  value: number;
  duration?: number;  // For temporary effects
  stat?: keyof CharacterStats;
}

// Activity Types
export const ActivityType = {
  ClosedDoorCultivation: 'closed_door',  // 闭关修炼
  MarketStation: 'market_station',        // 驻守坊市
  Travel: 'travel',                        // 游历
  Idle: 'idle',                            // 休息
} as const;

export type ActivityType = typeof ActivityType[keyof typeof ActivityType];

export interface ActivityInfo {
  type: ActivityType;
  name: string;
  chineseName: string;
  cultivationMultiplier: number;
  canTrade: boolean;
  canEncounter: boolean;
  description: string;
}

// Market System Types
export interface MarketItem {
  itemId: string;
  currentPrice: number;
  basePrice: number;
  volatility: number;    // How much price can fluctuate (0-1)
  trend: number;         // Current trend (-1 to 1, negative = falling)
  liquidity: number;     // How much stock available
  maxLiquidity: number;
  priceHistory: number[];
}

export interface Market {
  items: MarketItem[];
  lastUpdate: GameTime;
  activeEvents: MarketEvent[];
}

export interface MarketEvent {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  affectedItems: string[];
  priceModifier: number;  // Multiplier (1.3 = +30%)
  duration: number;       // In days
  remainingDuration: number;
}

// Combat Types
export const CombatActionType = {
  NormalAttack: 'normal_attack',
  Technique: 'technique',
  MovementSkill: 'movement_skill',
  UseTalisman: 'use_talisman',
  UsePill: 'use_pill',
  Observe: 'observe',
  Defend: 'defend',
} as const;

export type CombatActionType = typeof CombatActionType[keyof typeof CombatActionType];

export interface CombatAction {
  type: CombatActionType;
  name: string;
  chineseName: string;
  spCost: number;
  damage?: number;
  effect?: ItemEffect;
}

export interface Enemy {
  id: string;
  name: string;
  chineseName: string;
  realm: Realm;
  stats: CharacterStats;
  techniques: CombatAction[];
  loot: LootTable;
}

export interface LootTable {
  items: Array<{
    itemId: string;
    dropChance: number;
    minQuantity: number;
    maxQuantity: number;
  }>;
  spiritStones: {
    min: number;
    max: number;
  };
}

// ============================================
// Combat State Types
// ============================================

export type CombatPhase =
  | 'idle'              // Not in combat
  | 'starting'          // Combat initialization
  | 'player_turn'       // Player's turn to act
  | 'enemy_turn'        // Enemy's turn to act
  | 'animating'         // Action animation playing
  | 'victory'           // Player won
  | 'defeat'            // Player lost
  | 'fled';             // Player fled

export interface CombatLogEntry {
  message: string;
  chineseMessage: string;
  type: 'action' | 'damage' | 'heal' | 'buff' | 'system' | 'critical' | 'miss';
  timestamp: number;
}

export interface CombatState {
  inCombat: boolean;
  phase: CombatPhase;
  round: number;                   // Current round number
  playerUnit?: CombatUnit;         // Player's combat unit
  enemyUnit?: CombatUnit;          // Enemy's combat unit (single enemy for now)
  enemy?: CombatEnemy;             // Enemy template data
  turnOrder: ('player' | 'enemy')[];
  currentTurnIndex: number;
  combatLog: CombatLogEntry[];
  rewards?: {
    spiritStones: number;
    items: { itemId: string; quantity: number }[];
    cultivationExp: number;
  };
}

// Event Log
export interface GameLog {
  timestamp: GameTime;
  message: string;
  type: 'cultivation' | 'market' | 'combat' | 'event' | 'system';
}

// Game State
export interface GameState {
  character: Character;
  time: GameTime;
  market: Market;
  combat: CombatState;
  logs: GameLog[];
  isPaused: boolean;
  gameSpeed: number;  // 1 = normal, 2 = 2x, etc.
  settings: GameSettings;
}

export interface GameSettings {
  autoSave: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

// Intelligence/Rumors System
export interface Intelligence {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  affectedItems: string[];
  predictedChange: number;  // Expected price change
  reliability: number;      // 0-1, how accurate the intel is
  cost: number;             // Spirit stones to purchase
  expiresAt: GameTime;
}

// Alchemy/Production Queue
export interface ProductionTask {
  id: string;
  type: 'alchemy' | 'crafting';
  recipeId: string;
  materialsUsed: InventoryItem[];
  startTime: GameTime;
  duration: number;  // In ke
  progress: number;  // 0-100
}

export interface Recipe {
  id: string;
  name: string;
  chineseName: string;
  type: 'alchemy' | 'crafting';
  materials: InventoryItem[];
  output: InventoryItem;
  duration: number;
  successRate: number;
  requiredRealm: Realm;
}

// World Events
export interface WorldEvent {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  type: 'secret_realm' | 'sect_war' | 'resource_shortage' | 'resource_surplus' | 'competition';
  marketEffects: Array<{
    itemId: string;
    priceModifier: number;
  }>;
  duration: number;
  startsAt: GameTime;
}

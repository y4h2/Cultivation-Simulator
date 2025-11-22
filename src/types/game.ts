// ============================================
// Core Game Types for Xiuxian (Cultivation) Game
// ============================================

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

export interface CombatState {
  inCombat: boolean;
  enemy?: Enemy;
  turnOrder: ('player' | 'enemy')[];
  currentTurn: number;
  playerInsight: number;  // Stacks from Observe action
  combatLog: string[];
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

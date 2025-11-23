// ============================================
// Equipment System Types for Xiuxian Game
// ============================================

import type { Element } from './game';

// ============================================
// Equipment Slot Types
// ============================================

export const EquipmentSlot = {
  Weapon: 'weapon',           // 武器
  Armor: 'armor',             // 护甲/道袍
  Helmet: 'helmet',           // 头饰
  Accessory: 'accessory',     // 饰品 (戒指/项链)
  Boots: 'boots',             // 靴子
  Talisman: 'talisman',       // 护身符/法宝
} as const;

export type EquipmentSlot = typeof EquipmentSlot[keyof typeof EquipmentSlot];

// ============================================
// Equipment Rarity Types
// ============================================

export const EquipmentRarity = {
  Common: 'common',           // 凡品 (N)
  Uncommon: 'uncommon',       // 灵品 (R)
  Rare: 'rare',               // 宝品 (SR)
  Epic: 'epic',               // 地品 (SSR)
  Legendary: 'legendary',     // 仙品 (SSS)
} as const;

export type EquipmentRarity = typeof EquipmentRarity[keyof typeof EquipmentRarity];

// ============================================
// Equipment Grade (Growth Potential)
// ============================================

export const EquipmentGrade = {
  Lower: 1,                   // 下品
  Middle: 2,                  // 中品
  Upper: 3,                   // 上品
  Supreme: 4,                 // 极品
} as const;

export type EquipmentGrade = typeof EquipmentGrade[keyof typeof EquipmentGrade];

// ============================================
// Equipment Category (Sub-type)
// ============================================

export const EquipmentCategory = {
  // Weapons
  Sword: 'sword',             // 剑
  Saber: 'saber',             // 刀
  Staff: 'staff',             // 杖
  Fan: 'fan',                 // 扇
  Bow: 'bow',                 // 弓
  // Armor
  Robe: 'robe',               // 道袍
  LightArmor: 'light_armor',  // 轻甲
  HeavyArmor: 'heavy_armor',  // 重甲
  // Accessories
  Ring: 'ring',               // 戒指
  Necklace: 'necklace',       // 项链
  Pendant: 'pendant',         // 玉佩
  Belt: 'belt',               // 腰带
  // Helmet
  Crown: 'crown',             // 冠
  Hairpin: 'hairpin',         // 发簪
  Veil: 'veil',               // 面纱
  // Boots
  Shoes: 'shoes',             // 鞋
  CloudBoots: 'cloud_boots',  // 云靴
  // Talisman
  ProtectionCharm: 'protection_charm',  // 护身符
  SpiritTalisman: 'spirit_talisman',    // 灵符
  Artifact: 'artifact',       // 法宝
} as const;

export type EquipmentCategory = typeof EquipmentCategory[keyof typeof EquipmentCategory];

// ============================================
// Equipment Stats Interface
// ============================================

export interface EquipmentStats {
  // Base Stats
  atk?: number;               // 攻击
  def?: number;               // 防御
  hp?: number;                // 生命
  mp?: number;                // 灵力
  spd?: number;               // 速度

  // Advanced Stats
  crit?: number;              // 暴击率 (%)
  critDmg?: number;           // 暴击伤害 (%)
  acc?: number;               // 命中
  eva?: number;               // 闪避

  // Cultivation Stats
  wis?: number;               // 悟性
  sense?: number;             // 神识
  luck?: number;              // 气运
  cultivationBonus?: number;  // 修炼效率 (%)

  // Percentage Stats (added on top of base)
  atkPercent?: number;        // 攻击%
  defPercent?: number;        // 防御%
  hpPercent?: number;         // 生命%
  mpPercent?: number;         // 灵力%

  // Element Stats
  elementDamage?: Partial<Record<Element, number>>;      // 元素伤害加成
  elementResist?: Partial<Record<Element, number>>;      // 元素抗性
}

// ============================================
// Equipment Affix (Prefix/Suffix)
// ============================================

export const AffixType = {
  Prefix: 'prefix',
  Suffix: 'suffix',
} as const;

export type AffixType = typeof AffixType[keyof typeof AffixType];

export interface EquipmentAffix {
  id: string;
  name: string;
  chineseName: string;
  type: AffixType;
  stats: EquipmentStats;
  description?: string;
  chineseDescription?: string;
}

// ============================================
// Equipment Set Interface
// ============================================

export interface EquipmentSetBonus {
  requiredPieces: number;     // Number of pieces needed for bonus
  stats: EquipmentStats;
  specialEffect?: {
    id: string;
    name: string;
    chineseName: string;
    description: string;
    chineseDescription: string;
  };
}

export interface EquipmentSet {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;
  pieces: string[];           // Equipment IDs that belong to this set
  bonuses: EquipmentSetBonus[];
}

// ============================================
// Equipment Template (Blueprint)
// ============================================

export interface EquipmentTemplate {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;
  slot: EquipmentSlot;
  category: EquipmentCategory;
  rarity: EquipmentRarity;
  grade: EquipmentGrade;

  // Base stats for this equipment
  baseStats: EquipmentStats;

  // Element affinity
  element?: Element;
  elementPower?: number;      // 0-100

  // Tags for talent/skill synergy
  tags?: string[];            // e.g., ["sword", "fire", "beast", "merchant"]

  // Set membership
  setId?: string;

  // Level requirements
  requiredRealm?: string;

  // Possible affixes
  possiblePrefixes?: string[];
  possibleSuffixes?: string[];
  maxAffixCount?: number;

  // Enhancement limits
  maxEnhanceLevel?: number;
  maxRefineLevel?: number;

  // Image/icon reference
  icon?: string;
}

// ============================================
// Equipment Instance (Actual Item Owned)
// ============================================

export interface EquipmentInstance {
  instanceId: string;         // Unique instance ID
  templateId: string;         // Reference to template

  // Current state
  enhanceLevel: number;       // Current enhancement level (0-max)
  refineLevel: number;        // Current refinement level (0-max)

  // Rolled affixes
  prefixes: Array<{
    affixId: string;
    rolledStats: EquipmentStats;
  }>;
  suffixes: Array<{
    affixId: string;
    rolledStats: EquipmentStats;
  }>;

  // Computed stats (base + enhancement + affixes)
  computedStats: EquipmentStats;

  // Binding state
  isBound: boolean;
  ownerId?: string;

  // Awakening
  isAwakened: boolean;
  awakeningEffect?: {
    id: string;
    name: string;
    chineseName: string;
    description: string;
    chineseDescription: string;
  };

  // Market info
  marketInfo?: {
    basePrice: number;
    lastTradePrice?: number;
    isListed: boolean;
  };

  // Acquisition timestamp
  acquiredAt?: number;
}

// ============================================
// Character Equipment State
// ============================================

export interface CharacterEquipment {
  // Currently equipped items (one per slot)
  equipped: Partial<Record<EquipmentSlot, EquipmentInstance>>;

  // Equipment inventory (unequipped items)
  inventory: EquipmentInstance[];

  // Inventory capacity
  maxInventorySize: number;
}

// ============================================
// Computed Equipment Bonuses
// ============================================

export interface ComputedEquipmentBonuses {
  // Total stats from all equipped items
  totalStats: EquipmentStats;

  // Active set bonuses
  activeSetBonuses: Array<{
    setId: string;
    activePieces: number;
    bonuses: EquipmentSetBonus[];
  }>;

  // Element bonuses
  totalElementDamage: Partial<Record<Element, number>>;
  totalElementResist: Partial<Record<Element, number>>;
}

// ============================================
// Equipment Action Types
// ============================================

export type EquipmentActionResult = {
  success: boolean;
  message: string;
  chineseMessage: string;
  equipment?: EquipmentInstance;
  stats?: EquipmentStats;
};

export interface EnhanceResult extends EquipmentActionResult {
  newLevel?: number;
  statIncrease?: EquipmentStats;
  materialsCost?: Record<string, number>;
  spiritStonesCost?: number;
}

export interface RefineResult extends EquipmentActionResult {
  oldAffixes?: EquipmentAffix[];
  newAffixes?: EquipmentAffix[];
  lockedAffixes?: string[];
}

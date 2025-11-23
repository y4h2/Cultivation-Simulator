// ============================================
// Combat System Constants
// ============================================

import type {
  Element,
  Skill,
  Buff,
  CombatEnemy,
  CombatStats,
  QiGauge,
  Realm,
} from '../types/game';

// ============================================
// Element Relationships
// ============================================

// Element advantage: attacker element -> defender elements it's strong against
export const ELEMENT_ADVANTAGES: Record<Element, Element[]> = {
  fire: ['metal', 'wood'],    // Fire melts metal, burns wood
  water: ['fire'],            // Water extinguishes fire
  wood: ['earth', 'water'],   // Wood absorbs earth/water
  metal: ['wood'],            // Metal cuts wood
  earth: ['water', 'fire'],   // Earth absorbs water, smothers fire
  wind: ['earth'],            // Wind erodes earth
};

// Element disadvantage: attacker element -> defender elements it's weak against
export const ELEMENT_DISADVANTAGES: Record<Element, Element[]> = {
  fire: ['water', 'earth'],
  water: ['wood', 'earth'],
  wood: ['fire', 'metal'],
  metal: ['fire'],
  earth: ['wood'],
  wind: ['fire'],
};

// Damage modifier for element relationships
export const ELEMENT_ADVANTAGE_MODIFIER = 0.25;     // +25% damage when strong
export const ELEMENT_DISADVANTAGE_MODIFIER = -0.2;  // -20% damage when weak

// ============================================
// Element Power System (Balance Spec v1)
// ElementPower bonus = 1 + (EP / 100), soft cap at EP=80 (1.8x)
// ============================================
export const ELEMENT_POWER_CONSTANTS = {
  DIVISOR: 100,           // EP / 100 for damage multiplier
  SOFT_CAP: 80,           // Maximum effective EP from equipment
  SOFT_CAP_MULTIPLIER: 1.8, // Maximum damage multiplier from EP
};

// ============================================
// Skill Power Multiplier Guidelines (Balance Spec)
// Basic attack: 1.0-1.2
// Normal skill: 1.2-1.8
// Ultimate skill: 2.0-3.0
// ============================================

// ============================================
// Defense Formula Constants (Balance Spec)
// Defense coefficient K = 3-5x average ATK of same stage
// DEF_REDUCTION = DEF_target / (DEF_target + K)
// ============================================
export const DEFENSE_FORMULA_CONSTANTS = {
  K_MULTIPLIER: 4,        // K = 4x average ATK (middle of 3-5 range)
  QI_REFINING_BASE_ATK: 75,  // Average ATK for qi refining stage
};

// ============================================
// Combat Formula Constants
// ============================================

export const COMBAT_CONSTANTS = {
  BASE_HIT_RATE: 0.95,
  MIN_HIT_RATE: 0.05,
  MAX_HIT_RATE: 0.99,
  HIT_RATE_PER_ACC_DIFF: 0.005,

  MIN_DAMAGE_RATIO: 0.2,      // Minimum damage is 20% of ATK
  DEF_REDUCTION_FACTOR: 0.5,  // DEF reduces damage by 50% of its value

  MAX_INSIGHT_STACKS: 5,
  INSIGHT_HIT_BONUS: 0.05,    // +5% hit per stack
  INSIGHT_CRIT_BONUS: 0.05,   // +5% crit per stack
  INSIGHT_DMG_BONUS: 0.08,    // +8% damage per stack

  QI_THRESHOLD_ULTIMATE: 3,   // Qi needed to unlock ultimate
  QI_PER_SKILL_USE: 1,        // Qi gained per skill use

  DEFEND_DAMAGE_REDUCTION: 0.5, // 50% damage reduction when defending

  SPD_VARIANCE: 0.1,          // 10% random variance in speed for turn order
};

// ============================================
// Default QiGauge
// ============================================

export const createDefaultQiGauge = (): QiGauge => ({
  fire: 0,
  water: 0,
  wood: 0,
  metal: 0,
  earth: 0,
  wind: 0,
  neutral: 0,
});

// ============================================
// Buff/Debuff Templates
// ============================================

export const BUFF_TEMPLATES: Record<string, Omit<Buff, 'remainingDuration' | 'currentStacks'>> = {
  // Debuffs - Values based on Balance Spec v1
  // Fire: 2% max_hp per turn, 3 turns, stackable up to 3
  burn: {
    id: 'burn',
    name: 'Burn',
    chineseName: '焚灼',
    description: 'Takes 2% max HP fire damage each turn, stackable up to 3',
    chineseDescription: '每回合受到2%最大生命值的火焰伤害，可叠加3层',
    duration: 3,
    stackable: true,
    maxStacks: 3,
    isDebuff: true,
    onTurnStart: [{ type: 'damage', value: 2, isPercentage: true, stat: 'maxHp' }],
  },
  // Wood: 1.5% max_hp per turn, 4 turns, stackable up to 5
  poison: {
    id: 'poison',
    name: 'Poison',
    chineseName: '剧毒',
    description: 'Takes 1.5% max HP poison damage each turn, stackable up to 5',
    chineseDescription: '每回合受到1.5%最大生命值毒素伤害，可叠加5层',
    duration: 4,
    stackable: true,
    maxStacks: 5,
    isDebuff: true,
    onTurnStart: [{ type: 'damage', value: 1.5, isPercentage: true, stat: 'maxHp' }],
  },
  // Water: 3% speed reduction per stack, up to 5 stacks (15% total at 5 stacks)
  // At 3+ stacks: 25% chance for control effect
  frozen: {
    id: 'frozen',
    name: 'Frozen',
    chineseName: '寒意',
    description: 'Speed reduced by 3% per stack, up to 5 stacks',
    chineseDescription: '每层减速3%，最多叠加5层',
    duration: 3,
    stackable: true,
    maxStacks: 5,
    isDebuff: true,
    modifiers: [{ stat: 'spd', value: -3, isPercentage: true }],
  },
  mind_break: {
    id: 'mind_break',
    name: 'Mind Break',
    chineseName: '心神失守',
    description: 'Accuracy reduced by 30%',
    chineseDescription: '命中率降低30%',
    duration: 2,
    stackable: false,
    isDebuff: true,
    modifiers: [{ stat: 'acc', value: -30, isPercentage: true }],
  },
  weakened: {
    id: 'weakened',
    name: 'Weakened',
    chineseName: '虚弱',
    description: 'Attack reduced by 20%',
    chineseDescription: '攻击力降低20%',
    duration: 3,
    stackable: false,
    isDebuff: true,
    modifiers: [{ stat: 'atk', value: -20, isPercentage: true }],
  },
  // Metal: 5% DEF reduction per stack, up to 3 stacks (15% total)
  armor_break: {
    id: 'armor_break',
    name: 'Armor Break',
    chineseName: '破甲',
    description: 'Defense reduced by 5% per stack, up to 3 stacks',
    chineseDescription: '每层降低5%防御力，最多叠加3层',
    duration: 3,
    stackable: true,
    maxStacks: 3,
    isDebuff: true,
    modifiers: [{ stat: 'def', value: -5, isPercentage: true }],
  },

  // Earth: 3% damage reduction per stack, up to 3 stacks (9% total)
  // Also provides +10-20% crit resistance
  suppression: {
    id: 'suppression',
    name: 'Suppression',
    chineseName: '镇压',
    description: 'Deals 3% less damage per stack, up to 3 stacks',
    chineseDescription: '每层造成的伤害降低3%，最多叠加3层',
    duration: 3,
    stackable: true,
    maxStacks: 3,
    isDebuff: true,
    modifiers: [{ stat: 'atk', value: -3, isPercentage: true }],
  },

  // Buffs
  // Metal: Shield equal to 10-15% max HP (using 12% as middle value)
  spirit_shield: {
    id: 'spirit_shield',
    name: 'Spirit Shield',
    chineseName: '护体灵纹',
    description: 'Gain shield equal to 12% max HP',
    chineseDescription: '获得最大生命值12%的护盾',
    duration: 2,
    stackable: false,
    isDebuff: false,
    onApply: [{ type: 'shield', value: 12, isPercentage: true, stat: 'maxHp' }],
  },
  attack_up: {
    id: 'attack_up',
    name: 'Attack Up',
    chineseName: '攻击强化',
    description: 'Attack increased by 25%',
    chineseDescription: '攻击力提高25%',
    duration: 3,
    stackable: false,
    isDebuff: false,
    modifiers: [{ stat: 'atk', value: 25, isPercentage: true }],
  },
  defense_up: {
    id: 'defense_up',
    name: 'Defense Up',
    chineseName: '防御强化',
    description: 'Defense increased by 25%',
    chineseDescription: '防御力提高25%',
    duration: 3,
    stackable: false,
    isDebuff: false,
    modifiers: [{ stat: 'def', value: 25, isPercentage: true }],
  },
  speed_up: {
    id: 'speed_up',
    name: 'Speed Up',
    chineseName: '速度强化',
    description: 'Speed increased by 30%',
    chineseDescription: '速度提高30%',
    duration: 3,
    stackable: false,
    isDebuff: false,
    modifiers: [{ stat: 'spd', value: 30, isPercentage: true }],
  },
  regeneration: {
    id: 'regeneration',
    name: 'Regeneration',
    chineseName: '回春',
    description: 'Restore 5% max HP each turn',
    chineseDescription: '每回合恢复5%最大生命值',
    duration: 3,
    stackable: false,
    isDebuff: false,
    onTurnEnd: [{ type: 'heal', value: 5, isPercentage: true, stat: 'maxHp' }],
  },
  focus: {
    id: 'focus',
    name: 'Focus',
    chineseName: '专注',
    description: 'Crit rate increased by 20%, Accuracy increased by 15%',
    chineseDescription: '暴击率提高20%，命中率提高15%',
    duration: 2,
    stackable: false,
    isDebuff: false,
    modifiers: [
      { stat: 'crit', value: 20, isPercentage: false },
      { stat: 'acc', value: 15, isPercentage: true },
    ],
  },
};

// ============================================
// Player Skills
// Balance Spec Power Multiplier Guidelines:
// - Basic attack: 1.0-1.2
// - Normal skill: 1.2-1.8
// - Ultimate skill: 2.0-3.0
// ============================================

export const PLAYER_SKILLS: Skill[] = [
  // Basic Attack (Balance Spec: 1.0-1.2)
  {
    id: 'basic_attack',
    name: 'Basic Attack',
    chineseName: '普通攻击',
    description: 'A simple attack with your weapon',
    chineseDescription: '使用武器进行基础攻击',
    type: 'basic',
    costMp: 0,
    cooldown: 0,
    target: 'single_enemy',
    powerMultiplier: 1.0, // Balance Spec: basic 1.0-1.2
    effects: [],
  },

  // Fire Skills (Balance Spec adjusted)
  {
    id: 'fire_bolt',
    name: 'Fire Bolt',
    chineseName: '火球术',
    description: 'Launch a bolt of fire at the enemy',
    chineseDescription: '向敌人发射一枚火球',
    type: 'attack',
    element: 'fire',
    costMp: 15,
    cooldown: 0,
    target: 'single_enemy',
    powerMultiplier: 1.3, // Balance Spec: normal 1.2-1.8
    effects: [],
  },
  {
    id: 'flame_burst',
    name: 'Flame Burst',
    chineseName: '烈焰爆',
    description: 'Engulf the enemy in flames, chance to burn',
    chineseDescription: '烈焰包围敌人，有几率造成灼烧',
    type: 'attack',
    element: 'fire',
    costMp: 25,
    cooldown: 2,
    target: 'single_enemy',
    powerMultiplier: 1.6, // Balance Spec: normal 1.2-1.8
    effects: [{ type: 'debuff', value: 0.4, buffId: 'burn' }], // 40% chance to burn
  },
  {
    id: 'inferno',
    name: 'Inferno',
    chineseName: '炎狱',
    description: 'Ultimate fire technique. Requires 3 Fire Qi',
    chineseDescription: '究极火焰秘术，需要3点火系气机',
    type: 'ultimate',
    element: 'fire',
    costMp: 50,
    costQi: 3,
    qiElement: 'fire',
    cooldown: 4,
    target: 'single_enemy',
    powerMultiplier: 2.8, // Balance Spec: ultimate 2.0-3.0
    critBonus: 15,
    effects: [{ type: 'debuff', value: 0.8, buffId: 'burn' }],
  },

  // Water Skills (Balance Spec adjusted)
  {
    id: 'water_arrow',
    name: 'Water Arrow',
    chineseName: '水箭术',
    description: 'Fire a piercing water arrow',
    chineseDescription: '发射穿透性水箭',
    type: 'attack',
    element: 'water',
    costMp: 15,
    cooldown: 0,
    target: 'single_enemy',
    powerMultiplier: 1.25, // Balance Spec: normal 1.2-1.8
    hitBonus: 10,
    effects: [],
  },
  {
    id: 'frost_wave',
    name: 'Frost Wave',
    chineseName: '寒霜波',
    description: 'Release a wave of frost, chance to slow',
    chineseDescription: '释放寒霜波动，有几率减速敌人',
    type: 'attack',
    element: 'water',
    costMp: 25,
    cooldown: 2,
    target: 'single_enemy',
    powerMultiplier: 1.5, // Balance Spec: normal 1.2-1.8
    effects: [{ type: 'debuff', value: 0.35, buffId: 'frozen' }],
  },

  // Wood Skills (Balance Spec adjusted)
  {
    id: 'vine_strike',
    name: 'Vine Strike',
    chineseName: '藤蔓击',
    description: 'Strike with spiritual vines',
    chineseDescription: '以灵藤抽击敌人',
    type: 'attack',
    element: 'wood',
    costMp: 15,
    cooldown: 0,
    target: 'single_enemy',
    powerMultiplier: 1.2, // Balance Spec: normal 1.2-1.8
    effects: [],
  },
  {
    id: 'natures_blessing',
    name: 'Nature\'s Blessing',
    chineseName: '自然祝福',
    description: 'Heal yourself and gain regeneration',
    chineseDescription: '治愈自身并获得持续恢复效果',
    type: 'support',
    element: 'wood',
    costMp: 30,
    cooldown: 3,
    target: 'self',
    powerMultiplier: 0,
    effects: [
      { type: 'heal', value: 20, isPercentage: true, stat: 'maxHp' },
      { type: 'buff', value: 1, buffId: 'regeneration' },
    ],
  },

  // Metal Skills (Balance Spec adjusted)
  {
    id: 'sword_qi',
    name: 'Sword Qi',
    chineseName: '剑气',
    description: 'Release cutting sword energy',
    chineseDescription: '释放锋利的剑气',
    type: 'attack',
    element: 'metal',
    costMp: 15,
    cooldown: 0,
    target: 'single_enemy',
    powerMultiplier: 1.3, // Balance Spec: normal 1.2-1.8
    critBonus: 5,
    effects: [],
  },
  {
    id: 'armor_piercing',
    name: 'Armor Piercing',
    chineseName: '破甲斩',
    description: 'A strike that reduces enemy defense',
    chineseDescription: '降低敌人防御的攻击',
    type: 'attack',
    element: 'metal',
    costMp: 20,
    cooldown: 2,
    target: 'single_enemy',
    powerMultiplier: 1.2, // Balance Spec: normal 1.2-1.8 (lower power but has armor break)
    effects: [{ type: 'debuff', value: 0.6, buffId: 'armor_break' }],
  },

  // Earth Skills (Balance Spec adjusted)
  {
    id: 'stone_fist',
    name: 'Stone Fist',
    chineseName: '岩拳',
    description: 'Strike with earth-enhanced fist',
    chineseDescription: '以岩石强化的拳头攻击',
    type: 'attack',
    element: 'earth',
    costMp: 15,
    cooldown: 0,
    target: 'single_enemy',
    powerMultiplier: 1.25, // Balance Spec: normal 1.2-1.8
    effects: [],
  },
  {
    id: 'earth_shield',
    name: 'Earth Shield',
    chineseName: '土盾术',
    description: 'Create a protective earth barrier (12% HP shield)',
    chineseDescription: '创造保护性土系屏障（12%生命值护盾）',
    type: 'defense',
    element: 'earth',
    costMp: 25,
    cooldown: 3,
    target: 'self',
    powerMultiplier: 0,
    effects: [
      { type: 'buff', value: 1, buffId: 'spirit_shield' }, // Balance Spec: 12% max HP shield
      { type: 'buff', value: 1, buffId: 'defense_up' },
    ],
  },

  // Wind Skills (Balance Spec adjusted)
  {
    id: 'wind_blade',
    name: 'Wind Blade',
    chineseName: '风刃',
    description: 'Launch sharp wind blades',
    chineseDescription: '发射锋利的风刃',
    type: 'attack',
    element: 'wind',
    costMp: 15,
    cooldown: 0,
    target: 'single_enemy',
    powerMultiplier: 1.25, // Balance Spec: normal 1.2-1.8
    hitBonus: 5,
    effects: [],
  },
  {
    id: 'gale_force',
    name: 'Gale Force',
    chineseName: '狂风步',
    description: 'Increase your speed dramatically',
    chineseDescription: '大幅提升自身速度',
    type: 'support',
    element: 'wind',
    costMp: 20,
    cooldown: 3,
    target: 'self',
    powerMultiplier: 0,
    effects: [{ type: 'buff', value: 1, buffId: 'speed_up' }],
  },

  // Neutral/Support Skills (Balance Spec adjusted)
  {
    id: 'focus_mind',
    name: 'Focus Mind',
    chineseName: '凝神',
    description: 'Focus your mind to increase accuracy and crit',
    chineseDescription: '凝聚心神，提高命中和暴击',
    type: 'support',
    costMp: 15,
    cooldown: 2,
    target: 'self',
    powerMultiplier: 0,
    effects: [{ type: 'buff', value: 1, buffId: 'focus' }],
  },
  {
    id: 'power_strike',
    name: 'Power Strike',
    chineseName: '蓄力一击',
    description: 'A powerful charged attack',
    chineseDescription: '蓄力后的强力一击',
    type: 'attack',
    costMp: 20,
    cooldown: 1,
    target: 'single_enemy',
    powerMultiplier: 1.8, // Balance Spec: normal 1.2-1.8 (high end for charged attack)
    critBonus: 10,
    effects: [],
  },
];

// ============================================
// Enemy Templates
// ============================================

const createBaseCombatStats = (
  level: number,
  baseMultiplier: number
): CombatStats => ({
  hp: Math.floor(80 * baseMultiplier * (1 + level * 0.1)),
  maxHp: Math.floor(80 * baseMultiplier * (1 + level * 0.1)),
  mp: Math.floor(40 * baseMultiplier * (1 + level * 0.05)),
  maxMp: Math.floor(40 * baseMultiplier * (1 + level * 0.05)),
  atk: Math.floor(12 * baseMultiplier * (1 + level * 0.08)),
  def: Math.floor(8 * baseMultiplier * (1 + level * 0.06)),
  spd: Math.floor(10 * baseMultiplier * (1 + level * 0.05)),
  acc: Math.floor(100 + level * 2),
  eva: Math.floor(5 + level * 1),
  crit: 5 + level,
  critDmg: 1.5,
  wis: 10 + level,
  sense: 10 + level,
  resfire: 0,
  reswater: 0,
  reswood: 0,
  resmetal: 0,
  researth: 0,
  reswind: 0,
});

// Enemy skill templates (Balance Spec adjusted)
// Basic attack: 1.0-1.2, Normal skill: 1.2-1.8, Ultimate skill: 2.0-3.0
const ENEMY_SKILLS: Record<string, Skill> = {
  beast_bite: {
    id: 'beast_bite',
    name: 'Beast Bite',
    chineseName: '兽咬',
    description: 'A vicious bite attack',
    chineseDescription: '凶猛的撕咬',
    type: 'basic',
    costMp: 0,
    cooldown: 0,
    target: 'single_enemy',
    powerMultiplier: 1.0, // Balance Spec: basic 1.0-1.2
    effects: [],
  },
  claw_swipe: {
    id: 'claw_swipe',
    name: 'Claw Swipe',
    chineseName: '利爪挥击',
    description: 'Swipe with sharp claws',
    chineseDescription: '利爪横扫',
    type: 'attack',
    costMp: 10,
    cooldown: 1,
    target: 'single_enemy',
    powerMultiplier: 1.3, // Balance Spec: normal 1.2-1.8
    effects: [],
  },
  poison_fang: {
    id: 'poison_fang',
    name: 'Poison Fang',
    chineseName: '毒牙',
    description: 'Bite with poisonous fangs (1.5% max HP per turn, 5 stacks)',
    chineseDescription: '以毒牙撕咬（每回合1.5%最大生命，可叠5层）',
    type: 'attack',
    element: 'wood',
    costMp: 15,
    cooldown: 2,
    target: 'single_enemy',
    powerMultiplier: 1.2, // Balance Spec: normal 1.2-1.8
    effects: [{ type: 'debuff', value: 0.5, buffId: 'poison' }], // Balance Spec: wood 1.5% per stack
  },
  fire_breath: {
    id: 'fire_breath',
    name: 'Fire Breath',
    chineseName: '喷火',
    description: 'Breathe devastating fire (2% max HP per turn, 3 stacks)',
    chineseDescription: '喷射灼热火焰（每回合2%最大生命，可叠3层）',
    type: 'attack',
    element: 'fire',
    costMp: 20,
    cooldown: 2,
    target: 'single_enemy',
    powerMultiplier: 1.6, // Balance Spec: normal 1.2-1.8
    effects: [{ type: 'debuff', value: 0.3, buffId: 'burn' }], // Balance Spec: fire 2% per stack
  },
  howl: {
    id: 'howl',
    name: 'Howl',
    chineseName: '嚎叫',
    description: 'A terrifying howl that weakens enemies',
    chineseDescription: '令人恐惧的嚎叫削弱敌人',
    type: 'support',
    costMp: 15,
    cooldown: 3,
    target: 'single_enemy',
    powerMultiplier: 0,
    effects: [{ type: 'debuff', value: 0.7, buffId: 'weakened' }],
  },
  demon_strike: {
    id: 'demon_strike',
    name: 'Demon Strike',
    chineseName: '妖击',
    description: 'A strike infused with demonic energy',
    chineseDescription: '注入妖力的攻击',
    type: 'attack',
    costMp: 25,
    cooldown: 2,
    target: 'single_enemy',
    powerMultiplier: 1.8, // Balance Spec: normal 1.2-1.8 (high end for special attack)
    critBonus: 10,
    effects: [],
  },
  spirit_drain: {
    id: 'spirit_drain',
    name: 'Spirit Drain',
    chineseName: '吸灵',
    description: 'Drain spiritual energy from the target',
    chineseDescription: '吸取目标的灵力',
    type: 'attack',
    costMp: 20,
    cooldown: 3,
    target: 'single_enemy',
    powerMultiplier: 1.25, // Balance Spec: normal 1.2-1.8 (lower because it heals)
    effects: [{ type: 'heal', value: 30, isPercentage: true }],
  },
};

export const ENEMY_TEMPLATES: Record<string, CombatEnemy> = {
  // Qi Refining enemies
  wild_boar: {
    id: 'wild_boar',
    name: 'Wild Spirit Boar',
    chineseName: '野灵猪',
    realm: 'qi_refining',
    combatStats: createBaseCombatStats(1, 0.8),
    skills: [ENEMY_SKILLS.beast_bite],
    aiRules: [
      { condition: { type: 'always' }, action: 'use_skill', skillId: 'beast_bite', priority: 1 },
    ],
    loot: {
      items: [
        { itemId: 'demon_core_low', dropChance: 0.3, minQuantity: 1, maxQuantity: 1 },
        { itemId: 'spirit_grass', dropChance: 0.5, minQuantity: 1, maxQuantity: 2 },
      ],
      spiritStones: { min: 5, max: 15 },
    },
  },
  forest_wolf: {
    id: 'forest_wolf',
    name: 'Forest Wolf',
    chineseName: '林狼',
    realm: 'qi_refining',
    combatStats: createBaseCombatStats(2, 1.0),
    skills: [ENEMY_SKILLS.beast_bite, ENEMY_SKILLS.claw_swipe],
    aiRules: [
      { condition: { type: 'random', value: 40 }, action: 'use_skill', skillId: 'claw_swipe', priority: 2 },
      { condition: { type: 'always' }, action: 'use_skill', skillId: 'beast_bite', priority: 1 },
    ],
    loot: {
      items: [
        { itemId: 'demon_core_low', dropChance: 0.4, minQuantity: 1, maxQuantity: 1 },
        { itemId: 'spirit_grass', dropChance: 0.3, minQuantity: 1, maxQuantity: 3 },
      ],
      spiritStones: { min: 10, max: 25 },
    },
  },
  venomous_snake: {
    id: 'venomous_snake',
    name: 'Venomous Spirit Snake',
    chineseName: '毒灵蛇',
    realm: 'qi_refining',
    combatStats: {
      ...createBaseCombatStats(3, 0.9),
      reswood: 20,
    },
    element: 'wood',
    skills: [ENEMY_SKILLS.beast_bite, ENEMY_SKILLS.poison_fang],
    aiRules: [
      { condition: { type: 'random', value: 50 }, action: 'use_skill', skillId: 'poison_fang', priority: 2 },
      { condition: { type: 'always' }, action: 'use_skill', skillId: 'beast_bite', priority: 1 },
    ],
    loot: {
      items: [
        { itemId: 'demon_core_low', dropChance: 0.5, minQuantity: 1, maxQuantity: 1 },
        { itemId: 'jade_lotus', dropChance: 0.2, minQuantity: 1, maxQuantity: 1 },
      ],
      spiritStones: { min: 15, max: 35 },
    },
  },
  flame_fox: {
    id: 'flame_fox',
    name: 'Flame Fox',
    chineseName: '火狐',
    realm: 'qi_refining',
    combatStats: {
      ...createBaseCombatStats(4, 1.1),
      resfire: 30,
    },
    element: 'fire',
    skills: [ENEMY_SKILLS.beast_bite, ENEMY_SKILLS.fire_breath],
    aiRules: [
      { condition: { type: 'mp_above', value: 0.4 }, action: 'use_skill', skillId: 'fire_breath', priority: 3 },
      { condition: { type: 'always' }, action: 'use_skill', skillId: 'beast_bite', priority: 1 },
    ],
    loot: {
      items: [
        { itemId: 'demon_core_low', dropChance: 0.6, minQuantity: 1, maxQuantity: 2 },
        { itemId: 'fire_talisman', dropChance: 0.25, minQuantity: 1, maxQuantity: 1 },
      ],
      spiritStones: { min: 20, max: 50 },
    },
  },

  // Foundation enemies
  shadow_wolf: {
    id: 'shadow_wolf',
    name: 'Shadow Wolf',
    chineseName: '暗影狼',
    realm: 'foundation',
    combatStats: createBaseCombatStats(5, 1.5),
    skills: [ENEMY_SKILLS.beast_bite, ENEMY_SKILLS.claw_swipe, ENEMY_SKILLS.howl],
    aiRules: [
      { condition: { type: 'hp_below', value: 0.3 }, action: 'use_skill', skillId: 'howl', priority: 4 },
      { condition: { type: 'random', value: 50 }, action: 'use_skill', skillId: 'claw_swipe', priority: 2 },
      { condition: { type: 'always' }, action: 'use_skill', skillId: 'beast_bite', priority: 1 },
    ],
    loot: {
      items: [
        { itemId: 'demon_core_mid', dropChance: 0.4, minQuantity: 1, maxQuantity: 1 },
        { itemId: 'jade_essence', dropChance: 0.2, minQuantity: 1, maxQuantity: 1 },
      ],
      spiritStones: { min: 50, max: 100 },
    },
  },
  rock_golem: {
    id: 'rock_golem',
    name: 'Rock Golem',
    chineseName: '岩石傀儡',
    realm: 'foundation',
    combatStats: {
      ...createBaseCombatStats(6, 1.8),
      def: 25,
      spd: 8,
      researth: 40,
    },
    element: 'earth',
    skills: [ENEMY_SKILLS.beast_bite, ENEMY_SKILLS.demon_strike],
    aiRules: [
      { condition: { type: 'random', value: 40 }, action: 'use_skill', skillId: 'demon_strike', priority: 2 },
      { condition: { type: 'always' }, action: 'use_skill', skillId: 'beast_bite', priority: 1 },
    ],
    loot: {
      items: [
        { itemId: 'demon_core_mid', dropChance: 0.5, minQuantity: 1, maxQuantity: 1 },
        { itemId: 'jade_essence', dropChance: 0.3, minQuantity: 1, maxQuantity: 2 },
        { itemId: 'stellar_iron', dropChance: 0.1, minQuantity: 1, maxQuantity: 1 },
      ],
      spiritStones: { min: 60, max: 120 },
    },
  },
  demonic_ape: {
    id: 'demonic_ape',
    name: 'Demonic Ape',
    chineseName: '妖猿',
    realm: 'foundation',
    isBoss: true,
    combatStats: createBaseCombatStats(8, 2.2),
    skills: [ENEMY_SKILLS.beast_bite, ENEMY_SKILLS.demon_strike, ENEMY_SKILLS.spirit_drain],
    aiRules: [
      { condition: { type: 'hp_below', value: 0.4 }, action: 'use_skill', skillId: 'spirit_drain', priority: 5 },
      { condition: { type: 'random', value: 50 }, action: 'use_skill', skillId: 'demon_strike', priority: 3 },
      { condition: { type: 'always' }, action: 'use_skill', skillId: 'beast_bite', priority: 1 },
    ],
    loot: {
      items: [
        { itemId: 'demon_core_mid', dropChance: 1.0, minQuantity: 2, maxQuantity: 3 },
        { itemId: 'demon_core_high', dropChance: 0.3, minQuantity: 1, maxQuantity: 1 },
        { itemId: 'foundation_pill', dropChance: 0.15, minQuantity: 1, maxQuantity: 1 },
      ],
      spiritStones: { min: 150, max: 300 },
    },
  },
};

// ============================================
// Enemy Spawn Tables by Realm
// ============================================

export const ENEMY_SPAWN_TABLE: Record<Realm, string[]> = {
  qi_refining: ['wild_boar', 'forest_wolf', 'venomous_snake', 'flame_fox'],
  foundation: ['shadow_wolf', 'rock_golem', 'demonic_ape'],
  core_formation: ['shadow_wolf', 'rock_golem', 'demonic_ape'], // Placeholder
  nascent_soul: ['demonic_ape'], // Placeholder
  spirit_transformation: ['demonic_ape'], // Placeholder
  void_refining: ['demonic_ape'], // Placeholder
  body_integration: ['demonic_ape'], // Placeholder
  mahayana: ['demonic_ape'], // Placeholder
  tribulation: ['demonic_ape'], // Placeholder
};

// ============================================
// Combat Items (Pills and Talismans for combat)
// ============================================

export const COMBAT_ITEMS: Record<string, {
  id: string;
  name: string;
  chineseName: string;
  type: 'heal' | 'buff' | 'damage';
  target: 'self' | 'enemy';
  value: number;
  isPercentage?: boolean;
  element?: Element;
  buffId?: string;
}> = {
  healing_pill: {
    id: 'healing_pill',
    name: 'Healing Pill',
    chineseName: '疗伤丹',
    type: 'heal',
    target: 'self',
    value: 30,
    isPercentage: true,
  },
  spirit_recovery_pill: {
    id: 'spirit_recovery_pill',
    name: 'Spirit Recovery Pill',
    chineseName: '回灵丹',
    type: 'heal',
    target: 'self',
    value: 40,
    isPercentage: true,
  },
  fire_talisman: {
    id: 'fire_talisman',
    name: 'Fire Talisman',
    chineseName: '火符',
    type: 'damage',
    target: 'enemy',
    value: 50,
    element: 'fire',
  },
  lightning_talisman: {
    id: 'lightning_talisman',
    name: 'Lightning Talisman',
    chineseName: '雷符',
    type: 'damage',
    target: 'enemy',
    value: 80,
    element: 'wind',
  },
  shield_talisman: {
    id: 'shield_talisman',
    name: 'Shield Talisman',
    chineseName: '护盾符',
    type: 'buff',
    target: 'self',
    value: 0,
    buffId: 'spirit_shield',
  },
};

// ============================================
// Skill Tree Constants - Five Main Cultivation Paths
// ============================================

import type {
  SkillTreeNode,
  SkillTreeType,
  Realm,
  SkillTier,
} from '../types/game';

// ============================================
// Realm Requirements per Tier
// ============================================

export const TIER_REALM_REQUIREMENTS: Record<SkillTier, Realm> = {
  1: 'qi_refining',
  2: 'qi_refining',
  3: 'foundation',
  4: 'core_formation',
  5: 'nascent_soul',
};

// ============================================
// Skill Point Costs per Tier
// ============================================

export const TIER_POINT_COSTS: Record<SkillTier, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 5,
  5: 8,
};

// ============================================
// Sword Tree (Jian Dao Shu) - Single Target Burst
// ============================================

export const SWORD_TREE_NODES: SkillTreeNode[] = [
  // Tier 1
  {
    id: 'sword_t1_basic_form',
    name: 'Basic Sword Form',
    chineseName: '基础剑式',
    tree: 'sword',
    tier: 1,
    type: 'passive',
    cost: 1,
    prerequisites: [],
    realmRequired: 'qi_refining',
    modifiers: [
      { stat: 'atk', value: 5, isPercentage: true },
    ],
    description: '+5% sword damage',
    chineseDescription: '剑系伤害+5%',
    position: { x: 50, y: 10 },
  },
  {
    id: 'sword_t1_intent',
    name: 'Sword Intent Basics',
    chineseName: '剑意初窥',
    tree: 'sword',
    tier: 1,
    type: 'passive',
    cost: 1,
    prerequisites: [],
    realmRequired: 'qi_refining',
    triggers: [
      {
        type: 'on_attack',
        chance: 10,
        effect: {
          type: 'damage_bonus',
          value: 50,
          isPercentage: true,
          description: '10% chance for follow-up attack',
          chineseDescription: '10%几率追击',
        },
      },
    ],
    description: '10% chance for follow-up attack after sword skill',
    chineseDescription: '使用剑技后有10%几率追击',
    position: { x: 50, y: 10 },
  },

  // Tier 2
  {
    id: 'sword_t2_armor_break',
    name: 'Armor Break',
    chineseName: '破甲',
    tree: 'sword',
    tier: 2,
    type: 'passive',
    cost: 2,
    prerequisites: ['sword_t1_basic_form'],
    realmRequired: 'qi_refining',
    triggers: [
      {
        type: 'on_attack',
        chance: 100,
        effect: {
          type: 'apply_debuff',
          value: 3,
          buffId: 'armor_break_stack',
          description: '-3% DEF per hit, stacks up to 5 times',
          chineseDescription: '每次攻击降低敌人3%防御，最多叠加5层',
        },
      },
    ],
    description: 'Each hit reduces enemy DEF by 3%, max 5 stacks',
    chineseDescription: '每次命中降低敌人3%防御，最多5层',
    position: { x: 30, y: 25 },
  },
  {
    id: 'sword_t2_blood_mark',
    name: 'Blood Mark',
    chineseName: '血印',
    tree: 'sword',
    tier: 2,
    type: 'passive',
    cost: 2,
    prerequisites: ['sword_t1_intent'],
    realmRequired: 'qi_refining',
    triggers: [
      {
        type: 'on_crit',
        chance: 100,
        effect: {
          type: 'apply_debuff',
          value: 3,
          duration: 3,
          buffId: 'bleed',
          description: 'Critical hits apply Bleed DoT',
          chineseDescription: '暴击造成流血效果',
        },
      },
    ],
    description: 'Critical hits cause bleeding damage over time',
    chineseDescription: '暴击时对敌人造成流血持续伤害',
    position: { x: 70, y: 25 },
  },

  // Tier 3
  {
    id: 'sword_t3_chain_slash',
    name: 'Chain Slash',
    chineseName: '追击连斩',
    tree: 'sword',
    tier: 3,
    type: 'active',
    cost: 3,
    prerequisites: ['sword_t2_armor_break'],
    realmRequired: 'foundation',
    skill: {
      id: 'chain_slash',
      name: 'Chain Slash',
      chineseName: '追击连斩',
      description: 'Strike 3 times rapidly, each hit has 80% power',
      chineseDescription: '快速连斩三次，每次80%威力',
      type: 'attack',
      element: 'metal',
      costMp: 30,
      cooldown: 3,
      target: 'single_enemy',
      powerMultiplier: 0.8,
      effects: [],
    },
    description: 'Unlocks Chain Slash - 3 rapid strikes at 80% power each',
    chineseDescription: '解锁追击连斩 - 快速三连击，每击80%威力',
    position: { x: 30, y: 45 },
  },
  {
    id: 'sword_t3_finishing_blow',
    name: 'Finishing Blow',
    chineseName: '斩杀',
    tree: 'sword',
    tier: 3,
    type: 'passive',
    cost: 3,
    prerequisites: ['sword_t2_blood_mark'],
    realmRequired: 'foundation',
    triggers: [
      {
        type: 'on_attack',
        chance: 100,
        condition: {
          type: 'enemy_hp_below',
          value: 25,
        },
        effect: {
          type: 'damage_bonus',
          value: 100,
          isPercentage: true,
          description: 'Double damage to enemies below 25% HP',
          chineseDescription: '对25%血量以下敌人伤害翻倍',
        },
      },
    ],
    description: 'Execute: Double damage to enemies below 25% HP',
    chineseDescription: '斩杀：对生命值低于25%的敌人造成双倍伤害',
    position: { x: 70, y: 45 },
  },

  // Tier 4
  {
    id: 'sword_t4_wind_spirit',
    name: 'Wind Spirit Bond',
    chineseName: '风灵契约',
    tree: 'sword',
    tier: 4,
    type: 'passive',
    cost: 5,
    prerequisites: ['sword_t3_chain_slash'],
    realmRequired: 'core_formation',
    triggers: [
      {
        type: 'on_trade',
        chance: 100,
        effect: {
          type: 'stat_boost',
          value: 2,
          stat: 'crit',
          duration: 10,
          description: 'Market price changes affect crit rate',
          chineseDescription: '市场价格变化影响暴击率',
        },
      },
    ],
    description: 'Market momentum affects your critical rate',
    chineseDescription: '市场波动影响你的暴击率',
    position: { x: 30, y: 65 },
  },
  {
    id: 'sword_t4_frost_bone',
    name: 'Frost Sword Bone',
    chineseName: '霜剑骨',
    tree: 'sword',
    tier: 4,
    type: 'passive',
    cost: 5,
    prerequisites: ['sword_t3_finishing_blow'],
    realmRequired: 'core_formation',
    modifiers: [
      { stat: 'critDmg', value: 25, isPercentage: true },
    ],
    triggers: [
      {
        type: 'on_combat_start',
        chance: 100,
        effect: {
          type: 'stat_boost',
          value: 5,
          stat: 'atk',
          isPercentage: true,
          description: 'Inventory size boosts combat power',
          chineseDescription: '储物袋物品数量增加战力',
        },
      },
    ],
    description: '+25% crit damage, inventory affects combat power',
    chineseDescription: '暴击伤害+25%，储物袋物品数量增加战力',
    position: { x: 70, y: 65 },
  },

  // Tier 5
  {
    id: 'sword_t5_one_heart',
    name: 'One Heart One Sword',
    chineseName: '一心一剑',
    tree: 'sword',
    tier: 5,
    type: 'passive',
    cost: 8,
    prerequisites: ['sword_t4_wind_spirit', 'sword_t4_frost_bone'],
    realmRequired: 'nascent_soul',
    mutuallyExclusive: ['spell_t5_grand_formation'],
    modifiers: [
      { stat: 'atk', value: 30, isPercentage: true },
      { stat: 'crit', value: 15, isPercentage: false },
      { stat: 'critDmg', value: 50, isPercentage: true },
    ],
    description: 'Ultimate sword mastery. +30% ATK, +15% crit, +50% crit damage. Locks Spell T5.',
    chineseDescription: '剑道至境。攻击+30%，暴击+15%，暴伤+50%。锁定法术终极节点。',
    position: { x: 50, y: 85 },
  },
];

// ============================================
// Spell Tree (Fa Shu Shu) - AoE, Elements, Control
// ============================================

export const SPELL_TREE_NODES: SkillTreeNode[] = [
  // Tier 1
  {
    id: 'spell_t1_fire_spirit',
    name: 'Fire Spirit',
    chineseName: '火灵',
    tree: 'spell',
    tier: 1,
    type: 'passive',
    cost: 1,
    prerequisites: [],
    realmRequired: 'qi_refining',
    modifiers: [
      { stat: 'atk', value: 3, isPercentage: true },
    ],
    triggers: [
      {
        type: 'on_skill_use',
        chance: 20,
        effect: {
          type: 'apply_debuff',
          value: 1,
          buffId: 'burn',
          duration: 2,
          description: '20% chance to burn on spell use',
          chineseDescription: '使用法术时20%几率灼烧敌人',
        },
      },
    ],
    description: 'Basic fire affinity. +3% spell damage, 20% burn chance',
    chineseDescription: '火系亲和。法术伤害+3%，20%几率灼烧',
    position: { x: 30, y: 10 },
  },
  {
    id: 'spell_t1_water_wave',
    name: 'Water Wave',
    chineseName: '水波',
    tree: 'spell',
    tier: 1,
    type: 'passive',
    cost: 1,
    prerequisites: [],
    realmRequired: 'qi_refining',
    modifiers: [
      { stat: 'acc', value: 5, isPercentage: true },
    ],
    triggers: [
      {
        type: 'on_skill_use',
        chance: 15,
        effect: {
          type: 'apply_debuff',
          value: 1,
          buffId: 'slow',
          duration: 2,
          description: '15% chance to slow on spell use',
          chineseDescription: '使用法术时15%几率减速敌人',
        },
      },
    ],
    description: 'Basic water affinity. +5% accuracy, 15% slow chance',
    chineseDescription: '水系亲和。命中+5%，15%几率减速',
    position: { x: 70, y: 10 },
  },

  // Tier 2
  {
    id: 'spell_t2_fire_mastery',
    name: 'Fire Mastery',
    chineseName: '火系精通',
    tree: 'spell',
    tier: 2,
    type: 'passive',
    cost: 2,
    prerequisites: ['spell_t1_fire_spirit'],
    realmRequired: 'qi_refining',
    modifiers: [
      { stat: 'atk', value: 10, isPercentage: true },
    ],
    triggers: [
      {
        type: 'on_attack',
        chance: 100,
        condition: {
          type: 'has_buff',
          value: 1,
          buffId: 'burn',
        },
        effect: {
          type: 'damage_bonus',
          value: 20,
          isPercentage: true,
          description: '+20% damage to burning targets',
          chineseDescription: '对灼烧目标伤害+20%',
        },
      },
    ],
    description: 'Fire specialization. +10% fire damage, +20% vs burning targets',
    chineseDescription: '火系专精。火系伤害+10%，对灼烧目标+20%',
    position: { x: 20, y: 25 },
  },
  {
    id: 'spell_t2_water_mastery',
    name: 'Water Mastery',
    chineseName: '水系精通',
    tree: 'spell',
    tier: 2,
    type: 'passive',
    cost: 2,
    prerequisites: ['spell_t1_water_wave'],
    realmRequired: 'qi_refining',
    modifiers: [
      { stat: 'eva', value: 5, isPercentage: true },
    ],
    triggers: [
      {
        type: 'on_skill_use',
        chance: 30,
        effect: {
          type: 'heal',
          value: 5,
          isPercentage: true,
          description: '30% chance to heal 5% HP on spell use',
          chineseDescription: '使用法术时30%几率恢复5%生命',
        },
      },
    ],
    description: 'Water specialization. +5% EVA, 30% heal chance on spells',
    chineseDescription: '水系专精。闪避+5%，30%几率恢复生命',
    position: { x: 80, y: 25 },
  },
  {
    id: 'spell_t2_wood_mastery',
    name: 'Wood Mastery',
    chineseName: '木系精通',
    tree: 'spell',
    tier: 2,
    type: 'passive',
    cost: 2,
    prerequisites: ['spell_t1_fire_spirit', 'spell_t1_water_wave'],
    realmRequired: 'qi_refining',
    triggers: [
      {
        type: 'on_turn_end',
        chance: 100,
        effect: {
          type: 'heal',
          value: 2,
          isPercentage: true,
          description: 'Regenerate 2% HP per turn',
          chineseDescription: '每回合恢复2%生命',
        },
      },
    ],
    description: 'Wood specialization. Regenerate 2% HP per turn',
    chineseDescription: '木系专精。每回合恢复2%生命值',
    position: { x: 50, y: 25 },
  },

  // Tier 3
  {
    id: 'spell_t3_element_fusion',
    name: 'Element Fusion',
    chineseName: '元素融合',
    tree: 'spell',
    tier: 3,
    type: 'passive',
    cost: 3,
    prerequisites: ['spell_t2_fire_mastery', 'spell_t2_water_mastery'],
    realmRequired: 'foundation',
    triggers: [
      {
        type: 'on_attack',
        chance: 25,
        effect: {
          type: 'apply_debuff',
          value: 1,
          buffId: 'frozen',
          duration: 1,
          description: 'Burn + Slow = Freeze',
          chineseDescription: '灼烧+减速=冰冻',
        },
      },
    ],
    description: 'Combine elements for powerful effects. Burn+Slow=Freeze',
    chineseDescription: '融合元素产生强力效果。灼烧+减速=冰冻',
    position: { x: 50, y: 45 },
  },
  {
    id: 'spell_t3_lightning_burst',
    name: 'Lightning Burst',
    chineseName: '雷电爆发',
    tree: 'spell',
    tier: 3,
    type: 'active',
    cost: 3,
    prerequisites: ['spell_t2_fire_mastery'],
    realmRequired: 'foundation',
    skill: {
      id: 'lightning_burst',
      name: 'Lightning Burst',
      chineseName: '雷电爆发',
      description: 'Devastating lightning attack with high crit chance',
      chineseDescription: '破坏性雷电攻击，高暴击率',
      type: 'attack',
      element: 'wind',
      costMp: 40,
      cooldown: 4,
      target: 'single_enemy',
      powerMultiplier: 2.5,
      critBonus: 25,
      effects: [],
    },
    description: 'Unlocks Lightning Burst - High damage, high crit attack',
    chineseDescription: '解锁雷电爆发 - 高伤害高暴击攻击',
    position: { x: 20, y: 45 },
  },

  // Tier 4
  {
    id: 'spell_t4_battlefield_control',
    name: 'Battlefield Control',
    chineseName: '战场控制',
    tree: 'spell',
    tier: 4,
    type: 'passive',
    cost: 5,
    prerequisites: ['spell_t3_element_fusion'],
    realmRequired: 'core_formation',
    triggers: [
      {
        type: 'on_combat_start',
        chance: 100,
        effect: {
          type: 'apply_debuff',
          value: 1,
          buffId: 'slow',
          duration: 2,
          description: 'Enemies start combat slowed',
          chineseDescription: '敌人战斗开始时被减速',
        },
      },
    ],
    modifiers: [
      { stat: 'spd', value: 15, isPercentage: true },
    ],
    description: 'Enemies start slowed. +15% speed',
    chineseDescription: '敌人战斗开始时被减速。速度+15%',
    position: { x: 50, y: 65 },
  },
  {
    id: 'spell_t4_seal_formation',
    name: 'Seal Formation',
    chineseName: '封印阵法',
    tree: 'spell',
    tier: 4,
    type: 'active',
    cost: 5,
    prerequisites: ['spell_t3_lightning_burst'],
    realmRequired: 'core_formation',
    skill: {
      id: 'seal_formation',
      name: 'Seal Formation',
      chineseName: '封印阵法',
      description: 'Seal enemy skills for 2 turns',
      chineseDescription: '封印敌人技能2回合',
      type: 'support',
      costMp: 50,
      cooldown: 5,
      target: 'single_enemy',
      powerMultiplier: 0,
      effects: [
        { type: 'debuff', value: 1, buffId: 'silenced', duration: 2 },
      ],
    },
    description: 'Unlocks Seal Formation - Silence enemy for 2 turns',
    chineseDescription: '解锁封印阵法 - 沉默敌人2回合',
    position: { x: 20, y: 65 },
  },

  // Tier 5
  {
    id: 'spell_t5_grand_formation',
    name: 'Grand Formation Master',
    chineseName: '大阵宗师',
    tree: 'spell',
    tier: 5,
    type: 'passive',
    cost: 8,
    prerequisites: ['spell_t4_battlefield_control', 'spell_t4_seal_formation'],
    realmRequired: 'nascent_soul',
    mutuallyExclusive: ['sword_t5_one_heart'],
    modifiers: [
      { stat: 'atk', value: 25, isPercentage: true },
      { stat: 'acc', value: 20, isPercentage: true },
    ],
    triggers: [
      {
        type: 'on_skill_use',
        chance: 100,
        effect: {
          type: 'reduce_cooldown',
          value: 1,
          description: 'All spell cooldowns reduced by 1',
          chineseDescription: '所有法术冷却-1',
        },
      },
    ],
    description: 'Ultimate spell mastery. +25% spell damage, -1 all cooldowns. Locks Sword T5.',
    chineseDescription: '法术至境。法术伤害+25%，所有冷却-1。锁定剑道终极节点。',
    position: { x: 50, y: 85 },
  },
];

// ============================================
// Body/Defense Tree (Shen Fa Fang Yu Shu) - Dodge, Shield, Counter
// ============================================

export const BODY_TREE_NODES: SkillTreeNode[] = [
  // Tier 1
  {
    id: 'body_t1_light_body',
    name: 'Light Body',
    chineseName: '轻身术',
    tree: 'body',
    tier: 1,
    type: 'passive',
    cost: 1,
    prerequisites: [],
    realmRequired: 'qi_refining',
    modifiers: [
      { stat: 'eva', value: 5, isPercentage: true },
      { stat: 'spd', value: 5, isPercentage: true },
    ],
    description: '+5% Evasion, +5% Speed',
    chineseDescription: '闪避+5%，速度+5%',
    position: { x: 30, y: 10 },
  },
  {
    id: 'body_t1_iron_skin',
    name: 'Iron Skin',
    chineseName: '铁布衫',
    tree: 'body',
    tier: 1,
    type: 'passive',
    cost: 1,
    prerequisites: [],
    realmRequired: 'qi_refining',
    modifiers: [
      { stat: 'def', value: 8, isPercentage: true },
    ],
    description: '+8% Defense',
    chineseDescription: '防御+8%',
    position: { x: 70, y: 10 },
  },

  // Tier 2
  {
    id: 'body_t2_spirit_shield',
    name: 'Spirit Shield',
    chineseName: '护体灵罩',
    tree: 'body',
    tier: 2,
    type: 'passive',
    cost: 2,
    prerequisites: ['body_t1_iron_skin'],
    realmRequired: 'qi_refining',
    triggers: [
      {
        type: 'on_combat_start',
        chance: 100,
        effect: {
          type: 'gain_shield',
          value: 10,
          isPercentage: true,
          description: 'Start combat with 10% HP shield',
          chineseDescription: '战斗开始时获得10%生命护盾',
        },
      },
    ],
    description: 'Start combat with 10% HP as shield',
    chineseDescription: '战斗开始时获得最大生命值10%的护盾',
    position: { x: 70, y: 25 },
  },
  {
    id: 'body_t2_retreat_advance',
    name: 'Retreat to Advance',
    chineseName: '以退为进',
    tree: 'body',
    tier: 2,
    type: 'passive',
    cost: 2,
    prerequisites: ['body_t1_light_body'],
    realmRequired: 'qi_refining',
    triggers: [
      {
        type: 'on_dodge',
        chance: 100,
        effect: {
          type: 'damage_bonus',
          value: 20,
          isPercentage: true,
          duration: 1,
          description: 'Next attack deals +20% damage after dodging',
          chineseDescription: '闪避后下次攻击伤害+20%',
        },
      },
    ],
    description: 'After dodging, next attack deals +20% damage',
    chineseDescription: '闪避后下次攻击伤害增加20%',
    position: { x: 30, y: 25 },
  },

  // Tier 3
  {
    id: 'body_t3_flow_intent',
    name: 'Flow with Intent',
    chineseName: '随心流转',
    tree: 'body',
    tier: 3,
    type: 'passive',
    cost: 3,
    prerequisites: ['body_t2_retreat_advance'],
    realmRequired: 'foundation',
    triggers: [
      {
        type: 'on_defend',
        chance: 100,
        effect: {
          type: 'stat_boost',
          value: 5,
          stat: 'atk',
          isPercentage: true,
          duration: 3,
          description: 'Defending grants attack stacks',
          chineseDescription: '防御时获得攻击加成层数',
        },
      },
    ],
    description: 'Support skills grant stacking attack bonus',
    chineseDescription: '使用支援技能获得叠加的攻击加成',
    position: { x: 30, y: 45 },
  },
  {
    id: 'body_t3_draw_prison',
    name: 'Draw Prison',
    chineseName: '画地为牢',
    tree: 'body',
    tier: 3,
    type: 'active',
    cost: 3,
    prerequisites: ['body_t2_spirit_shield'],
    realmRequired: 'foundation',
    skill: {
      id: 'draw_prison',
      name: 'Draw Prison',
      chineseName: '画地为牢',
      description: 'Create a barrier that slows enemies greatly',
      chineseDescription: '创造结界大幅减速敌人',
      type: 'defense',
      element: 'earth',
      costMp: 35,
      cooldown: 4,
      target: 'single_enemy',
      powerMultiplier: 0,
      effects: [
        { type: 'debuff', value: 1, buffId: 'heavy_slow', duration: 3 },
      ],
    },
    description: 'Unlocks Draw Prison - Heavy slow on enemy',
    chineseDescription: '解锁画地为牢 - 大幅减速敌人',
    position: { x: 70, y: 45 },
  },

  // Tier 4
  {
    id: 'body_t4_iron_mountain',
    name: 'Iron Mountain',
    chineseName: '铁山靠',
    tree: 'body',
    tier: 4,
    type: 'passive',
    cost: 5,
    prerequisites: ['body_t3_flow_intent', 'body_t3_draw_prison'],
    realmRequired: 'core_formation',
    modifiers: [
      { stat: 'def', value: 20, isPercentage: true },
      { stat: 'hp', value: 15, isPercentage: true },
    ],
    triggers: [
      {
        type: 'on_hit',
        chance: 20,
        effect: {
          type: 'damage_bonus',
          value: 50,
          isPercentage: true,
          description: '20% chance to counter when hit',
          chineseDescription: '受击时20%几率反击',
        },
      },
    ],
    description: '+20% DEF, +15% HP, 20% counter chance',
    chineseDescription: '防御+20%，生命+15%，20%几率反击',
    position: { x: 50, y: 65 },
  },

  // Tier 5
  {
    id: 'body_t5_indestructible',
    name: 'Indestructible Body',
    chineseName: '金刚不坏',
    tree: 'body',
    tier: 5,
    type: 'passive',
    cost: 8,
    prerequisites: ['body_t4_iron_mountain'],
    realmRequired: 'nascent_soul',
    modifiers: [
      { stat: 'def', value: 30, isPercentage: true },
      { stat: 'hp', value: 25, isPercentage: true },
    ],
    triggers: [
      {
        type: 'on_low_hp',
        chance: 100,
        condition: {
          type: 'hp_below',
          value: 1,
        },
        effect: {
          type: 'heal',
          value: 30,
          isPercentage: true,
          description: 'Survive fatal blow once per combat',
          chineseDescription: '每场战斗免疫一次致命伤害',
        },
      },
    ],
    description: 'Ultimate body cultivation. Survive fatal blow once per combat.',
    chineseDescription: '身法至境。每场战斗可免疫一次致命伤害。',
    position: { x: 50, y: 85 },
  },
];

// ============================================
// Mind/Perception Tree (Shen Shi Xin Fa Shu) - Insight, Qi, Cooldowns
// ============================================

export const MIND_TREE_NODES: SkillTreeNode[] = [
  // Tier 1
  {
    id: 'mind_t1_calm_observation',
    name: 'Calm Observation',
    chineseName: '静观',
    tree: 'mind',
    tier: 1,
    type: 'passive',
    cost: 1,
    prerequisites: [],
    realmRequired: 'qi_refining',
    triggers: [
      {
        type: 'on_observe',
        chance: 100,
        effect: {
          type: 'stat_boost',
          value: 1,
          stat: 'sense',
          description: '+1 insight per observe (max 3 extra uses)',
          chineseDescription: '每次观察+1洞察（最多额外3次）',
        },
      },
    ],
    description: '+1 insight stack per Observe action',
    chineseDescription: '每次观察行动额外获得1层洞察',
    position: { x: 30, y: 10 },
  },
  {
    id: 'mind_t1_meditation',
    name: 'Battle Meditation',
    chineseName: '战斗冥想',
    tree: 'mind',
    tier: 1,
    type: 'passive',
    cost: 1,
    prerequisites: [],
    realmRequired: 'qi_refining',
    modifiers: [
      { stat: 'wis', value: 10, isPercentage: true },
    ],
    description: '+10% Comprehension, faster Qi regeneration',
    chineseDescription: '悟性+10%，气机恢复加快',
    position: { x: 70, y: 10 },
  },

  // Tier 2
  {
    id: 'mind_t2_qi_flow',
    name: 'Qi Flow',
    chineseName: '气机流转',
    tree: 'mind',
    tier: 2,
    type: 'passive',
    cost: 2,
    prerequisites: ['mind_t1_meditation'],
    realmRequired: 'qi_refining',
    triggers: [
      {
        type: 'on_crit',
        chance: 100,
        effect: {
          type: 'gain_qi',
          value: 1,
          description: 'Critical hits grant 1 Qi',
          chineseDescription: '暴击获得1点气机',
        },
      },
    ],
    description: 'Critical hits grant Qi points',
    chineseDescription: '暴击时获得气机',
    position: { x: 70, y: 25 },
  },
  {
    id: 'mind_t2_see_through',
    name: 'See Through',
    chineseName: '洞察',
    tree: 'mind',
    tier: 2,
    type: 'passive',
    cost: 2,
    prerequisites: ['mind_t1_calm_observation'],
    realmRequired: 'qi_refining',
    modifiers: [
      { stat: 'acc', value: 10, isPercentage: true },
      { stat: 'sense', value: 10, isPercentage: true },
    ],
    description: '+10% Accuracy, +10% Divine Sense',
    chineseDescription: '命中+10%，神识+10%',
    position: { x: 30, y: 25 },
  },

  // Tier 3
  {
    id: 'mind_t3_still_mind',
    name: 'Still Mind',
    chineseName: '心如止水',
    tree: 'mind',
    tier: 3,
    type: 'passive',
    cost: 3,
    prerequisites: ['mind_t2_see_through'],
    realmRequired: 'foundation',
    triggers: [
      {
        type: 'on_hit',
        chance: 100,
        condition: {
          type: 'consecutive_crits',
          value: 2,
        },
        effect: {
          type: 'damage_bonus',
          value: -30,
          isPercentage: true,
          description: 'Reduce consecutive crit damage taken',
          chineseDescription: '降低连续暴击伤害',
        },
      },
    ],
    description: 'Reduce damage from consecutive critical hits',
    chineseDescription: '降低受到的连续暴击伤害',
    position: { x: 30, y: 45 },
  },
  {
    id: 'mind_t3_qi_explosion',
    name: 'Qi Explosion',
    chineseName: '气爆',
    tree: 'mind',
    tier: 3,
    type: 'active',
    cost: 3,
    prerequisites: ['mind_t2_qi_flow'],
    realmRequired: 'foundation',
    skill: {
      id: 'qi_explosion',
      name: 'Qi Explosion',
      chineseName: '气爆',
      description: 'Release accumulated Qi for massive damage',
      chineseDescription: '释放积累的气机造成大量伤害',
      type: 'ultimate',
      costMp: 30,
      costQi: 3,
      qiElement: undefined,
      cooldown: 5,
      target: 'single_enemy',
      powerMultiplier: 3.0,
      effects: [],
    },
    description: 'Unlocks Qi Explosion - Consume Qi for burst damage',
    chineseDescription: '解锁气爆 - 消耗气机造成爆发伤害',
    position: { x: 70, y: 45 },
  },

  // Tier 4
  {
    id: 'mind_t4_enlightened_path',
    name: 'Enlightened Path',
    chineseName: '悟道',
    tree: 'mind',
    tier: 4,
    type: 'passive',
    cost: 5,
    prerequisites: ['mind_t3_still_mind', 'mind_t3_qi_explosion'],
    realmRequired: 'core_formation',
    triggers: [
      {
        type: 'on_combat_end',
        chance: 100,
        effect: {
          type: 'skill_point_bonus',
          value: 1,
          description: 'Earn bonus skill points based on combat style',
          chineseDescription: '根据战斗风格获得额外悟道点',
        },
      },
    ],
    modifiers: [
      { stat: 'wis', value: 20, isPercentage: true },
    ],
    description: '+20% Comprehension, combat grants bonus skill points',
    chineseDescription: '悟性+20%，战斗获得额外悟道点',
    position: { x: 50, y: 65 },
  },

  // Tier 5
  {
    id: 'mind_t5_omniscient',
    name: 'Omniscient',
    chineseName: '全知',
    tree: 'mind',
    tier: 5,
    type: 'passive',
    cost: 8,
    prerequisites: ['mind_t4_enlightened_path'],
    realmRequired: 'nascent_soul',
    modifiers: [
      { stat: 'sense', value: 50, isPercentage: true },
      { stat: 'acc', value: 25, isPercentage: true },
      { stat: 'crit', value: 10, isPercentage: false },
    ],
    triggers: [
      {
        type: 'on_combat_start',
        chance: 100,
        effect: {
          type: 'stat_boost',
          value: 3,
          stat: 'sense',
          description: 'Start combat with 3 insight stacks',
          chineseDescription: '战斗开始时获得3层洞察',
        },
      },
    ],
    description: 'Ultimate perception. +50% Divine Sense, start with 3 insight stacks.',
    chineseDescription: '神识至境。神识+50%，战斗开始时获得3层洞察。',
    position: { x: 50, y: 85 },
  },
];

// ============================================
// Celestial Commerce Tree (Tian Ji Shang Dao Shu) - Trade-Combat Synergy
// ============================================

export const COMMERCE_TREE_NODES: SkillTreeNode[] = [
  // Tier 1
  {
    id: 'commerce_t1_keen_eye',
    name: 'Keen Eye',
    chineseName: '慧眼识珠',
    tree: 'commerce',
    tier: 1,
    type: 'passive',
    cost: 1,
    prerequisites: [],
    realmRequired: 'qi_refining',
    triggers: [
      {
        type: 'on_kill',
        chance: 100,
        effect: {
          type: 'market_insight',
          value: 1,
          description: 'Defeating enemies reveals market hints',
          chineseDescription: '击败敌人后获得市场情报',
        },
      },
    ],
    description: 'Better price visibility, combat kills reveal market hints',
    chineseDescription: '看清物品真实价值，击杀敌人后获得市场情报',
    position: { x: 30, y: 10 },
  },
  {
    id: 'commerce_t1_hoarding',
    name: 'Hoarding Instinct',
    chineseName: '囤货直觉',
    tree: 'commerce',
    tier: 1,
    type: 'passive',
    cost: 1,
    prerequisites: [],
    realmRequired: 'qi_refining',
    triggers: [
      {
        type: 'on_combat_start',
        chance: 100,
        effect: {
          type: 'damage_bonus',
          value: 1,
          isPercentage: true,
          description: '+1% element damage per related item in inventory',
          chineseDescription: '储物袋中每件相关物品+1%元素伤害',
        },
      },
    ],
    description: 'Inventory items boost related element damage',
    chineseDescription: '储物袋中的物品增强相关元素伤害',
    position: { x: 70, y: 10 },
  },

  // Tier 2
  {
    id: 'commerce_t2_market_momentum',
    name: 'Market Momentum',
    chineseName: '市场动量',
    tree: 'commerce',
    tier: 2,
    type: 'passive',
    cost: 2,
    prerequisites: ['commerce_t1_keen_eye'],
    realmRequired: 'qi_refining',
    triggers: [
      {
        type: 'on_trade',
        chance: 100,
        effect: {
          type: 'stat_boost',
          value: 5,
          stat: 'crit',
          duration: 10,
          description: 'Recent trades boost crit rate',
          chineseDescription: '近期交易增加暴击率',
        },
      },
    ],
    description: 'Recent profitable trades boost crit rate',
    chineseDescription: '近期盈利交易增加暴击率',
    position: { x: 30, y: 25 },
  },
  {
    id: 'commerce_t2_black_market',
    name: 'Black Market Intel',
    chineseName: '黑市情报',
    tree: 'commerce',
    tier: 2,
    type: 'passive',
    cost: 2,
    prerequisites: ['commerce_t1_hoarding'],
    realmRequired: 'qi_refining',
    triggers: [
      {
        type: 'on_combat_start',
        chance: 30,
        effect: {
          type: 'apply_debuff',
          value: 1,
          buffId: 'exposed',
          duration: 3,
          description: 'Combat intel reveals enemy weakness',
          chineseDescription: '战斗情报揭示敌人弱点',
        },
      },
    ],
    description: '30% chance to reveal enemy weakness at combat start',
    chineseDescription: '30%几率在战斗开始时揭示敌人弱点',
    position: { x: 70, y: 25 },
  },

  // Tier 3
  {
    id: 'commerce_t3_war_profiteer',
    name: 'War Profiteer',
    chineseName: '战争牟利',
    tree: 'commerce',
    tier: 3,
    type: 'passive',
    cost: 3,
    prerequisites: ['commerce_t2_market_momentum'],
    realmRequired: 'foundation',
    triggers: [
      {
        type: 'on_kill',
        chance: 100,
        effect: {
          type: 'damage_bonus',
          value: 50,
          isPercentage: true,
          description: 'War events boost loot quality',
          chineseDescription: '战争事件提升战利品品质',
        },
      },
    ],
    description: 'During war events, combat loot quality +50%',
    chineseDescription: '战争事件期间，战利品品质+50%',
    position: { x: 30, y: 45 },
  },
  {
    id: 'commerce_t3_cultivation_hedge',
    name: 'Cultivation Hedge',
    chineseName: '修炼对冲',
    tree: 'commerce',
    tier: 3,
    type: 'passive',
    cost: 3,
    prerequisites: ['commerce_t2_black_market'],
    realmRequired: 'foundation',
    triggers: [
      {
        type: 'on_trade',
        chance: 100,
        effect: {
          type: 'stat_boost',
          value: 10,
          stat: 'atk',
          isPercentage: true,
          duration: 5,
          description: 'Trading before combat grants attack buff',
          chineseDescription: '战斗前交易获得攻击加成',
        },
      },
    ],
    description: 'Pre-battle trading grants combat buffs',
    chineseDescription: '战斗前进行交易获得战斗增益',
    position: { x: 70, y: 45 },
  },

  // Tier 4
  {
    id: 'commerce_t4_celestial_operator',
    name: 'Celestial Operator',
    chineseName: '天机算子',
    tree: 'commerce',
    tier: 4,
    type: 'passive',
    cost: 5,
    prerequisites: ['commerce_t3_war_profiteer', 'commerce_t3_cultivation_hedge'],
    realmRequired: 'core_formation',
    triggers: [
      {
        type: 'on_trade',
        chance: 100,
        effect: {
          type: 'cultivation_bonus',
          value: 5,
          isPercentage: true,
          description: 'Profitable trades grant cultivation bonus',
          chineseDescription: '盈利交易获得修炼加成',
        },
      },
      {
        type: 'on_kill',
        chance: 50,
        effect: {
          type: 'market_insight',
          value: 2,
          description: 'Combat victories can manipulate market',
          chineseDescription: '战斗胜利可影响市场',
        },
      },
    ],
    description: 'Market manipulation power. Trade profits boost cultivation.',
    chineseDescription: '市场操控之力。交易利润增加修炼效率。',
    position: { x: 50, y: 65 },
  },

  // Tier 5
  {
    id: 'commerce_t5_golden_touch',
    name: 'Golden Touch',
    chineseName: '点金手',
    tree: 'commerce',
    tier: 5,
    type: 'passive',
    cost: 8,
    prerequisites: ['commerce_t4_celestial_operator'],
    realmRequired: 'nascent_soul',
    triggers: [
      {
        type: 'on_trade',
        chance: 100,
        effect: {
          type: 'stat_boost',
          value: 20,
          stat: 'atk',
          isPercentage: true,
          duration: 20,
          description: 'Every trade empowers you',
          chineseDescription: '每次交易增强你的力量',
        },
      },
      {
        type: 'on_kill',
        chance: 100,
        effect: {
          type: 'market_insight',
          value: 5,
          description: 'All combat connected to market',
          chineseDescription: '所有战斗与市场联动',
        },
      },
    ],
    description: 'Ultimate commerce mastery. All actions synergize with market.',
    chineseDescription: '商道至境。所有行动与市场完美联动。',
    position: { x: 50, y: 85 },
  },
];

// ============================================
// Combined Skill Trees
// ============================================

export const ALL_SKILL_TREE_NODES: Record<SkillTreeType, SkillTreeNode[]> = {
  sword: SWORD_TREE_NODES,
  spell: SPELL_TREE_NODES,
  body: BODY_TREE_NODES,
  mind: MIND_TREE_NODES,
  commerce: COMMERCE_TREE_NODES,
};

// Helper function to get all nodes flat
export const getAllSkillTreeNodes = (): SkillTreeNode[] => {
  return [
    ...SWORD_TREE_NODES,
    ...SPELL_TREE_NODES,
    ...BODY_TREE_NODES,
    ...MIND_TREE_NODES,
    ...COMMERCE_TREE_NODES,
  ];
};

// Helper to get node by ID
export const getSkillTreeNodeById = (nodeId: string): SkillTreeNode | undefined => {
  return getAllSkillTreeNodes().find(node => node.id === nodeId);
};

// Tree display info
export const SKILL_TREE_INFO: Record<SkillTreeType, {
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;
  color: string;
}> = {
  sword: {
    name: 'Way of the Sword',
    chineseName: '剑道',
    description: 'Single target burst, execute, combos',
    chineseDescription: '单体爆发、斩杀、连击',
    color: '#ef4444', // red
  },
  spell: {
    name: 'Way of Spells',
    chineseName: '法术',
    description: 'AoE, elements, control',
    chineseDescription: '群攻、元素、控制',
    color: '#8b5cf6', // purple
  },
  body: {
    name: 'Way of the Body',
    chineseName: '身法',
    description: 'Dodge, shield, counter',
    chineseDescription: '闪避、护盾、反击',
    color: '#22c55e', // green
  },
  mind: {
    name: 'Way of the Mind',
    chineseName: '心法',
    description: 'Insight, Qi, cooldowns',
    chineseDescription: '洞察、气机、冷却',
    color: '#3b82f6', // blue
  },
  commerce: {
    name: 'Way of Commerce',
    chineseName: '商道',
    description: 'Trade-combat synergy',
    chineseDescription: '贸易战斗联动',
    color: '#f59e0b', // amber
  },
};

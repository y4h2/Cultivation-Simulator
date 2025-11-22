// ============================================
// Combat System Utility Functions
// ============================================

import type {
  Element,
  Skill,
  Buff,
  CombatUnit,
  CombatStats,
  CombatEnemy,
  CombatLogEntry,
  Character,
  QiGauge,
  AIRule,
  BuffEffect,
  InventoryItem,
} from '../types/game';
import {
  ELEMENT_ADVANTAGES,
  ELEMENT_DISADVANTAGES,
  ELEMENT_ADVANTAGE_MODIFIER,
  ELEMENT_DISADVANTAGE_MODIFIER,
  COMBAT_CONSTANTS,
  BUFF_TEMPLATES,
  PLAYER_SKILLS,
  ENEMY_TEMPLATES,
  ENEMY_SPAWN_TABLE,
  createDefaultQiGauge,
} from '../constants/combat';

// ============================================
// Element System
// ============================================

export const getElementModifier = (
  attackerElement: Element | undefined,
  defenderElement: Element | undefined
): number => {
  if (!attackerElement || !defenderElement) return 0;

  if (ELEMENT_ADVANTAGES[attackerElement]?.includes(defenderElement)) {
    return ELEMENT_ADVANTAGE_MODIFIER;
  }
  if (ELEMENT_DISADVANTAGES[attackerElement]?.includes(defenderElement)) {
    return ELEMENT_DISADVANTAGE_MODIFIER;
  }
  return 0;
};

export const getElementResistance = (
  element: Element | undefined,
  stats: CombatStats
): number => {
  if (!element) return 0;

  const resistanceKey = `res${element}` as keyof CombatStats;
  return (stats[resistanceKey] as number) / 100 || 0;
};

// ============================================
// Hit Rate Calculation
// ============================================

export const calculateHitRate = (
  attacker: CombatUnit,
  target: CombatUnit,
  skill: Skill
): number => {
  const { BASE_HIT_RATE, MIN_HIT_RATE, MAX_HIT_RATE, HIT_RATE_PER_ACC_DIFF } = COMBAT_CONSTANTS;

  // Get effective stats with buff modifiers
  const attackerAcc = getEffectiveStat(attacker, 'acc');
  const targetEva = getEffectiveStat(target, 'eva');

  // Base calculation
  let hitRate = BASE_HIT_RATE + (attackerAcc - targetEva) * HIT_RATE_PER_ACC_DIFF;

  // Skill hit bonus
  if (skill.hitBonus) {
    hitRate += skill.hitBonus / 100;
  }

  // Insight bonus
  if (attacker.insightStacks > 0) {
    hitRate += attacker.insightStacks * COMBAT_CONSTANTS.INSIGHT_HIT_BONUS;
  }

  // Clamp to valid range
  return Math.max(MIN_HIT_RATE, Math.min(MAX_HIT_RATE, hitRate));
};

// ============================================
// Critical Hit Calculation
// ============================================

export const calculateCritRate = (
  attacker: CombatUnit,
  skill: Skill
): number => {
  let critRate = getEffectiveStat(attacker, 'crit') / 100;

  // Skill crit bonus
  if (skill.critBonus) {
    critRate += skill.critBonus / 100;
  }

  // Insight bonus
  if (attacker.insightStacks > 0) {
    critRate += attacker.insightStacks * COMBAT_CONSTANTS.INSIGHT_CRIT_BONUS;
  }

  return Math.min(1, critRate);
};

// ============================================
// Damage Calculation
// ============================================

export interface DamageResult {
  damage: number;
  isCritical: boolean;
  isHit: boolean;
  elementModifier: number;
  shieldAbsorbed: number;
}

export const calculateDamage = (
  attacker: CombatUnit,
  target: CombatUnit,
  skill: Skill,
  enemyElement?: Element
): DamageResult => {
  // Hit check
  const hitRate = calculateHitRate(attacker, target, skill);
  const isHit = Math.random() < hitRate;

  if (!isHit) {
    return { damage: 0, isCritical: false, isHit: false, elementModifier: 0, shieldAbsorbed: 0 };
  }

  const attackerAtk = getEffectiveStat(attacker, 'atk');
  const targetDef = getEffectiveStat(target, 'def');

  // Raw damage calculation
  const minDamage = attackerAtk * COMBAT_CONSTANTS.MIN_DAMAGE_RATIO;
  let rawDamage = Math.max(
    minDamage,
    attackerAtk * skill.powerMultiplier - targetDef * COMBAT_CONSTANTS.DEF_REDUCTION_FACTOR
  );

  // Element modifier
  const elementModifier = getElementModifier(skill.element, enemyElement);
  const elementResistance = getElementResistance(skill.element, target.combatStats);
  rawDamage *= (1 + elementModifier - elementResistance);

  // Critical hit check
  const critRate = calculateCritRate(attacker, skill);
  const isCritical = Math.random() < critRate;
  if (isCritical) {
    rawDamage *= attacker.combatStats.critDmg;
  }

  // Insight damage bonus (consumed after attack)
  if (attacker.insightStacks > 0) {
    rawDamage *= (1 + attacker.insightStacks * COMBAT_CONSTANTS.INSIGHT_DMG_BONUS);
  }

  // Defending damage reduction
  if (target.isDefending) {
    rawDamage *= (1 - COMBAT_CONSTANTS.DEFEND_DAMAGE_REDUCTION);
  }

  // Shield absorption
  let shieldAbsorbed = 0;
  let finalDamage = Math.floor(rawDamage);
  if (target.shield > 0) {
    shieldAbsorbed = Math.min(target.shield, finalDamage);
    finalDamage -= shieldAbsorbed;
  }

  return {
    damage: finalDamage,
    isCritical,
    isHit: true,
    elementModifier,
    shieldAbsorbed,
  };
};

// ============================================
// Stat Calculation with Buffs
// ============================================

export const getEffectiveStat = (
  unit: CombatUnit,
  stat: keyof CombatStats
): number => {
  let baseStat = unit.combatStats[stat] as number;
  let percentageModifier = 0;
  let flatModifier = 0;

  for (const buff of unit.buffs) {
    if (buff.modifiers) {
      for (const modifier of buff.modifiers) {
        if (modifier.stat === stat) {
          const stacks = buff.currentStacks || 1;
          if (modifier.isPercentage) {
            percentageModifier += modifier.value * stacks;
          } else {
            flatModifier += modifier.value * stacks;
          }
        }
      }
    }
  }

  return Math.max(0, Math.floor(baseStat * (1 + percentageModifier / 100) + flatModifier));
};

// ============================================
// Buff System
// ============================================

export const createBuff = (buffId: string, stacks: number = 1): Buff | null => {
  const template = BUFF_TEMPLATES[buffId];
  if (!template) return null;

  return {
    ...template,
    remainingDuration: template.duration,
    currentStacks: template.stackable ? stacks : 1,
  };
};

export const applyBuff = (
  unit: CombatUnit,
  buffId: string,
  stacks: number = 1
): { unit: CombatUnit; applied: boolean } => {
  const template = BUFF_TEMPLATES[buffId];
  if (!template) return { unit, applied: false };

  const existingBuffIndex = unit.buffs.findIndex(b => b.id === buffId);

  if (existingBuffIndex >= 0) {
    const existingBuff = unit.buffs[existingBuffIndex];
    if (existingBuff.stackable && existingBuff.maxStacks) {
      // Add stacks
      const newStacks = Math.min(
        existingBuff.maxStacks,
        (existingBuff.currentStacks || 1) + stacks
      );
      const updatedBuffs = [...unit.buffs];
      updatedBuffs[existingBuffIndex] = {
        ...existingBuff,
        currentStacks: newStacks,
        remainingDuration: template.duration, // Refresh duration
      };
      return { unit: { ...unit, buffs: updatedBuffs }, applied: true };
    } else {
      // Refresh duration
      const updatedBuffs = [...unit.buffs];
      updatedBuffs[existingBuffIndex] = {
        ...existingBuff,
        remainingDuration: template.duration,
      };
      return { unit: { ...unit, buffs: updatedBuffs }, applied: true };
    }
  } else {
    // Add new buff
    const newBuff = createBuff(buffId, stacks);
    if (!newBuff) return { unit, applied: false };

    return { unit: { ...unit, buffs: [...unit.buffs, newBuff] }, applied: true };
  }
};

export const processBuffEffects = (
  unit: CombatUnit,
  effects: BuffEffect[] | undefined
): { unit: CombatUnit; hpChange: number } => {
  if (!effects) return { unit, hpChange: 0 };

  let hpChange = 0;
  let updatedUnit = { ...unit };

  for (const effect of effects) {
    switch (effect.type) {
      case 'damage': {
        const damageBase = effect.isPercentage && effect.stat
          ? unit.combatStats[effect.stat] as number
          : 0;
        const damage = effect.isPercentage
          ? Math.floor(damageBase * effect.value / 100)
          : effect.value;
        hpChange -= damage;
        break;
      }
      case 'heal': {
        const healBase = effect.isPercentage && effect.stat
          ? unit.combatStats[effect.stat] as number
          : 0;
        const heal = effect.isPercentage
          ? Math.floor(healBase * effect.value / 100)
          : effect.value;
        hpChange += heal;
        break;
      }
      case 'shield': {
        const shieldBase = effect.isPercentage && effect.stat
          ? unit.combatStats[effect.stat] as number
          : 0;
        const shieldValue = effect.isPercentage
          ? Math.floor(shieldBase * effect.value / 100)
          : effect.value;
        updatedUnit = { ...updatedUnit, shield: updatedUnit.shield + shieldValue };
        break;
      }
    }
  }

  return { unit: updatedUnit, hpChange };
};

export const processBuffTicks = (
  unit: CombatUnit,
  phase: 'turnStart' | 'turnEnd'
): { unit: CombatUnit; logs: CombatLogEntry[] } => {
  const logs: CombatLogEntry[] = [];
  let updatedUnit = { ...unit };
  let totalHpChange = 0;

  // Process buff effects
  for (const buff of updatedUnit.buffs) {
    const effects = phase === 'turnStart' ? buff.onTurnStart : buff.onTurnEnd;
    const { unit: processedUnit, hpChange } = processBuffEffects(updatedUnit, effects);
    updatedUnit = processedUnit;
    totalHpChange += hpChange;

    if (hpChange !== 0) {
      const stacks = buff.currentStacks || 1;
      const actualChange = hpChange * stacks;
      logs.push({
        message: `${unit.name} ${actualChange < 0 ? 'takes' : 'heals'} ${Math.abs(actualChange)} from ${buff.name}`,
        chineseMessage: `${unit.chineseName} ${actualChange < 0 ? '受到' : '恢复'} ${Math.abs(actualChange)} (${buff.chineseName})`,
        type: actualChange < 0 ? 'damage' : 'heal',
        timestamp: Date.now(),
      });
    }
  }

  // Apply HP change
  if (totalHpChange !== 0) {
    const newHp = Math.max(0, Math.min(
      updatedUnit.combatStats.maxHp,
      updatedUnit.combatStats.hp + totalHpChange
    ));
    updatedUnit = {
      ...updatedUnit,
      combatStats: { ...updatedUnit.combatStats, hp: newHp },
    };
  }

  // Decrement buff durations at turn end
  if (phase === 'turnEnd') {
    const remainingBuffs = updatedUnit.buffs
      .map(buff => ({ ...buff, remainingDuration: buff.remainingDuration - 1 }))
      .filter(buff => buff.remainingDuration > 0);

    // Log expired buffs
    for (const buff of updatedUnit.buffs) {
      if (buff.remainingDuration <= 1) {
        logs.push({
          message: `${buff.name} expired on ${unit.name}`,
          chineseMessage: `${unit.chineseName}的${buff.chineseName}效果消失`,
          type: 'buff',
          timestamp: Date.now(),
        });
      }
    }

    updatedUnit = { ...updatedUnit, buffs: remainingBuffs };
  }

  return { unit: updatedUnit, logs };
};

// ============================================
// Qi Gauge System
// ============================================

export const addQi = (
  qiGauge: QiGauge,
  element: Element | undefined,
  amount: number = 1
): QiGauge => {
  const key = element || 'neutral';
  return {
    ...qiGauge,
    [key]: qiGauge[key] + amount,
  };
};

export const consumeQi = (
  qiGauge: QiGauge,
  element: Element | undefined,
  amount: number
): QiGauge | null => {
  const key = element || 'neutral';
  if (qiGauge[key] < amount) return null;

  return {
    ...qiGauge,
    [key]: qiGauge[key] - amount,
  };
};

export const hasEnoughQi = (
  qiGauge: QiGauge,
  element: Element | undefined,
  amount: number
): boolean => {
  const key = element || 'neutral';
  return qiGauge[key] >= amount;
};

// ============================================
// AI System
// ============================================

export const evaluateAICondition = (
  enemy: CombatUnit,
  player: CombatUnit,
  condition: AIRule['condition']
): boolean => {
  switch (condition.type) {
    case 'hp_below':
      return enemy.combatStats.hp / enemy.combatStats.maxHp < (condition.value || 0);
    case 'hp_above':
      return enemy.combatStats.hp / enemy.combatStats.maxHp > (condition.value || 0);
    case 'mp_below':
      return enemy.combatStats.mp / enemy.combatStats.maxMp < (condition.value || 0);
    case 'mp_above':
      return enemy.combatStats.mp / enemy.combatStats.maxMp > (condition.value || 0);
    case 'target_hp_below':
      return player.combatStats.hp / player.combatStats.maxHp < (condition.value || 0);
    case 'target_hp_above':
      return player.combatStats.hp / player.combatStats.maxHp > (condition.value || 0);
    case 'has_buff':
      return enemy.buffs.some(b => b.id === condition.buffId);
    case 'target_has_debuff':
      return player.buffs.some(b => b.id === condition.buffId && b.isDebuff);
    case 'random':
      return Math.random() * 100 < (condition.value || 0);
    case 'always':
      return true;
    default:
      return false;
  }
};

export const executeAI = (
  enemy: CombatUnit,
  player: CombatUnit,
  aiRules: AIRule[]
): { action: 'use_skill' | 'use_item' | 'defend' | 'flee'; skillId?: string } => {
  // Sort rules by priority (highest first)
  const sortedRules = [...aiRules].sort((a, b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    if (evaluateAICondition(enemy, player, rule.condition)) {
      // Check if skill is available (has enough MP, not on cooldown)
      if (rule.action === 'use_skill' && rule.skillId) {
        const skill = enemy.skills.find(s => s.id === rule.skillId);
        if (skill) {
          if (enemy.combatStats.mp < skill.costMp) continue;
          if (skill.currentCooldown && skill.currentCooldown > 0) continue;
          return { action: 'use_skill', skillId: rule.skillId };
        }
      }
      return { action: rule.action };
    }
  }

  // Default: use basic attack
  const basicSkill = enemy.skills.find(s => s.type === 'basic');
  return { action: 'use_skill', skillId: basicSkill?.id || enemy.skills[0]?.id };
};

// ============================================
// Combat Unit Creation
// ============================================

export const createPlayerCombatUnit = (character: Character): CombatUnit => {
  const combatStats: CombatStats = {
    hp: character.stats.hp,
    maxHp: character.stats.maxHp,
    mp: character.stats.spiritualPower,
    maxMp: character.stats.maxSpiritualPower,
    atk: character.stats.attack,
    def: character.stats.defense,
    spd: character.stats.speed,
    acc: 100 + character.stats.divineSense,
    eva: 5 + Math.floor(character.stats.speed / 5),
    crit: 5 + Math.floor(character.stats.divineSense / 10),
    critDmg: 1.5,
    wis: character.stats.comprehension,
    sense: character.stats.divineSense,
    resfire: 0,
    reswater: 0,
    reswood: 0,
    resmetal: 0,
    researth: 0,
    reswind: 0,
  };

  // Initialize skills with cooldowns reset
  const skills = PLAYER_SKILLS.map(skill => ({
    ...skill,
    currentCooldown: 0,
  }));

  return {
    id: 'player',
    name: character.name,
    chineseName: character.name,
    isPlayer: true,
    combatStats,
    skills,
    buffs: [],
    qiGauge: createDefaultQiGauge(),
    insightStacks: 0,
    shield: 0,
    isStunned: false,
    isDefending: false,
  };
};

export const createEnemyCombatUnit = (enemyTemplate: CombatEnemy): CombatUnit => {
  const skills = enemyTemplate.skills.map(skill => ({
    ...skill,
    currentCooldown: 0,
  }));

  return {
    id: enemyTemplate.id,
    name: enemyTemplate.name,
    chineseName: enemyTemplate.chineseName,
    isPlayer: false,
    combatStats: { ...enemyTemplate.combatStats },
    skills,
    buffs: [],
    qiGauge: createDefaultQiGauge(),
    insightStacks: 0,
    shield: 0,
    isStunned: false,
    isDefending: false,
  };
};

// ============================================
// Combat Initialization
// ============================================

export const calculateTurnOrder = (
  player: CombatUnit,
  enemy: CombatUnit
): ('player' | 'enemy')[] => {
  const playerSpd = getEffectiveStat(player, 'spd');
  const enemySpd = getEffectiveStat(enemy, 'spd');

  // Add random variance
  const playerEffective = playerSpd * (1 + (Math.random() - 0.5) * COMBAT_CONSTANTS.SPD_VARIANCE * 2);
  const enemyEffective = enemySpd * (1 + (Math.random() - 0.5) * COMBAT_CONSTANTS.SPD_VARIANCE * 2);

  return playerEffective >= enemyEffective
    ? ['player', 'enemy']
    : ['enemy', 'player'];
};

export const getRandomEnemy = (playerRealm: string): CombatEnemy | null => {
  const enemyIds = ENEMY_SPAWN_TABLE[playerRealm as keyof typeof ENEMY_SPAWN_TABLE];
  if (!enemyIds || enemyIds.length === 0) return null;

  const randomId = enemyIds[Math.floor(Math.random() * enemyIds.length)];
  return ENEMY_TEMPLATES[randomId] || null;
};

// ============================================
// Skill Execution
// ============================================

export interface SkillExecutionResult {
  attacker: CombatUnit;
  target: CombatUnit;
  logs: CombatLogEntry[];
  damageDealt: number;
  healingDone: number;
}

export const executeSkill = (
  attacker: CombatUnit,
  target: CombatUnit,
  skill: Skill,
  targetElement?: Element
): SkillExecutionResult => {
  const logs: CombatLogEntry[] = [];
  let updatedAttacker = { ...attacker };
  let updatedTarget = { ...target };
  let damageDealt = 0;
  let healingDone = 0;

  // Consume MP
  updatedAttacker = {
    ...updatedAttacker,
    combatStats: {
      ...updatedAttacker.combatStats,
      mp: updatedAttacker.combatStats.mp - skill.costMp,
    },
  };

  // Add Qi for skill use
  if (skill.type !== 'basic') {
    updatedAttacker = {
      ...updatedAttacker,
      qiGauge: addQi(updatedAttacker.qiGauge, skill.element),
    };
  }

  // Set cooldown
  if (skill.cooldown > 0) {
    updatedAttacker = {
      ...updatedAttacker,
      skills: updatedAttacker.skills.map(s =>
        s.id === skill.id ? { ...s, currentCooldown: skill.cooldown } : s
      ),
    };
  }

  // Log skill use
  logs.push({
    message: `${attacker.name} uses ${skill.name}!`,
    chineseMessage: `${attacker.chineseName}使用了${skill.chineseName}!`,
    type: 'action',
    timestamp: Date.now(),
  });

  // Calculate damage if attack skill
  if (skill.powerMultiplier > 0 && (skill.type === 'basic' || skill.type === 'attack' || skill.type === 'ultimate')) {
    const damageResult = calculateDamage(updatedAttacker, updatedTarget, skill, targetElement);

    if (!damageResult.isHit) {
      logs.push({
        message: `${attacker.name}'s attack missed!`,
        chineseMessage: `${attacker.chineseName}的攻击未命中!`,
        type: 'miss',
        timestamp: Date.now(),
      });
    } else {
      damageDealt = damageResult.damage;

      // Apply shield absorption
      if (damageResult.shieldAbsorbed > 0) {
        updatedTarget = {
          ...updatedTarget,
          shield: updatedTarget.shield - damageResult.shieldAbsorbed,
        };
        logs.push({
          message: `Shield absorbs ${damageResult.shieldAbsorbed} damage!`,
          chineseMessage: `护盾吸收了${damageResult.shieldAbsorbed}点伤害!`,
          type: 'system',
          timestamp: Date.now(),
        });
      }

      // Apply damage
      updatedTarget = {
        ...updatedTarget,
        combatStats: {
          ...updatedTarget.combatStats,
          hp: Math.max(0, updatedTarget.combatStats.hp - damageResult.damage),
        },
      };

      const critText = damageResult.isCritical ? ' (Critical!)' : '';
      const critTextZh = damageResult.isCritical ? ' (暴击!)' : '';

      logs.push({
        message: `${target.name} takes ${damageResult.damage} damage${critText}`,
        chineseMessage: `${target.chineseName}受到${damageResult.damage}点伤害${critTextZh}`,
        type: damageResult.isCritical ? 'critical' : 'damage',
        timestamp: Date.now(),
      });
    }
  }

  // Consume insight stacks after attack
  if (updatedAttacker.insightStacks > 0 && skill.powerMultiplier > 0) {
    logs.push({
      message: `${attacker.name} consumed ${updatedAttacker.insightStacks} Insight stacks`,
      chineseMessage: `${attacker.chineseName}消耗了${updatedAttacker.insightStacks}层洞察`,
      type: 'system',
      timestamp: Date.now(),
    });
    updatedAttacker = { ...updatedAttacker, insightStacks: 0 };
  }

  // Process skill effects
  for (const effect of skill.effects) {
    switch (effect.type) {
      case 'heal': {
        const healBase = effect.isPercentage && effect.stat
          ? updatedAttacker.combatStats[effect.stat] as number
          : updatedAttacker.combatStats.maxHp;
        const healAmount = effect.isPercentage
          ? Math.floor(healBase * effect.value / 100)
          : effect.value;

        const actualTarget = skill.target === 'self' ? updatedAttacker : updatedTarget;
        const newHp = Math.min(actualTarget.combatStats.maxHp, actualTarget.combatStats.hp + healAmount);
        const actualHeal = newHp - actualTarget.combatStats.hp;

        if (skill.target === 'self') {
          updatedAttacker = {
            ...updatedAttacker,
            combatStats: { ...updatedAttacker.combatStats, hp: newHp },
          };
        } else {
          updatedTarget = {
            ...updatedTarget,
            combatStats: { ...updatedTarget.combatStats, hp: newHp },
          };
        }

        if (actualHeal > 0) {
          healingDone += actualHeal;
          logs.push({
            message: `${skill.target === 'self' ? attacker.name : target.name} heals for ${actualHeal}`,
            chineseMessage: `${skill.target === 'self' ? attacker.chineseName : target.chineseName}恢复了${actualHeal}点生命`,
            type: 'heal',
            timestamp: Date.now(),
          });
        }
        break;
      }
      case 'buff': {
        if (effect.buffId) {
          const buffTarget = skill.target === 'self' || skill.target === 'single_ally'
            ? updatedAttacker
            : updatedTarget;
          const { unit: buffedUnit, applied } = applyBuff(buffTarget, effect.buffId);

          if (applied) {
            const buff = BUFF_TEMPLATES[effect.buffId];
            if (skill.target === 'self' || skill.target === 'single_ally') {
              updatedAttacker = buffedUnit;
            } else {
              updatedTarget = buffedUnit;
            }
            logs.push({
              message: `${buffTarget.name} gains ${buff.name}`,
              chineseMessage: `${buffTarget.chineseName}获得了${buff.chineseName}效果`,
              type: 'buff',
              timestamp: Date.now(),
            });
          }
        }
        break;
      }
      case 'debuff': {
        if (effect.buffId) {
          // Chance-based debuff application
          const chance = effect.value; // value is chance (0-1)
          if (Math.random() < chance) {
            const { unit: debuffedUnit, applied } = applyBuff(updatedTarget, effect.buffId);
            if (applied) {
              updatedTarget = debuffedUnit;
              const debuff = BUFF_TEMPLATES[effect.buffId];
              logs.push({
                message: `${target.name} is afflicted with ${debuff.name}!`,
                chineseMessage: `${target.chineseName}陷入了${debuff.chineseName}状态!`,
                type: 'buff',
                timestamp: Date.now(),
              });
            }
          }
        }
        break;
      }
      case 'shield': {
        const shieldBase = effect.isPercentage && effect.stat
          ? updatedAttacker.combatStats[effect.stat] as number
          : updatedAttacker.combatStats.maxHp;
        const shieldValue = effect.isPercentage
          ? Math.floor(shieldBase * effect.value / 100)
          : effect.value;

        updatedAttacker = {
          ...updatedAttacker,
          shield: updatedAttacker.shield + shieldValue,
        };

        logs.push({
          message: `${attacker.name} gains ${shieldValue} shield`,
          chineseMessage: `${attacker.chineseName}获得了${shieldValue}点护盾`,
          type: 'buff',
          timestamp: Date.now(),
        });
        break;
      }
    }
  }

  return {
    attacker: updatedAttacker,
    target: updatedTarget,
    logs,
    damageDealt,
    healingDone,
  };
};

// ============================================
// Turn End Processing
// ============================================

export const processTurnEnd = (
  unit: CombatUnit
): { unit: CombatUnit; logs: CombatLogEntry[] } => {
  let updatedUnit = { ...unit };
  const logs: CombatLogEntry[] = [];

  // Reset defending status
  updatedUnit = { ...updatedUnit, isDefending: false };

  // Process buff ticks
  const { unit: tickedUnit, logs: buffLogs } = processBuffTicks(updatedUnit, 'turnEnd');
  updatedUnit = tickedUnit;
  logs.push(...buffLogs);

  // Reduce skill cooldowns
  updatedUnit = {
    ...updatedUnit,
    skills: updatedUnit.skills.map(skill => ({
      ...skill,
      currentCooldown: Math.max(0, (skill.currentCooldown || 0) - 1),
    })),
  };

  return { unit: updatedUnit, logs };
};

// ============================================
// Loot Generation
// ============================================

export const generateLoot = (
  enemy: CombatEnemy
): { spiritStones: number; items: InventoryItem[] } => {
  const { loot } = enemy;

  // Spirit stones
  const spiritStones = Math.floor(
    Math.random() * (loot.spiritStones.max - loot.spiritStones.min + 1) + loot.spiritStones.min
  );

  // Items
  const items: InventoryItem[] = [];
  for (const drop of loot.items) {
    if (Math.random() < drop.dropChance) {
      const quantity = Math.floor(
        Math.random() * (drop.maxQuantity - drop.minQuantity + 1) + drop.minQuantity
      );
      if (quantity > 0) {
        items.push({ itemId: drop.itemId, quantity });
      }
    }
  }

  return { spiritStones, items };
};

// ============================================
// Observe Action
// ============================================

export const executeObserve = (
  unit: CombatUnit
): { unit: CombatUnit; log: CombatLogEntry } => {
  const newStacks = Math.min(
    COMBAT_CONSTANTS.MAX_INSIGHT_STACKS,
    unit.insightStacks + 1
  );

  return {
    unit: { ...unit, insightStacks: newStacks },
    log: {
      message: `${unit.name} observes the enemy. Insight: ${newStacks}/${COMBAT_CONSTANTS.MAX_INSIGHT_STACKS}`,
      chineseMessage: `${unit.chineseName}观察敌人。洞察: ${newStacks}/${COMBAT_CONSTANTS.MAX_INSIGHT_STACKS}`,
      type: 'action',
      timestamp: Date.now(),
    },
  };
};

// ============================================
// Defend Action
// ============================================

export const executeDefend = (
  unit: CombatUnit
): { unit: CombatUnit; log: CombatLogEntry } => {
  return {
    unit: { ...unit, isDefending: true },
    log: {
      message: `${unit.name} takes a defensive stance`,
      chineseMessage: `${unit.chineseName}进入防御姿态`,
      type: 'action',
      timestamp: Date.now(),
    },
  };
};

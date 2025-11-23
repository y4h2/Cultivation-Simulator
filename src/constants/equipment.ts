// ============================================
// Equipment System Constants and Helper Functions
// ============================================

import type {
  EquipmentTemplate,
  EquipmentInstance,
  EquipmentAffix,
  EquipmentSet,
  EquipmentStats,
  EquipmentRarity,
  EquipmentSlot,
  CharacterEquipment,
  ComputedEquipmentBonuses,
} from '../types/equipment';

// Re-export types for convenience
export type { EquipmentTemplate, EquipmentInstance, EquipmentAffix, EquipmentSet, EquipmentStats, EquipmentRarity, EquipmentSlot, CharacterEquipment, ComputedEquipmentBonuses };
import type { Element } from '../types/game';
import equipmentData from '../data/equipment.json';

// ============================================
// Data Loading
// ============================================

export const EQUIPMENT_TEMPLATES: Record<string, EquipmentTemplate> = equipmentData.templates.reduce(
  (acc, template) => {
    acc[template.id] = template as EquipmentTemplate;
    return acc;
  },
  {} as Record<string, EquipmentTemplate>
);

export const EQUIPMENT_AFFIXES: Record<string, EquipmentAffix> = equipmentData.affixes.reduce(
  (acc, affix) => {
    acc[affix.id] = affix as EquipmentAffix;
    return acc;
  },
  {} as Record<string, EquipmentAffix>
);

export const EQUIPMENT_SETS: Record<string, EquipmentSet> = equipmentData.sets.reduce(
  (acc, set) => {
    acc[set.id] = set as EquipmentSet;
    return acc;
  },
  {} as Record<string, EquipmentSet>
);

// ============================================
// Rarity Colors and Names
// ============================================

export const RARITY_COLORS: Record<EquipmentRarity, string> = {
  common: '#9ca3af',      // gray
  uncommon: '#22c55e',    // green
  rare: '#3b82f6',        // blue
  epic: '#a855f7',        // purple
  legendary: '#f59e0b',   // gold
};

export const RARITY_NAMES: Record<EquipmentRarity, { en: string; zh: string }> = {
  common: { en: 'Common', zh: '凡品' },
  uncommon: { en: 'Uncommon', zh: '灵品' },
  rare: { en: 'Rare', zh: '宝品' },
  epic: { en: 'Epic', zh: '地品' },
  legendary: { en: 'Legendary', zh: '仙品' },
};

export const SLOT_NAMES: Record<EquipmentSlot, { en: string; zh: string }> = {
  weapon: { en: 'Weapon', zh: '武器' },
  armor: { en: 'Armor', zh: '护甲' },
  helmet: { en: 'Helmet', zh: '头饰' },
  accessory: { en: 'Accessory', zh: '饰品' },
  boots: { en: 'Boots', zh: '靴子' },
  talisman: { en: 'Talisman', zh: '护符' },
};

export const GRADE_NAMES: Record<number, { en: string; zh: string }> = {
  1: { en: 'Lower Grade', zh: '下品' },
  2: { en: 'Middle Grade', zh: '中品' },
  3: { en: 'Upper Grade', zh: '上品' },
  4: { en: 'Supreme Grade', zh: '极品' },
};

// ============================================
// Template Helpers
// ============================================

export function getTemplateById(id: string): EquipmentTemplate | undefined {
  return EQUIPMENT_TEMPLATES[id];
}

export function getTemplatesBySlot(slot: EquipmentSlot): EquipmentTemplate[] {
  return Object.values(EQUIPMENT_TEMPLATES).filter((t) => t.slot === slot);
}

export function getTemplatesByRarity(rarity: EquipmentRarity): EquipmentTemplate[] {
  return Object.values(EQUIPMENT_TEMPLATES).filter((t) => t.rarity === rarity);
}

export function getAffixById(id: string): EquipmentAffix | undefined {
  return EQUIPMENT_AFFIXES[id];
}

export function getSetById(id: string): EquipmentSet | undefined {
  return EQUIPMENT_SETS[id];
}

// ============================================
// Stats Calculation Helpers
// ============================================

export function createEmptyStats(): EquipmentStats {
  return {};
}

export function mergeStats(base: EquipmentStats, add: EquipmentStats): EquipmentStats {
  const result: EquipmentStats = { ...base };

  // Merge numeric stats
  const numericKeys: (keyof EquipmentStats)[] = [
    'atk', 'def', 'hp', 'mp', 'spd', 'crit', 'critDmg', 'acc', 'eva',
    'wis', 'sense', 'luck', 'cultivationBonus',
    'atkPercent', 'defPercent', 'hpPercent', 'mpPercent',
  ];

  for (const key of numericKeys) {
    if (add[key] !== undefined) {
      result[key] = ((result[key] as number) || 0) + (add[key] as number);
    }
  }

  // Merge element damage
  if (add.elementDamage) {
    result.elementDamage = result.elementDamage || {};
    for (const [element, value] of Object.entries(add.elementDamage)) {
      result.elementDamage[element as Element] =
        ((result.elementDamage[element as Element]) || 0) + (value || 0);
    }
  }

  // Merge element resist
  if (add.elementResist) {
    result.elementResist = result.elementResist || {};
    for (const [element, value] of Object.entries(add.elementResist)) {
      result.elementResist[element as Element] =
        ((result.elementResist[element as Element]) || 0) + (value || 0);
    }
  }

  return result;
}

export function calculateEnhancementBonus(
  baseStats: EquipmentStats,
  enhanceLevel: number,
  grade: number
): EquipmentStats {
  const bonus: EquipmentStats = {};
  const multiplier = 1 + (enhanceLevel * 0.05 * grade); // 5% per level, scaled by grade

  if (baseStats.atk) bonus.atk = Math.floor(baseStats.atk * (multiplier - 1));
  if (baseStats.def) bonus.def = Math.floor(baseStats.def * (multiplier - 1));
  if (baseStats.hp) bonus.hp = Math.floor(baseStats.hp * (multiplier - 1));
  if (baseStats.mp) bonus.mp = Math.floor(baseStats.mp * (multiplier - 1));

  return bonus;
}

export function computeInstanceStats(instance: EquipmentInstance): EquipmentStats {
  const template = getTemplateById(instance.templateId);
  if (!template) return {};

  let stats = { ...template.baseStats };

  // Add enhancement bonus
  const enhanceBonus = calculateEnhancementBonus(
    template.baseStats,
    instance.enhanceLevel,
    template.grade
  );
  stats = mergeStats(stats, enhanceBonus);

  // Add prefix stats
  for (const prefix of instance.prefixes) {
    stats = mergeStats(stats, prefix.rolledStats);
  }

  // Add suffix stats
  for (const suffix of instance.suffixes) {
    stats = mergeStats(stats, suffix.rolledStats);
  }

  return stats;
}

// ============================================
// Equipment Instance Factory
// ============================================

let instanceCounter = 0;

export function createEquipmentInstance(
  templateId: string,
  withAffixes: boolean = false
): EquipmentInstance | null {
  const template = getTemplateById(templateId);
  if (!template) return null;

  const instance: EquipmentInstance = {
    instanceId: `equip_${Date.now()}_${instanceCounter++}`,
    templateId,
    enhanceLevel: 0,
    refineLevel: 0,
    prefixes: [],
    suffixes: [],
    computedStats: {},
    isBound: false,
    isAwakened: false,
    acquiredAt: Date.now(),
  };

  // Roll random affixes if requested
  if (withAffixes && template.maxAffixCount && template.maxAffixCount > 0) {
    const numAffixes = Math.min(
      Math.floor(Math.random() * template.maxAffixCount) + 1,
      template.maxAffixCount
    );

    // Roll prefixes
    if (template.possiblePrefixes && template.possiblePrefixes.length > 0) {
      const numPrefixes = Math.floor(numAffixes / 2) + (Math.random() > 0.5 ? 1 : 0);
      for (let i = 0; i < numPrefixes && i < template.possiblePrefixes.length; i++) {
        const prefixId = template.possiblePrefixes[
          Math.floor(Math.random() * template.possiblePrefixes.length)
        ];
        const affix = getAffixById(prefixId);
        if (affix && !instance.prefixes.some((p) => p.affixId === prefixId)) {
          instance.prefixes.push({
            affixId: prefixId,
            rolledStats: rollAffixStats(affix.stats),
          });
        }
      }
    }

    // Roll suffixes
    if (template.possibleSuffixes && template.possibleSuffixes.length > 0) {
      const remainingSlots = (template.maxAffixCount || 0) - instance.prefixes.length;
      const numSuffixes = Math.min(remainingSlots, Math.floor(Math.random() * 2) + 1);
      for (let i = 0; i < numSuffixes && i < template.possibleSuffixes.length; i++) {
        const suffixId = template.possibleSuffixes[
          Math.floor(Math.random() * template.possibleSuffixes.length)
        ];
        const affix = getAffixById(suffixId);
        if (affix && !instance.suffixes.some((s) => s.affixId === suffixId)) {
          instance.suffixes.push({
            affixId: suffixId,
            rolledStats: rollAffixStats(affix.stats),
          });
        }
      }
    }
  }

  // Compute final stats
  instance.computedStats = computeInstanceStats(instance);

  return instance;
}

function rollAffixStats(baseStats: EquipmentStats): EquipmentStats {
  const rolled: EquipmentStats = {};
  const variance = 0.2; // +/- 20% variance

  const numericKeys: (keyof EquipmentStats)[] = [
    'atk', 'def', 'hp', 'mp', 'spd', 'crit', 'critDmg', 'acc', 'eva',
    'wis', 'sense', 'luck', 'cultivationBonus',
    'atkPercent', 'defPercent', 'hpPercent', 'mpPercent',
  ];

  for (const key of numericKeys) {
    if (baseStats[key] !== undefined) {
      const base = baseStats[key] as number;
      const min = Math.floor(base * (1 - variance));
      const max = Math.ceil(base * (1 + variance));
      rolled[key] = Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }

  // Copy element damage/resist as-is
  if (baseStats.elementDamage) {
    rolled.elementDamage = { ...baseStats.elementDamage };
  }
  if (baseStats.elementResist) {
    rolled.elementResist = { ...baseStats.elementResist };
  }

  return rolled;
}

// ============================================
// Character Equipment Helpers
// ============================================

export function createInitialCharacterEquipment(): CharacterEquipment {
  return {
    equipped: {},
    inventory: [],
    maxInventorySize: 20,
  };
}

export function equipItem(
  equipment: CharacterEquipment,
  instance: EquipmentInstance
): { equipment: CharacterEquipment; unequipped?: EquipmentInstance } {
  const template = getTemplateById(instance.templateId);
  if (!template) return { equipment };

  const slot = template.slot as EquipmentSlot;
  const currentEquipped = equipment.equipped[slot];

  // Remove from inventory if it's there
  const newInventory = equipment.inventory.filter((i) => i.instanceId !== instance.instanceId);

  const result: CharacterEquipment = {
    ...equipment,
    equipped: {
      ...equipment.equipped,
      [slot]: instance,
    },
    inventory: currentEquipped
      ? [...newInventory, currentEquipped]
      : newInventory,
  };

  return {
    equipment: result,
    unequipped: currentEquipped,
  };
}

export function unequipItem(
  equipment: CharacterEquipment,
  slot: EquipmentSlot
): CharacterEquipment {
  const currentEquipped = equipment.equipped[slot];
  if (!currentEquipped) return equipment;

  const newEquipped = { ...equipment.equipped };
  delete newEquipped[slot];

  return {
    ...equipment,
    equipped: newEquipped,
    inventory: [...equipment.inventory, currentEquipped],
  };
}

export function addToInventory(
  equipment: CharacterEquipment,
  instance: EquipmentInstance
): CharacterEquipment | null {
  if (equipment.inventory.length >= equipment.maxInventorySize) {
    return null; // Inventory full
  }

  return {
    ...equipment,
    inventory: [...equipment.inventory, instance],
  };
}

export function removeFromInventory(
  equipment: CharacterEquipment,
  instanceId: string
): CharacterEquipment {
  return {
    ...equipment,
    inventory: equipment.inventory.filter((i) => i.instanceId !== instanceId),
  };
}

// ============================================
// Set Bonus Calculation
// ============================================

export function calculateSetBonuses(equipment: CharacterEquipment): ComputedEquipmentBonuses['activeSetBonuses'] {
  const setCount: Record<string, number> = {};

  // Count equipped pieces per set
  for (const instance of Object.values(equipment.equipped)) {
    if (!instance) continue;
    const template = getTemplateById(instance.templateId);
    if (template?.setId) {
      setCount[template.setId] = (setCount[template.setId] || 0) + 1;
    }
  }

  // Calculate active bonuses
  const activeSetBonuses: ComputedEquipmentBonuses['activeSetBonuses'] = [];

  for (const [setId, count] of Object.entries(setCount)) {
    const set = getSetById(setId);
    if (!set) continue;

    const activeBonuses = set.bonuses.filter((b) => b.requiredPieces <= count);
    if (activeBonuses.length > 0) {
      activeSetBonuses.push({
        setId,
        activePieces: count,
        bonuses: activeBonuses,
      });
    }
  }

  return activeSetBonuses;
}

// ============================================
// Total Equipment Bonuses
// ============================================

export function computeTotalEquipmentBonuses(equipment: CharacterEquipment): ComputedEquipmentBonuses {
  let totalStats: EquipmentStats = {};
  const totalElementDamage: Partial<Record<Element, number>> = {};
  const totalElementResist: Partial<Record<Element, number>> = {};

  // Sum stats from all equipped items
  for (const instance of Object.values(equipment.equipped)) {
    if (!instance) continue;
    totalStats = mergeStats(totalStats, instance.computedStats);
  }

  // Add set bonuses
  const activeSetBonuses = calculateSetBonuses(equipment);
  for (const setBonus of activeSetBonuses) {
    for (const bonus of setBonus.bonuses) {
      totalStats = mergeStats(totalStats, bonus.stats);
    }
  }

  // Extract element stats
  if (totalStats.elementDamage) {
    for (const [element, value] of Object.entries(totalStats.elementDamage)) {
      totalElementDamage[element as Element] = value;
    }
  }
  if (totalStats.elementResist) {
    for (const [element, value] of Object.entries(totalStats.elementResist)) {
      totalElementResist[element as Element] = value;
    }
  }

  return {
    totalStats,
    activeSetBonuses,
    totalElementDamage,
    totalElementResist,
  };
}

// ============================================
// Equipment Comparison
// ============================================

export interface EquipmentComparison {
  stat: string;
  statNameZh: string;
  current: number;
  new: number;
  diff: number;
  isPositive: boolean;
}

const STAT_NAMES_ZH: Record<string, string> = {
  atk: '攻击',
  def: '防御',
  hp: '生命',
  mp: '灵力',
  spd: '速度',
  crit: '暴击率',
  critDmg: '暴击伤害',
  acc: '命中',
  eva: '闪避',
  wis: '悟性',
  sense: '神识',
  luck: '气运',
  cultivationBonus: '修炼效率',
  atkPercent: '攻击%',
  defPercent: '防御%',
  hpPercent: '生命%',
  mpPercent: '灵力%',
};

export function compareEquipment(
  current: EquipmentInstance | undefined,
  newItem: EquipmentInstance
): EquipmentComparison[] {
  const currentStats = current?.computedStats || {};
  const newStats = newItem.computedStats;
  const comparisons: EquipmentComparison[] = [];

  const allStats = new Set([
    ...Object.keys(currentStats),
    ...Object.keys(newStats),
  ]);

  for (const stat of allStats) {
    if (stat === 'elementDamage' || stat === 'elementResist') continue;

    const currentValue = (currentStats as Record<string, number>)[stat] || 0;
    const newValue = (newStats as Record<string, number>)[stat] || 0;

    if (currentValue !== 0 || newValue !== 0) {
      comparisons.push({
        stat,
        statNameZh: STAT_NAMES_ZH[stat] || stat,
        current: currentValue,
        new: newValue,
        diff: newValue - currentValue,
        isPositive: newValue > currentValue,
      });
    }
  }

  return comparisons;
}

// ============================================
// Equipment Enhancement Cost
// ============================================

export function getEnhancementCost(
  instance: EquipmentInstance,
  template: EquipmentTemplate
): { spiritStones: number; materials: Record<string, number> } {
  const level = instance.enhanceLevel;
  const grade = template.grade;
  const rarityMultiplier = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5,
  }[template.rarity] || 1;

  const baseCost = 100 * grade * rarityMultiplier;
  const levelMultiplier = Math.pow(1.5, level);

  return {
    spiritStones: Math.floor(baseCost * levelMultiplier),
    materials: {
      spirit_stone_ore: Math.ceil((level + 1) * grade),
    },
  };
}

// ============================================
// Generate Display Name
// ============================================

export function getEquipmentDisplayName(
  instance: EquipmentInstance,
  isZh: boolean
): string {
  const template = getTemplateById(instance.templateId);
  if (!template) return 'Unknown';

  let name = isZh ? template.chineseName : template.name;

  // Add prefix names
  for (const prefix of instance.prefixes) {
    const affix = getAffixById(prefix.affixId);
    if (affix) {
      name = (isZh ? affix.chineseName : affix.name) + name;
    }
  }

  // Add suffix names
  for (const suffix of instance.suffixes) {
    const affix = getAffixById(suffix.affixId);
    if (affix) {
      name = name + (isZh ? affix.chineseName : ' ' + affix.name);
    }
  }

  // Add enhancement level
  if (instance.enhanceLevel > 0) {
    name = `+${instance.enhanceLevel} ${name}`;
  }

  return name;
}

export function getRarityColor(rarity: EquipmentRarity): string {
  return RARITY_COLORS[rarity] || RARITY_COLORS.common;
}

import type { Item, ItemRarity } from '../types/game';
import { ItemCategory } from '../types/game';

// ============================================
// Balance Spec v1 - Item System
// ============================================
// Quality Base Stat Coefficients:
// - Common (N): 1.0x
// - Uncommon (R): 1.2x
// - Rare (SR): 1.5x
// - Epic (SSR): 1.8x
// - Legendary (SSS): 2.2x
//
// Price Volatility by Category (daily base fluctuation):
// - Herbs/Spirit Grass: 3-6%
// - Ores/Metals: 2-5%
// - Beast Materials: 4-7%
// - Pills: 5-8%
// - Equipment: 1-4%
// - Spirit Beast Items: 4-8%
//
// Typical Buy-Sell Profit Margins:
// - Herbs: 15-25%
// - Ores: 10-20%
// - Beast Materials: 20-30%
// - Pills: 25-40%
// - Equipment: 20-50%
// - Spirit Beast Items: 30-50%
// ============================================

export const QUALITY_STAT_MULTIPLIERS: Record<ItemRarity, number> = {
  common: 1.0,
  uncommon: 1.2,
  rare: 1.5,
  epic: 1.8,
  legendary: 2.2,
};

export const ITEMS: Record<string, Item> = {
  // Spirit Materials - Herbs (3-6% volatility, 15-25% profit margin)
  spirit_grass: {
    id: 'spirit_grass',
    name: 'Spirit Grass',
    chineseName: '灵草',
    category: ItemCategory.SpiritMaterial,
    rarity: 'common',
    description: 'Common spiritual herb used in basic alchemy.',
    basePrice: 8,  // Adjusted for balance
  },
  jade_lotus: {
    id: 'jade_lotus',
    name: 'Jade Lotus',
    chineseName: '玉莲花',
    category: ItemCategory.SpiritMaterial,
    rarity: 'uncommon',
    description: 'A beautiful lotus infused with pure spiritual energy.',
    basePrice: 65,  // Adjusted: 8 * 1.2x * tier scaling
  },
  thunder_root: {
    id: 'thunder_root',
    name: 'Thunder Root',
    chineseName: '雷根',
    category: ItemCategory.SpiritMaterial,
    rarity: 'rare',
    description: 'Root from a tree struck by heavenly lightning.',
    basePrice: 250,  // Adjusted: higher rarity premium
  },
  phoenix_flower: {
    id: 'phoenix_flower',
    name: 'Phoenix Flower',
    chineseName: '凤凰花',
    category: ItemCategory.SpiritMaterial,
    rarity: 'epic',
    description: 'Legendary flower that blooms once every hundred years.',
    basePrice: 1200,  // Adjusted for epic rarity
  },

  // Spirit Materials - Ores (2-5% volatility, 10-20% profit margin)
  spirit_stone_ore: {
    id: 'spirit_stone_ore',
    name: 'Spirit Stone Ore',
    chineseName: '灵石矿',
    category: ItemCategory.SpiritMaterial,
    rarity: 'common',
    description: 'Raw ore containing trace amounts of spiritual energy.',
    basePrice: 5,  // Base ore price
  },
  jade_essence: {
    id: 'jade_essence',
    name: 'Jade Essence',
    chineseName: '玉精',
    category: ItemCategory.SpiritMaterial,
    rarity: 'uncommon',
    description: 'Purified jade with concentrated spiritual energy.',
    basePrice: 100,  // Adjusted for uncommon tier
  },
  stellar_iron: {
    id: 'stellar_iron',
    name: 'Stellar Iron',
    chineseName: '星铁',
    category: ItemCategory.SpiritMaterial,
    rarity: 'rare',
    description: 'Iron from a fallen meteor, imbued with celestial energy.',
    basePrice: 380,  // Adjusted for rare premium
  },

  // Spirit Materials - Demon Cores (4-7% volatility, 20-30% profit margin)
  demon_core_low: {
    id: 'demon_core_low',
    name: 'Low-Grade Demon Core',
    chineseName: '低阶妖丹',
    category: ItemCategory.SpiritMaterial,
    rarity: 'common',
    description: 'Core from a weak demon beast.',
    basePrice: 25,  // Beast materials have higher base price
  },
  demon_core_mid: {
    id: 'demon_core_mid',
    name: 'Mid-Grade Demon Core',
    chineseName: '中阶妖丹',
    category: ItemCategory.SpiritMaterial,
    rarity: 'uncommon',
    description: 'Core from a moderately powerful demon beast.',
    basePrice: 120,  // Adjusted with rarity multiplier
  },
  demon_core_high: {
    id: 'demon_core_high',
    name: 'High-Grade Demon Core',
    chineseName: '高阶妖丹',
    category: ItemCategory.SpiritMaterial,
    rarity: 'rare',
    description: 'Core from a powerful demon beast.',
    basePrice: 580,  // Higher profit margin for beast materials
  },

  // Pills (5-8% volatility, 25-40% profit margin)
  qi_gathering_pill: {
    id: 'qi_gathering_pill',
    name: 'Qi Gathering Pill',
    chineseName: '聚气丹',
    category: ItemCategory.Pill,
    rarity: 'common',
    description: 'Enhances cultivation speed for a short period.',
    basePrice: 45,  // Pills have higher base prices
    effects: [{ type: 'boost_cultivation', value: 50 }],
  },
  spirit_recovery_pill: {
    id: 'spirit_recovery_pill',
    name: 'Spirit Recovery Pill',
    chineseName: '回灵丹',
    category: ItemCategory.Pill,
    rarity: 'common',
    description: 'Restores spiritual power.',
    basePrice: 35,
    effects: [{ type: 'heal_sp', value: 50 }],
  },
  healing_pill: {
    id: 'healing_pill',
    name: 'Healing Pill',
    chineseName: '疗伤丹',
    category: ItemCategory.Pill,
    rarity: 'common',
    description: 'Restores health points.',
    basePrice: 35,
    effects: [{ type: 'heal_hp', value: 50 }],
  },
  foundation_pill: {
    id: 'foundation_pill',
    name: 'Foundation Establishment Pill',
    chineseName: '筑基丹',
    category: ItemCategory.Pill,
    rarity: 'rare',
    description: 'Increases breakthrough chance for Foundation realm.',
    basePrice: 650,  // Rare pill premium
    effects: [{ type: 'boost_cultivation', value: 500 }],
  },
  breakthrough_pill: {
    id: 'breakthrough_pill',
    name: 'Breakthrough Pill',
    chineseName: '破境丹',
    category: ItemCategory.Pill,
    rarity: 'epic',
    description: 'Greatly increases breakthrough success rate.',
    basePrice: 2500,  // Epic pill premium
    effects: [{ type: 'boost_cultivation', value: 2000 }],
  },

  // Talismans (3-5% volatility, 15-25% profit margin)
  fire_talisman: {
    id: 'fire_talisman',
    name: 'Fire Talisman',
    chineseName: '火符',
    category: ItemCategory.Talisman,
    rarity: 'common',
    description: 'Single-use talisman that deals fire damage.',
    basePrice: 20,
    effects: [{ type: 'combat_damage', value: 35 }],  // Adjusted damage
  },
  lightning_talisman: {
    id: 'lightning_talisman',
    name: 'Lightning Talisman',
    chineseName: '雷符',
    category: ItemCategory.Talisman,
    rarity: 'uncommon',
    description: 'Single-use talisman that deals lightning damage.',
    basePrice: 55,
    effects: [{ type: 'combat_damage', value: 70 }],  // Adjusted damage
  },
  shield_talisman: {
    id: 'shield_talisman',
    name: 'Shield Talisman',
    chineseName: '护盾符',
    category: ItemCategory.Talisman,
    rarity: 'common',
    description: 'Creates a temporary protective barrier.',
    basePrice: 25,
    effects: [{ type: 'boost_stat', value: 25, stat: 'defense', duration: 3 }],  // Adjusted boost
  },
};

export const getItemById = (id: string): Item | undefined => ITEMS[id];

export const getItemsByCategory = (category: typeof ItemCategory[keyof typeof ItemCategory]): Item[] => {
  return Object.values(ITEMS).filter(item => item.category === category);
};

export const getRarityColor = (rarity: ItemRarity): string => {
  switch (rarity) {
    case 'common':
      return '#9ca3af'; // gray
    case 'uncommon':
      return '#22c55e'; // green
    case 'rare':
      return '#3b82f6'; // blue
    case 'epic':
      return '#a855f7'; // purple
    case 'legendary':
      return '#f59e0b'; // orange/gold
    default:
      return '#9ca3af';
  }
};

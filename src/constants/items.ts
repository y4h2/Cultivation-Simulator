import type { Item, ItemRarity } from '../types/game';
import { ItemCategory } from '../types/game';

export const ITEMS: Record<string, Item> = {
  // Spirit Materials - Herbs
  spirit_grass: {
    id: 'spirit_grass',
    name: 'Spirit Grass',
    chineseName: '灵草',
    category: ItemCategory.SpiritMaterial,
    rarity: 'common',
    description: 'Common spiritual herb used in basic alchemy.',
    basePrice: 5,
  },
  jade_lotus: {
    id: 'jade_lotus',
    name: 'Jade Lotus',
    chineseName: '玉莲花',
    category: ItemCategory.SpiritMaterial,
    rarity: 'uncommon',
    description: 'A beautiful lotus infused with pure spiritual energy.',
    basePrice: 50,
  },
  thunder_root: {
    id: 'thunder_root',
    name: 'Thunder Root',
    chineseName: '雷根',
    category: ItemCategory.SpiritMaterial,
    rarity: 'rare',
    description: 'Root from a tree struck by heavenly lightning.',
    basePrice: 200,
  },
  phoenix_flower: {
    id: 'phoenix_flower',
    name: 'Phoenix Flower',
    chineseName: '凤凰花',
    category: ItemCategory.SpiritMaterial,
    rarity: 'epic',
    description: 'Legendary flower that blooms once every hundred years.',
    basePrice: 1000,
  },

  // Spirit Materials - Ores
  spirit_stone_ore: {
    id: 'spirit_stone_ore',
    name: 'Spirit Stone Ore',
    chineseName: '灵石矿',
    category: ItemCategory.SpiritMaterial,
    rarity: 'common',
    description: 'Raw ore containing trace amounts of spiritual energy.',
    basePrice: 3,
  },
  jade_essence: {
    id: 'jade_essence',
    name: 'Jade Essence',
    chineseName: '玉精',
    category: ItemCategory.SpiritMaterial,
    rarity: 'uncommon',
    description: 'Purified jade with concentrated spiritual energy.',
    basePrice: 80,
  },
  stellar_iron: {
    id: 'stellar_iron',
    name: 'Stellar Iron',
    chineseName: '星铁',
    category: ItemCategory.SpiritMaterial,
    rarity: 'rare',
    description: 'Iron from a fallen meteor, imbued with celestial energy.',
    basePrice: 300,
  },

  // Spirit Materials - Demon Cores
  demon_core_low: {
    id: 'demon_core_low',
    name: 'Low-Grade Demon Core',
    chineseName: '低阶妖丹',
    category: ItemCategory.SpiritMaterial,
    rarity: 'common',
    description: 'Core from a weak demon beast.',
    basePrice: 20,
  },
  demon_core_mid: {
    id: 'demon_core_mid',
    name: 'Mid-Grade Demon Core',
    chineseName: '中阶妖丹',
    category: ItemCategory.SpiritMaterial,
    rarity: 'uncommon',
    description: 'Core from a moderately powerful demon beast.',
    basePrice: 100,
  },
  demon_core_high: {
    id: 'demon_core_high',
    name: 'High-Grade Demon Core',
    chineseName: '高阶妖丹',
    category: ItemCategory.SpiritMaterial,
    rarity: 'rare',
    description: 'Core from a powerful demon beast.',
    basePrice: 500,
  },

  // Pills
  qi_gathering_pill: {
    id: 'qi_gathering_pill',
    name: 'Qi Gathering Pill',
    chineseName: '聚气丹',
    category: ItemCategory.Pill,
    rarity: 'common',
    description: 'Enhances cultivation speed for a short period.',
    basePrice: 30,
    effects: [{ type: 'boost_cultivation', value: 50 }],
  },
  spirit_recovery_pill: {
    id: 'spirit_recovery_pill',
    name: 'Spirit Recovery Pill',
    chineseName: '回灵丹',
    category: ItemCategory.Pill,
    rarity: 'common',
    description: 'Restores spiritual power.',
    basePrice: 25,
    effects: [{ type: 'heal_sp', value: 50 }],
  },
  healing_pill: {
    id: 'healing_pill',
    name: 'Healing Pill',
    chineseName: '疗伤丹',
    category: ItemCategory.Pill,
    rarity: 'common',
    description: 'Restores health points.',
    basePrice: 25,
    effects: [{ type: 'heal_hp', value: 50 }],
  },
  foundation_pill: {
    id: 'foundation_pill',
    name: 'Foundation Establishment Pill',
    chineseName: '筑基丹',
    category: ItemCategory.Pill,
    rarity: 'rare',
    description: 'Increases breakthrough chance for Foundation realm.',
    basePrice: 500,
    effects: [{ type: 'boost_cultivation', value: 500 }],
  },
  breakthrough_pill: {
    id: 'breakthrough_pill',
    name: 'Breakthrough Pill',
    chineseName: '破境丹',
    category: ItemCategory.Pill,
    rarity: 'epic',
    description: 'Greatly increases breakthrough success rate.',
    basePrice: 2000,
    effects: [{ type: 'boost_cultivation', value: 2000 }],
  },

  // Talismans
  fire_talisman: {
    id: 'fire_talisman',
    name: 'Fire Talisman',
    chineseName: '火符',
    category: ItemCategory.Talisman,
    rarity: 'common',
    description: 'Single-use talisman that deals fire damage.',
    basePrice: 15,
    effects: [{ type: 'combat_damage', value: 30 }],
  },
  lightning_talisman: {
    id: 'lightning_talisman',
    name: 'Lightning Talisman',
    chineseName: '雷符',
    category: ItemCategory.Talisman,
    rarity: 'uncommon',
    description: 'Single-use talisman that deals lightning damage.',
    basePrice: 40,
    effects: [{ type: 'combat_damage', value: 60 }],
  },
  shield_talisman: {
    id: 'shield_talisman',
    name: 'Shield Talisman',
    chineseName: '护盾符',
    category: ItemCategory.Talisman,
    rarity: 'common',
    description: 'Creates a temporary protective barrier.',
    basePrice: 20,
    effects: [{ type: 'boost_stat', value: 20, stat: 'defense', duration: 3 }],
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

// ============================================
// Spirit Beast Constants
// ============================================

import type {
  SpiritBeastTemplate,
  SpiritBeastRarity,
  BeastTier,
  BeastPersonality,
  BeastMood,
} from '../types/game';

// Import data from JSON
import spiritBeastData from '../data/spiritBeasts.json';

// ============================================
// Tier Information
// ============================================

export interface TierInfo {
  name: string;
  chineseName: string;
  maxLevel: number;
  statMultiplier: number;
}

export const TIER_INFO: Record<BeastTier, TierInfo> =
  spiritBeastData.tierInfo as Record<BeastTier, TierInfo>;

export const TIER_ORDER: BeastTier[] = ['mortal', 'spirit', 'mystic', 'holy'];

export const getNextTier = (currentTier: BeastTier): BeastTier | null => {
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  if (currentIndex === -1 || currentIndex === TIER_ORDER.length - 1) {
    return null;
  }
  return TIER_ORDER[currentIndex + 1];
};

// ============================================
// Personality Modifiers
// ============================================

export interface PersonalityModifiers {
  name: string;
  chineseName: string;
  modifiers: {
    hp: number;
    atk: number;
    def: number;
    spd: number;
    wis: number;
    sense: number;
  };
}

export const PERSONALITY_MODIFIERS: Record<BeastPersonality, PersonalityModifiers> =
  spiritBeastData.personalityModifiers as Record<BeastPersonality, PersonalityModifiers>;

// ============================================
// Mood Effects
// ============================================

export interface MoodEffect {
  statBonus: number;
  canFight: boolean;
}

export const MOOD_EFFECTS: Record<BeastMood, MoodEffect> =
  spiritBeastData.moodEffects as Record<BeastMood, MoodEffect>;

// ============================================
// Rarity Base Capture Rates
// ============================================

export const RARITY_BASE_CAPTURE_RATE: Record<SpiritBeastRarity, number> =
  spiritBeastData.rarityBaseCaptureRate as Record<SpiritBeastRarity, number>;

// ============================================
// Experience Requirements
// ============================================

export const EXP_BASE = spiritBeastData.expRequirements.baseExp;
export const EXP_GROWTH_RATE = spiritBeastData.expRequirements.growthRate;

export const calculateExpToNextLevel = (level: number): number => {
  return Math.floor(EXP_BASE * Math.pow(EXP_GROWTH_RATE, level - 1));
};

// ============================================
// Spirit Beast Templates
// ============================================

export const SPIRIT_BEAST_TEMPLATES: SpiritBeastTemplate[] =
  spiritBeastData.beasts as SpiritBeastTemplate[];

export const getTemplateById = (templateId: string): SpiritBeastTemplate | undefined => {
  return SPIRIT_BEAST_TEMPLATES.find(template => template.id === templateId);
};

export const getTemplatesByRarity = (rarity: SpiritBeastRarity): SpiritBeastTemplate[] => {
  return SPIRIT_BEAST_TEMPLATES.filter(template => template.rarity === rarity);
};

// ============================================
// Trait Information
// ============================================

export interface TraitInfo {
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;
}

export const TRAIT_INFO: Record<string, TraitInfo> =
  spiritBeastData.traits as Record<string, TraitInfo>;

// ============================================
// Feed Items
// ============================================

export interface FeedItemInfo {
  name: string;
  chineseName: string;
  expBonus: number;
  affinityBonus: number;
  moodBonus: number;
}

export const FEED_ITEMS: Record<string, FeedItemInfo> =
  spiritBeastData.feedItems as Record<string, FeedItemInfo>;

// ============================================
// Breakthrough Requirements
// ============================================

export const TIER_BREAKTHROUGH_REQUIREMENTS: Record<BeastTier, {
  minLevel: number;
  minAffinity: number;
  materials?: string[];
}> = {
  mortal: {
    minLevel: 20,
    minAffinity: 30,
    materials: ['beast_essence_fragment'],
  },
  spirit: {
    minLevel: 40,
    minAffinity: 60,
    materials: ['spirit_beast_core', 'beast_essence_fragment'],
  },
  mystic: {
    minLevel: 60,
    minAffinity: 80,
    materials: ['mystic_beast_core', 'spirit_beast_core'],
  },
  holy: {
    minLevel: 100,
    minAffinity: 100,
    materials: ['holy_beast_core', 'mystic_beast_core'],
  },
};

// ============================================
// Display Helpers
// ============================================

export const getRarityColor = (rarity: SpiritBeastRarity): string => {
  const colors: Record<SpiritBeastRarity, string> = {
    N: '#9ca3af',     // Gray
    R: '#22c55e',     // Green
    SR: '#3b82f6',    // Blue
    SSR: '#a855f7',   // Purple
    SSS: '#f59e0b',   // Gold
  };
  return colors[rarity];
};

export const getMoodColor = (mood: BeastMood): string => {
  const colors: Record<BeastMood, string> = {
    happy: '#22c55e',    // Green
    calm: '#3b82f6',     // Blue
    anxious: '#f59e0b',  // Yellow
    fearful: '#ef4444',  // Red
    sick: '#6b7280',     // Gray
  };
  return colors[mood];
};

export const getTierColor = (tier: BeastTier): string => {
  const colors: Record<BeastTier, string> = {
    mortal: '#9ca3af',   // Gray
    spirit: '#22c55e',   // Green
    mystic: '#a855f7',   // Purple
    holy: '#f59e0b',     // Gold
  };
  return colors[tier];
};

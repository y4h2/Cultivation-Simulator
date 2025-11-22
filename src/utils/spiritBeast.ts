// ============================================
// Spirit Beast Utility Functions
// ============================================

import type {
  SpiritBeast,
  SpiritBeastTemplate,
  SpiritBeastBaseStats,
  BeastTier,
  BeastPersonality,
  BeastMood,
  SpiritBeastRarity,
  GameTime,
  Character,
  SpiritBeastCollection,
  SpiritBeastSkill,
} from '../types/game';
import {
  TIER_INFO,
  PERSONALITY_MODIFIERS,
  MOOD_EFFECTS,
  RARITY_BASE_CAPTURE_RATE,
  calculateExpToNextLevel,
  getTemplateById,
  getNextTier,
  TIER_BREAKTHROUGH_REQUIREMENTS,
  FEED_ITEMS,
  SPIRIT_BEAST_TEMPLATES,
} from '../constants/spiritBeasts';

// ============================================
// Initial State Creation
// ============================================

export const createInitialSpiritBeastCollection = (): SpiritBeastCollection => {
  // Give the player a starter beast (Iron Turtle - easy to capture N rarity)
  const starterTemplate = SPIRIT_BEAST_TEMPLATES.find(t => t.id === 'iron_turtle');
  const initialTime: GameTime = { ke: 1, day: 1, tenDay: 1, month: 1, year: 1 };

  if (starterTemplate) {
    const starterBeast = createStarterBeast(starterTemplate, initialTime);
    return {
      beasts: [starterBeast],
      activeBeastId: starterBeast.id,
      maxSlots: 5,
    };
  }

  return {
    beasts: [],
    activeBeastId: null,
    maxSlots: 5,
  };
};

// Create a starter beast (called during initial character creation)
const createStarterBeast = (
  template: SpiritBeastTemplate,
  capturedAt: GameTime
): SpiritBeast => {
  const personality: BeastPersonality = 'calm';
  const initialStats = calculateBeastStats(template.baseStats, 1, 'mortal', personality, 'calm');
  const initialSkills = template.skills.filter(skill => skill.unlockLevel <= 1 && !skill.unlockTier);

  return {
    id: `${template.id}_starter_${Date.now()}`,
    templateId: template.id,
    level: 1,
    exp: 0,
    expToNextLevel: calculateExpToNextLevel(1),
    tier: 'mortal',
    personality,
    mood: 'calm',
    affinity: 20, // Starter beast has some initial affinity
    currentStats: initialStats,
    battleMode: 'accompanying',
    skills: initialSkills,
    isActive: true,
    capturedAt,
  };
};

// ============================================
// Beast Creation
// ============================================

export const createSpiritBeast = (
  template: SpiritBeastTemplate,
  capturedAt: GameTime,
  personality?: BeastPersonality
): SpiritBeast => {
  const personalities: BeastPersonality[] = ['aggressive', 'calm', 'agile', 'wise', 'lucky'];
  const randomPersonality = personality || personalities[Math.floor(Math.random() * personalities.length)];

  const initialStats = calculateBeastStats(template.baseStats, 1, 'mortal', randomPersonality, 'calm');
  const initialSkills = template.skills.filter(skill => skill.unlockLevel <= 1 && !skill.unlockTier);

  return {
    id: `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    templateId: template.id,
    level: 1,
    exp: 0,
    expToNextLevel: calculateExpToNextLevel(1),
    tier: 'mortal',
    personality: randomPersonality,
    mood: 'calm',
    affinity: 10,
    currentStats: initialStats,
    battleMode: 'accompanying',
    skills: initialSkills,
    isActive: false,
    capturedAt,
  };
};

// ============================================
// Stats Calculation
// ============================================

export const calculateBeastStats = (
  baseStats: SpiritBeastBaseStats,
  level: number,
  tier: BeastTier,
  personality: BeastPersonality,
  mood: BeastMood,
  growthRates?: SpiritBeastBaseStats
): SpiritBeastBaseStats => {
  const tierInfo = TIER_INFO[tier];
  const personalityMods = PERSONALITY_MODIFIERS[personality];
  const moodEffect = MOOD_EFFECTS[mood];

  const growth = growthRates || {
    hp: 10,
    atk: 2,
    def: 2,
    spd: 1.5,
    wis: 1.5,
    sense: 1.5,
  };

  const calculateStat = (
    base: number,
    growthRate: number,
    personalityMod: number
  ): number => {
    const levelBonus = (level - 1) * growthRate;
    const baseWithGrowth = base + levelBonus;
    const withTier = baseWithGrowth * tierInfo.statMultiplier;
    const withPersonality = withTier * personalityMod;
    const withMood = withPersonality * moodEffect.statBonus;
    return Math.floor(withMood);
  };

  return {
    hp: calculateStat(baseStats.hp, growth.hp, personalityMods.modifiers.hp),
    atk: calculateStat(baseStats.atk, growth.atk, personalityMods.modifiers.atk),
    def: calculateStat(baseStats.def, growth.def, personalityMods.modifiers.def),
    spd: calculateStat(baseStats.spd, growth.spd, personalityMods.modifiers.spd),
    wis: calculateStat(baseStats.wis, growth.wis, personalityMods.modifiers.wis),
    sense: calculateStat(baseStats.sense, growth.sense, personalityMods.modifiers.sense),
  };
};

export const recalculateBeastStats = (beast: SpiritBeast): SpiritBeastBaseStats => {
  const template = getTemplateById(beast.templateId);
  if (!template) {
    return beast.currentStats;
  }

  return calculateBeastStats(
    template.baseStats,
    beast.level,
    beast.tier,
    beast.personality,
    beast.mood,
    template.growthRates
  );
};

// ============================================
// Capture System
// ============================================

export interface CaptureFactors {
  beastHpRatio: number;         // 0-1, current HP / max HP
  fearLevel: number;            // 0-100, temporary fear/affinity state
  playerBeastMasteryLevel: number;  // 御兽术 level
  beastLanguageBonus: number;   // 兽语心法 bonus
  itemQuality: number;          // 1-5, capture item quality
  rarity: SpiritBeastRarity;
}

export const calculateCaptureChance = (factors: CaptureFactors): number => {
  const baseRate = RARITY_BASE_CAPTURE_RATE[factors.rarity];

  // HP factor: lower HP = easier capture (up to 2x bonus at 10% HP)
  const hpFactor = 1 + (1 - factors.beastHpRatio) * 1.5;

  // Fear/affinity factor: higher = easier
  const fearFactor = 1 + (factors.fearLevel / 100) * 0.5;

  // Player skill factors
  const masteryFactor = 1 + factors.playerBeastMasteryLevel * 0.05;
  const languageFactor = 1 + factors.beastLanguageBonus * 0.03;

  // Item quality factor
  const itemFactor = 0.5 + factors.itemQuality * 0.3;

  const finalChance = baseRate * hpFactor * fearFactor * masteryFactor * languageFactor * itemFactor;

  // Cap at 95%
  return Math.min(0.95, Math.max(0.01, finalChance));
};

export const attemptCapture = (
  template: SpiritBeastTemplate,
  factors: CaptureFactors,
  capturedAt: GameTime
): { success: boolean; beast?: SpiritBeast; chance: number } => {
  const chance = calculateCaptureChance(factors);
  const roll = Math.random();

  if (roll < chance) {
    const beast = createSpiritBeast(template, capturedAt);
    return { success: true, beast, chance };
  }

  return { success: false, chance };
};

// ============================================
// Feeding System
// ============================================

export interface FeedResult {
  beast: SpiritBeast;
  expGained: number;
  affinityGained: number;
  moodChange: number;
  leveledUp: boolean;
  newLevel?: number;
  newSkills?: SpiritBeastSkill[];
}

export const feedBeast = (
  beast: SpiritBeast,
  feedItemId: string,
  currentTime: GameTime
): FeedResult | null => {
  const feedItem = FEED_ITEMS[feedItemId];
  if (!feedItem) {
    return null;
  }

  const template = getTemplateById(beast.templateId);
  if (!template) {
    return null;
  }

  let newExp = beast.exp + feedItem.expBonus;
  let newLevel = beast.level;
  let expToNext = beast.expToNextLevel;
  let leveledUp = false;
  const newSkills: SpiritBeastSkill[] = [];

  // Check for level ups
  const tierInfo = TIER_INFO[beast.tier];
  while (newExp >= expToNext && newLevel < tierInfo.maxLevel) {
    newExp -= expToNext;
    newLevel++;
    expToNext = calculateExpToNextLevel(newLevel);
    leveledUp = true;

    // Check for new skill unlocks
    template.skills.forEach(skill => {
      const hasSkill = beast.skills.some(s => s.id === skill.id);
      if (!hasSkill && skill.unlockLevel <= newLevel) {
        if (!skill.unlockTier || TIER_INFO[beast.tier].maxLevel >= TIER_INFO[skill.unlockTier].maxLevel) {
          newSkills.push(skill);
        }
      }
    });
  }

  // Cap exp at level max
  if (newLevel >= tierInfo.maxLevel) {
    newExp = 0;
    expToNext = 0;
  }

  // Calculate new affinity (cap at 100)
  const newAffinity = Math.min(100, beast.affinity + feedItem.affinityBonus);

  // Calculate new mood
  const moodOrder: BeastMood[] = ['sick', 'fearful', 'anxious', 'calm', 'happy'];
  const currentMoodIndex = moodOrder.indexOf(beast.mood);
  const moodChange = Math.floor(feedItem.moodBonus / 10);
  const newMoodIndex = Math.min(moodOrder.length - 1, Math.max(0, currentMoodIndex + moodChange));
  const newMood = moodOrder[newMoodIndex];

  // Recalculate stats with new level and mood
  const newStats = calculateBeastStats(
    template.baseStats,
    newLevel,
    beast.tier,
    beast.personality,
    newMood,
    template.growthRates
  );

  const updatedBeast: SpiritBeast = {
    ...beast,
    exp: newExp,
    expToNextLevel: expToNext,
    level: newLevel,
    affinity: newAffinity,
    mood: newMood,
    currentStats: newStats,
    skills: [...beast.skills, ...newSkills],
    lastFedAt: currentTime,
  };

  return {
    beast: updatedBeast,
    expGained: feedItem.expBonus,
    affinityGained: feedItem.affinityBonus,
    moodChange,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
    newSkills: newSkills.length > 0 ? newSkills : undefined,
  };
};

// ============================================
// Training System
// ============================================

export interface TrainResult {
  beast: SpiritBeast;
  expGained: number;
  leveledUp: boolean;
  newLevel?: number;
  newSkills?: SpiritBeastSkill[];
}

export const trainBeast = (
  beast: SpiritBeast,
  trainingIntensity: number, // 1-3 (light, normal, intense)
  currentTime: GameTime
): TrainResult => {
  const template = getTemplateById(beast.templateId);
  if (!template) {
    return { beast, expGained: 0, leveledUp: false };
  }

  // Base exp based on training intensity
  const baseExp = [15, 30, 50][trainingIntensity - 1];
  const wisdomBonus = 1 + beast.currentStats.wis / 100;
  const expGained = Math.floor(baseExp * wisdomBonus);

  let newExp = beast.exp + expGained;
  let newLevel = beast.level;
  let expToNext = beast.expToNextLevel;
  let leveledUp = false;
  const newSkills: SpiritBeastSkill[] = [];

  // Check for level ups
  const tierInfo = TIER_INFO[beast.tier];
  while (newExp >= expToNext && newLevel < tierInfo.maxLevel) {
    newExp -= expToNext;
    newLevel++;
    expToNext = calculateExpToNextLevel(newLevel);
    leveledUp = true;

    // Check for new skill unlocks
    template.skills.forEach(skill => {
      const hasSkill = beast.skills.some(s => s.id === skill.id);
      if (!hasSkill && skill.unlockLevel <= newLevel) {
        if (!skill.unlockTier || TIER_INFO[beast.tier].maxLevel >= TIER_INFO[skill.unlockTier].maxLevel) {
          newSkills.push(skill);
        }
      }
    });
  }

  // Cap exp at level max
  if (newLevel >= tierInfo.maxLevel) {
    newExp = 0;
    expToNext = 0;
  }

  // Intense training might decrease mood
  let newMood = beast.mood;
  if (trainingIntensity === 3 && Math.random() < 0.3) {
    const moodOrder: BeastMood[] = ['sick', 'fearful', 'anxious', 'calm', 'happy'];
    const currentMoodIndex = moodOrder.indexOf(beast.mood);
    if (currentMoodIndex > 0) {
      newMood = moodOrder[currentMoodIndex - 1];
    }
  }

  // Recalculate stats
  const newStats = calculateBeastStats(
    template.baseStats,
    newLevel,
    beast.tier,
    beast.personality,
    newMood,
    template.growthRates
  );

  const updatedBeast: SpiritBeast = {
    ...beast,
    exp: newExp,
    expToNextLevel: expToNext,
    level: newLevel,
    mood: newMood,
    currentStats: newStats,
    skills: [...beast.skills, ...newSkills],
    lastTrainedAt: currentTime,
  };

  return {
    beast: updatedBeast,
    expGained,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
    newSkills: newSkills.length > 0 ? newSkills : undefined,
  };
};

// ============================================
// Breakthrough System
// ============================================

export interface BreakthroughResult {
  success: boolean;
  beast?: SpiritBeast;
  reason?: string;
  reasonChinese?: string;
}

export const canAttemptBreakthrough = (beast: SpiritBeast): {
  canBreakthrough: boolean;
  reason?: string;
  reasonChinese?: string;
} => {
  const nextTier = getNextTier(beast.tier);
  if (!nextTier) {
    return {
      canBreakthrough: false,
      reason: 'Already at maximum tier',
      reasonChinese: '已达最高品阶',
    };
  }

  const requirements = TIER_BREAKTHROUGH_REQUIREMENTS[beast.tier];
  const tierInfo = TIER_INFO[beast.tier];

  if (beast.level < tierInfo.maxLevel) {
    return {
      canBreakthrough: false,
      reason: `Level must be ${tierInfo.maxLevel}`,
      reasonChinese: `等级需要达到${tierInfo.maxLevel}级`,
    };
  }

  if (beast.affinity < requirements.minAffinity) {
    return {
      canBreakthrough: false,
      reason: `Affinity must be at least ${requirements.minAffinity}`,
      reasonChinese: `亲密度需要达到${requirements.minAffinity}`,
    };
  }

  return { canBreakthrough: true };
};

export const attemptBeastBreakthrough = (
  beast: SpiritBeast,
  character: Character
): BreakthroughResult => {
  const { canBreakthrough, reason, reasonChinese } = canAttemptBreakthrough(beast);

  if (!canBreakthrough) {
    return { success: false, reason, reasonChinese };
  }

  const nextTier = getNextTier(beast.tier);
  if (!nextTier) {
    return { success: false, reason: 'Already at maximum tier', reasonChinese: '已达最高品阶' };
  }

  const template = getTemplateById(beast.templateId);
  if (!template) {
    return { success: false, reason: 'Template not found', reasonChinese: '模板未找到' };
  }

  // Calculate success chance based on affinity and luck
  const baseChance = 0.5;
  const affinityBonus = (beast.affinity - 50) / 100;
  const luckBonus = character.stats.luck / 200;
  const successChance = Math.min(0.95, Math.max(0.1, baseChance + affinityBonus + luckBonus));

  const roll = Math.random();
  if (roll >= successChance) {
    // Failure - decrease affinity slightly
    const failedBeast: SpiritBeast = {
      ...beast,
      affinity: Math.max(0, beast.affinity - 5),
    };
    return {
      success: false,
      beast: failedBeast,
      reason: 'Breakthrough failed',
      reasonChinese: '突破失败',
    };
  }

  // Success! Advance to next tier
  const newStats = calculateBeastStats(
    template.baseStats,
    beast.level,
    nextTier,
    beast.personality,
    beast.mood,
    template.growthRates
  );

  // Unlock tier-gated skills
  const newSkills = template.skills.filter(skill => {
    const hasSkill = beast.skills.some(s => s.id === skill.id);
    if (hasSkill) return false;
    if (skill.unlockLevel > beast.level) return false;
    if (skill.unlockTier === nextTier) return true;
    return false;
  });

  const advancedBeast: SpiritBeast = {
    ...beast,
    tier: nextTier,
    exp: 0,
    expToNextLevel: calculateExpToNextLevel(beast.level),
    currentStats: newStats,
    skills: [...beast.skills, ...newSkills],
  };

  return {
    success: true,
    beast: advancedBeast,
  };
};

// ============================================
// Collection Management
// ============================================

export const addBeastToCollection = (
  collection: SpiritBeastCollection,
  beast: SpiritBeast
): SpiritBeastCollection | null => {
  if (collection.beasts.length >= collection.maxSlots) {
    return null; // No space
  }

  return {
    ...collection,
    beasts: [...collection.beasts, beast],
  };
};

export const removeBeastFromCollection = (
  collection: SpiritBeastCollection,
  beastId: string
): SpiritBeastCollection => {
  const newBeasts = collection.beasts.filter(b => b.id !== beastId);
  const newActiveBeastId = collection.activeBeastId === beastId ? null : collection.activeBeastId;

  return {
    ...collection,
    beasts: newBeasts,
    activeBeastId: newActiveBeastId,
  };
};

export const setActiveBeast = (
  collection: SpiritBeastCollection,
  beastId: string | null
): SpiritBeastCollection => {
  const newBeasts = collection.beasts.map(beast => ({
    ...beast,
    isActive: beast.id === beastId,
  }));

  return {
    ...collection,
    beasts: newBeasts,
    activeBeastId: beastId,
  };
};

export const getActiveBeast = (collection: SpiritBeastCollection): SpiritBeast | null => {
  if (!collection.activeBeastId) return null;
  return collection.beasts.find(b => b.id === collection.activeBeastId) || null;
};

export const updateBeastInCollection = (
  collection: SpiritBeastCollection,
  updatedBeast: SpiritBeast
): SpiritBeastCollection => {
  const newBeasts = collection.beasts.map(beast =>
    beast.id === updatedBeast.id ? updatedBeast : beast
  );

  return {
    ...collection,
    beasts: newBeasts,
  };
};

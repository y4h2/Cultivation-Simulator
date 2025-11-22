import type { Character, Realm, GameLog, GameTime } from '../types/game';
import { ActivityType } from '../types/game';
import { REALM_INFO, REALM_ORDER, getNextRealm, getRealmDisplayName } from '../constants/realms';
import { ACTIVITY_INFO } from '../constants/activities';
import { createInitialSkillPoints, createInitialLearnedSkills } from './skillTree';
import { createInitialSpiritBeastCollection } from './spiritBeast';

// Base cultivation value gained per ke
const BASE_CULTIVATION_PER_KE = 1;

export const calculateCultivationGain = (character: Character): number => {
  const activityInfo = ACTIVITY_INFO[character.currentActivity];
  const comprehensionBonus = 1 + (character.stats.comprehension / 100);

  return Math.floor(
    BASE_CULTIVATION_PER_KE *
    activityInfo.cultivationMultiplier *
    comprehensionBonus
  );
};

export const processCultivation = (
  character: Character,
  time: GameTime
): { character: Character; log?: GameLog } => {
  const cultivationGain = calculateCultivationGain(character);
  const newCultivationValue = character.cultivationValue + cultivationGain;

  // Check if cultivation value exceeds max (ready for breakthrough)
  if (newCultivationValue >= character.cultivationMax) {
    // Only show notification once
    if (!character.breakthroughNotified) {
      return {
        character: {
          ...character,
          cultivationValue: character.cultivationMax,
          breakthroughNotified: true,
        },
        log: {
          timestamp: time,
          message: `修为已达圆满，可以尝试突破了！当前境界：${getRealmDisplayName(character.realm, character.realmStage)}`,
          type: 'cultivation',
        },
      };
    }
    // Already notified, just cap the value without logging
    return {
      character: {
        ...character,
        cultivationValue: character.cultivationMax,
      },
    };
  }

  return {
    character: {
      ...character,
      cultivationValue: newCultivationValue,
    },
  };
};

export const attemptBreakthrough = (
  character: Character,
  time: GameTime
): { character: Character; success: boolean; log: GameLog } => {
  const realmInfo = REALM_INFO[character.realm];
  const nextRealm = getNextRealm(character.realm);

  // Calculate breakthrough chance
  const baseChance = 0.3 + (character.stats.luck / 200);
  const cultivationBonus = (character.cultivationValue / character.cultivationMax) * 0.3;
  const successChance = Math.min(0.95, baseChance + cultivationBonus);

  const roll = Math.random();
  const success = roll < successChance;

  if (success) {
    // Check if advancing to next stage or next realm
    if (character.realmStage < realmInfo.stages) {
      // Advance to next stage
      const newStage = character.realmStage + 1;
      const newCultivationMax = calculateCultivationMax(character.realm, newStage);
      const newStats = calculateStatsForRealm(character.realm, newStage, character.stats.comprehension, character.stats.luck);

      return {
        character: {
          ...character,
          realmStage: newStage,
          cultivationValue: 0,
          cultivationMax: newCultivationMax,
          breakthroughNotified: false, // Reset notification flag for next breakthrough
          stats: {
            ...character.stats,
            maxHp: newStats.maxHp,
            maxSpiritualPower: newStats.maxSpiritualPower,
            hp: newStats.maxHp,
            spiritualPower: newStats.maxSpiritualPower,
            divineSense: newStats.divineSense,
            speed: newStats.speed,
            attack: newStats.attack,
            defense: newStats.defense,
          },
        },
        success: true,
        log: {
          timestamp: time,
          message: `突破成功！境界提升至${getRealmDisplayName(character.realm, newStage)}！`,
          type: 'cultivation',
        },
      };
    } else if (nextRealm) {
      // Advance to next realm
      const newCultivationMax = calculateCultivationMax(nextRealm, 1);
      const newStats = calculateStatsForRealm(nextRealm, 1, character.stats.comprehension, character.stats.luck);

      return {
        character: {
          ...character,
          realm: nextRealm,
          realmStage: 1,
          cultivationValue: 0,
          cultivationMax: newCultivationMax,
          breakthroughNotified: false, // Reset notification flag for next breakthrough
          stats: {
            ...character.stats,
            maxHp: newStats.maxHp,
            maxSpiritualPower: newStats.maxSpiritualPower,
            hp: newStats.maxHp,
            spiritualPower: newStats.maxSpiritualPower,
            divineSense: newStats.divineSense,
            speed: newStats.speed,
            attack: newStats.attack,
            defense: newStats.defense,
          },
        },
        success: true,
        log: {
          timestamp: time,
          message: `大突破成功！晋升至${getRealmDisplayName(nextRealm, 1)}！天地异象，灵气涌动！`,
          type: 'cultivation',
        },
      };
    }
  }

  // Failure - lose some cultivation progress
  const cultivationLoss = Math.floor(character.cultivationValue * 0.3);

  return {
    character: {
      ...character,
      cultivationValue: character.cultivationValue - cultivationLoss,
      breakthroughNotified: false, // Reset so next time cultivation is full, notify again
    },
    success: false,
    log: {
      timestamp: time,
      message: `突破失败！损失${cultivationLoss}点修为。需要继续积累...`,
      type: 'cultivation',
    },
  };
};

export const calculateCultivationMax = (realm: Realm, stage: number): number => {
  const realmInfo = REALM_INFO[realm];
  const realmIndex = REALM_ORDER.indexOf(realm);

  // Base requirement increases exponentially with realm
  const baseRequirement = realmInfo.cultivationRequired;

  // Stage multiplier (later stages require more)
  const stageMultiplier = 1 + (stage - 1) * 0.5;

  return Math.floor(baseRequirement * stageMultiplier * Math.pow(1.2, realmIndex));
};

interface CalculatedStats {
  maxHp: number;
  maxSpiritualPower: number;
  divineSense: number;
  comprehension: number;
  luck: number;
  speed: number;
  attack: number;
  defense: number;
}

export const calculateStatsForRealm = (
  realm: Realm,
  stage: number,
  comprehension: number,
  luck: number
): CalculatedStats => {
  const realmInfo = REALM_INFO[realm];
  const multiplier = realmInfo.statsMultiplier * (1 + (stage - 1) * 0.2);

  return {
    maxHp: Math.floor(100 * multiplier),
    maxSpiritualPower: Math.floor(50 * multiplier),
    divineSense: Math.floor(10 * multiplier),
    comprehension,
    luck,
    speed: Math.floor(10 * multiplier),
    attack: Math.floor(15 * multiplier),
    defense: Math.floor(10 * multiplier),
  };
};

export const createInitialCharacter = (name: string): Character => {
  const initialStats = calculateStatsForRealm('qi_refining', 1, 10, 10);

  return {
    name,
    realm: 'qi_refining',
    realmStage: 1,
    cultivationValue: 0,
    cultivationMax: calculateCultivationMax('qi_refining', 1),
    breakthroughNotified: false,
    stats: {
      hp: initialStats.maxHp,
      maxHp: initialStats.maxHp,
      spiritualPower: initialStats.maxSpiritualPower,
      maxSpiritualPower: initialStats.maxSpiritualPower,
      divineSense: initialStats.divineSense,
      comprehension: initialStats.comprehension,
      luck: initialStats.luck,
      speed: initialStats.speed,
      attack: initialStats.attack,
      defense: initialStats.defense,
    },
    inventory: {
      items: [
        { itemId: 'spirit_grass', quantity: 5 },
        { itemId: 'qi_gathering_pill', quantity: 3 },
        { itemId: 'healing_pill', quantity: 2 },
      ],
      capacity: 50,
    },
    spiritStones: 100,
    reputation: 0,
    currentActivity: ActivityType.ClosedDoorCultivation,
    // Skill Tree System
    skillPoints: createInitialSkillPoints(),
    learnedSkills: createInitialLearnedSkills(),
    // Spirit Beast System
    spiritBeasts: createInitialSpiritBeastCollection(),
  };
};

export const changeActivity = (
  character: Character,
  newActivity: typeof ActivityType[keyof typeof ActivityType],
  time: GameTime
): { character: Character; log: GameLog } => {
  const activityInfo = ACTIVITY_INFO[newActivity];

  return {
    character: {
      ...character,
      currentActivity: newActivity,
    },
    log: {
      timestamp: time,
      message: `开始${activityInfo.chineseName}`,
      type: 'system',
    },
  };
};

// ============================================
// Clan System Constants and Helper Functions
// ============================================

import type {
  ClanState,
  ClanStatus,
  ClanAtmosphere,
  ClanNPC,
  ClanPeak,
  ClanHall,
  ClanActivity,
  ClanEvent,
  ClanActivityResult,
  PeakType,
  HallType,
  ClanActivityType,
  LifeCircle,
  NPCRole,
  NPCPersonality,
} from '../types/clan';
import type { GameTime, Realm, Element } from '../types/game';
import clanData from '../data/clan.json';

// ============================================
// Data Access Functions
// ============================================

export const getPeakById = (peakId: PeakType): ClanPeak | undefined => {
  const peakData = clanData.peaks.find(p => p.id === peakId);
  if (!peakData) return undefined;

  return {
    ...peakData,
    id: peakData.id as PeakType,
    element: peakData.element as Element | undefined,
    reputation: 0,
    contributions: 0,
    activities: peakData.activities as ClanActivityType[],
  };
};

export const getHallById = (hallId: HallType): ClanHall | undefined => {
  const hallData = clanData.halls.find(h => h.id === hallId);
  if (!hallData) return undefined;

  return {
    ...hallData,
    id: hallData.id as HallType,
    activities: hallData.activities as ClanActivityType[],
  };
};

export const getActivityById = (activityId: ClanActivityType): ClanActivity | undefined => {
  const activityData = clanData.activities.find(a => a.id === activityId);
  if (!activityData) return undefined;

  return {
    ...activityData,
    id: activityData.id as ClanActivityType,
    location: activityData.location as PeakType | HallType,
    minStatus: activityData.minStatus as ClanStatus | undefined,
  };
};

export const getEventById = (eventId: string): ClanEvent | undefined => {
  const eventData = clanData.events.find(e => e.id === eventId);
  if (!eventData) return undefined;

  return eventData as unknown as ClanEvent;
};

export const getNPCById = (npcs: ClanNPC[], npcId: string): ClanNPC | undefined => {
  return npcs.find(n => n.id === npcId);
};

export const getAllPeaks = (): ClanPeak[] => {
  return clanData.peaks.map(p => ({
    ...p,
    id: p.id as PeakType,
    element: p.element as Element | undefined,
    reputation: 0,
    contributions: 0,
    activities: p.activities as ClanActivityType[],
  }));
};

export const getAllHalls = (): ClanHall[] => {
  return clanData.halls.map(h => ({
    ...h,
    id: h.id as HallType,
    activities: h.activities as ClanActivityType[],
  }));
};

export const getAllActivities = (): ClanActivity[] => {
  return clanData.activities.map(a => ({
    ...a,
    id: a.id as ClanActivityType,
    location: a.location as PeakType | HallType,
    minStatus: a.minStatus as ClanStatus | undefined,
  }));
};

// ============================================
// Status Calculation Functions
// ============================================

export const calculateStatus = (
  clanAffinity: number,
  totalContributions: number,
  hasMaster: boolean,
  realmIndex: number
): ClanStatus => {
  const thresholds = clanData.statusThresholds;

  // Check from highest to lowest
  if (
    clanAffinity >= thresholds.successor.minAffinity &&
    totalContributions >= thresholds.successor.minContributions &&
    hasMaster &&
    realmIndex >= thresholds.successor.minRealmIndex
  ) {
    return 'successor';
  }

  if (
    clanAffinity >= thresholds.direct_disciple.minAffinity &&
    totalContributions >= thresholds.direct_disciple.minContributions &&
    hasMaster
  ) {
    return 'direct_disciple';
  }

  if (
    clanAffinity >= thresholds.registered.minAffinity &&
    totalContributions >= thresholds.registered.minContributions
  ) {
    return 'registered';
  }

  return 'guest';
};

export const getStatusName = (status: ClanStatus, isZh: boolean): string => {
  const names: Record<ClanStatus, { zh: string; en: string }> = {
    guest: { zh: '过客', en: 'Guest' },
    registered: { zh: '座下弟子', en: 'Registered Disciple' },
    direct_disciple: { zh: '亲传弟子', en: 'Direct Disciple' },
    successor: { zh: '继承人', en: 'Successor' },
  };
  return isZh ? names[status].zh : names[status].en;
};

export const getStatusColor = (status: ClanStatus): string => {
  const colors: Record<ClanStatus, string> = {
    guest: '#9CA3AF',           // Gray
    registered: '#60A5FA',      // Blue
    direct_disciple: '#A78BFA', // Purple
    successor: '#FBBF24',       // Amber
  };
  return colors[status];
};

// ============================================
// Atmosphere Functions
// ============================================

export const getAtmosphereDescription = (atmosphere: ClanAtmosphere, isZh: boolean): string => {
  const tempDesc = atmosphere.temperature > 30
    ? (isZh ? '温情' : 'Warm')
    : atmosphere.temperature < -30
      ? (isZh ? '冷漠' : 'Cold')
      : (isZh ? '平和' : 'Neutral');

  const methodDesc = atmosphere.methods > 30
    ? (isZh ? '激进' : 'Aggressive')
    : atmosphere.methods < -30
      ? (isZh ? '守序' : 'Orderly')
      : (isZh ? '中庸' : 'Balanced');

  return isZh ? `${tempDesc}/${methodDesc}` : `${tempDesc}/${methodDesc}`;
};

export const getAtmosphereModifiers = (atmosphere: ClanAtmosphere): {
  npcMoodModifier: number;
  eventChanceModifier: number;
} => {
  const effects = clanData.atmosphereEffects;

  if (atmosphere.temperature >= 60) {
    return effects.very_warm;
  } else if (atmosphere.temperature >= 30) {
    return effects.warm;
  } else if (atmosphere.temperature <= -60) {
    return effects.very_cold;
  } else if (atmosphere.temperature <= -30) {
    return effects.cold;
  }
  return effects.neutral;
};

// ============================================
// Life Circle Functions
// ============================================

export const getLifeCircleName = (circle: LifeCircle, isZh: boolean): string => {
  const names: Record<LifeCircle, { zh: string; en: string }> = {
    below_mountain: { zh: '山下圈', en: 'Below Mountain' },
    main_gate: { zh: '山门圈', en: 'Main Gate' },
    cloud_peak: { zh: '云巅圈', en: 'Cloud Peak' },
  };
  return isZh ? names[circle].zh : names[circle].en;
};

export const getLifeCircleColor = (circle: LifeCircle): string => {
  const colors: Record<LifeCircle, string> = {
    below_mountain: '#92400E', // Brown
    main_gate: '#3B82F6',      // Blue
    cloud_peak: '#8B5CF6',     // Purple
  };
  return colors[circle];
};

export const canAccessLifeCircle = (
  playerStatus: ClanStatus,
  circle: LifeCircle
): boolean => {
  const statusOrder: ClanStatus[] = ['guest', 'registered', 'direct_disciple', 'successor'];
  const playerStatusIndex = statusOrder.indexOf(playerStatus);

  const circleRequirements: Record<LifeCircle, number> = {
    below_mountain: 0, // All can access
    main_gate: 1,      // Registered+
    cloud_peak: 2,     // Direct disciple+ (occasional visits)
  };

  return playerStatusIndex >= circleRequirements[circle];
};

// ============================================
// NPC Functions
// ============================================

export const getNPCRoleName = (role: NPCRole, isZh: boolean): string => {
  const names: Record<NPCRole, { zh: string; en: string }> = {
    peak_master: { zh: '峰主', en: 'Peak Master' },
    grand_elder: { zh: '太上长老', en: 'Grand Elder' },
    elder: { zh: '长老', en: 'Elder' },
    instructor: { zh: '传功师', en: 'Instructor' },
    senior_disciple: { zh: '师兄/姐', en: 'Senior Disciple' },
    junior_disciple: { zh: '师弟/妹', en: 'Junior Disciple' },
    logistics: { zh: '后勤弟子', en: 'Logistics Disciple' },
    worker: { zh: '杂役', en: 'Worker' },
    merchant: { zh: '商贩', en: 'Merchant' },
    guest_cultivator: { zh: '客卿', en: 'Guest Cultivator' },
  };
  return isZh ? names[role].zh : names[role].en;
};

export const getNPCPersonalityName = (personality: NPCPersonality, isZh: boolean): string => {
  const names: Record<NPCPersonality, { zh: string; en: string }> = {
    warm: { zh: '温柔', en: 'Warm' },
    strict: { zh: '严厉', en: 'Strict' },
    pragmatic: { zh: '功利', en: 'Pragmatic' },
    carefree: { zh: '佛系', en: 'Carefree' },
    eccentric: { zh: '疯批', en: 'Eccentric' },
    cold: { zh: '冷漠', en: 'Cold' },
    jealous: { zh: '嫉妒', en: 'Jealous' },
    supportive: { zh: '热心', en: 'Supportive' },
  };
  return isZh ? names[personality].zh : names[personality].en;
};

export const calculateNPCMood = (
  npc: ClanNPC,
  atmosphere: ClanAtmosphere
): number => {
  let baseMood = npc.mood;
  const { npcMoodModifier } = getAtmosphereModifiers(atmosphere);

  // Personality affects how atmosphere impacts mood
  if (npc.personality === 'warm' || npc.personality === 'supportive') {
    baseMood += npcMoodModifier * 1.5;
  } else if (npc.personality === 'cold' || npc.personality === 'pragmatic') {
    baseMood += npcMoodModifier * 0.5;
  } else {
    baseMood += npcMoodModifier;
  }

  // Clamp to -100 to 100
  return Math.max(-100, Math.min(100, baseMood));
};

export const getNPCRelationshipLevel = (npc: ClanNPC): string => {
  const avgRelation = (npc.affection + npc.trust + npc.respect) / 3;

  if (avgRelation >= 80) return 'very_close';
  if (avgRelation >= 60) return 'close';
  if (avgRelation >= 40) return 'friendly';
  if (avgRelation >= 20) return 'acquaintance';
  if (avgRelation >= 0) return 'stranger';
  return 'hostile';
};

export const getNPCRelationshipName = (level: string, isZh: boolean): string => {
  const names: Record<string, { zh: string; en: string }> = {
    very_close: { zh: '亲密无间', en: 'Very Close' },
    close: { zh: '亲近', en: 'Close' },
    friendly: { zh: '友善', en: 'Friendly' },
    acquaintance: { zh: '相识', en: 'Acquaintance' },
    stranger: { zh: '陌生', en: 'Stranger' },
    hostile: { zh: '敌对', en: 'Hostile' },
  };
  return isZh ? names[level].zh : names[level].en;
};

// ============================================
// Peak Functions
// ============================================

export const getPeakName = (peakId: PeakType, isZh: boolean): string => {
  const peak = clanData.peaks.find(p => p.id === peakId);
  if (!peak) return peakId;
  return isZh ? peak.chineseName : peak.name;
};

export const getPeakColor = (peakId: PeakType): string => {
  const colors: Record<PeakType, string> = {
    sword_peak: '#EF4444',     // Red
    alchemy_peak: '#F97316',   // Orange
    beast_garden: '#22C55E',   // Green
    scripture_cliff: '#3B82F6', // Blue
    commerce_hall: '#FBBF24',  // Amber
  };
  return colors[peakId];
};

// ============================================
// Hall Functions
// ============================================

export const getHallName = (hallId: HallType, isZh: boolean): string => {
  const hall = clanData.halls.find(h => h.id === hallId);
  if (!hall) return hallId;
  return isZh ? hall.chineseName : hall.name;
};

// ============================================
// Activity Execution Functions
// ============================================

export const canDoActivity = (
  activity: ClanActivity,
  clanState: ClanState
): { canDo: boolean; reason?: string; chineseReason?: string } => {
  // Check status requirement
  if (activity.minStatus) {
    const statusOrder: ClanStatus[] = ['guest', 'registered', 'direct_disciple', 'successor'];
    const playerStatusIndex = statusOrder.indexOf(clanState.status);
    const requiredStatusIndex = statusOrder.indexOf(activity.minStatus);

    if (playerStatusIndex < requiredStatusIndex) {
      return {
        canDo: false,
        reason: `Requires ${getStatusName(activity.minStatus, false)} status`,
        chineseReason: `需要${getStatusName(activity.minStatus, true)}身份`,
      };
    }
  }

  // Check if already done today (limit some activities)
  const limitedActivities: ClanActivityType[] = ['seek_guidance', 'meet_master', 'find_mentor'];
  if (
    limitedActivities.includes(activity.id) &&
    clanState.dailyActivitiesCompleted.includes(activity.id)
  ) {
    return {
      canDo: false,
      reason: 'Already done today',
      chineseReason: '今日已完成',
    };
  }

  return { canDo: true };
};

export const executeActivity = (
  activity: ClanActivity,
  clanState: ClanState,
  _gameTime: GameTime
): ClanActivityResult => {
  const result: ClanActivityResult = {
    success: true,
    message: `Completed ${activity.name}`,
    chineseMessage: `完成了${activity.chineseName}`,
    wudaoPointsGained: activity.wudaoPointsGain,
    contributionGained: activity.contributionGain,
  };

  // Check for event trigger
  const { eventChanceModifier } = getAtmosphereModifiers(clanState.atmosphere);
  const adjustedEventChance = activity.eventChance * eventChanceModifier;

  if (Math.random() * 100 < adjustedEventChance) {
    // Find matching events for this activity
    const matchingEvents = clanData.events.filter(
      e => e.triggerActivity === activity.id
    );

    if (matchingEvents.length > 0) {
      const randomEvent = matchingEvents[Math.floor(Math.random() * matchingEvents.length)];
      result.triggeredEventId = randomEvent.id;
    }
  }

  // Gossip for gossip center locations
  const location = activity.location;
  const hall = clanData.halls.find(h => h.id === location);
  if (hall?.isGossipCenter && Math.random() < 0.3) {
    const gossips = [
      { en: 'Elder Qing seems troubled lately...', zh: '青锋长老最近似乎有心事...' },
      { en: 'A new secret realm may open soon.', zh: '听说有新的秘境即将开启。' },
      { en: 'The alchemy peak had a successful batch.', zh: '丹台那边炼丹大成了。' },
      { en: 'Someone saw strange lights on the mountain.', zh: '有人在山上看到了奇怪的光芒。' },
    ];
    const randomGossip = gossips[Math.floor(Math.random() * gossips.length)];
    result.gossipLearned = randomGossip.en;
    result.chineseGossipLearned = randomGossip.zh;
  }

  return result;
};

// ============================================
// Initial State Creation
// ============================================

export const createInitialClanState = (): ClanState => {
  const defaultClan = clanData.defaultClan;

  // Initialize peaks
  const peaks: Record<PeakType, ClanPeak> = {} as Record<PeakType, ClanPeak>;
  for (const peakData of clanData.peaks) {
    peaks[peakData.id as PeakType] = {
      ...peakData,
      id: peakData.id as PeakType,
      element: peakData.element as Element | undefined,
      reputation: 0,
      contributions: 0,
      activities: peakData.activities as ClanActivityType[],
    };
  }

  // Initialize halls
  const halls: Record<HallType, ClanHall> = {} as Record<HallType, ClanHall>;
  for (const hallData of clanData.halls) {
    halls[hallData.id as HallType] = {
      ...hallData,
      id: hallData.id as HallType,
      activities: hallData.activities as ClanActivityType[],
    };
  }

  // Initialize NPCs with default relationship values
  const npcs: ClanNPC[] = clanData.npcs.map(npcData => ({
    ...npcData,
    role: npcData.role as NPCRole,
    personality: npcData.personality as NPCPersonality,
    realm: npcData.realm as Realm,
    element: (npcData as { element?: string }).element as Element | undefined,
    peakAffiliation: npcData.peakAffiliation as PeakType | undefined,
    lifeCircle: npcData.lifeCircle as LifeCircle,
    intention: (npcData as { intention?: string }).intention as 'genuine' | 'investment' | 'utilitarian' | undefined,
    teachingStyle: (npcData as { teachingStyle?: string }).teachingStyle as 'hands_on' | 'distant' | 'harsh' | 'patient' | undefined,
    affection: 10,
    trust: 10,
    respect: 10,
    familiarity: 0,
    mood: 50,
    isAvailable: true,
    flags: npcData.flags || {},
  }));

  return {
    clanName: defaultClan.name,
    chineseClanName: defaultClan.chineseName,
    founded: false,
    status: 'guest',
    totalContributions: 0,
    monthlyContributions: 0,
    clanAffinity: 10,
    atmosphere: {
      temperature: 20, // Slightly warm
      methods: 0,      // Balanced
    },
    peaks,
    halls,
    npcs,
    activeEvents: [],
    eventHistory: [],
    dailyActivitiesCompleted: [],
    lastDayReset: { year: 1, month: 1, day: 1, ke: 0, tenDay: 1 },
    storyFlags: {},
  };
};

// ============================================
// Export Default Data
// ============================================

export const DEFAULT_CLAN = clanData.defaultClan;
export const ALL_PEAKS = clanData.peaks;
export const ALL_HALLS = clanData.halls;
export const ALL_ACTIVITIES = clanData.activities;
export const ALL_EVENTS = clanData.events;

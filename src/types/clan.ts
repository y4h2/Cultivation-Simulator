// ============================================
// Clan/Sect System Types for Xiuxian (Cultivation) Game
// Based on relationship-driven design, not rank divisions
// ============================================

import type { GameTime, Element, Realm } from './game';

// ============================================
// Life Circle Types (三个生活圈)
// ============================================

export const LifeCircle = {
  BelowMountain: 'below_mountain',   // 山下圈 - Mortals, workers, merchants
  MainGate: 'main_gate',             // 山门圈 - Regular disciples, daily life
  CloudPeak: 'cloud_peak',           // 云巅圈 - Peak masters, decision circle
} as const;

export type LifeCircle = typeof LifeCircle[keyof typeof LifeCircle];

// ============================================
// Peak Types (峰脉)
// ============================================

export const PeakType = {
  SwordPeak: 'sword_peak',           // 剑锋 - Combat, protection
  AlchemyPeak: 'alchemy_peak',       // 丹台 - Pills, healing, herbs
  BeastGarden: 'beast_garden',       // 灵兽苑 - Spirit beasts
  ScriptureCliff: 'scripture_cliff', // 藏经崖 - Techniques, formations, intel
  CommerceHall: 'commerce_hall',     // 商行阁 - Finance, trade
} as const;

export type PeakType = typeof PeakType[keyof typeof PeakType];

// ============================================
// Hall Types (事务堂)
// ============================================

export const HallType = {
  DiningHall: 'dining_hall',         // 斋堂 - Eating, gossip center
  DisciplineHall: 'discipline_hall', // 刑堂 - Punishment, disputes
  TeachingHall: 'teaching_hall',     // 传功堂 - Courses, mentorship
  ChoresHall: 'chores_hall',         // 杂务堂 - Cleaning, delivery, errands
} as const;

export type HallType = typeof HallType[keyof typeof HallType];

// ============================================
// Clan Status Types (身份层级)
// Based on relationship closeness, not rank
// ============================================

export const ClanStatus = {
  Guest: 'guest',                    // 过客·借住 - Just arrived, limited access
  Registered: 'registered',          // 在籍·座下弟子 - Passed exam, basic rights
  DirectDisciple: 'direct_disciple', // 亲传·自家人 - Acknowledged by an elder
  Successor: 'successor',            // 心灯·继承人 - Heir to a lineage
} as const;

export type ClanStatus = typeof ClanStatus[keyof typeof ClanStatus];

// ============================================
// NPC Personality Types
// ============================================

export const NPCPersonality = {
  Warm: 'warm',                      // 温柔 - Kind, helpful
  Strict: 'strict',                  // 严厉 - Demanding, principled
  Pragmatic: 'pragmatic',            // 功利 - Result-oriented
  Carefree: 'carefree',              // 佛系 - Relaxed, detached
  Eccentric: 'eccentric',            // 疯批 - Unpredictable, genius
  Cold: 'cold',                      // 冷漠 - Distant, professional
  Jealous: 'jealous',                // 嫉妒 - Competitive, envious
  Supportive: 'supportive',          // 热心 - Always willing to help
} as const;

export type NPCPersonality = typeof NPCPersonality[keyof typeof NPCPersonality];

// ============================================
// NPC Role Types
// ============================================

export const NPCRole = {
  PeakMaster: 'peak_master',         // 峰主
  GrandElder: 'grand_elder',         // 太上长老
  Elder: 'elder',                    // 长老
  Instructor: 'instructor',          // 传功师
  SeniorDisciple: 'senior_disciple', // 师兄/姐
  JuniorDisciple: 'junior_disciple', // 师弟/妹
  LogisticsDisciple: 'logistics',    // 后勤弟子
  Worker: 'worker',                  // 杂役
  Merchant: 'merchant',              // 商贩
  GuestCultivator: 'guest_cultivator', // 客卿
} as const;

export type NPCRole = typeof NPCRole[keyof typeof NPCRole];

// ============================================
// Clan Atmosphere Types (宗门氛围)
// ============================================

export interface ClanAtmosphere {
  temperature: number;               // -100 to 100: Cold (-100) <-> Warm (100)
  methods: number;                   // -100 to 100: Orderly (-100) <-> Aggressive (100)
}

// ============================================
// NPC Definition Interface
// ============================================

export interface ClanNPC {
  id: string;
  name: string;
  chineseName: string;
  role: NPCRole;
  personality: NPCPersonality;
  realm: Realm;
  element?: Element;
  peakAffiliation?: PeakType;        // Which peak they belong to
  lifeCircle: LifeCircle;

  // Relationship with player
  affection: number;                 // -100 to 100: How much they like you
  trust: number;                     // 0 to 100: How much they trust you
  respect: number;                   // 0 to 100: How much they respect you
  familiarity: number;               // 0 to 100: How well you know each other

  // Master-disciple specific
  isMaster?: boolean;                // Is this NPC player's master?
  intention?: 'genuine' | 'investment' | 'utilitarian'; // Why they took you as disciple
  teachingStyle?: 'hands_on' | 'distant' | 'harsh' | 'patient';

  // State
  mood: number;                      // -100 to 100: Current mood
  isAvailable: boolean;              // Can interact with this NPC now
  lastInteraction?: GameTime;

  // Story flags
  flags: Record<string, boolean | number | string>;
}

// ============================================
// Peak Definition Interface
// ============================================

export interface ClanPeak {
  id: PeakType;
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;

  // Peak characteristics
  focus: string;                     // Main focus (combat, alchemy, etc.)
  element?: Element;                 // Associated element if any

  // Player relationship
  reputation: number;                // 0 to 100: Standing with this peak
  contributions: number;             // Total contributions made

  // Activities available
  activities: ClanActivityType[];

  // Key NPCs
  masterNPCId?: string;              // Peak master NPC id
}

// ============================================
// Hall Definition Interface
// ============================================

export interface ClanHall {
  id: HallType;
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;

  // Activities available
  activities: ClanActivityType[];

  // Hall characteristics
  isGossipCenter?: boolean;          // Can hear gossip here
  socialValue: number;               // How much social interaction here
}

// ============================================
// Activity Types
// ============================================

export const ClanActivityType = {
  // Dining Hall
  EatMeal: 'eat_meal',               // 用餐 - May trigger small events
  Gossip: 'gossip',                  // 闲聊 - Learn rumors

  // Peak Activities
  AttendLecture: 'attend_lecture',   // 听道 - Gain wudao points
  GroupTraining: 'group_training',   // 集体修炼 - Train with others
  SeekGuidance: 'seek_guidance',     // 请教 - Ask master for advice

  // Chores Hall
  DoChores: 'do_chores',             // 做杂务 - Earn contribution, learn gossip
  DeliverMessage: 'deliver_message', // 送信 - Opportunity for events

  // Commerce Hall
  HelpTrade: 'help_trade',           // 协助贸易 - Affect sect trade
  ReviewAccounts: 'review_accounts', // 查账 - Market insight

  // Beast Garden
  VisitBeasts: 'visit_beasts',       // 看灵兽 - Beast management
  BeastTraining: 'beast_training',   // 灵兽训练 - Train sect beasts

  // Discipline Hall
  ReportIssue: 'report_issue',       // 举报 - Report misconduct
  SeekJustice: 'seek_justice',       // 申诉 - Appeal decisions

  // Teaching Hall
  AttendClass: 'attend_class',       // 上课 - Learn techniques
  FindMentor: 'find_mentor',         // 寻师 - Find a master

  // Scripture Cliff
  StudyTechniques: 'study_techniques', // 研习功法 - Study techniques
  ReadRecords: 'read_records',       // 查阅典籍 - Gain knowledge

  // General
  MeetNPC: 'meet_npc',               // 拜访 - Visit specific NPC
  MeetMaster: 'meet_master',         // 请安 - Visit your master
} as const;

export type ClanActivityType = typeof ClanActivityType[keyof typeof ClanActivityType];

// ============================================
// Activity Definition Interface
// ============================================

export interface ClanActivity {
  id: ClanActivityType;
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;
  location: PeakType | HallType;

  // Requirements
  minStatus?: ClanStatus;
  minReputation?: number;
  minAffection?: number;             // With relevant NPC

  // Costs
  timeCost: number;                  // In game ke
  energyCost?: number;
  contributionCost?: number;

  // Rewards
  wudaoPointsGain?: number;
  contributionGain?: number;
  reputationGain?: number;
  affectionGain?: number;            // With relevant NPCs

  // Event chance
  eventChance: number;               // 0-100 chance of triggering an event
}

// ============================================
// Clan Event Types
// ============================================

export const ClanEventType = {
  // Relationship Events
  MasterMood: 'master_mood',         // Master's mood affects teaching
  FellowConflict: 'fellow_conflict', // Conflict with fellow disciple
  FellowHelp: 'fellow_help',         // Fellow disciple helps/asks for help
  ElderNotice: 'elder_notice',       // An elder takes notice of you

  // Sect Events
  SectCrisis: 'sect_crisis',         // Sect faces a crisis
  SectCelebration: 'sect_celebration', // Sect celebration
  DiscourseGathering: 'discourse',   // Martial arts discourse
  SectCompetition: 'sect_competition', // Internal competition

  // Personal Events
  MisunderstandingCleared: 'misunderstanding_cleared',
  SecretDiscovered: 'secret_discovered',
  GossipHeard: 'gossip_heard',
  MentorOffer: 'mentor_offer',       // Someone offers to mentor you

  // NPC Life Events
  NPCPromotion: 'npc_promotion',     // NPC gets promoted
  NPCInjury: 'npc_injury',           // NPC gets injured
  NPCMissing: 'npc_missing',         // NPC goes missing
  NPCBetrayal: 'npc_betrayal',       // NPC betrays sect
  NPCBreakthrough: 'npc_breakthrough', // NPC breaks through
} as const;

export type ClanEventType = typeof ClanEventType[keyof typeof ClanEventType];

// ============================================
// Clan Event Definition Interface
// ============================================

export interface ClanEvent {
  id: string;
  type: ClanEventType;
  name: string;
  chineseName: string;
  description: string;
  chineseDescription: string;

  // Triggers
  triggerActivity?: ClanActivityType;
  triggerLocation?: PeakType | HallType;
  triggerNPCId?: string;
  triggerChance: number;             // Base chance

  // Requirements
  requirements?: {
    minStatus?: ClanStatus;
    minReputation?: number;
    npcAffection?: { npcId: string; min: number };
    flags?: Record<string, boolean | number | string>;
  };

  // Choices
  choices?: ClanEventChoice[];

  // Effects (if no choices)
  effects?: ClanEventEffect[];
}

export interface ClanEventChoice {
  id: string;
  text: string;
  chineseText: string;

  // Requirements to show this choice
  requirements?: {
    minRealm?: Realm;
    hasItem?: string;
    npcAffection?: { npcId: string; min: number };
  };

  // Effects of this choice
  effects: ClanEventEffect[];
}

export interface ClanEventEffect {
  type: 'affection' | 'trust' | 'respect' | 'reputation' | 'contribution'
      | 'wudao_points' | 'spirit_stones' | 'item' | 'flag' | 'atmosphere'
      | 'status_change' | 'npc_mood' | 'log';
  target?: string;                   // NPC id, peak id, etc.
  value?: number;
  itemId?: string;
  flagKey?: string;
  flagValue?: boolean | number | string;
  message?: string;
  chineseMessage?: string;
}

// ============================================
// Active Clan Event (In Progress)
// ============================================

export interface ActiveClanEvent {
  eventId: string;
  startTime: GameTime;
  selectedChoiceId?: string;
  isResolved: boolean;
}

// ============================================
// Clan State Interface (Main State)
// ============================================

export interface ClanState {
  // Basic info
  clanName: string;
  chineseClanName: string;
  founded: boolean;                  // Has player joined a clan
  joinedAt?: GameTime;

  // Player status
  status: ClanStatus;
  totalContributions: number;
  monthlyContributions: number;

  // Relationships
  clanAffinity: number;              // 0-100: Overall standing with clan

  // Atmosphere (affected by player actions)
  atmosphere: ClanAtmosphere;

  // Peaks and Halls
  peaks: Record<PeakType, ClanPeak>;
  halls: Record<HallType, ClanHall>;

  // NPCs
  npcs: ClanNPC[];
  masterNPCId?: string;              // Player's master NPC id

  // Events
  activeEvents: ActiveClanEvent[];
  eventHistory: Array<{
    eventId: string;
    resolvedAt: GameTime;
    choiceId?: string;
  }>;

  // Daily tracking
  dailyActivitiesCompleted: ClanActivityType[];
  lastDayReset: GameTime;

  // Flags for story progression
  storyFlags: Record<string, boolean | number | string>;
}

// ============================================
// Clan Action Types for Context
// ============================================

export type ClanAction =
  | { type: 'JOIN_CLAN'; payload: { clanName: string; chineseClanName: string } }
  | { type: 'DO_CLAN_ACTIVITY'; payload: { activityId: ClanActivityType; locationId: PeakType | HallType; npcId?: string } }
  | { type: 'INTERACT_NPC'; payload: { npcId: string; interactionType: 'greet' | 'chat' | 'request' | 'gift' } }
  | { type: 'RESOLVE_CLAN_EVENT'; payload: { eventId: string; choiceId?: string } }
  | { type: 'UPDATE_NPC_RELATIONSHIP'; payload: { npcId: string; affection?: number; trust?: number; respect?: number } }
  | { type: 'UPDATE_PEAK_REPUTATION'; payload: { peakId: PeakType; reputation?: number; contributions?: number } }
  | { type: 'UPDATE_CLAN_ATMOSPHERE'; payload: { temperature?: number; methods?: number } }
  | { type: 'TRIGGER_CLAN_EVENT'; payload: { eventId: string } }
  | { type: 'SET_MASTER'; payload: { npcId: string | null } }
  | { type: 'TICK_CLAN_DAY' };

// ============================================
// Helper Type for Activity Results
// ============================================

export interface ClanActivityResult {
  success: boolean;
  message: string;
  chineseMessage: string;
  wudaoPointsGained?: number;
  contributionGained?: number;
  reputationChanges?: Record<PeakType, number>;
  npcAffectionChanges?: Record<string, number>;
  triggeredEventId?: string;
  gossipLearned?: string;
  chineseGossipLearned?: string;
}

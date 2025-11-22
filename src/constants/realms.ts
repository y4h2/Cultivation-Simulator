import type { Realm, RealmInfo } from '../types/game';

export const REALM_INFO: Record<Realm, RealmInfo> = {
  qi_refining: {
    name: 'Qi Refining',
    chineseName: '炼气期',
    stages: 9,
    cultivationRequired: 100,
    statsMultiplier: 1,
  },
  foundation: {
    name: 'Foundation',
    chineseName: '筑基期',
    stages: 4,
    cultivationRequired: 1000,
    statsMultiplier: 2,
  },
  core_formation: {
    name: 'Core Formation',
    chineseName: '结丹期',
    stages: 4,
    cultivationRequired: 10000,
    statsMultiplier: 5,
  },
  nascent_soul: {
    name: 'Nascent Soul',
    chineseName: '元婴期',
    stages: 4,
    cultivationRequired: 100000,
    statsMultiplier: 15,
  },
  spirit_transformation: {
    name: 'Spirit Transformation',
    chineseName: '化神期',
    stages: 4,
    cultivationRequired: 1000000,
    statsMultiplier: 50,
  },
  void_refining: {
    name: 'Void Refining',
    chineseName: '炼虚期',
    stages: 4,
    cultivationRequired: 10000000,
    statsMultiplier: 200,
  },
  body_integration: {
    name: 'Body Integration',
    chineseName: '合体期',
    stages: 4,
    cultivationRequired: 100000000,
    statsMultiplier: 1000,
  },
  mahayana: {
    name: 'Mahayana',
    chineseName: '大乘期',
    stages: 4,
    cultivationRequired: 1000000000,
    statsMultiplier: 5000,
  },
  tribulation: {
    name: 'Tribulation',
    chineseName: '渡劫期',
    stages: 9,
    cultivationRequired: Number.MAX_SAFE_INTEGER,
    statsMultiplier: 50000,
  },
};

export const REALM_ORDER: Realm[] = [
  'qi_refining',
  'foundation',
  'core_formation',
  'nascent_soul',
  'spirit_transformation',
  'void_refining',
  'body_integration',
  'mahayana',
  'tribulation',
];

export const STAGE_NAMES = ['初期', '中期', '后期', '巅峰'];
export const STAGE_NAMES_EN = ['Early', 'Mid', 'Late', 'Peak'];

export const getRealmDisplayName = (realm: Realm, stage: number): string => {
  const info = REALM_INFO[realm];
  if (realm === 'qi_refining') {
    return `${info.chineseName}第${stage}层`;
  }
  return `${info.chineseName}${STAGE_NAMES[stage - 1] || ''}`;
};

export const getNextRealm = (currentRealm: Realm): Realm | null => {
  const currentIndex = REALM_ORDER.indexOf(currentRealm);
  if (currentIndex === -1 || currentIndex === REALM_ORDER.length - 1) {
    return null;
  }
  return REALM_ORDER[currentIndex + 1];
};

export const calculateBreakthroughChance = (
  cultivationValue: number,
  cultivationMax: number,
  luck: number
): number => {
  const baseChance = Math.min(0.8, (cultivationValue / cultivationMax) * 0.5);
  const luckBonus = luck * 0.002;
  return Math.min(0.95, baseChance + luckBonus);
};

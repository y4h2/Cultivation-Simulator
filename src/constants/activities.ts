import type { ActivityInfo, ActivityType } from '../types/game';

export const ACTIVITY_INFO: Record<ActivityType, ActivityInfo> = {
  closed_door: {
    type: 'closed_door',
    name: 'Closed-Door Cultivation',
    chineseName: '闭关修炼',
    cultivationMultiplier: 1.5,
    canTrade: false,
    canEncounter: false,
    description: 'Focus entirely on cultivation. Faster progress but no trading or adventures.',
  },
  market_station: {
    type: 'market_station',
    name: 'Station at Market',
    chineseName: '驻守坊市',
    cultivationMultiplier: 0.5,
    canTrade: true,
    canEncounter: false,
    description: 'Stay at the market to trade. Slower cultivation but can execute trading strategies.',
  },
  travel: {
    type: 'travel',
    name: 'Travel & Adventure',
    chineseName: '游历',
    cultivationMultiplier: 0.8,
    canTrade: true,
    canEncounter: true,
    description: 'Travel the world. May trigger encounters, find hidden treasures, or discover secret markets.',
  },
  idle: {
    type: 'idle',
    name: 'Rest',
    chineseName: '休息',
    cultivationMultiplier: 0.3,
    canTrade: false,
    canEncounter: false,
    description: 'Rest and recover. Minimal cultivation progress.',
  },
};

export const getActivityInfo = (type: ActivityType): ActivityInfo => ACTIVITY_INFO[type];

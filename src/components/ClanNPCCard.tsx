import React from 'react';
import type { ClanNPC } from '../types/clan';
import {
  getNPCRoleName,
  getNPCPersonalityName,
  getNPCRelationshipLevel,
  getNPCRelationshipName,
  getPeakName,
  getLifeCircleName,
  getLifeCircleColor,
} from '../constants/clan';

interface ClanNPCCardProps {
  npc: ClanNPC;
  isZh: boolean;
  isMaster?: boolean;
  onClose: () => void;
}

export const ClanNPCCard: React.FC<ClanNPCCardProps> = ({
  npc,
  isZh,
  isMaster = false,
  onClose,
}) => {
  const relationshipLevel = getNPCRelationshipLevel(npc);
  const circleColor = getLifeCircleColor(npc.lifeCircle);

  // Calculate overall relationship score
  const overallRelation = Math.round((npc.affection + npc.trust + npc.respect) / 3);

  // Get realm name
  const getRealmName = (realm: string, isZh: boolean): string => {
    const names: Record<string, { zh: string; en: string }> = {
      qi_refining: { zh: '炼气期', en: 'Qi Refining' },
      foundation: { zh: '筑基期', en: 'Foundation' },
      core_formation: { zh: '结丹期', en: 'Core Formation' },
      nascent_soul: { zh: '元婴期', en: 'Nascent Soul' },
      spirit_transformation: { zh: '化神期', en: 'Spirit Transformation' },
      void_refining: { zh: '炼虚期', en: 'Void Refining' },
      body_integration: { zh: '合体期', en: 'Body Integration' },
      mahayana: { zh: '大乘期', en: 'Mahayana' },
      tribulation: { zh: '渡劫期', en: 'Tribulation' },
    };
    return isZh ? names[realm]?.zh || realm : names[realm]?.en || realm;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-amber-900/30 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: `${circleColor}20`, color: circleColor }}
            >
              {isZh ? npc.chineseName[0] : npc.name[0]}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isZh ? npc.chineseName : npc.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {getNPCRoleName(npc.role, isZh)}
                </span>
                {isMaster && (
                  <span className="text-xs px-1.5 py-0.5 bg-purple-900/50 text-purple-400 rounded">
                    {isZh ? '师父' : 'Master'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-amber-400 mb-3">
              {isZh ? '基本信息' : 'Basic Info'}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <InfoItem label={isZh ? '境界' : 'Realm'} value={getRealmName(npc.realm, isZh)} />
              <InfoItem label={isZh ? '性格' : 'Personality'} value={getNPCPersonalityName(npc.personality, isZh)} />
              <InfoItem
                label={isZh ? '所属' : 'Affiliation'}
                value={npc.peakAffiliation ? getPeakName(npc.peakAffiliation, isZh) : (isZh ? '无' : 'None')}
              />
              <InfoItem
                label={isZh ? '活动圈' : 'Circle'}
                value={getLifeCircleName(npc.lifeCircle, isZh)}
                color={circleColor}
              />
            </div>
          </div>

          {/* Relationship */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-pink-400 mb-3">
              {isZh ? '关系状态' : 'Relationship'}
            </h4>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">{isZh ? '总体关系' : 'Overall'}</span>
              <span className="text-lg font-bold" style={{ color: getRelationColor(overallRelation) }}>
                {getNPCRelationshipName(relationshipLevel, isZh)}
              </span>
            </div>

            {/* Relationship Bars */}
            <div className="space-y-2">
              <RelationshipBar
                label={isZh ? '情谊' : 'Affection'}
                value={npc.affection}
                color="#EC4899"
              />
              <RelationshipBar
                label={isZh ? '信任' : 'Trust'}
                value={npc.trust}
                color="#3B82F6"
              />
              <RelationshipBar
                label={isZh ? '尊敬' : 'Respect'}
                value={npc.respect}
                color="#8B5CF6"
              />
              <RelationshipBar
                label={isZh ? '熟悉度' : 'Familiarity'}
                value={npc.familiarity}
                color="#22C55E"
              />
            </div>
          </div>

          {/* Current State */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-cyan-400 mb-3">
              {isZh ? '当前状态' : 'Current State'}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <MoodDisplay mood={npc.mood} isZh={isZh} />
              <AvailabilityDisplay isAvailable={npc.isAvailable} isZh={isZh} />
            </div>
          </div>

          {/* Master-specific info */}
          {npc.isMaster && npc.intention && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-purple-400 mb-3">
                {isZh ? '师徒关系' : 'Master-Disciple'}
              </h4>
              <div className="space-y-2">
                <InfoItem
                  label={isZh ? '意图' : 'Intention'}
                  value={getIntentionName(npc.intention, isZh)}
                />
                {npc.teachingStyle && (
                  <InfoItem
                    label={isZh ? '教学风格' : 'Teaching Style'}
                    value={getTeachingStyleName(npc.teachingStyle, isZh)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Interaction Button */}
          <button
            disabled={!npc.isAvailable}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              npc.isAvailable
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {npc.isAvailable
              ? (isZh ? '前去拜访' : 'Visit')
              : (isZh ? '暂时不在' : 'Unavailable')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components

interface InfoItemProps {
  label: string;
  value: string;
  color?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, color }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium" style={color ? { color } : { color: 'white' }}>
      {value}
    </p>
  </div>
);

interface RelationshipBarProps {
  label: string;
  value: number;
  color: string;
}

const RelationshipBar: React.FC<RelationshipBarProps> = ({ label, value, color }) => {
  // Value ranges from -100 to 100, normalize to 0-100 for display
  const normalizedValue = (value + 100) / 2;

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${normalizedValue}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};

interface MoodDisplayProps {
  mood: number;
  isZh: boolean;
}

const MoodDisplay: React.FC<MoodDisplayProps> = ({ mood, isZh }) => {
  const getMoodText = (mood: number, isZh: boolean): string => {
    if (mood >= 60) return isZh ? '心情大好' : 'Very Happy';
    if (mood >= 30) return isZh ? '心情愉快' : 'Happy';
    if (mood >= 0) return isZh ? '心情平静' : 'Calm';
    if (mood >= -30) return isZh ? '心情不佳' : 'Unhappy';
    return isZh ? '心情极差' : 'Very Unhappy';
  };

  const getMoodColor = (mood: number): string => {
    if (mood >= 60) return '#22C55E';
    if (mood >= 30) return '#84CC16';
    if (mood >= 0) return '#9CA3AF';
    if (mood >= -30) return '#F97316';
    return '#EF4444';
  };

  return (
    <div className="bg-gray-900/50 rounded p-2">
      <p className="text-xs text-gray-500">{isZh ? '心情' : 'Mood'}</p>
      <p className="text-sm font-medium" style={{ color: getMoodColor(mood) }}>
        {getMoodText(mood, isZh)}
      </p>
    </div>
  );
};

interface AvailabilityDisplayProps {
  isAvailable: boolean;
  isZh: boolean;
}

const AvailabilityDisplay: React.FC<AvailabilityDisplayProps> = ({ isAvailable, isZh }) => (
  <div className="bg-gray-900/50 rounded p-2">
    <p className="text-xs text-gray-500">{isZh ? '状态' : 'Status'}</p>
    <p className={`text-sm font-medium ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>
      {isAvailable
        ? (isZh ? '可以拜访' : 'Available')
        : (isZh ? '暂时不在' : 'Unavailable')}
    </p>
  </div>
);

// Helper Functions

const getRelationColor = (value: number): string => {
  if (value >= 60) return '#22C55E';
  if (value >= 40) return '#84CC16';
  if (value >= 20) return '#FBBF24';
  if (value >= 0) return '#9CA3AF';
  return '#EF4444';
};

const getIntentionName = (intention: string, isZh: boolean): string => {
  const names: Record<string, { zh: string; en: string }> = {
    genuine: { zh: '真心传授', en: 'Genuine' },
    investment: { zh: '投资培养', en: 'Investment' },
    utilitarian: { zh: '功利目的', en: 'Utilitarian' },
  };
  return isZh ? names[intention]?.zh || intention : names[intention]?.en || intention;
};

const getTeachingStyleName = (style: string, isZh: boolean): string => {
  const names: Record<string, { zh: string; en: string }> = {
    hands_on: { zh: '亲力亲为', en: 'Hands-on' },
    distant: { zh: '放任自流', en: 'Distant' },
    harsh: { zh: '严格要求', en: 'Harsh' },
    patient: { zh: '循循善诱', en: 'Patient' },
  };
  return isZh ? names[style]?.zh || style : names[style]?.en || style;
};

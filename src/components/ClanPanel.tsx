import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';
import type { PeakType, HallType, ClanNPC, ClanActivityType } from '../types/clan';
import {
  getPeakName,
  getPeakColor,
  getStatusName,
  getStatusColor,
  getAtmosphereDescription,
  getNPCRelationshipLevel,
  getNPCRelationshipName,
  getNPCRoleName,
  getAllActivities,
  canDoActivity,
} from '../constants/clan';
import { ClanPeakCard } from './ClanPeakCard';
import { ClanNPCCard } from './ClanNPCCard';
import { ClanActivityModal } from './ClanActivityModal';
import { ClanEventModal } from './ClanEventModal';

export const ClanPanel: React.FC = () => {
  const { state, actions } = useGame();
  const { language, t } = useLanguage();
  const isZh = language === 'zh';

  const [selectedTab, setSelectedTab] = useState<'overview' | 'peaks' | 'halls' | 'npcs' | 'activities'>('overview');
  const [selectedPeak, setSelectedPeak] = useState<PeakType | null>(null);
  const [selectedHall, setSelectedHall] = useState<HallType | null>(null);
  const [selectedNPC, setSelectedNPC] = useState<ClanNPC | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  // Get clan state - use default if not initialized
  const clanState = state.clanState;

  // All hooks MUST be called before any conditional returns (React Rules of Hooks)
  // Get available activities
  const availableActivities = useMemo(() => {
    if (!clanState?.founded) return [];
    const allActivities = getAllActivities();
    return allActivities.filter(activity => {
      const check = canDoActivity(activity, clanState);
      return check.canDo;
    });
  }, [clanState]);

  // NPCs by life circle
  const npcsByCircle = useMemo(() => {
    if (!clanState?.npcs) return { cloud_peak: [], main_gate: [], below_mountain: [] };
    return {
      cloud_peak: clanState.npcs.filter(n => n.lifeCircle === 'cloud_peak'),
      main_gate: clanState.npcs.filter(n => n.lifeCircle === 'main_gate'),
      below_mountain: clanState.npcs.filter(n => n.lifeCircle === 'below_mountain'),
    };
  }, [clanState?.npcs]);

  // Get active event count
  const activeEventCount = clanState?.activeEvents?.filter(e => !e.isResolved).length ?? 0;

  // Master NPC
  const masterNPC = clanState?.masterNPCId && clanState?.npcs
    ? clanState.npcs.find(n => n.id === clanState.masterNPCId)
    : null;

  // Check if player can join clan (requires completing storyline quest)
  const canJoinClan = state.storylineState?.storyFlags?.can_join_clan === true;

  // If clan system not founded yet, show appropriate state
  if (!clanState || !clanState.founded) {
    // If player hasn't completed the storyline quest, show locked/grayed state
    if (!canJoinClan) {
      return (
        <div className="bg-gray-900/70 rounded-xl border border-gray-700/50 p-4 sm:p-6 opacity-60">
          <h2 className="text-lg sm:text-xl font-bold text-gray-500 mb-4">
            {t.clan.title}
          </h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-30">
              <svg className="w-24 h-24 mx-auto text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">
              {isZh ? '宗门系统未解锁' : 'Clan System Locked'}
            </p>
            <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">
              {isZh
                ? '请先完成主线任务「宗门考核」以解锁宗门系统'
                : 'Complete the main quest "Sect Entrance Exam" to unlock the clan system'}
            </p>
            <div className="mt-6 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg inline-flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-400 text-sm">
                {isZh ? '前往主线查看任务进度' : 'Go to Story to check quest progress'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // This state should not normally be reached since join_clan is automatic
    // But show a loading/transitional state just in case
    return (
      <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-amber-400 mb-4">
          {t.clan.title}
        </h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">
            <svg className="w-24 h-24 mx-auto text-amber-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-amber-400 text-lg">
            {isZh ? '正在加入宗门...' : 'Joining sect...'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {isZh ? '请完成主线任务「宗门考核」' : 'Please complete the "Sect Entrance Exam" quest'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-amber-400">
            {isZh ? clanState.chineseClanName : clanState.clanName}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: `${getStatusColor(clanState.status)}20`, color: getStatusColor(clanState.status) }}
            >
              {getStatusName(clanState.status, isZh)}
            </span>
            <span className="text-xs text-gray-500">
              {t.clan.contributions}: {clanState.totalContributions}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeEventCount > 0 && (
            <button
              onClick={() => setShowEventModal(true)}
              className="px-3 py-1.5 bg-red-900/50 hover:bg-red-800/50 text-red-400 rounded-lg text-sm transition-colors animate-pulse"
            >
              {isZh ? '事件' : 'Events'} ({activeEventCount})
            </button>
          )}
          <button
            onClick={() => setShowActivityModal(true)}
            className="px-3 py-1.5 bg-amber-900/50 hover:bg-amber-800/50 text-amber-400 rounded-lg text-sm transition-colors"
          >
            {t.clan.doActivity}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {(['overview', 'peaks', 'halls', 'npcs', 'activities'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              selectedTab === tab
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            {tab === 'overview' && (isZh ? '总览' : 'Overview')}
            {tab === 'peaks' && t.clan.peaks}
            {tab === 'halls' && t.clan.halls}
            {tab === 'npcs' && t.clan.npcs}
            {tab === 'activities' && t.clan.activities}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {selectedTab === 'overview' && (
          <OverviewTab
            clanState={clanState}
            masterNPC={masterNPC}
            isZh={isZh}
            t={t}
          />
        )}

        {selectedTab === 'peaks' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(clanState.peaks).map(peak => (
              <ClanPeakCard
                key={peak.id}
                peak={peak}
                isZh={isZh}
                onClick={() => setSelectedPeak(peak.id)}
                isSelected={selectedPeak === peak.id}
              />
            ))}
          </div>
        )}

        {selectedTab === 'halls' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(clanState.halls).map(hall => (
              <HallCard
                key={hall.id}
                hall={hall}
                isZh={isZh}
                onClick={() => setSelectedHall(hall.id)}
                isSelected={selectedHall === hall.id}
              />
            ))}
          </div>
        )}

        {selectedTab === 'npcs' && (
          <div className="space-y-4">
            {/* Cloud Peak NPCs (if accessible) */}
            {npcsByCircle.cloud_peak.length > 0 && (
              <NPCSection
                title={t.clan.lifeCircles.cloud_peak}
                npcs={npcsByCircle.cloud_peak}
                isZh={isZh}
                onSelectNPC={setSelectedNPC}
                selectedNPCId={selectedNPC?.id}
                t={t}
              />
            )}

            {/* Main Gate NPCs */}
            {npcsByCircle.main_gate.length > 0 && (
              <NPCSection
                title={t.clan.lifeCircles.main_gate}
                npcs={npcsByCircle.main_gate}
                isZh={isZh}
                onSelectNPC={setSelectedNPC}
                selectedNPCId={selectedNPC?.id}
                t={t}
              />
            )}

            {/* Below Mountain NPCs */}
            {npcsByCircle.below_mountain.length > 0 && (
              <NPCSection
                title={t.clan.lifeCircles.below_mountain}
                npcs={npcsByCircle.below_mountain}
                isZh={isZh}
                onSelectNPC={setSelectedNPC}
                selectedNPCId={selectedNPC?.id}
                t={t}
              />
            )}
          </div>
        )}

        {selectedTab === 'activities' && (
          <ActivitiesTab
            activities={availableActivities}
            completedToday={clanState.dailyActivitiesCompleted}
            isZh={isZh}
            t={t}
            onSelectActivity={() => {
              setShowActivityModal(true);
            }}
          />
        )}
      </div>

      {/* Activity Modal */}
      {showActivityModal && (
        <ClanActivityModal
          clanState={clanState}
          isZh={isZh}
          onClose={() => setShowActivityModal(false)}
          onDoActivity={(activityId, locationId, npcId) => {
            actions.doClanActivity?.(activityId, locationId, npcId);
            setShowActivityModal(false);
          }}
        />
      )}

      {/* Event Modal */}
      {showEventModal && (
        <ClanEventModal
          events={clanState.activeEvents}
          isZh={isZh}
          onClose={() => setShowEventModal(false)}
          onResolveEvent={(eventId, choiceId) => {
            actions.resolveClanEvent?.(eventId, choiceId);
          }}
        />
      )}

      {/* Selected NPC Detail */}
      {selectedNPC && (
        <ClanNPCCard
          npc={selectedNPC}
          isZh={isZh}
          isMaster={selectedNPC.id === clanState.masterNPCId}
          onClose={() => setSelectedNPC(null)}
        />
      )}
    </div>
  );
};

// ============================================
// Overview Tab Component
// ============================================

interface OverviewTabProps {
  clanState: NonNullable<ReturnType<typeof useGame>['state']['clanState']>;
  masterNPC: ClanNPC | null | undefined;
  isZh: boolean;
  t: ReturnType<typeof useLanguage>['t'];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ clanState, masterNPC, isZh, t }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left Column - Stats */}
      <div className="space-y-4">
        {/* Status Card */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-amber-400 mb-3">
            {isZh ? '个人状态' : 'Personal Status'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatItem label={t.clan.status} value={getStatusName(clanState.status, isZh)} color={getStatusColor(clanState.status)} />
            <StatItem label={t.clan.affinity} value={`${clanState.clanAffinity}/100`} />
            <StatItem label={t.clan.contributions} value={clanState.totalContributions.toString()} />
            <StatItem label={t.clan.monthlyContributions} value={clanState.monthlyContributions.toString()} />
          </div>
        </div>

        {/* Master Card */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-purple-400 mb-3">
            {t.clan.master}
          </h3>
          {masterNPC ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-900/50 flex items-center justify-center">
                <span className="text-xl">{isZh ? masterNPC.chineseName[0] : masterNPC.name[0]}</span>
              </div>
              <div>
                <p className="font-medium text-white">
                  {isZh ? masterNPC.chineseName : masterNPC.name}
                </p>
                <p className="text-xs text-gray-400">
                  {getNPCRoleName(masterNPC.role, isZh)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-pink-400">
                    {t.clan.relationship.affection}: {masterNPC.affection}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">{t.clan.noMaster}</p>
          )}
        </div>
      </div>

      {/* Right Column - Atmosphere & Quick Access */}
      <div className="space-y-4">
        {/* Atmosphere Card */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-cyan-400 mb-3">
            {t.clan.atmosphere}
          </h3>
          <div className="space-y-3">
            <AtmosphereBar
              label={t.clan.temperature}
              value={clanState.atmosphere.temperature}
              leftLabel={isZh ? '冷漠' : 'Cold'}
              rightLabel={isZh ? '温情' : 'Warm'}
              leftColor="#3B82F6"
              rightColor="#EF4444"
            />
            <AtmosphereBar
              label={t.clan.methods}
              value={clanState.atmosphere.methods}
              leftLabel={isZh ? '守序' : 'Orderly'}
              rightLabel={isZh ? '激进' : 'Aggressive'}
              leftColor="#22C55E"
              rightColor="#F97316"
            />
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {isZh ? '当前氛围：' : 'Current: '}{getAtmosphereDescription(clanState.atmosphere, isZh)}
          </p>
        </div>

        {/* Quick Peak Access */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-400 mb-3">
            {t.clan.peaks}
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(clanState.peaks).map(peak => (
              <div
                key={peak.id}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: `${getPeakColor(peak.id)}20`, color: getPeakColor(peak.id) }}
              >
                {getPeakName(peak.id, isZh)}
                <span className="ml-1 opacity-70">({t.clan.reputation}: {peak.reputation})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Helper Components
// ============================================

interface StatItemProps {
  label: string;
  value: string;
  color?: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, color }) => (
  <div className="bg-gray-900/50 rounded p-2">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium" style={color ? { color } : { color: 'white' }}>
      {value}
    </p>
  </div>
);

interface AtmosphereBarProps {
  label: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
  leftColor: string;
  rightColor: string;
}

const AtmosphereBar: React.FC<AtmosphereBarProps> = ({
  label,
  value,
  leftLabel,
  rightLabel,
  leftColor,
  rightColor,
}) => {
  const position = ((value + 100) / 200) * 100; // Convert -100~100 to 0~100

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{leftLabel}</span>
        <span className="text-gray-400">{label}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white"
          style={{
            left: `${position}%`,
            transform: `translateX(-50%) translateY(-50%)`,
            backgroundColor: value < 0 ? leftColor : rightColor,
          }}
        />
      </div>
    </div>
  );
};

interface HallCardProps {
  hall: NonNullable<ReturnType<typeof useGame>['state']['clanState']>['halls'][HallType];
  isZh: boolean;
  onClick: () => void;
  isSelected: boolean;
}

const HallCard: React.FC<HallCardProps> = ({ hall, isZh, onClick, isSelected }) => (
  <button
    onClick={onClick}
    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
      isSelected
        ? 'border-amber-500 bg-amber-900/30'
        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
    }`}
  >
    <h4 className="font-medium text-white">{isZh ? hall.chineseName : hall.name}</h4>
    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
      {isZh ? hall.chineseDescription : hall.description}
    </p>
    {hall.isGossipCenter && (
      <span className="inline-block mt-2 px-2 py-0.5 bg-purple-900/50 text-purple-400 rounded text-xs">
        {isZh ? '八卦中心' : 'Gossip Center'}
      </span>
    )}
  </button>
);

interface NPCSectionProps {
  title: string;
  npcs: ClanNPC[];
  isZh: boolean;
  onSelectNPC: (npc: ClanNPC) => void;
  selectedNPCId?: string;
  t: ReturnType<typeof useLanguage>['t'];
}

const NPCSection: React.FC<NPCSectionProps> = ({ title, npcs, isZh, onSelectNPC, selectedNPCId, t }) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-400 mb-2">{title}</h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {npcs.map(npc => {
        const relationshipLevel = getNPCRelationshipLevel(npc);
        return (
          <button
            key={npc.id}
            onClick={() => onSelectNPC(npc)}
            className={`p-3 rounded-lg border transition-all text-left ${
              selectedNPCId === npc.id
                ? 'border-amber-500 bg-amber-900/30'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                {isZh ? npc.chineseName[0] : npc.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {isZh ? npc.chineseName : npc.name}
                </p>
                <p className="text-xs text-gray-500">
                  {getNPCRoleName(npc.role, isZh)}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {getNPCRelationshipName(relationshipLevel, isZh)}
              </span>
              <span className={`text-xs ${npc.mood > 30 ? 'text-green-400' : npc.mood < -30 ? 'text-red-400' : 'text-gray-400'}`}>
                {t.clan.relationship.mood}: {npc.mood > 0 ? '+' : ''}{npc.mood}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

interface ActivitiesTabProps {
  activities: ReturnType<typeof getAllActivities>;
  completedToday: ClanActivityType[];
  isZh: boolean;
  t: ReturnType<typeof useLanguage>['t'];
  onSelectActivity: () => void;
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ activities, completedToday, isZh, t, onSelectActivity }) => {
  // Group activities by location
  const activityGroups = useMemo(() => {
    const groups: Record<string, typeof activities> = {};
    for (const activity of activities) {
      const location = activity.location;
      if (!groups[location]) {
        groups[location] = [];
      }
      groups[location].push(activity);
    }
    return groups;
  }, [activities]);

  return (
    <div className="space-y-4">
      {Object.entries(activityGroups).map(([location, locationActivities]) => (
        <div key={location}>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">
            {isZh
              ? (t.clan.peakNames[location as keyof typeof t.clan.peakNames] ||
                 t.clan.hallNames[location as keyof typeof t.clan.hallNames] ||
                 location)
              : (t.clan.peakNames[location as keyof typeof t.clan.peakNames] ||
                 t.clan.hallNames[location as keyof typeof t.clan.hallNames] ||
                 location)}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {locationActivities.map(activity => {
              const isDone = completedToday.includes(activity.id);
              return (
                <button
                  key={activity.id}
                  onClick={() => onSelectActivity()}
                  disabled={isDone}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isDone
                      ? 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
                      : 'border-gray-700 bg-gray-800/50 hover:border-amber-600'
                  }`}
                >
                  <p className="text-sm font-medium text-white">
                    {isZh ? activity.chineseName : activity.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {isZh ? activity.chineseDescription : activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    {activity.wudaoPointsGain && (
                      <span className="text-blue-400">+{activity.wudaoPointsGain} {isZh ? '悟道' : 'Dao'}</span>
                    )}
                    {activity.contributionGain && (
                      <span className="text-amber-400">+{activity.contributionGain} {isZh ? '贡献' : 'Contrib'}</span>
                    )}
                    {isDone && (
                      <span className="text-green-400">{isZh ? '已完成' : 'Done'}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

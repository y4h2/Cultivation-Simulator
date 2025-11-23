import React, { useState, useMemo } from 'react';
import type { ClanState, ClanActivityType, PeakType, HallType } from '../types/clan';
import {
  getAllActivities,
  canDoActivity,
  getPeakName,
  getHallName,
  getPeakColor,
} from '../constants/clan';

interface ClanActivityModalProps {
  clanState: ClanState;
  isZh: boolean;
  onClose: () => void;
  onDoActivity: (activityId: ClanActivityType, locationId: PeakType | HallType, npcId?: string) => void;
}

export const ClanActivityModal: React.FC<ClanActivityModalProps> = ({
  clanState,
  isZh,
  onClose,
  onDoActivity,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<PeakType | HallType | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ClanActivityType | null>(null);

  // Get all activities grouped by location
  const allActivities = useMemo(() => getAllActivities(), []);

  const activityGroups = useMemo(() => {
    const groups: Record<string, { activity: ReturnType<typeof getAllActivities>[0]; canDo: boolean; reason?: string }[]> = {};

    for (const activity of allActivities) {
      const location = activity.location;
      if (!groups[location]) {
        groups[location] = [];
      }

      const check = canDoActivity(activity, clanState);
      groups[location].push({
        activity,
        canDo: check.canDo,
        reason: isZh ? check.chineseReason : check.reason,
      });
    }

    return groups;
  }, [allActivities, clanState, isZh]);

  // Locations list
  const locations = useMemo(() => {
    const peakIds: PeakType[] = ['sword_peak', 'alchemy_peak', 'beast_garden', 'scripture_cliff', 'commerce_hall'];
    const hallIds: HallType[] = ['dining_hall', 'discipline_hall', 'teaching_hall', 'chores_hall'];

    return {
      peaks: peakIds.map(id => ({
        id,
        name: getPeakName(id, isZh),
        color: getPeakColor(id),
        isPeak: true,
      })),
      halls: hallIds.map(id => ({
        id,
        name: getHallName(id, isZh),
        color: '#9CA3AF',
        isPeak: false,
      })),
    };
  }, [isZh]);

  const handleConfirm = () => {
    if (selectedActivity && selectedLocation) {
      onDoActivity(selectedActivity, selectedLocation);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-amber-900/30 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-bold text-amber-400">
            {isZh ? '选择活动' : 'Select Activity'}
          </h3>
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
        <div className="flex-1 overflow-y-auto p-4">
          {/* Step 1: Select Location */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">
              {isZh ? '步骤 1: 选择地点' : 'Step 1: Select Location'}
            </h4>

            {/* Peaks */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">{isZh ? '峰脉' : 'Peaks'}</p>
              <div className="flex flex-wrap gap-2">
                {locations.peaks.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setSelectedLocation(loc.id);
                      setSelectedActivity(null);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedLocation === loc.id
                        ? 'ring-2 ring-amber-500'
                        : ''
                    }`}
                    style={{
                      backgroundColor: `${loc.color}20`,
                      color: loc.color,
                    }}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Halls */}
            <div>
              <p className="text-xs text-gray-500 mb-2">{isZh ? '事务堂' : 'Halls'}</p>
              <div className="flex flex-wrap gap-2">
                {locations.halls.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setSelectedLocation(loc.id);
                      setSelectedActivity(null);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all bg-gray-800 text-gray-300 hover:bg-gray-700 ${
                      selectedLocation === loc.id
                        ? 'ring-2 ring-amber-500'
                        : ''
                    }`}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Select Activity */}
          {selectedLocation && activityGroups[selectedLocation] && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">
                {isZh ? '步骤 2: 选择活动' : 'Step 2: Select Activity'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activityGroups[selectedLocation].map(({ activity, canDo, reason }) => (
                  <button
                    key={activity.id}
                    onClick={() => canDo && setSelectedActivity(activity.id)}
                    disabled={!canDo}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedActivity === activity.id
                        ? 'border-amber-500 bg-amber-900/30'
                        : canDo
                          ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                          : 'border-gray-800 bg-gray-900/50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {isZh ? activity.chineseName : activity.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {isZh ? activity.chineseDescription : activity.description}
                        </p>
                      </div>
                      {selectedActivity === activity.id && (
                        <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Activity Stats */}
                    <div className="mt-3 pt-2 border-t border-gray-700/50">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="text-gray-500">
                          {isZh ? '耗时' : 'Time'}: {activity.timeCost} {isZh ? '刻' : 'ke'}
                        </span>
                        {activity.wudaoPointsGain && (
                          <span className="text-blue-400">
                            +{activity.wudaoPointsGain} {isZh ? '悟道' : 'Dao'}
                          </span>
                        )}
                        {activity.contributionGain && (
                          <span className="text-amber-400">
                            +{activity.contributionGain} {isZh ? '贡献' : 'Contrib'}
                          </span>
                        )}
                        {activity.reputationGain && (
                          <span className="text-green-400">
                            +{activity.reputationGain} {isZh ? '声望' : 'Rep'}
                          </span>
                        )}
                      </div>
                      {activity.eventChance > 0 && (
                        <p className="text-xs text-purple-400 mt-1">
                          {isZh ? '事件概率' : 'Event chance'}: {activity.eventChance}%
                        </p>
                      )}
                    </div>

                    {/* Disabled Reason */}
                    {!canDo && reason && (
                      <p className="text-xs text-red-400 mt-2">{reason}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {isZh ? '取消' : 'Cancel'}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedActivity}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedActivity
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isZh ? '确认' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

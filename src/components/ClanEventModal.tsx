import React, { useState, useMemo } from 'react';
import type { ActiveClanEvent, ClanEventChoice } from '../types/clan';
import { getEventById } from '../constants/clan';

interface ClanEventModalProps {
  events: ActiveClanEvent[];
  isZh: boolean;
  onClose: () => void;
  onResolveEvent: (eventId: string, choiceId?: string) => void;
}

export const ClanEventModal: React.FC<ClanEventModalProps> = ({
  events,
  isZh,
  onClose,
  onResolveEvent,
}) => {
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  // Get unresolved events
  const unresolvedEvents = useMemo(() =>
    events.filter(e => !e.isResolved),
    [events]
  );

  // Get current event details
  const currentActiveEvent = unresolvedEvents[selectedEventIndex];
  const currentEventDef = currentActiveEvent
    ? getEventById(currentActiveEvent.eventId)
    : null;

  // Handle resolve
  const handleResolve = () => {
    if (currentActiveEvent) {
      onResolveEvent(currentActiveEvent.eventId, selectedChoiceId || undefined);
      setSelectedChoiceId(null);

      // Move to next event or close
      if (selectedEventIndex >= unresolvedEvents.length - 1) {
        if (unresolvedEvents.length <= 1) {
          onClose();
        } else {
          setSelectedEventIndex(0);
        }
      }
    }
  };

  // No events
  if (unresolvedEvents.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-xl border border-amber-900/30 max-w-md w-full p-6 text-center">
          <div className="text-4xl mb-4 opacity-50">
            <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg">
            {isZh ? '当前没有待处理的事件' : 'No pending events'}
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
          >
            {isZh ? '关闭' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-amber-900/30 max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-400">
                {isZh ? '宗门事件' : 'Sect Event'}
              </h3>
              <p className="text-xs text-gray-500">
                {unresolvedEvents.length} {isZh ? '个待处理事件' : 'pending event(s)'}
              </p>
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

        {/* Event Navigation (if multiple events) */}
        {unresolvedEvents.length > 1 && (
          <div className="px-4 py-2 border-b border-gray-800 flex gap-1 overflow-x-auto flex-shrink-0">
            {unresolvedEvents.map((event, index) => {
              const eventDef = getEventById(event.eventId);
              return (
                <button
                  key={event.eventId}
                  onClick={() => {
                    setSelectedEventIndex(index);
                    setSelectedChoiceId(null);
                  }}
                  className={`px-3 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                    selectedEventIndex === index
                      ? 'bg-red-900/50 text-red-400'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {eventDef ? (isZh ? eventDef.chineseName : eventDef.name) : event.eventId}
                </button>
              );
            })}
          </div>
        )}

        {/* Event Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentEventDef ? (
            <div className="space-y-4">
              {/* Event Title & Description */}
              <div>
                <h4 className="text-xl font-bold text-white mb-2">
                  {isZh ? currentEventDef.chineseName : currentEventDef.name}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {isZh ? currentEventDef.chineseDescription : currentEventDef.description}
                </p>
              </div>

              {/* Choices */}
              {currentEventDef.choices && currentEventDef.choices.length > 0 ? (
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-amber-400">
                    {isZh ? '你的选择' : 'Your Choice'}
                  </h5>
                  {currentEventDef.choices.map((choice) => (
                    <ChoiceButton
                      key={choice.id}
                      choice={choice}
                      isZh={isZh}
                      isSelected={selectedChoiceId === choice.id}
                      onClick={() => setSelectedChoiceId(choice.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400">
                    {isZh
                      ? '这件事已经发生了，你只能接受结果。'
                      : 'This has already happened. You can only accept the outcome.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">
              {isZh ? '无法加载事件详情' : 'Unable to load event details'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {isZh ? '稍后处理' : 'Later'}
          </button>
          <button
            onClick={handleResolve}
            disabled={currentEventDef?.choices && currentEventDef.choices.length > 0 && !selectedChoiceId}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              (!currentEventDef?.choices || currentEventDef.choices.length === 0 || selectedChoiceId)
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentEventDef?.choices && currentEventDef.choices.length > 0
              ? (isZh ? '确认选择' : 'Confirm Choice')
              : (isZh ? '知道了' : 'Acknowledge')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Choice Button Component
interface ChoiceButtonProps {
  choice: ClanEventChoice;
  isZh: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({
  choice,
  isZh,
  isSelected,
  onClick,
}) => {
  // Preview effects
  const effectPreviews = useMemo(() => {
    const previews: string[] = [];

    for (const effect of choice.effects) {
      switch (effect.type) {
        case 'affection':
          if (effect.value && effect.value > 0) {
            previews.push(isZh ? `情谊+${effect.value}` : `Affection+${effect.value}`);
          } else if (effect.value && effect.value < 0) {
            previews.push(isZh ? `情谊${effect.value}` : `Affection${effect.value}`);
          }
          break;
        case 'reputation':
          if (effect.value && effect.value > 0) {
            previews.push(isZh ? `声望+${effect.value}` : `Reputation+${effect.value}`);
          }
          break;
        case 'contribution':
          if (effect.value && effect.value > 0) {
            previews.push(isZh ? `贡献+${effect.value}` : `Contribution+${effect.value}`);
          }
          break;
        case 'wudao_points':
          if (effect.value && effect.value > 0) {
            previews.push(isZh ? `悟道+${effect.value}` : `Dao Points+${effect.value}`);
          }
          break;
        case 'atmosphere':
          if (effect.value && effect.value !== 0) {
            previews.push(isZh
              ? (effect.value > 0 ? '宗门氛围趋向激进' : '宗门氛围趋向温和')
              : (effect.value > 0 ? 'Sect becomes more aggressive' : 'Sect becomes more peaceful'));
          }
          break;
        case 'status_change':
          if (effect.value && effect.value > 0) {
            previews.push(isZh ? '身份提升' : 'Status Upgrade');
          }
          break;
      }
    }

    return previews;
  }, [choice.effects, isZh]);

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
        isSelected
          ? 'border-amber-500 bg-amber-900/30'
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
          isSelected ? 'border-amber-500 bg-amber-500' : 'border-gray-600'
        }`}>
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className="text-white font-medium">
            {isZh ? choice.chineseText : choice.text}
          </p>
          {effectPreviews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {effectPreviews.map((preview, index) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-0.5 rounded ${
                    preview.includes('+') || preview.includes('提升') || preview.includes('Upgrade')
                      ? 'bg-green-900/50 text-green-400'
                      : preview.includes('-')
                        ? 'bg-red-900/50 text-red-400'
                        : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {preview}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

import React, { useState, useEffect } from 'react';
import type { StoryNode, ActiveStoryNode, StoryChoice } from '../types/storyline';

interface StoryDialogModalProps {
  node: StoryNode;
  activeState: ActiveStoryNode;
  isZh: boolean;
  onAdvance: () => void;
  onChoice: (choiceId: string) => void;
  onComplete: () => void;
  onClose: () => void;
}

export const StoryDialogModal: React.FC<StoryDialogModalProps> = ({
  node,
  activeState,
  isZh,
  onAdvance,
  onChoice,
  onComplete,
  onClose,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const dialogueIndex = activeState.dialogueIndex || 0;
  const currentDialogue = node.dialogue?.[dialogueIndex];
  const isLastDialogue = node.dialogue && dialogueIndex >= node.dialogue.length - 1;
  const hasChoices = node.choices && node.choices.length > 0;
  const showChoices = isLastDialogue && hasChoices && currentDialogue === undefined;

  // Get emotion-based styling
  const getEmotionStyle = (emotion?: string) => {
    switch (emotion) {
      case 'happy':
        return 'border-l-green-500';
      case 'angry':
        return 'border-l-red-500';
      case 'sad':
        return 'border-l-blue-500';
      case 'surprised':
        return 'border-l-yellow-500';
      case 'serious':
        return 'border-l-purple-500';
      default:
        return 'border-l-amber-500';
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (!showChoices && currentDialogue) {
          handleAdvance();
        }
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showChoices, currentDialogue]);

  const handleAdvance = () => {
    if (isAnimating) return;

    if (!currentDialogue && !showChoices) {
      // No more dialogue and no choices, complete
      onComplete();
      return;
    }

    if (isLastDialogue && !hasChoices) {
      // Last dialogue line and no choices, complete
      onAdvance();
      onComplete();
      return;
    }

    setIsAnimating(true);
    onAdvance();
    setTimeout(() => setIsAnimating(false), 100);
  };

  const handleChoiceSelect = (choice: StoryChoice) => {
    onChoice(choice.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-2xl bg-gray-900 rounded-xl border border-amber-900/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700/50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-amber-400">
            {isZh ? node.chineseName : node.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[200px]">
          {currentDialogue && !showChoices ? (
            <div className={`border-l-4 pl-4 ${getEmotionStyle(currentDialogue.emotion)}`}>
              {/* Speaker */}
              {(currentDialogue.speaker || currentDialogue.chineseSpeaker) && (
                <div className="text-sm text-amber-400 mb-2 font-medium">
                  {isZh ? currentDialogue.chineseSpeaker : currentDialogue.speaker}
                </div>
              )}

              {/* Dialogue Text */}
              <p className="text-white text-lg leading-relaxed">
                {isZh ? currentDialogue.chineseText : currentDialogue.text}
              </p>

              {/* Progress indicator */}
              <div className="mt-4 flex items-center gap-2">
                {node.dialogue?.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i <= dialogueIndex ? 'bg-amber-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : showChoices && node.choices ? (
            <div>
              <h4 className="text-lg font-medium text-amber-400 mb-4">
                {isZh ? '做出你的选择' : 'Make your choice'}
              </h4>
              <div className="space-y-3">
                {node.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoiceSelect(choice)}
                    className="w-full p-4 text-left bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-amber-600 rounded-lg transition-all group"
                  >
                    <p className="text-white group-hover:text-amber-400 transition-colors">
                      {isZh ? choice.chineseText : choice.text}
                    </p>
                    {choice.effects.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {choice.effects.slice(0, 3).map((effect, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded"
                          >
                            {getEffectLabel(effect, isZh)}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">{isZh ? '加载中...' : 'Loading...'}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!showChoices && (
          <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-700/50 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {isZh ? '按 Enter 或点击继续' : 'Press Enter or click to continue'}
            </span>
            <button
              onClick={handleAdvance}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isLastDialogue && !hasChoices
                ? (isZh ? '完成' : 'Complete')
                : (isZh ? '继续' : 'Continue')}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper to get effect label
const getEffectLabel = (effect: { type: string; value?: number | string }, isZh: boolean): string => {
  const value = effect.value;
  switch (effect.type) {
    case 'give_spirit_stones':
      return isZh ? `+${value} 灵石` : `+${value} Spirit Stones`;
    case 'give_contribution':
      return isZh ? `+${value} 贡献` : `+${value} Contribution`;
    case 'give_wudao_points':
      return isZh ? `+${value} 悟道点` : `+${value} Dao Points`;
    case 'give_cultivation':
      return isZh ? `+${value} 修为` : `+${value} Cultivation`;
    case 'change_affinity':
      return isZh ? `亲和 ${Number(value) > 0 ? '+' : ''}${value}` : `Affinity ${Number(value) > 0 ? '+' : ''}${value}`;
    case 'give_item':
      return isZh ? '获得物品' : 'Item';
    default:
      return '';
  }
};

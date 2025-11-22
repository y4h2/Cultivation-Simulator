import React, { useState } from 'react';
import { useLanguage } from '../i18n';
import type { TalentSelectionOption, BreakthroughTalentOption } from '../types/talent';
import {
  getTalentById,
  getRarityColor,
  getTalentTypeColor,
  getScopeName,
} from '../constants/talents';

// ============================================
// Starting Talent Selection Modal
// ============================================

interface TalentSelectionModalProps {
  options: TalentSelectionOption[];
  onSelect: (option: TalentSelectionOption) => void;
  onClose?: () => void;
}

export const TalentSelectionModal: React.FC<TalentSelectionModalProps> = ({
  options,
  onSelect,
  onClose,
}) => {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedIndex !== null && options[selectedIndex]) {
      onSelect(options[selectedIndex]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-amber-900/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-amber-400 text-center">
            {isZh ? '选择你的命运' : 'Choose Your Destiny'}
          </h2>
          <p className="text-sm text-gray-400 text-center mt-2">
            {isZh
              ? '每个命运组合包含一个先天气运和一个后天悟性，部分还有缺陷。'
              : 'Each destiny contains one Innate Talent and one Acquired Insight. Some include a Flaw.'}
          </p>
        </div>

        {/* Options */}
        <div className="p-4 sm:p-6 space-y-4">
          {options.map((option, index) => (
            <DestinyOption
              key={index}
              option={option}
              index={index}
              isSelected={selectedIndex === index}
              isHovered={hoveredIndex === index}
              onSelect={() => setSelectedIndex(index)}
              onHover={() => setHoveredIndex(index)}
              onLeave={() => setHoveredIndex(null)}
              isZh={isZh}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-4 sm:p-6 flex justify-between items-center">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              {isZh ? '取消' : 'Cancel'}
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={selectedIndex === null}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              selectedIndex !== null
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isZh ? '确认选择' : 'Confirm Selection'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Destiny Option Component
interface DestinyOptionProps {
  option: TalentSelectionOption;
  index: number;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
  isZh: boolean;
}

const DestinyOption: React.FC<DestinyOptionProps> = ({
  option,
  index,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onLeave,
  isZh,
}) => {
  const majorTalent = getTalentById(option.majorTalent);
  const minorTalent = getTalentById(option.minorTalent);
  const flawTalent = option.flaw ? getTalentById(option.flaw) : null;

  if (!majorTalent || !minorTalent) return null;

  const destinyNames = isZh
    ? ['天命一', '天命二', '天命三', '天命四', '天命五']
    : ['Destiny I', 'Destiny II', 'Destiny III', 'Destiny IV', 'Destiny V'];

  return (
    <button
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`w-full text-left rounded-xl border-2 transition-all p-4 sm:p-5 ${
        isSelected
          ? 'border-amber-500 bg-amber-900/20'
          : isHovered
          ? 'border-gray-600 bg-gray-800/50'
          : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
      }`}
    >
      {/* Destiny Name */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">
          {destinyNames[index] || `Destiny ${index + 1}`}
        </h3>
        {isSelected && (
          <div className="flex items-center gap-1 text-amber-400 text-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {isZh ? '已选择' : 'Selected'}
          </div>
        )}
      </div>

      {/* Talents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Major Talent */}
        <TalentPreview
          talent={majorTalent}
          label={isZh ? '先天气运' : 'Innate Talent'}
          isZh={isZh}
        />

        {/* Minor Talent */}
        <TalentPreview
          talent={minorTalent}
          label={isZh ? '后天悟性' : 'Acquired Insight'}
          isZh={isZh}
        />

        {/* Flaw (if present) */}
        {flawTalent && (
          <TalentPreview
            talent={flawTalent}
            label={isZh ? '阴影缺陷' : 'Shadow Flaw'}
            isZh={isZh}
          />
        )}
      </div>
    </button>
  );
};

// Talent Preview Component
interface TalentPreviewProps {
  talent: NonNullable<ReturnType<typeof getTalentById>>;
  label: string;
  isZh: boolean;
}

const TalentPreview: React.FC<TalentPreviewProps> = ({ talent, label, isZh }) => {
  const typeColor = getTalentTypeColor(talent.type);
  const rarityColor = getRarityColor(talent.rarity);

  return (
    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
      <div
        className="text-xs font-medium mb-2"
        style={{ color: typeColor }}
      >
        {label}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-white">
          {isZh ? talent.chineseName : talent.name}
        </span>
        <span
          className="text-xs px-1 py-0.5 rounded"
          style={{ backgroundColor: `${rarityColor}20`, color: rarityColor }}
        >
          {talent.rarity.charAt(0).toUpperCase()}
        </span>
      </div>
      <p className="text-xs text-gray-400 line-clamp-2">
        {isZh ? talent.chineseDescription : talent.description}
      </p>
      <div className="flex flex-wrap gap-1 mt-2">
        {talent.scopes.slice(0, 2).map(scope => (
          <span
            key={scope}
            className="text-xs px-1 py-0.5 rounded bg-gray-700/50 text-gray-500"
          >
            {getScopeName(scope, isZh)}
          </span>
        ))}
        {talent.scopes.length > 2 && (
          <span className="text-xs text-gray-500">+{talent.scopes.length - 2}</span>
        )}
      </div>
    </div>
  );
};

// ============================================
// Breakthrough Talent Selection Modal
// ============================================

interface BreakthroughTalentModalProps {
  options: BreakthroughTalentOption[];
  realmName: string;
  onSelect: (talentId: string) => void;
  onSkip?: () => void;
}

export const BreakthroughTalentModal: React.FC<BreakthroughTalentModalProps> = ({
  options,
  realmName,
  onSelect,
  onSkip,
}) => {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedId) {
      onSelect(selectedId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-amber-900/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-amber-400 text-center">
            {isZh ? '突破感悟' : 'Breakthrough Insight'}
          </h2>
          <p className="text-sm text-gray-400 text-center mt-2">
            {isZh
              ? `成功突破到${realmName}！你的经历让你获得了新的领悟。`
              : `Successfully advanced to ${realmName}! Your experiences grant new insight.`}
          </p>
        </div>

        {/* Options */}
        <div className="p-4 sm:p-6 space-y-3">
          {options.map((option) => {
            const talent = getTalentById(option.talentId);
            if (!talent) return null;

            const isSelected = selectedId === option.talentId;
            const rarityColor = getRarityColor(talent.rarity);

            return (
              <button
                key={option.talentId}
                onClick={() => setSelectedId(option.talentId)}
                className={`w-full text-left rounded-lg border-2 transition-all p-4 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">
                        {isZh ? talent.chineseName : talent.name}
                      </span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${rarityColor}20`, color: rarityColor }}
                      >
                        {talent.rarity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      {isZh ? talent.chineseDescription : talent.description}
                    </p>
                    <p className="text-xs text-blue-400 italic">
                      {isZh ? option.chineseReason : option.reason}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-4 sm:p-6 flex justify-between items-center">
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              {isZh ? '暂时跳过' : 'Skip for now'}
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!selectedId}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              selectedId
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isZh ? '获得领悟' : 'Gain Insight'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Fate Change Modal
// ============================================

interface FateChangeModalProps {
  currentTalents: Array<{ id: string; name: string; chineseName: string; type: string }>;
  availableTalents: Array<{ id: string; name: string; chineseName: string; type: string; rarity: string }>;
  cost: number;
  onConfirm: (removeId: string, addId: string) => void;
  onClose: () => void;
}

export const FateChangeModal: React.FC<FateChangeModalProps> = ({
  currentTalents,
  availableTalents,
  cost,
  onConfirm,
  onClose,
}) => {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [removeId, setRemoveId] = useState<string | null>(null);
  const [addId, setAddId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (removeId && addId) {
      onConfirm(removeId, addId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-purple-900/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-purple-400 text-center">
            {isZh ? '改命仪式' : 'Fate Change Ritual'}
          </h2>
          <p className="text-sm text-gray-400 text-center mt-2">
            {isZh
              ? `消耗 ${cost.toLocaleString()} 灵石更换一个天赋。`
              : `Spend ${cost.toLocaleString()} spirit stones to exchange one talent.`}
          </p>
        </div>

        {/* Selection */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Remove Selection */}
          <div>
            <h3 className="text-sm font-semibold text-red-400 mb-3">
              {isZh ? '选择要移除的天赋' : 'Select Talent to Remove'}
            </h3>
            <div className="space-y-2">
              {currentTalents.map((talent) => (
                <button
                  key={talent.id}
                  onClick={() => setRemoveId(talent.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    removeId === talent.id
                      ? 'border-red-500 bg-red-900/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <span className="text-white">
                    {isZh ? talent.chineseName : talent.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Add Selection */}
          <div>
            <h3 className="text-sm font-semibold text-green-400 mb-3">
              {isZh ? '选择要获得的天赋' : 'Select Talent to Gain'}
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableTalents.map((talent) => {
                const rarityColor = getRarityColor(talent.rarity);
                return (
                  <button
                    key={talent.id}
                    onClick={() => setAddId(talent.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      addId === talent.id
                        ? 'border-green-500 bg-green-900/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white">
                        {isZh ? talent.chineseName : talent.name}
                      </span>
                      <span
                        className="text-xs px-1 py-0.5 rounded"
                        style={{ backgroundColor: `${rarityColor}20`, color: rarityColor }}
                      >
                        {talent.rarity.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-4 sm:p-6 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            {isZh ? '取消' : 'Cancel'}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!removeId || !addId}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              removeId && addId
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isZh ? `确认改命 (${cost.toLocaleString()} 灵石)` : `Confirm (${cost.toLocaleString()} Stones)`}
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useLanguage } from '../i18n';
import type { EquipmentInstance } from '../types/equipment';
import {
  getTemplateById,
  getEquipmentDisplayName,
  getRarityColor,
  compareEquipment,
} from '../constants/equipment';

interface EquipmentCompareModalProps {
  current?: EquipmentInstance;
  newItem: EquipmentInstance;
  onEquip: () => void;
  onCancel: () => void;
}

export const EquipmentCompareModal: React.FC<EquipmentCompareModalProps> = ({
  current,
  newItem,
  onEquip,
  onCancel,
}) => {
  const { t, language } = useLanguage();
  const isZh = language === 'zh';

  const currentTemplate = current ? getTemplateById(current.templateId) : null;
  const newTemplate = getTemplateById(newItem.templateId);

  if (!newTemplate) return null;

  const comparisons = compareEquipment(current, newItem);

  const currentName = current ? getEquipmentDisplayName(current, isZh) : t.equipment.emptySlot;
  const newName = getEquipmentDisplayName(newItem, isZh);

  const currentColor = currentTemplate ? getRarityColor(currentTemplate.rarity) : '#9ca3af';
  const newColor = getRarityColor(newTemplate.rarity);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-amber-900/30 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700">
          <h3 className="text-lg font-bold text-amber-400">{t.equipment.compare}</h3>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Equipment Names */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">{t.equipment.currentStats}</div>
              <div
                className="text-sm font-medium truncate"
                style={{ color: currentColor }}
              >
                {currentName}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">{t.equipment.newStats}</div>
              <div
                className="text-sm font-medium truncate"
                style={{ color: newColor }}
              >
                {newName}
              </div>
            </div>
          </div>

          {/* Stats Comparison */}
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
            {comparisons.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-2">
                {t.equipment.noEquipment}
              </div>
            ) : (
              comparisons.map((comparison) => (
                <div key={comparison.stat} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{comparison.statNameZh}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {comparison.current || 0}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                    <span className="text-sm text-gray-200 w-12 text-right">
                      {comparison.new || 0}
                    </span>
                    <span
                      className={`text-sm w-16 text-right ${
                        comparison.diff > 0
                          ? 'text-green-400'
                          : comparison.diff < 0
                          ? 'text-red-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {comparison.diff > 0 ? '+' : ''}{comparison.diff}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="mt-4 text-center">
            {comparisons.filter(c => c.diff > 0).length > comparisons.filter(c => c.diff < 0).length ? (
              <span className="text-sm text-green-400">
                {isZh ? '整体提升' : 'Overall improvement'}
              </span>
            ) : comparisons.filter(c => c.diff < 0).length > comparisons.filter(c => c.diff > 0).length ? (
              <span className="text-sm text-red-400">
                {isZh ? '整体下降' : 'Overall downgrade'}
              </span>
            ) : (
              <span className="text-sm text-gray-400">
                {isZh ? '属性相当' : 'Similar stats'}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-700 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={onEquip}
            className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
          >
            {t.equipment.equip}
          </button>
        </div>
      </div>
    </div>
  );
};

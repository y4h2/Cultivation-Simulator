import React from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';
import { ITEMS, getRarityColor } from '../constants/items';
import { ItemCategory } from '../types/game';

export const InventoryPanel: React.FC = () => {
  const { state } = useGame();
  const { character } = state;
  const { t, language } = useLanguage();

  const CATEGORY_NAMES: Record<typeof ItemCategory[keyof typeof ItemCategory], { zh: string; en: string }> = {
    spirit_material: { zh: '灵材', en: 'Spirit Materials' },
    pill: { zh: '丹药', en: 'Pills' },
    artifact: { zh: '法器', en: 'Artifacts' },
    talisman: { zh: '符箓', en: 'Talismans' },
    misc: { zh: '杂物', en: 'Misc' },
  };

  // Group items by category
  const itemsByCategory = character.inventory.items.reduce((acc, invItem) => {
    const item = ITEMS[invItem.itemId];
    if (item) {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ ...invItem, item });
    }
    return acc;
  }, {} as Record<typeof ItemCategory[keyof typeof ItemCategory], Array<{ itemId: string; quantity: number; item: typeof ITEMS[string] }>>);

  const totalItems = character.inventory.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-amber-400">{t.inventory.title}</h2>
        <span className="text-gray-400 text-sm">
          {totalItems} / {character.inventory.capacity}
        </span>
      </div>

      {character.inventory.items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t.inventory.empty}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(itemsByCategory).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm text-gray-400 mb-2">
                {CATEGORY_NAMES[category as typeof ItemCategory[keyof typeof ItemCategory]][language]}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {items.map(({ itemId, quantity, item }) => (
                  <div
                    key={itemId}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getRarityColor(item.rarity) }}
                      />
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: getRarityColor(item.rarity) }}
                        >
                          {language === 'zh' ? item.chineseName : item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {language === 'zh' ? item.name : item.chineseName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-200 font-medium">x{quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../i18n';
import { ITEMS, getRarityColor } from '../constants/items';
import { getPriceChangePercent, getPriceTrend } from '../utils/market';
import type { MarketItem } from '../types/game';

export const MarketPanel: React.FC = () => {
  const { state, actions } = useGame();
  const { market, character } = state;
  const { t, language } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handleBuy = (itemId: string) => {
    if (quantity > 0) {
      actions.buyItem(itemId, quantity);
      setQuantity(1);
    }
  };

  const handleSell = (itemId: string) => {
    if (quantity > 0) {
      actions.sellItem(itemId, quantity);
      setQuantity(1);
    }
  };

  const getInventoryQuantity = (itemId: string): number => {
    const item = character.inventory.items.find(i => i.itemId === itemId);
    return item?.quantity || 0;
  };

  return (
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-amber-400">{t.market.title}</h2>
        {market.activeEvents.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {market.activeEvents.map((event) => (
              <span
                key={event.id}
                className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-amber-900/50 text-amber-300 text-[10px] sm:text-xs rounded"
              >
                {language === 'zh' ? event.chineseName : event.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-800/50 rounded-lg">
        <span className="text-gray-400 text-sm">{t.market.quantity}:</span>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {[1, 5, 10, 50].map((q) => (
            <button
              key={q}
              onClick={() => setQuantity(q)}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-1 rounded text-xs sm:text-sm min-w-[40px] min-h-[36px] ${
                quantity === q
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {q}
            </button>
          ))}
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 sm:w-20 px-2 py-1.5 sm:py-1 bg-gray-700 rounded text-center text-gray-200 text-sm min-h-[36px]"
          />
        </div>
      </div>

      {/* Market Items */}
      <div className="space-y-2 max-h-[280px] sm:max-h-96 overflow-y-auto pr-1 sm:pr-2">
        {market.items.map((marketItem) => (
          <MarketItemRow
            key={marketItem.itemId}
            marketItem={marketItem}
            inventoryQuantity={getInventoryQuantity(marketItem.itemId)}
            quantity={quantity}
            spiritStones={character.spiritStones}
            isSelected={selectedItem === marketItem.itemId}
            onSelect={() => setSelectedItem(
              selectedItem === marketItem.itemId ? null : marketItem.itemId
            )}
            onBuy={() => handleBuy(marketItem.itemId)}
            onSell={() => handleSell(marketItem.itemId)}
          />
        ))}
      </div>
    </div>
  );
};

interface MarketItemRowProps {
  marketItem: MarketItem;
  inventoryQuantity: number;
  quantity: number;
  spiritStones: number;
  isSelected: boolean;
  onSelect: () => void;
  onBuy: () => void;
  onSell: () => void;
}

const MarketItemRow: React.FC<MarketItemRowProps> = ({
  marketItem,
  inventoryQuantity,
  quantity,
  spiritStones,
  isSelected,
  onSelect,
  onBuy,
  onSell,
}) => {
  const { t, language } = useLanguage();
  const item = ITEMS[marketItem.itemId];
  if (!item) return null;

  const priceChange = getPriceChangePercent(marketItem);
  const trend = getPriceTrend(marketItem);
  const totalCost = Math.round(marketItem.currentPrice * quantity);
  const canAfford = spiritStones >= totalCost && marketItem.liquidity >= quantity;
  const canSell = inventoryQuantity >= quantity;

  return (
    <div
      className={`p-2 sm:p-3 rounded-lg transition-all cursor-pointer ${
        isSelected ? 'bg-gray-800 border border-amber-500/50' : 'bg-gray-800/50 hover:bg-gray-800'
      }`}
      onClick={onSelect}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Item Info */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <span
                className="font-medium text-sm sm:text-base truncate"
                style={{ color: getRarityColor(item.rarity) }}
              >
                {language === 'zh' ? item.chineseName : item.name}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">
                {language === 'zh' ? item.name : item.chineseName}
              </span>
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
              {t.market.inventory}: {inventoryQuantity} | {t.market.marketStock}: {marketItem.liquidity}
            </div>
          </div>
        </div>

        {/* Price Info */}
        <div className="text-left sm:text-right flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-yellow-400 font-medium text-sm sm:text-base">
              {marketItem.currentPrice.toFixed(1)}
            </span>
            <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">{t.header.spiritStones}</span>
            <span
              className={`text-[10px] sm:text-xs ${
                trend === 'up'
                  ? 'text-green-400'
                  : trend === 'down'
                  ? 'text-red-400'
                  : 'text-gray-500'
              }`}
            >
              {trend === 'up' && String.fromCharCode(8593)}
              {trend === 'down' && String.fromCharCode(8595)}
              {priceChange !== 0 && `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(1)}%`}
            </span>
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500">
            {t.market.basePrice}: {marketItem.basePrice}
          </div>
        </div>
      </div>

      {/* Expanded Actions */}
      {isSelected && (
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs sm:text-sm text-gray-400">
            {quantity} x = {totalCost} {t.header.spiritStones}
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuy();
              }}
              disabled={!canAfford}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors min-h-[40px] sm:min-h-0 ${
                canAfford
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t.market.buy}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSell();
              }}
              disabled={!canSell}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors min-h-[40px] sm:min-h-0 ${
                canSell
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t.market.sell}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

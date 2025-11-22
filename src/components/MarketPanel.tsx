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
    <div className="bg-gray-900/70 rounded-xl border border-amber-900/30 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-amber-400">{t.market.title}</h2>
        {market.activeEvents.length > 0 && (
          <div className="flex gap-2">
            {market.activeEvents.map((event) => (
              <span
                key={event.id}
                className="px-2 py-1 bg-amber-900/50 text-amber-300 text-xs rounded"
              >
                {language === 'zh' ? event.chineseName : event.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-gray-800/50 rounded-lg">
        <span className="text-gray-400">{t.market.quantity}:</span>
        <div className="flex items-center gap-2">
          {[1, 5, 10, 50].map((q) => (
            <button
              key={q}
              onClick={() => setQuantity(q)}
              className={`px-3 py-1 rounded text-sm ${
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
            className="w-20 px-2 py-1 bg-gray-700 rounded text-center text-gray-200"
          />
        </div>
      </div>

      {/* Market Items */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
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
      className={`p-3 rounded-lg transition-all cursor-pointer ${
        isSelected ? 'bg-gray-800 border border-amber-500/50' : 'bg-gray-800/50 hover:bg-gray-800'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Item Info */}
          <div>
            <div className="flex items-center gap-2">
              <span
                className="font-medium"
                style={{ color: getRarityColor(item.rarity) }}
              >
                {language === 'zh' ? item.chineseName : item.name}
              </span>
              <span className="text-gray-500 text-sm">
                {language === 'zh' ? item.name : item.chineseName}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {t.market.inventory}: {inventoryQuantity} | {t.market.marketStock}: {marketItem.liquidity}
            </div>
          </div>
        </div>

        {/* Price Info */}
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-medium">
              {marketItem.currentPrice.toFixed(1)}
            </span>
            <span className="text-gray-500 text-sm">{t.header.spiritStones}</span>
            <span
              className={`text-xs ${
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
          <div className="text-xs text-gray-500">
            {t.market.basePrice}: {marketItem.basePrice}
          </div>
        </div>
      </div>

      {/* Expanded Actions */}
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {quantity} x = {totalCost} {t.header.spiritStones}
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuy();
              }}
              disabled={!canAfford}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
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
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
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

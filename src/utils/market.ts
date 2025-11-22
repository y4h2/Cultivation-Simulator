import type { MarketItem, Market, MarketEvent, GameTime } from '../types/game';
import { ITEMS } from '../constants/items';

// Price calculation constants
const MIN_PRICE_RATIO = 0.3;  // Minimum 30% of base price
const MAX_PRICE_RATIO = 3.0;  // Maximum 300% of base price
const TREND_DECAY = 0.95;     // Trend weakens over time

export const createInitialMarket = (): Market => {
  const marketItems: MarketItem[] = [
    // Spirit Materials
    createMarketItem('spirit_grass', 0.3, 100),
    createMarketItem('jade_lotus', 0.4, 30),
    createMarketItem('thunder_root', 0.5, 10),
    createMarketItem('spirit_stone_ore', 0.25, 150),
    createMarketItem('jade_essence', 0.35, 25),
    createMarketItem('demon_core_low', 0.3, 50),
    createMarketItem('demon_core_mid', 0.4, 20),
    // Pills
    createMarketItem('qi_gathering_pill', 0.2, 40),
    createMarketItem('spirit_recovery_pill', 0.2, 40),
    createMarketItem('healing_pill', 0.2, 50),
    // Talismans
    createMarketItem('fire_talisman', 0.25, 60),
    createMarketItem('lightning_talisman', 0.3, 30),
    createMarketItem('shield_talisman', 0.25, 40),
  ];

  return {
    items: marketItems,
    lastUpdate: { ke: 1, day: 1, tenDay: 1, month: 1, year: 1 },
    activeEvents: [],
  };
};

const createMarketItem = (
  itemId: string,
  volatility: number,
  maxLiquidity: number
): MarketItem => {
  const item = ITEMS[itemId];
  if (!item) {
    throw new Error(`Item ${itemId} not found`);
  }

  return {
    itemId,
    currentPrice: item.basePrice,
    basePrice: item.basePrice,
    volatility,
    trend: 0,
    liquidity: maxLiquidity,
    maxLiquidity,
    priceHistory: [item.basePrice],
  };
};

export const updateMarketPrices = (
  market: Market,
  _time: GameTime
): Market => {
  const updatedItems = market.items.map(item => {
    // Calculate random fluctuation based on volatility
    const randomFactor = (Math.random() - 0.5) * 2 * item.volatility;

    // Calculate event factor from active events
    const eventFactor = market.activeEvents.reduce((factor, event) => {
      if (event.affectedItems.includes(item.itemId)) {
        return factor * event.priceModifier;
      }
      return factor;
    }, 1);

    // Update trend (mean reversion)
    const newTrend = item.trend * TREND_DECAY + randomFactor * 0.1;

    // Calculate new price
    let newPrice = item.currentPrice * (1 + randomFactor * 0.1 + newTrend * 0.05) * eventFactor;

    // Clamp price within bounds
    const minPrice = item.basePrice * MIN_PRICE_RATIO;
    const maxPrice = item.basePrice * MAX_PRICE_RATIO;
    newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
    newPrice = Math.round(newPrice * 100) / 100;

    // Update price history (keep last 30 entries)
    const priceHistory = [...item.priceHistory, newPrice].slice(-30);

    // Slowly restore liquidity
    const restoredLiquidity = Math.min(
      item.maxLiquidity,
      item.liquidity + Math.floor(item.maxLiquidity * 0.05)
    );

    return {
      ...item,
      currentPrice: newPrice,
      trend: newTrend,
      priceHistory,
      liquidity: restoredLiquidity,
    };
  });

  // Update active events (reduce duration)
  const updatedEvents = market.activeEvents
    .map(event => ({
      ...event,
      remainingDuration: event.remainingDuration - 1,
    }))
    .filter(event => event.remainingDuration > 0);

  return {
    ...market,
    items: updatedItems,
    activeEvents: updatedEvents,
  };
};

export const buyItem = (
  market: Market,
  itemId: string,
  quantity: number
): { market: Market; totalCost: number; actualQuantity: number } => {
  const itemIndex = market.items.findIndex(i => i.itemId === itemId);
  if (itemIndex === -1) {
    return { market, totalCost: 0, actualQuantity: 0 };
  }

  const marketItem = market.items[itemIndex];
  const actualQuantity = Math.min(quantity, marketItem.liquidity);
  const totalCost = Math.round(marketItem.currentPrice * actualQuantity);

  // Buying pressure increases price and reduces liquidity
  const priceIncrease = (actualQuantity / marketItem.maxLiquidity) * 0.1;
  const newPrice = Math.min(
    marketItem.basePrice * MAX_PRICE_RATIO,
    marketItem.currentPrice * (1 + priceIncrease)
  );

  const updatedItems = [...market.items];
  updatedItems[itemIndex] = {
    ...marketItem,
    currentPrice: Math.round(newPrice * 100) / 100,
    liquidity: marketItem.liquidity - actualQuantity,
    trend: marketItem.trend + priceIncrease * 0.5,
  };

  return {
    market: { ...market, items: updatedItems },
    totalCost,
    actualQuantity,
  };
};

export const sellItem = (
  market: Market,
  itemId: string,
  quantity: number
): { market: Market; totalRevenue: number } => {
  const itemIndex = market.items.findIndex(i => i.itemId === itemId);
  if (itemIndex === -1) {
    return { market, totalRevenue: 0 };
  }

  const marketItem = market.items[itemIndex];

  // Selling price is slightly lower than current price
  const sellPrice = marketItem.currentPrice * 0.9;
  const totalRevenue = Math.round(sellPrice * quantity);

  // Selling pressure decreases price and increases liquidity
  const priceDecrease = (quantity / marketItem.maxLiquidity) * 0.1;
  const newPrice = Math.max(
    marketItem.basePrice * MIN_PRICE_RATIO,
    marketItem.currentPrice * (1 - priceDecrease)
  );

  const updatedItems = [...market.items];
  updatedItems[itemIndex] = {
    ...marketItem,
    currentPrice: Math.round(newPrice * 100) / 100,
    liquidity: Math.min(marketItem.maxLiquidity, marketItem.liquidity + quantity),
    trend: marketItem.trend - priceDecrease * 0.5,
  };

  return {
    market: { ...market, items: updatedItems },
    totalRevenue,
  };
};

export const addMarketEvent = (market: Market, event: MarketEvent): Market => {
  return {
    ...market,
    activeEvents: [...market.activeEvents, event],
  };
};

export const getPriceChangePercent = (item: MarketItem): number => {
  if (item.priceHistory.length < 2) return 0;
  const oldPrice = item.priceHistory[item.priceHistory.length - 2];
  return ((item.currentPrice - oldPrice) / oldPrice) * 100;
};

export const getPriceTrend = (item: MarketItem): 'up' | 'down' | 'stable' => {
  const change = getPriceChangePercent(item);
  if (change > 1) return 'up';
  if (change < -1) return 'down';
  return 'stable';
};

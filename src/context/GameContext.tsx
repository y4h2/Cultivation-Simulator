import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type {
  GameState,
  GameLog,
  GameTime,
  Character,
  Market,
  CombatState,
  ActivityType,
} from '../types/game';
import { createInitialTime, advanceTime, isNewDay } from '../utils/time';
import { createInitialMarket, updateMarketPrices } from '../utils/market';
import {
  createInitialCharacter,
  processCultivation,
  attemptBreakthrough,
  changeActivity,
} from '../utils/cultivation';
import { TIME_CONSTANTS } from '../constants/time';

// Action Types
type GameAction =
  | { type: 'TICK' }
  | { type: 'SET_GAME_SPEED'; payload: number }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'CHANGE_ACTIVITY'; payload: ActivityType }
  | { type: 'ATTEMPT_BREAKTHROUGH' }
  | { type: 'BUY_ITEM'; payload: { itemId: string; quantity: number } }
  | { type: 'SELL_ITEM'; payload: { itemId: string; quantity: number } }
  | { type: 'ADD_LOG'; payload: GameLog }
  | { type: 'UPDATE_CHARACTER'; payload: Partial<Character> }
  | { type: 'UPDATE_MARKET'; payload: Market }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'RESET_GAME' };

// Initial State
const createInitialState = (): GameState => ({
  character: createInitialCharacter('无名修士'),
  time: createInitialTime(),
  market: createInitialMarket(),
  combat: {
    inCombat: false,
    turnOrder: [],
    currentTurn: 0,
    playerInsight: 0,
    combatLog: [],
  },
  logs: [
    {
      timestamp: createInitialTime(),
      message: '你踏上了修仙之路...',
      type: 'system',
    },
  ],
  isPaused: false,
  gameSpeed: 1,
  settings: {
    autoSave: true,
    soundEnabled: false,
    notificationsEnabled: true,
  },
});

// Reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'TICK': {
      if (state.isPaused || state.combat.inCombat) {
        return state;
      }

      const oldTime = state.time;
      const newTime = advanceTime(state.time);

      // Process cultivation
      const { character: updatedCharacter, log: cultivationLog } = processCultivation(
        state.character,
        newTime
      );

      // Update market on new day
      let updatedMarket = state.market;
      if (isNewDay(oldTime, newTime)) {
        updatedMarket = updateMarketPrices(state.market, newTime);
      }

      // Add logs
      const newLogs = [...state.logs];
      if (cultivationLog) {
        newLogs.push(cultivationLog);
      }

      // Keep only last 100 logs
      const trimmedLogs = newLogs.slice(-100);

      return {
        ...state,
        time: newTime,
        character: updatedCharacter,
        market: updatedMarket,
        logs: trimmedLogs,
      };
    }

    case 'SET_GAME_SPEED':
      return {
        ...state,
        gameSpeed: action.payload,
      };

    case 'TOGGLE_PAUSE':
      return {
        ...state,
        isPaused: !state.isPaused,
      };

    case 'CHANGE_ACTIVITY': {
      const { character, log } = changeActivity(
        state.character,
        action.payload,
        state.time
      );
      return {
        ...state,
        character,
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'ATTEMPT_BREAKTHROUGH': {
      const { character, log } = attemptBreakthrough(state.character, state.time);
      return {
        ...state,
        character,
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'BUY_ITEM': {
      const { itemId, quantity } = action.payload;
      const marketItem = state.market.items.find(i => i.itemId === itemId);
      if (!marketItem) return state;

      const actualQuantity = Math.min(quantity, marketItem.liquidity);
      const totalCost = Math.round(marketItem.currentPrice * actualQuantity);

      if (state.character.spiritStones < totalCost || actualQuantity === 0) {
        return state;
      }

      // Update inventory
      const existingItem = state.character.inventory.items.find(i => i.itemId === itemId);
      let newInventoryItems;
      if (existingItem) {
        newInventoryItems = state.character.inventory.items.map(i =>
          i.itemId === itemId ? { ...i, quantity: i.quantity + actualQuantity } : i
        );
      } else {
        newInventoryItems = [
          ...state.character.inventory.items,
          { itemId, quantity: actualQuantity },
        ];
      }

      // Update market
      const updatedMarketItems = state.market.items.map(item => {
        if (item.itemId === itemId) {
          const priceIncrease = (actualQuantity / item.maxLiquidity) * 0.1;
          return {
            ...item,
            currentPrice: Math.round(item.currentPrice * (1 + priceIncrease) * 100) / 100,
            liquidity: item.liquidity - actualQuantity,
            trend: item.trend + priceIncrease * 0.5,
          };
        }
        return item;
      });

      const log: GameLog = {
        timestamp: state.time,
        message: `购买了 ${actualQuantity} 个物品，花费 ${totalCost} 灵石`,
        type: 'market',
      };

      return {
        ...state,
        character: {
          ...state.character,
          spiritStones: state.character.spiritStones - totalCost,
          inventory: {
            ...state.character.inventory,
            items: newInventoryItems,
          },
        },
        market: {
          ...state.market,
          items: updatedMarketItems,
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'SELL_ITEM': {
      const { itemId, quantity } = action.payload;
      const inventoryItem = state.character.inventory.items.find(i => i.itemId === itemId);
      if (!inventoryItem || inventoryItem.quantity < quantity) return state;

      const marketItem = state.market.items.find(i => i.itemId === itemId);
      if (!marketItem) return state;

      const sellPrice = marketItem.currentPrice * 0.9;
      const totalRevenue = Math.round(sellPrice * quantity);

      // Update inventory
      const newInventoryItems = state.character.inventory.items
        .map(i =>
          i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i
        )
        .filter(i => i.quantity > 0);

      // Update market
      const updatedMarketItems = state.market.items.map(item => {
        if (item.itemId === itemId) {
          const priceDecrease = (quantity / item.maxLiquidity) * 0.1;
          return {
            ...item,
            currentPrice: Math.round(item.currentPrice * (1 - priceDecrease) * 100) / 100,
            liquidity: Math.min(item.maxLiquidity, item.liquidity + quantity),
            trend: item.trend - priceDecrease * 0.5,
          };
        }
        return item;
      });

      const log: GameLog = {
        timestamp: state.time,
        message: `出售了 ${quantity} 个物品，获得 ${totalRevenue} 灵石`,
        type: 'market',
      };

      return {
        ...state,
        character: {
          ...state.character,
          spiritStones: state.character.spiritStones + totalRevenue,
          inventory: {
            ...state.character.inventory,
            items: newInventoryItems,
          },
        },
        market: {
          ...state.market,
          items: updatedMarketItems,
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'ADD_LOG':
      return {
        ...state,
        logs: [...state.logs, action.payload].slice(-100),
      };

    case 'UPDATE_CHARACTER':
      return {
        ...state,
        character: {
          ...state.character,
          ...action.payload,
        },
      };

    case 'UPDATE_MARKET':
      return {
        ...state,
        market: action.payload,
      };

    case 'LOAD_GAME':
      return action.payload;

    case 'RESET_GAME':
      return createInitialState();

    default:
      return state;
  }
};

// Context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  actions: {
    tick: () => void;
    setGameSpeed: (speed: number) => void;
    togglePause: () => void;
    changeActivity: (activity: ActivityType) => void;
    attemptBreakthrough: () => void;
    buyItem: (itemId: string, quantity: number) => void;
    sellItem: (itemId: string, quantity: number) => void;
    saveGame: () => void;
    loadGame: () => void;
    resetGame: () => void;
  };
}

const GameContext = createContext<GameContextType | null>(null);

// Provider Component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);
  const tickIntervalRef = useRef<number | null>(null);

  // Game tick effect
  useEffect(() => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
    }

    if (!state.isPaused && !state.combat.inCombat) {
      const tickRate = TIME_CONSTANTS.BASE_TICK_RATE / state.gameSpeed;
      tickIntervalRef.current = window.setInterval(() => {
        dispatch({ type: 'TICK' });
      }, tickRate);
    }

    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, [state.isPaused, state.gameSpeed, state.combat.inCombat]);

  // Auto-save effect
  useEffect(() => {
    if (state.settings.autoSave) {
      const saveInterval = setInterval(() => {
        localStorage.setItem('xiuxian_save', JSON.stringify(state));
      }, 30000); // Save every 30 seconds

      return () => clearInterval(saveInterval);
    }
  }, [state]);

  // Actions
  const actions = {
    tick: useCallback(() => dispatch({ type: 'TICK' }), []),
    setGameSpeed: useCallback((speed: number) => dispatch({ type: 'SET_GAME_SPEED', payload: speed }), []),
    togglePause: useCallback(() => dispatch({ type: 'TOGGLE_PAUSE' }), []),
    changeActivity: useCallback((activity: ActivityType) => dispatch({ type: 'CHANGE_ACTIVITY', payload: activity }), []),
    attemptBreakthrough: useCallback(() => dispatch({ type: 'ATTEMPT_BREAKTHROUGH' }), []),
    buyItem: useCallback((itemId: string, quantity: number) => dispatch({ type: 'BUY_ITEM', payload: { itemId, quantity } }), []),
    sellItem: useCallback((itemId: string, quantity: number) => dispatch({ type: 'SELL_ITEM', payload: { itemId, quantity } }), []),
    saveGame: useCallback(() => {
      localStorage.setItem('xiuxian_save', JSON.stringify(state));
    }, [state]),
    loadGame: useCallback(() => {
      const saved = localStorage.getItem('xiuxian_save');
      if (saved) {
        try {
          const parsedState = JSON.parse(saved) as GameState;
          dispatch({ type: 'LOAD_GAME', payload: parsedState });
        } catch (e) {
          console.error('Failed to load game:', e);
        }
      }
    }, []),
    resetGame: useCallback(() => {
      localStorage.removeItem('xiuxian_save');
      dispatch({ type: 'RESET_GAME' });
    }, []),
  };

  return (
    <GameContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom Hook
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Selector hooks for performance optimization
export const useGameTime = (): GameTime => {
  const { state } = useGame();
  return state.time;
};

export const useCharacter = (): Character => {
  const { state } = useGame();
  return state.character;
};

export const useMarket = (): Market => {
  const { state } = useGame();
  return state.market;
};

export const useCombat = (): CombatState => {
  const { state } = useGame();
  return state.combat;
};

export const useLogs = (): GameLog[] => {
  const { state } = useGame();
  return state.logs;
};

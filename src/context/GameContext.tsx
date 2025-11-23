import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type {
  GameState,
  GameLog,
  GameTime,
  Character,
  Market,
  CombatState,
  ActivityType,
  CombatEnemy,
  CombatLogEntry,
  SpiritBeast,
  TalentSelectionOption,
} from '../types/game';
import type { EquipmentSlot, EquipmentInstance } from '../types/equipment';
import {
  equipItem as equipItemUtil,
  unequipItem as unequipItemUtil,
  addToInventory,
  removeFromInventory,
  getTemplateById,
  getEquipmentDisplayName,
  computeInstanceStats,
} from '../constants/equipment';
import { createInitialTime, advanceTime, isNewDay } from '../utils/time';
import { createInitialMarket, updateMarketPrices } from '../utils/market';
import {
  createInitialCharacter,
  processCultivation,
  attemptBreakthrough,
  changeActivity,
} from '../utils/cultivation';
import { TIME_CONSTANTS } from '../constants/time';
import {
  createPlayerCombatUnit,
  createEnemyCombatUnit,
  calculateTurnOrder,
  getRandomEnemy,
  executeSkill,
  executeObserve,
  executeDefend,
  processTurnEnd,
  processBuffTicks,
  generateLoot,
  executeAI,
  hasEnoughQi,
  consumeQi,
} from '../utils/combat';
import { COMBAT_ITEMS } from '../constants/combat';
import {
  learnSkillNode,
  learnElementNode,
  resetSkillTree,
  resetElementTree,
} from '../utils/skillTree';
import {
  feedBeast,
  trainBeast,
  attemptBeastBreakthrough,
  setActiveBeast,
  updateBeastInCollection,
  addBeastToCollection,
} from '../utils/spiritBeast';
import {
  addTalent,
  removeTalent,
  getTalentById,
  generateBreakthroughOptions,
  generateNewRandomTalents,
} from '../constants/talents';
import {
  createInitialWorldEventState,
  getTriggeredRandomEvents,
  getTimedEvents,
  startEvent,
  tickEvent,
  endEvent,
  getEventById,
  generateEventNews,
  EVENT_CONFIG,
} from '../constants/worldEvents';
import type { IntelSourceType, WorldEventState } from '../types/worldEvent';
import type { SkillTreeType, ElementTreeType } from '../types/game';
import type { ClanActivityType, PeakType } from '../types/clan';
import {
  createInitialClanState,
  executeActivity,
  getActivityById,
  getEventById as getClanEventById,
} from '../constants/clan';
import type { StoryState, StoryEffect } from '../types/storyline';
import {
  createInitialStoryState,
  getNodeById as getStoryNodeById,
  startNode as storyStartNode,
  advanceDialogue as storyAdvanceDialogue,
  makeChoice as storyMakeChoice,
  completeNode as storyCompleteNode,
  completeChapter as storyCompleteChapter,
  checkChapterComplete,
  getAvailableNodes,
  computeEffectResults,
} from '../constants/storyline';

// Helper function to process world event tick (called on new day)
function processWorldEventTick(
  worldEvents: WorldEventState,
  gameTime: GameTime,
  character: Character
): WorldEventState {
  const updatedWorldEvents = { ...worldEvents };

  // Decrease random event cooldown
  if (updatedWorldEvents.randomEventCooldown > 0) {
    updatedWorldEvents.randomEventCooldown -= 1;
  }

  // Tick all active events
  const updatedActiveEvents = updatedWorldEvents.activeEvents.map(activeEvent => {
    const eventDef = getEventById(activeEvent.definitionId);
    if (!eventDef) return activeEvent;

    const result = tickEvent(activeEvent, eventDef);
    if (result.completed) {
      // Record to history
      updatedWorldEvents.eventHistory = [
        ...updatedWorldEvents.eventHistory,
        endEvent(activeEvent, gameTime),
      ];
      // Set cooldown
      if (eventDef.cooldownDays) {
        updatedWorldEvents.eventCooldowns = {
          ...updatedWorldEvents.eventCooldowns,
          [eventDef.id]: eventDef.cooldownDays,
        };
      }
      return null;
    }

    if (result.phaseChanged && result.event && result.event.isDiscovered) {
      const news = generateEventNews(eventDef, result.event, 'sect_notice', gameTime, true);
      updatedWorldEvents.eventNews = [...updatedWorldEvents.eventNews, news];
    }

    return result.event;
  }).filter((e): e is NonNullable<typeof e> => e !== null);

  updatedWorldEvents.activeEvents = updatedActiveEvents;

  // Decrease event cooldowns
  const newCooldowns: Record<string, number> = {};
  for (const eventId of Object.keys(updatedWorldEvents.eventCooldowns)) {
    const cooldown = updatedWorldEvents.eventCooldowns[eventId];
    if (cooldown > 1) {
      newCooldowns[eventId] = cooldown - 1;
    }
  }
  updatedWorldEvents.eventCooldowns = newCooldowns;

  // Check for new random events (only if cooldown is 0)
  if (updatedWorldEvents.randomEventCooldown <= 0) {
    const talentIds = character.talents.majorTalents.map(t => t.talentId)
      .concat(character.talents.minorTalents.map(t => t.talentId));
    const realmIndex = ['qi_refining', 'foundation', 'core_formation', 'nascent_soul',
      'spirit_transformation', 'void_refining', 'body_integration', 'mahayana', 'tribulation']
      .indexOf(character.realm);

    const triggeredEvents = getTriggeredRandomEvents(updatedWorldEvents, gameTime, realmIndex, talentIds);
    for (const eventDef of triggeredEvents) {
      const newEvent = startEvent(eventDef, gameTime);
      updatedWorldEvents.activeEvents = [...updatedWorldEvents.activeEvents, newEvent];
      updatedWorldEvents.randomEventCooldown = EVENT_CONFIG.minEventInterval;

      // Generate initial rumor
      const news = generateEventNews(eventDef, newEvent, 'rumor', gameTime, true);
      updatedWorldEvents.eventNews = [...updatedWorldEvents.eventNews, news];
    }

    // Check for timed events
    const timedEvents = getTimedEvents(updatedWorldEvents, gameTime, realmIndex);
    for (const eventDef of timedEvents) {
      const newEvent = startEvent(eventDef, gameTime);
      newEvent.isDiscovered = true; // Timed events are always discovered
      updatedWorldEvents.activeEvents = [...updatedWorldEvents.activeEvents, newEvent];

      const news = generateEventNews(eventDef, newEvent, 'sect_notice', gameTime, true);
      updatedWorldEvents.eventNews = [...updatedWorldEvents.eventNews, news];
    }
  }

  // Clean up old news
  const maxNewsAge = EVENT_CONFIG.newsRetentionDays;
  updatedWorldEvents.eventNews = updatedWorldEvents.eventNews.filter(news => {
    const daysSinceNews = (gameTime.year - news.timestamp.year) * 365 +
      (gameTime.month - news.timestamp.month) * 30 +
      (gameTime.day - news.timestamp.day);
    return daysSinceNews < maxNewsAge;
  });

  updatedWorldEvents.lastEventCheck = { ...gameTime };

  return updatedWorldEvents;
}

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
  | { type: 'RESET_GAME' }
  // Combat Actions
  | { type: 'START_COMBAT'; payload: { enemy: CombatEnemy } }
  | { type: 'PLAYER_ATTACK'; payload: { skillId: string } }
  | { type: 'PLAYER_DEFEND' }
  | { type: 'PLAYER_OBSERVE' }
  | { type: 'PLAYER_USE_ITEM'; payload: { itemId: string } }
  | { type: 'PLAYER_FLEE' }
  | { type: 'ENEMY_ACTION' }
  | { type: 'END_COMBAT'; payload: { victory: boolean } }
  | { type: 'COLLECT_REWARDS' }
  | { type: 'TRIGGER_RANDOM_ENCOUNTER' }
  // Skill Tree Actions
  | { type: 'LEARN_SKILL_NODE'; payload: { nodeId: string; treeType: 'main' | 'element' } }
  | { type: 'RESET_SKILL_TREE'; payload: { tree: SkillTreeType | ElementTreeType; treeType: 'main' | 'element' } }
  | { type: 'AWARD_SKILL_POINTS'; payload: { amount: number } }
  // Spirit Beast Actions
  | { type: 'CAPTURE_BEAST'; payload: { beast: SpiritBeast } }
  | { type: 'FEED_BEAST'; payload: { beastId: string; feedItemId: string } }
  | { type: 'TRAIN_BEAST'; payload: { beastId: string; intensity: number } }
  | { type: 'SET_ACTIVE_BEAST'; payload: { beastId: string | null } }
  | { type: 'BEAST_BREAKTHROUGH'; payload: { beastId: string } }
  // Talent Actions
  | { type: 'SELECT_STARTING_TALENTS'; payload: TalentSelectionOption }
  | { type: 'SELECT_BREAKTHROUGH_TALENT'; payload: { talentId: string; realm: string } }
  | { type: 'PERFORM_FATE_CHANGE'; payload: { removeId: string; addId: string; cost: number } }
  | { type: 'GENERATE_BREAKTHROUGH_OPTIONS'; payload: { realmName: string } }
  | { type: 'CLEAR_TALENT_OPTIONS' }
  | { type: 'SET_SHOW_TALENT_SELECTION'; payload: boolean }
  | { type: 'REFRESH_TALENTS'; payload: { cost: number } }
  // World Event Actions
  | { type: 'TICK_WORLD_EVENTS' }
  | { type: 'TRIGGER_WORLD_EVENT'; payload: { eventId: string } }
  | { type: 'DISCOVER_EVENT'; payload: { eventId: string; source: IntelSourceType } }
  | { type: 'MARK_NEWS_READ'; payload: { newsId: string } }
  // Clan Actions
  | { type: 'JOIN_CLAN'; payload: { clanName: string; chineseClanName: string } }
  | { type: 'DO_CLAN_ACTIVITY'; payload: { activityId: string; locationId: string; npcId?: string } }
  | { type: 'RESOLVE_CLAN_EVENT'; payload: { eventId: string; choiceId?: string } }
  | { type: 'UPDATE_NPC_RELATIONSHIP'; payload: { npcId: string; affection?: number; trust?: number; respect?: number } }
  | { type: 'TICK_CLAN_DAY' }
  // Equipment Actions
  | { type: 'EQUIP_ITEM'; payload: { instanceId: string } }
  | { type: 'UNEQUIP_ITEM'; payload: { slot: EquipmentSlot } }
  | { type: 'ADD_EQUIPMENT'; payload: { equipment: EquipmentInstance } }
  | { type: 'REMOVE_EQUIPMENT'; payload: { instanceId: string } }
  | { type: 'ENHANCE_EQUIPMENT'; payload: { instanceId: string } }
  // Storyline Actions
  | { type: 'INIT_STORY' }
  | { type: 'START_STORY_NODE'; payload: { nodeId: string } }
  | { type: 'ADVANCE_STORY_DIALOGUE'; payload: { nodeId: string } }
  | { type: 'MAKE_STORY_CHOICE'; payload: { nodeId: string; choiceId: string } }
  | { type: 'COMPLETE_STORY_NODE'; payload: { nodeId: string } }
  | { type: 'CHECK_STORY_CONDITIONS' }
  | { type: 'APPLY_STORY_EFFECTS'; payload: { effects: StoryEffect[] } };

// Initial State
const createInitialState = (): GameState => ({
  character: createInitialCharacter('无名修士'),
  time: createInitialTime(),
  market: createInitialMarket(),
  combat: {
    inCombat: false,
    phase: 'idle',
    round: 0,
    turnOrder: [],
    currentTurnIndex: 0,
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
  // Talent selection UI state - no longer show at start, talents are auto-assigned
  showTalentSelection: false,
  talentSelectionType: null,
  startingTalentOptions: [],
  breakthroughTalentOptions: [],
  breakthroughRealmName: '',
  // World Event System
  worldEvents: createInitialWorldEventState(),
  // Clan/Sect System
  clanState: undefined, // Will be created when joining a clan
  // Storyline/Main Quest System
  storylineState: createInitialStoryState(),
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
      let updatedWorldEvents = state.worldEvents;
      if (isNewDay(oldTime, newTime)) {
        updatedMarket = updateMarketPrices(state.market, newTime);
        // Process world events on new day - inline to avoid dispatch during reducer
        updatedWorldEvents = processWorldEventTick(state.worldEvents, newTime, state.character);
      }

      // Add logs
      const newLogs = [...state.logs];
      if (cultivationLog) {
        newLogs.push(cultivationLog);
      }

      // Keep only last 100 logs
      const trimmedLogs = newLogs.slice(-100);

      // Check for random encounter while traveling (5% chance per tick)
      if (updatedCharacter.currentActivity === 'travel' && Math.random() < 0.05) {
        const enemy = getRandomEnemy(updatedCharacter.realm);
        if (enemy) {
          const playerUnit = createPlayerCombatUnit(updatedCharacter);
          const enemyUnit = createEnemyCombatUnit(enemy);
          const turnOrder = calculateTurnOrder(playerUnit, enemyUnit);

          const encounterLog: GameLog = {
            timestamp: newTime,
            message: `Travel encounter: ${enemy.chineseName}!`,
            type: 'combat',
          };

          const startLog: CombatLogEntry = {
            message: `Combat started! ${enemy.name} appears!`,
            chineseMessage: `Battle begins! ${enemy.chineseName} appears!`,
            type: 'system',
            timestamp: Date.now(),
          };

          const firstTurn = turnOrder[0];
          let readyPlayerUnit = playerUnit;
          let readyEnemyUnit = enemyUnit;
          const combatLogs: CombatLogEntry[] = [startLog];

          if (firstTurn === 'player') {
            const { unit, logs } = processBuffTicks(playerUnit, 'turnStart');
            readyPlayerUnit = unit;
            combatLogs.push(...logs);
          } else {
            const { unit, logs } = processBuffTicks(enemyUnit, 'turnStart');
            readyEnemyUnit = unit;
            combatLogs.push(...logs);
          }

          return {
            ...state,
            time: newTime,
            character: updatedCharacter,
            market: updatedMarket,
            combat: {
              inCombat: true,
              phase: firstTurn === 'player' ? 'player_turn' : 'enemy_turn',
              round: 1,
              playerUnit: readyPlayerUnit,
              enemyUnit: readyEnemyUnit,
              enemy,
              turnOrder,
              currentTurnIndex: 0,
              combatLog: combatLogs,
            },
            logs: [...trimmedLogs, encounterLog].slice(-100),
          };
        }
      }

      return {
        ...state,
        time: newTime,
        character: updatedCharacter,
        market: updatedMarket,
        worldEvents: updatedWorldEvents,
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
      const { character, success, log } = attemptBreakthrough(state.character, state.time);

      // Award skill points on successful breakthrough
      let updatedCharacter = character;
      if (success) {
        const realmIndex = ['qi_refining', 'foundation', 'core_formation', 'nascent_soul',
          'spirit_transformation', 'void_refining', 'body_integration', 'mahayana', 'tribulation']
          .indexOf(character.realm);
        const pointsAwarded = Math.max(2, realmIndex + 1);

        updatedCharacter = {
          ...character,
          skillPoints: {
            ...character.skillPoints,
            wudaoPoints: character.skillPoints.wudaoPoints + pointsAwarded,
            totalPointsEarned: character.skillPoints.totalPointsEarned + pointsAwarded,
          },
        };
      }

      return {
        ...state,
        character: updatedCharacter,
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

    // ========== Combat Actions ==========
    case 'START_COMBAT': {
      const { enemy } = action.payload;
      const playerUnit = createPlayerCombatUnit(state.character);
      const enemyUnit = createEnemyCombatUnit(enemy);
      const turnOrder = calculateTurnOrder(playerUnit, enemyUnit);

      const startLog: CombatLogEntry = {
        message: `Combat started! ${enemy.name} appears!`,
        chineseMessage: `战斗开始！${enemy.chineseName}出现了！`,
        type: 'system',
        timestamp: Date.now(),
      };

      // Process turn start buffs for the first unit
      const firstTurn = turnOrder[0];
      let updatedPlayerUnit = playerUnit;
      let updatedEnemyUnit = enemyUnit;
      const combatLogs: CombatLogEntry[] = [startLog];

      if (firstTurn === 'player') {
        const { unit, logs } = processBuffTicks(playerUnit, 'turnStart');
        updatedPlayerUnit = unit;
        combatLogs.push(...logs);
      } else {
        const { unit, logs } = processBuffTicks(enemyUnit, 'turnStart');
        updatedEnemyUnit = unit;
        combatLogs.push(...logs);
      }

      return {
        ...state,
        combat: {
          inCombat: true,
          phase: firstTurn === 'player' ? 'player_turn' : 'enemy_turn',
          round: 1,
          playerUnit: updatedPlayerUnit,
          enemyUnit: updatedEnemyUnit,
          enemy,
          turnOrder,
          currentTurnIndex: 0,
          combatLog: combatLogs,
        },
      };
    }

    case 'PLAYER_ATTACK': {
      if (!state.combat.playerUnit || !state.combat.enemyUnit || !state.combat.enemy) {
        return state;
      }

      const skill = state.combat.playerUnit.skills.find(s => s.id === action.payload.skillId);
      if (!skill) return state;

      // Check if skill is available
      if (skill.currentCooldown && skill.currentCooldown > 0) return state;
      if (state.combat.playerUnit.combatStats.mp < skill.costMp) return state;

      // Check Qi requirements for ultimate skills
      if (skill.type === 'ultimate' && skill.costQi) {
        if (!hasEnoughQi(state.combat.playerUnit.qiGauge, skill.qiElement, skill.costQi)) {
          return state;
        }
      }

      // Execute skill
      const result = executeSkill(
        state.combat.playerUnit,
        state.combat.enemyUnit,
        skill,
        state.combat.enemy.element
      );

      // Consume Qi for ultimate
      let updatedAttacker = result.attacker;
      if (skill.type === 'ultimate' && skill.costQi) {
        const newQiGauge = consumeQi(updatedAttacker.qiGauge, skill.qiElement, skill.costQi);
        if (newQiGauge) {
          updatedAttacker = { ...updatedAttacker, qiGauge: newQiGauge };
        }
      }

      // Check for victory
      if (result.target.combatStats.hp <= 0) {
        const loot = generateLoot(state.combat.enemy);
        const victoryLog: CombatLogEntry = {
          message: `Victory! ${state.combat.enemy.name} defeated!`,
          chineseMessage: `胜利！${state.combat.enemy.chineseName}被击败了！`,
          type: 'system',
          timestamp: Date.now(),
        };

        return {
          ...state,
          combat: {
            ...state.combat,
            phase: 'victory',
            playerUnit: updatedAttacker,
            enemyUnit: result.target,
            combatLog: [...state.combat.combatLog, ...result.logs, victoryLog],
            rewards: {
              spiritStones: loot.spiritStones,
              items: loot.items,
              cultivationExp: Math.floor(state.combat.enemy.combatStats.maxHp / 5),
            },
          },
        };
      }

      // Process turn end for player
      const { unit: turnEndPlayer, logs: turnEndLogs } = processTurnEnd(updatedAttacker);

      // Move to enemy turn
      const nextTurnIndex = (state.combat.currentTurnIndex + 1) % state.combat.turnOrder.length;
      const isNewRound = nextTurnIndex === 0;

      // Process turn start buffs for enemy
      const { unit: turnStartEnemy, logs: enemyStartLogs } = processBuffTicks(result.target, 'turnStart');

      return {
        ...state,
        combat: {
          ...state.combat,
          phase: 'enemy_turn',
          round: isNewRound ? state.combat.round + 1 : state.combat.round,
          playerUnit: turnEndPlayer,
          enemyUnit: turnStartEnemy,
          currentTurnIndex: nextTurnIndex,
          combatLog: [...state.combat.combatLog, ...result.logs, ...turnEndLogs, ...enemyStartLogs],
        },
      };
    }

    case 'PLAYER_DEFEND': {
      if (!state.combat.playerUnit || !state.combat.enemyUnit) {
        return state;
      }

      const { unit: defendingPlayer, log: defendLog } = executeDefend(state.combat.playerUnit);

      // Process turn end
      const { unit: turnEndPlayer, logs: turnEndLogs } = processTurnEnd(defendingPlayer);

      // Move to enemy turn
      const nextTurnIndex = (state.combat.currentTurnIndex + 1) % state.combat.turnOrder.length;
      const isNewRound = nextTurnIndex === 0;

      // Process turn start buffs for enemy
      const { unit: turnStartEnemy, logs: enemyStartLogs } = processBuffTicks(state.combat.enemyUnit, 'turnStart');

      return {
        ...state,
        combat: {
          ...state.combat,
          phase: 'enemy_turn',
          round: isNewRound ? state.combat.round + 1 : state.combat.round,
          playerUnit: turnEndPlayer,
          enemyUnit: turnStartEnemy,
          currentTurnIndex: nextTurnIndex,
          combatLog: [...state.combat.combatLog, defendLog, ...turnEndLogs, ...enemyStartLogs],
        },
      };
    }

    case 'PLAYER_OBSERVE': {
      if (!state.combat.playerUnit || !state.combat.enemyUnit) {
        return state;
      }

      const { unit: observingPlayer, log: observeLog } = executeObserve(state.combat.playerUnit);

      // Process turn end
      const { unit: turnEndPlayer, logs: turnEndLogs } = processTurnEnd(observingPlayer);

      // Move to enemy turn
      const nextTurnIndex = (state.combat.currentTurnIndex + 1) % state.combat.turnOrder.length;
      const isNewRound = nextTurnIndex === 0;

      // Process turn start buffs for enemy
      const { unit: turnStartEnemy, logs: enemyStartLogs } = processBuffTicks(state.combat.enemyUnit, 'turnStart');

      return {
        ...state,
        combat: {
          ...state.combat,
          phase: 'enemy_turn',
          round: isNewRound ? state.combat.round + 1 : state.combat.round,
          playerUnit: turnEndPlayer,
          enemyUnit: turnStartEnemy,
          currentTurnIndex: nextTurnIndex,
          combatLog: [...state.combat.combatLog, observeLog, ...turnEndLogs, ...enemyStartLogs],
        },
      };
    }

    case 'PLAYER_USE_ITEM': {
      if (!state.combat.playerUnit || !state.combat.enemyUnit) {
        return state;
      }

      const { itemId } = action.payload;
      const inventoryItem = state.character.inventory.items.find(i => i.itemId === itemId);
      if (!inventoryItem || inventoryItem.quantity <= 0) return state;

      const combatItem = COMBAT_ITEMS[itemId];
      if (!combatItem) return state;

      const logs: CombatLogEntry[] = [];
      let updatedPlayer = state.combat.playerUnit;
      let updatedEnemy = state.combat.enemyUnit;

      // Apply item effect
      if (combatItem.type === 'heal') {
        const healBase = combatItem.isPercentage
          ? updatedPlayer.combatStats.maxHp
          : 0;
        const healAmount = combatItem.isPercentage
          ? Math.floor(healBase * combatItem.value / 100)
          : combatItem.value;
        const newHp = Math.min(updatedPlayer.combatStats.maxHp, updatedPlayer.combatStats.hp + healAmount);

        updatedPlayer = {
          ...updatedPlayer,
          combatStats: { ...updatedPlayer.combatStats, hp: newHp },
        };

        logs.push({
          message: `${updatedPlayer.name} uses ${combatItem.name} and heals ${healAmount} HP`,
          chineseMessage: `${updatedPlayer.chineseName}使用${combatItem.chineseName}，恢复了${healAmount}点生命`,
          type: 'heal',
          timestamp: Date.now(),
        });
      } else if (combatItem.type === 'damage') {
        const damage = combatItem.value;
        updatedEnemy = {
          ...updatedEnemy,
          combatStats: { ...updatedEnemy.combatStats, hp: Math.max(0, updatedEnemy.combatStats.hp - damage) },
        };

        logs.push({
          message: `${updatedPlayer.name} uses ${combatItem.name} and deals ${damage} damage`,
          chineseMessage: `${updatedPlayer.chineseName}使用${combatItem.chineseName}，造成了${damage}点伤害`,
          type: 'damage',
          timestamp: Date.now(),
        });
      }

      // Remove item from inventory
      const newInventoryItems = state.character.inventory.items
        .map(i => i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0);

      // Check for victory
      if (updatedEnemy.combatStats.hp <= 0 && state.combat.enemy) {
        const loot = generateLoot(state.combat.enemy);
        logs.push({
          message: `Victory! ${state.combat.enemy.name} defeated!`,
          chineseMessage: `胜利！${state.combat.enemy.chineseName}被击败了！`,
          type: 'system',
          timestamp: Date.now(),
        });

        return {
          ...state,
          character: {
            ...state.character,
            inventory: { ...state.character.inventory, items: newInventoryItems },
          },
          combat: {
            ...state.combat,
            phase: 'victory',
            playerUnit: updatedPlayer,
            enemyUnit: updatedEnemy,
            combatLog: [...state.combat.combatLog, ...logs],
            rewards: {
              spiritStones: loot.spiritStones,
              items: loot.items,
              cultivationExp: Math.floor(state.combat.enemy.combatStats.maxHp / 5),
            },
          },
        };
      }

      // Process turn end for player
      const { unit: turnEndPlayer, logs: turnEndLogs } = processTurnEnd(updatedPlayer);

      // Move to enemy turn
      const nextTurnIndex = (state.combat.currentTurnIndex + 1) % state.combat.turnOrder.length;
      const isNewRound = nextTurnIndex === 0;

      // Process turn start buffs for enemy
      const { unit: turnStartEnemy, logs: enemyStartLogs } = processBuffTicks(updatedEnemy, 'turnStart');

      return {
        ...state,
        character: {
          ...state.character,
          inventory: { ...state.character.inventory, items: newInventoryItems },
        },
        combat: {
          ...state.combat,
          phase: 'enemy_turn',
          round: isNewRound ? state.combat.round + 1 : state.combat.round,
          playerUnit: turnEndPlayer,
          enemyUnit: turnStartEnemy,
          currentTurnIndex: nextTurnIndex,
          combatLog: [...state.combat.combatLog, ...logs, ...turnEndLogs, ...enemyStartLogs],
        },
      };
    }

    case 'PLAYER_FLEE': {
      // 30% base flee chance, modified by speed difference
      const playerSpd = state.combat.playerUnit?.combatStats.spd || 10;
      const enemySpd = state.combat.enemyUnit?.combatStats.spd || 10;
      const speedRatio = playerSpd / enemySpd;
      const fleeChance = Math.min(0.8, 0.3 * speedRatio);

      if (Math.random() < fleeChance) {
        const fleeLog: CombatLogEntry = {
          message: 'You successfully fled from combat!',
          chineseMessage: '你成功逃离了战斗！',
          type: 'system',
          timestamp: Date.now(),
        };

        return {
          ...state,
          combat: {
            ...state.combat,
            phase: 'fled',
            combatLog: [...state.combat.combatLog, fleeLog],
          },
        };
      }

      // Failed to flee, enemy gets a turn
      const failLog: CombatLogEntry = {
        message: 'Failed to flee!',
        chineseMessage: '逃跑失败！',
        type: 'system',
        timestamp: Date.now(),
      };

      return {
        ...state,
        combat: {
          ...state.combat,
          phase: 'enemy_turn',
          combatLog: [...state.combat.combatLog, failLog],
        },
      };
    }

    case 'ENEMY_ACTION': {
      if (!state.combat.playerUnit || !state.combat.enemyUnit || !state.combat.enemy) {
        return state;
      }

      // Execute AI to determine action
      const aiDecision = executeAI(
        state.combat.enemyUnit,
        state.combat.playerUnit,
        state.combat.enemy.aiRules
      );

      const logs: CombatLogEntry[] = [];
      let updatedEnemy = state.combat.enemyUnit;
      let updatedPlayer = state.combat.playerUnit;

      if (aiDecision.action === 'use_skill' && aiDecision.skillId) {
        const skill = updatedEnemy.skills.find(s => s.id === aiDecision.skillId);
        if (skill) {
          const result = executeSkill(updatedEnemy, updatedPlayer, skill);
          updatedEnemy = result.attacker;
          updatedPlayer = result.target;
          logs.push(...result.logs);
        }
      } else if (aiDecision.action === 'defend') {
        const { unit, log } = executeDefend(updatedEnemy);
        updatedEnemy = unit;
        logs.push(log);
      }

      // Check for defeat
      if (updatedPlayer.combatStats.hp <= 0) {
        const defeatLog: CombatLogEntry = {
          message: 'You have been defeated...',
          chineseMessage: '你被击败了...',
          type: 'system',
          timestamp: Date.now(),
        };

        return {
          ...state,
          combat: {
            ...state.combat,
            phase: 'defeat',
            playerUnit: updatedPlayer,
            enemyUnit: updatedEnemy,
            combatLog: [...state.combat.combatLog, ...logs, defeatLog],
          },
        };
      }

      // Process turn end for enemy
      const { unit: turnEndEnemy, logs: turnEndLogs } = processTurnEnd(updatedEnemy);

      // Move to player turn
      const nextTurnIndex = (state.combat.currentTurnIndex + 1) % state.combat.turnOrder.length;
      const isNewRound = nextTurnIndex === 0;

      // Process turn start buffs for player
      const { unit: turnStartPlayer, logs: playerStartLogs } = processBuffTicks(updatedPlayer, 'turnStart');

      return {
        ...state,
        combat: {
          ...state.combat,
          phase: 'player_turn',
          round: isNewRound ? state.combat.round + 1 : state.combat.round,
          playerUnit: turnStartPlayer,
          enemyUnit: turnEndEnemy,
          currentTurnIndex: nextTurnIndex,
          combatLog: [...state.combat.combatLog, ...logs, ...turnEndLogs, ...playerStartLogs],
        },
      };
    }

    case 'END_COMBAT': {
      // Reset combat state
      return {
        ...state,
        combat: {
          inCombat: false,
          phase: 'idle',
          round: 0,
          turnOrder: [],
          currentTurnIndex: 0,
          combatLog: [],
        },
      };
    }

    case 'COLLECT_REWARDS': {
      if (!state.combat.rewards) return state;

      const { spiritStones, items, cultivationExp } = state.combat.rewards;

      // Add spirit stones
      let updatedCharacter = {
        ...state.character,
        spiritStones: state.character.spiritStones + spiritStones,
        cultivationValue: state.character.cultivationValue + cultivationExp,
      };

      // Add items to inventory
      const newInventoryItems = [...updatedCharacter.inventory.items];
      for (const item of items) {
        const existingItem = newInventoryItems.find(i => i.itemId === item.itemId);
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          newInventoryItems.push({ ...item });
        }
      }

      updatedCharacter = {
        ...updatedCharacter,
        inventory: { ...updatedCharacter.inventory, items: newInventoryItems },
      };

      // Sync HP and SP from combat
      if (state.combat.playerUnit) {
        updatedCharacter = {
          ...updatedCharacter,
          stats: {
            ...updatedCharacter.stats,
            hp: state.combat.playerUnit.combatStats.hp,
            spiritualPower: state.combat.playerUnit.combatStats.mp,
          },
        };
      }

      // Chance to award skill points for combat victory
      const isBossKill = state.combat.enemy?.isBoss || false;
      const skillPointChance = isBossKill ? 0.5 : 0.1;
      let skillPointsAwarded = 0;
      if (Math.random() < skillPointChance) {
        skillPointsAwarded = isBossKill ? 2 : 1;
        updatedCharacter = {
          ...updatedCharacter,
          skillPoints: {
            ...updatedCharacter.skillPoints,
            wudaoPoints: updatedCharacter.skillPoints.wudaoPoints + skillPointsAwarded,
            totalPointsEarned: updatedCharacter.skillPoints.totalPointsEarned + skillPointsAwarded,
          },
        };
      }

      const skillPointMsg = skillPointsAwarded > 0
        ? `，${skillPointsAwarded} 悟道点`
        : '';

      const log: GameLog = {
        timestamp: state.time,
        message: `战斗胜利！获得 ${spiritStones} 灵石，${cultivationExp} 修为${skillPointMsg}`,
        type: 'combat',
      };

      return {
        ...state,
        character: updatedCharacter,
        combat: {
          inCombat: false,
          phase: 'idle',
          round: 0,
          turnOrder: [],
          currentTurnIndex: 0,
          combatLog: [],
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'TRIGGER_RANDOM_ENCOUNTER': {
      // Only trigger if traveling
      if (state.character.currentActivity !== 'travel') return state;

      // Random encounter chance (10% per trigger)
      if (Math.random() > 0.1) return state;

      const enemy = getRandomEnemy(state.character.realm);
      if (!enemy) return state;

      // Start combat with random enemy
      const playerUnit = createPlayerCombatUnit(state.character);
      const enemyUnit = createEnemyCombatUnit(enemy);
      const turnOrder = calculateTurnOrder(playerUnit, enemyUnit);

      const encounterLog: GameLog = {
        timestamp: state.time,
        message: `游历中遇到了${enemy.chineseName}！`,
        type: 'combat',
      };

      const startLog: CombatLogEntry = {
        message: `Combat started! ${enemy.name} appears!`,
        chineseMessage: `战斗开始！${enemy.chineseName}出现了！`,
        type: 'system',
        timestamp: Date.now(),
      };

      const firstTurn = turnOrder[0];
      let updatedPlayerUnit = playerUnit;
      let updatedEnemyUnit = enemyUnit;
      const combatLogs: CombatLogEntry[] = [startLog];

      if (firstTurn === 'player') {
        const { unit, logs } = processBuffTicks(playerUnit, 'turnStart');
        updatedPlayerUnit = unit;
        combatLogs.push(...logs);
      } else {
        const { unit, logs } = processBuffTicks(enemyUnit, 'turnStart');
        updatedEnemyUnit = unit;
        combatLogs.push(...logs);
      }

      return {
        ...state,
        combat: {
          inCombat: true,
          phase: firstTurn === 'player' ? 'player_turn' : 'enemy_turn',
          round: 1,
          playerUnit: updatedPlayerUnit,
          enemyUnit: updatedEnemyUnit,
          enemy,
          turnOrder,
          currentTurnIndex: 0,
          combatLog: combatLogs,
        },
        logs: [...state.logs, encounterLog].slice(-100),
      };
    }

    // ========== Skill Tree Actions ==========
    case 'LEARN_SKILL_NODE': {
      const { nodeId, treeType } = action.payload;

      if (treeType === 'main') {
        const result = learnSkillNode(state.character, nodeId);
        if (!result.success) {
          return state;
        }

        const log: GameLog = {
          timestamp: state.time,
          message: result.messageChinese,
          type: 'system',
        };

        return {
          ...state,
          character: result.character,
          logs: [...state.logs, log].slice(-100),
        };
      } else {
        const result = learnElementNode(state.character, nodeId);
        if (!result.success) {
          return state;
        }

        const log: GameLog = {
          timestamp: state.time,
          message: result.messageChinese,
          type: 'system',
        };

        return {
          ...state,
          character: result.character,
          logs: [...state.logs, log].slice(-100),
        };
      }
    }

    case 'RESET_SKILL_TREE': {
      const { tree, treeType } = action.payload;

      let updatedCharacter;
      if (treeType === 'main') {
        updatedCharacter = resetSkillTree(state.character, tree as SkillTreeType);
      } else {
        updatedCharacter = resetElementTree(state.character, tree as ElementTreeType);
      }

      const log: GameLog = {
        timestamp: state.time,
        message: `重置了${tree}技能树`,
        type: 'system',
      };

      return {
        ...state,
        character: updatedCharacter,
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'AWARD_SKILL_POINTS': {
      const { amount } = action.payload;

      return {
        ...state,
        character: {
          ...state.character,
          skillPoints: {
            ...state.character.skillPoints,
            wudaoPoints: state.character.skillPoints.wudaoPoints + amount,
            totalPointsEarned: state.character.skillPoints.totalPointsEarned + amount,
          },
        },
      };
    }

    // ========== Spirit Beast Actions ==========
    case 'CAPTURE_BEAST': {
      const { beast } = action.payload;
      const updatedCollection = addBeastToCollection(state.character.spiritBeasts, beast);

      if (!updatedCollection) {
        // No space
        return state;
      }

      const log: GameLog = {
        timestamp: state.time,
        message: `成功捕获了灵兽！`,
        type: 'event',
      };

      return {
        ...state,
        character: {
          ...state.character,
          spiritBeasts: updatedCollection,
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'FEED_BEAST': {
      const { beastId, feedItemId } = action.payload;
      const beast = state.character.spiritBeasts.beasts.find(b => b.id === beastId);

      if (!beast) return state;

      // Check if player has the feed item
      const inventoryItem = state.character.inventory.items.find(i => i.itemId === feedItemId);
      if (!inventoryItem || inventoryItem.quantity <= 0) return state;

      const result = feedBeast(beast, feedItemId, state.time);
      if (!result) return state;

      // Update inventory
      const newInventoryItems = state.character.inventory.items
        .map(i => i.itemId === feedItemId ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0);

      const updatedCollection = updateBeastInCollection(state.character.spiritBeasts, result.beast);

      let logMessage = `喂养了灵兽，获得${result.expGained}经验，亲密度+${result.affinityGained}`;
      if (result.leveledUp) {
        logMessage += `，升级到${result.newLevel}级！`;
      }
      if (result.newSkills && result.newSkills.length > 0) {
        logMessage += ` 学会了新技能：${result.newSkills.map(s => s.chineseName).join('、')}`;
      }

      const log: GameLog = {
        timestamp: state.time,
        message: logMessage,
        type: 'event',
      };

      return {
        ...state,
        character: {
          ...state.character,
          spiritBeasts: updatedCollection,
          inventory: { ...state.character.inventory, items: newInventoryItems },
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'TRAIN_BEAST': {
      const { beastId, intensity } = action.payload;
      const beast = state.character.spiritBeasts.beasts.find(b => b.id === beastId);

      if (!beast) return state;

      const result = trainBeast(beast, intensity, state.time);
      const updatedCollection = updateBeastInCollection(state.character.spiritBeasts, result.beast);

      let logMessage = `训练了灵兽，获得${result.expGained}经验`;
      if (result.leveledUp) {
        logMessage += `，升级到${result.newLevel}级！`;
      }
      if (result.newSkills && result.newSkills.length > 0) {
        logMessage += ` 学会了新技能：${result.newSkills.map(s => s.chineseName).join('、')}`;
      }

      const log: GameLog = {
        timestamp: state.time,
        message: logMessage,
        type: 'event',
      };

      return {
        ...state,
        character: {
          ...state.character,
          spiritBeasts: updatedCollection,
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'SET_ACTIVE_BEAST': {
      const { beastId } = action.payload;
      const updatedCollection = setActiveBeast(state.character.spiritBeasts, beastId);

      const beast = beastId ? state.character.spiritBeasts.beasts.find(b => b.id === beastId) : null;
      const logMessage = beast
        ? `设置${beast.nickname || '灵兽'}为出战灵兽`
        : `取消了出战灵兽`;

      const log: GameLog = {
        timestamp: state.time,
        message: logMessage,
        type: 'system',
      };

      return {
        ...state,
        character: {
          ...state.character,
          spiritBeasts: updatedCollection,
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'BEAST_BREAKTHROUGH': {
      const { beastId } = action.payload;
      const beast = state.character.spiritBeasts.beasts.find(b => b.id === beastId);

      if (!beast) return state;

      const result = attemptBeastBreakthrough(beast, state.character);

      if (!result.success) {
        const log: GameLog = {
          timestamp: state.time,
          message: result.reasonChinese || '灵兽突破失败',
          type: 'event',
        };

        if (result.beast) {
          const updatedCollection = updateBeastInCollection(state.character.spiritBeasts, result.beast);
          return {
            ...state,
            character: {
              ...state.character,
              spiritBeasts: updatedCollection,
            },
            logs: [...state.logs, log].slice(-100),
          };
        }

        return {
          ...state,
          logs: [...state.logs, log].slice(-100),
        };
      }

      if (!result.beast) return state;

      const updatedCollection = updateBeastInCollection(state.character.spiritBeasts, result.beast);
      const tierNames: Record<string, string> = {
        mortal: '凡兽',
        spirit: '灵兽',
        mystic: '玄兽',
        holy: '圣兽',
      };

      const log: GameLog = {
        timestamp: state.time,
        message: `灵兽突破成功！晋升为${tierNames[result.beast.tier]}`,
        type: 'event',
      };

      return {
        ...state,
        character: {
          ...state.character,
          spiritBeasts: updatedCollection,
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    // ========== Talent Actions ==========
    case 'SELECT_STARTING_TALENTS': {
      const option = action.payload;

      let newTalents = state.character.talents;

      // Add major talent
      newTalents = addTalent(newTalents, option.majorTalent, 'start');

      // Add minor talent
      newTalents = addTalent(newTalents, option.minorTalent, 'start');

      // Add flaw if present
      if (option.flaw) {
        newTalents = addTalent(newTalents, option.flaw, 'start');
      }

      // Get talent names for log
      const majorDef = getTalentById(option.majorTalent);
      const minorDef = getTalentById(option.minorTalent);
      const flawDef = option.flaw ? getTalentById(option.flaw) : null;

      let logMessage = `命运已定！获得天赋：${majorDef?.chineseName || option.majorTalent}、${minorDef?.chineseName || option.minorTalent}`;
      if (flawDef) {
        logMessage += `，同时承受缺陷：${flawDef.chineseName}`;
      }

      const log: GameLog = {
        timestamp: state.time,
        message: logMessage,
        type: 'system',
      };

      return {
        ...state,
        character: {
          ...state.character,
          talents: newTalents,
        },
        showTalentSelection: false,
        talentSelectionType: null,
        startingTalentOptions: [],
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'SELECT_BREAKTHROUGH_TALENT': {
      const { talentId, realm } = action.payload;

      const newTalents = addTalent(state.character.talents, talentId, 'breakthrough', realm);

      const talentDef = getTalentById(talentId);
      const log: GameLog = {
        timestamp: state.time,
        message: `突破感悟！领悟了新天赋：${talentDef?.chineseName || talentId}`,
        type: 'cultivation',
      };

      return {
        ...state,
        character: {
          ...state.character,
          talents: newTalents,
        },
        showTalentSelection: false,
        talentSelectionType: null,
        breakthroughTalentOptions: [],
        breakthroughRealmName: '',
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'PERFORM_FATE_CHANGE': {
      const { removeId, addId, cost } = action.payload;

      // Check if player has enough spirit stones
      if (state.character.spiritStones < cost) return state;

      // Remove old talent and add new one
      let newTalents = removeTalent(state.character.talents, removeId);
      newTalents = addTalent(newTalents, addId, 'fate_change');
      newTalents = {
        ...newTalents,
        fateChangeCount: newTalents.fateChangeCount + 1,
      };

      const removedDef = getTalentById(removeId);
      const addedDef = getTalentById(addId);

      const log: GameLog = {
        timestamp: state.time,
        message: `改命成功！失去：${removedDef?.chineseName || removeId}，获得：${addedDef?.chineseName || addId}`,
        type: 'system',
      };

      return {
        ...state,
        character: {
          ...state.character,
          talents: newTalents,
          spiritStones: state.character.spiritStones - cost,
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'GENERATE_BREAKTHROUGH_OPTIONS': {
      const { realmName } = action.payload;

      const options = generateBreakthroughOptions(
        state.character.talents,
        state.character.behaviorStats,
        3
      );

      return {
        ...state,
        showTalentSelection: true,
        talentSelectionType: 'breakthrough',
        breakthroughTalentOptions: options,
        breakthroughRealmName: realmName,
      };
    }

    case 'CLEAR_TALENT_OPTIONS': {
      return {
        ...state,
        showTalentSelection: false,
        talentSelectionType: null,
        startingTalentOptions: [],
        breakthroughTalentOptions: [],
        breakthroughRealmName: '',
      };
    }

    case 'SET_SHOW_TALENT_SELECTION': {
      return {
        ...state,
        showTalentSelection: action.payload,
      };
    }

    case 'REFRESH_TALENTS': {
      const { cost } = action.payload;

      // Check if player has enough spirit stones
      if (state.character.spiritStones < cost) return state;

      // Generate new random talents
      const newTalents = generateNewRandomTalents();

      // Get talent names for log
      const majorTalent = newTalents.majorTalents[0];
      const minorTalent = newTalents.minorTalents[0];
      const majorDef = majorTalent ? getTalentById(majorTalent.talentId) : null;
      const minorDef = minorTalent ? getTalentById(minorTalent.talentId) : null;

      let logMessage = `刷新天赋成功！消耗 ${cost} 灵石。`;
      if (majorDef && minorDef) {
        logMessage += ` 新天赋：${majorDef.chineseName}、${minorDef.chineseName}`;
      }
      if (newTalents.flaws.length > 0) {
        const flawDef = getTalentById(newTalents.flaws[0].talentId);
        if (flawDef) {
          logMessage += `，缺陷：${flawDef.chineseName}`;
        }
      }

      const log: GameLog = {
        timestamp: state.time,
        message: logMessage,
        type: 'system',
      };

      return {
        ...state,
        character: {
          ...state.character,
          talents: newTalents,
          spiritStones: state.character.spiritStones - cost,
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    // ========== World Event Actions ==========
    case 'TICK_WORLD_EVENTS': {
      const worldEvents = { ...state.worldEvents };
      const newLogs: GameLog[] = [];
      const completedEvents: string[] = [];

      // Decrease random event cooldown
      if (worldEvents.randomEventCooldown > 0) {
        worldEvents.randomEventCooldown -= 1;
      }

      // Tick all active events
      const updatedActiveEvents = worldEvents.activeEvents.map(activeEvent => {
        const eventDef = getEventById(activeEvent.definitionId);
        if (!eventDef) return activeEvent;

        const result = tickEvent(activeEvent, eventDef);
        if (result.completed) {
          completedEvents.push(activeEvent.definitionId);
          // Record to history
          worldEvents.eventHistory.push(endEvent(activeEvent, state.time));
          // Set cooldown
          if (eventDef.cooldownDays) {
            worldEvents.eventCooldowns[eventDef.id] = eventDef.cooldownDays;
          }
          newLogs.push({
            timestamp: state.time,
            message: `${eventDef.chineseName} 已结束`,
            type: 'event',
          });
          return null;
        }

        if (result.phaseChanged && result.event) {
          const phase = eventDef.phases[result.event.currentPhaseIndex];
          // Generate news for phase change
          if (result.event.isDiscovered) {
            const news = generateEventNews(eventDef, result.event, 'sect_notice', state.time, true);
            worldEvents.eventNews.push(news);
          }
          newLogs.push({
            timestamp: state.time,
            message: `${eventDef.chineseName}: ${phase.chineseName}`,
            type: 'event',
          });
        }

        return result.event;
      }).filter((e): e is NonNullable<typeof e> => e !== null);

      worldEvents.activeEvents = updatedActiveEvents;

      // Decrease event cooldowns
      for (const eventId of Object.keys(worldEvents.eventCooldowns)) {
        if (worldEvents.eventCooldowns[eventId] > 0) {
          worldEvents.eventCooldowns[eventId] -= 1;
        }
      }

      // Check for new random events (only if cooldown is 0)
      if (worldEvents.randomEventCooldown <= 0) {
        const talentIds = state.character.talents.majorTalents.map(t => t.talentId)
          .concat(state.character.talents.minorTalents.map(t => t.talentId));
        const realmIndex = ['qi_refining', 'foundation', 'core_formation', 'nascent_soul',
          'spirit_transformation', 'void_refining', 'body_integration', 'mahayana', 'tribulation']
          .indexOf(state.character.realm);

        const triggeredEvents = getTriggeredRandomEvents(worldEvents, state.time, realmIndex, talentIds);
        for (const eventDef of triggeredEvents) {
          const newEvent = startEvent(eventDef, state.time);
          worldEvents.activeEvents.push(newEvent);
          worldEvents.randomEventCooldown = EVENT_CONFIG.minEventInterval;

          // Generate initial rumor
          const news = generateEventNews(eventDef, newEvent, 'rumor', state.time, true);
          worldEvents.eventNews.push(news);

          newLogs.push({
            timestamp: state.time,
            message: `传闻: ${eventDef.chineseName}`,
            type: 'event',
          });
        }

        // Check for timed events
        const timedEvents = getTimedEvents(worldEvents, state.time, realmIndex);
        for (const eventDef of timedEvents) {
          const newEvent = startEvent(eventDef, state.time);
          newEvent.isDiscovered = true; // Timed events are always discovered
          worldEvents.activeEvents.push(newEvent);

          const news = generateEventNews(eventDef, newEvent, 'sect_notice', state.time, true);
          worldEvents.eventNews.push(news);

          newLogs.push({
            timestamp: state.time,
            message: `宗门公告: ${eventDef.chineseName}`,
            type: 'event',
          });
        }
      }

      // Clean up old news
      const maxNewsAge = EVENT_CONFIG.newsRetentionDays;
      worldEvents.eventNews = worldEvents.eventNews.filter(news => {
        const daysSinceNews = (state.time.year - news.timestamp.year) * 365 +
          (state.time.month - news.timestamp.month) * 30 +
          (state.time.day - news.timestamp.day);
        return daysSinceNews < maxNewsAge;
      });

      worldEvents.lastEventCheck = { ...state.time };

      return {
        ...state,
        worldEvents,
        logs: [...state.logs, ...newLogs].slice(-100),
      };
    }

    case 'TRIGGER_WORLD_EVENT': {
      const { eventId } = action.payload;
      const eventDef = getEventById(eventId);
      if (!eventDef) return state;

      // Check if event is already active
      if (state.worldEvents.activeEvents.some(e => e.definitionId === eventId)) {
        return state;
      }

      const newEvent = startEvent(eventDef, state.time);
      const news = generateEventNews(eventDef, newEvent, 'rumor', state.time, true);

      const log: GameLog = {
        timestamp: state.time,
        message: `事件开始: ${eventDef.chineseName}`,
        type: 'event',
      };

      return {
        ...state,
        worldEvents: {
          ...state.worldEvents,
          activeEvents: [...state.worldEvents.activeEvents, newEvent],
          eventNews: [...state.worldEvents.eventNews, news],
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'DISCOVER_EVENT': {
      const { eventId, source } = action.payload;
      const activeEventIndex = state.worldEvents.activeEvents.findIndex(
        e => e.definitionId === eventId
      );

      if (activeEventIndex === -1) return state;

      const activeEvent = state.worldEvents.activeEvents[activeEventIndex];
      if (activeEvent.isDiscovered) return state;

      const updatedEvent = {
        ...activeEvent,
        isDiscovered: true,
        discoverySource: source,
      };

      const eventDef = getEventById(eventId);
      const news = eventDef
        ? generateEventNews(eventDef, updatedEvent, source, state.time, true)
        : null;

      const updatedActiveEvents = [...state.worldEvents.activeEvents];
      updatedActiveEvents[activeEventIndex] = updatedEvent;

      const log: GameLog = {
        timestamp: state.time,
        message: `发现事件: ${eventDef?.chineseName || eventId}`,
        type: 'event',
      };

      return {
        ...state,
        worldEvents: {
          ...state.worldEvents,
          activeEvents: updatedActiveEvents,
          eventNews: news ? [...state.worldEvents.eventNews, news] : state.worldEvents.eventNews,
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'MARK_NEWS_READ': {
      const { newsId } = action.payload;
      const updatedNews = state.worldEvents.eventNews.map(news =>
        news.id === newsId ? { ...news, isRead: true } : news
      );

      return {
        ...state,
        worldEvents: {
          ...state.worldEvents,
          eventNews: updatedNews,
        },
      };
    }

    // ========== Clan Actions ==========
    case 'JOIN_CLAN': {
      const { clanName, chineseClanName } = action.payload;
      const initialClanState = createInitialClanState();

      const log: GameLog = {
        timestamp: state.time,
        message: `加入了${chineseClanName}！`,
        type: 'event',
      };

      return {
        ...state,
        clanState: {
          ...initialClanState,
          clanName,
          chineseClanName,
          founded: true,
          joinedAt: { ...state.time },
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'DO_CLAN_ACTIVITY': {
      if (!state.clanState) return state;

      const { activityId } = action.payload;
      const activity = getActivityById(activityId as ClanActivityType);
      if (!activity) return state;

      const result = executeActivity(activity, state.clanState, state.time);

      // Update clan state
      let updatedClanState = {
        ...state.clanState,
        totalContributions: state.clanState.totalContributions + (result.contributionGained || 0),
        monthlyContributions: state.clanState.monthlyContributions + (result.contributionGained || 0),
        dailyActivitiesCompleted: [...state.clanState.dailyActivitiesCompleted, activityId as ClanActivityType],
      };

      // Update peak reputation if applicable
      if (result.reputationChanges) {
        const updatedPeaks = { ...updatedClanState.peaks };
        for (const [peakId, change] of Object.entries(result.reputationChanges)) {
          if (updatedPeaks[peakId as PeakType]) {
            updatedPeaks[peakId as PeakType] = {
              ...updatedPeaks[peakId as PeakType],
              reputation: Math.max(0, Math.min(100, updatedPeaks[peakId as PeakType].reputation + change)),
            };
          }
        }
        updatedClanState = { ...updatedClanState, peaks: updatedPeaks };
      }

      // Trigger event if any
      if (result.triggeredEventId) {
        updatedClanState = {
          ...updatedClanState,
          activeEvents: [
            ...updatedClanState.activeEvents,
            {
              eventId: result.triggeredEventId,
              startTime: { ...state.time },
              isResolved: false,
            },
          ],
        };
      }

      // Update wudao points if gained
      let updatedCharacter = state.character;
      if (result.wudaoPointsGained) {
        updatedCharacter = {
          ...state.character,
          skillPoints: {
            ...state.character.skillPoints,
            wudaoPoints: state.character.skillPoints.wudaoPoints + result.wudaoPointsGained,
            totalPointsEarned: state.character.skillPoints.totalPointsEarned + result.wudaoPointsGained,
          },
        };
      }

      const log: GameLog = {
        timestamp: state.time,
        message: result.chineseMessage,
        type: 'event',
      };

      return {
        ...state,
        character: updatedCharacter,
        clanState: updatedClanState,
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'RESOLVE_CLAN_EVENT': {
      if (!state.clanState) return state;

      const { eventId, choiceId } = action.payload;
      const eventIndex = state.clanState.activeEvents.findIndex(e => e.eventId === eventId);
      if (eventIndex === -1) return state;

      const activeEvent = state.clanState.activeEvents[eventIndex];
      const eventDef = getClanEventById(eventId);

      // Apply effects based on choice
      let updatedClanState = { ...state.clanState };
      let updatedCharacter = state.character;

      if (eventDef && choiceId) {
        const choice = eventDef.choices?.find(c => c.id === choiceId);
        if (choice) {
          for (const effect of choice.effects) {
            switch (effect.type) {
              case 'affection':
                if (effect.target && effect.value) {
                  const npcIndex = updatedClanState.npcs.findIndex(n => n.id === effect.target);
                  if (npcIndex !== -1) {
                    const updatedNpcs = [...updatedClanState.npcs];
                    updatedNpcs[npcIndex] = {
                      ...updatedNpcs[npcIndex],
                      affection: Math.max(-100, Math.min(100, updatedNpcs[npcIndex].affection + effect.value)),
                    };
                    updatedClanState = { ...updatedClanState, npcs: updatedNpcs };
                  }
                }
                break;
              case 'reputation':
                if (effect.value) {
                  updatedClanState = {
                    ...updatedClanState,
                    clanAffinity: Math.max(0, Math.min(100, updatedClanState.clanAffinity + effect.value)),
                  };
                }
                break;
              case 'contribution':
                if (effect.value) {
                  updatedClanState = {
                    ...updatedClanState,
                    totalContributions: updatedClanState.totalContributions + effect.value,
                  };
                }
                break;
              case 'wudao_points':
                if (effect.value) {
                  updatedCharacter = {
                    ...updatedCharacter,
                    skillPoints: {
                      ...updatedCharacter.skillPoints,
                      wudaoPoints: updatedCharacter.skillPoints.wudaoPoints + effect.value,
                      totalPointsEarned: updatedCharacter.skillPoints.totalPointsEarned + effect.value,
                    },
                  };
                }
                break;
              case 'atmosphere':
                if (effect.value) {
                  updatedClanState = {
                    ...updatedClanState,
                    atmosphere: {
                      ...updatedClanState.atmosphere,
                      methods: Math.max(-100, Math.min(100, updatedClanState.atmosphere.methods + effect.value)),
                    },
                  };
                }
                break;
              case 'flag':
                if (effect.flagKey !== undefined && effect.flagValue !== undefined) {
                  updatedClanState = {
                    ...updatedClanState,
                    storyFlags: {
                      ...updatedClanState.storyFlags,
                      [effect.flagKey]: effect.flagValue,
                    },
                  };
                }
                break;
            }
          }
        }
      }

      // Mark event as resolved
      const updatedActiveEvents = [...updatedClanState.activeEvents];
      updatedActiveEvents[eventIndex] = {
        ...activeEvent,
        isResolved: true,
        selectedChoiceId: choiceId,
      };

      // Add to history
      const eventHistory = [
        ...updatedClanState.eventHistory,
        {
          eventId,
          resolvedAt: { ...state.time },
          choiceId,
        },
      ];

      updatedClanState = {
        ...updatedClanState,
        activeEvents: updatedActiveEvents.filter(e => !e.isResolved),
        eventHistory,
      };

      const log: GameLog = {
        timestamp: state.time,
        message: eventDef ? `处理了事件：${eventDef.chineseName}` : '处理了一个事件',
        type: 'event',
      };

      return {
        ...state,
        character: updatedCharacter,
        clanState: updatedClanState,
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'UPDATE_NPC_RELATIONSHIP': {
      if (!state.clanState) return state;

      const { npcId, affection, trust, respect } = action.payload;
      const npcIndex = state.clanState.npcs.findIndex(n => n.id === npcId);
      if (npcIndex === -1) return state;

      const updatedNpcs = [...state.clanState.npcs];
      updatedNpcs[npcIndex] = {
        ...updatedNpcs[npcIndex],
        affection: affection !== undefined
          ? Math.max(-100, Math.min(100, updatedNpcs[npcIndex].affection + affection))
          : updatedNpcs[npcIndex].affection,
        trust: trust !== undefined
          ? Math.max(0, Math.min(100, updatedNpcs[npcIndex].trust + trust))
          : updatedNpcs[npcIndex].trust,
        respect: respect !== undefined
          ? Math.max(0, Math.min(100, updatedNpcs[npcIndex].respect + respect))
          : updatedNpcs[npcIndex].respect,
      };

      return {
        ...state,
        clanState: {
          ...state.clanState,
          npcs: updatedNpcs,
        },
      };
    }

    case 'TICK_CLAN_DAY': {
      if (!state.clanState) return state;

      // Reset daily activities on new day
      return {
        ...state,
        clanState: {
          ...state.clanState,
          dailyActivitiesCompleted: [],
          lastDayReset: { ...state.time },
        },
      };
    }

    // ========== Equipment Actions ==========
    case 'EQUIP_ITEM': {
      const { instanceId } = action.payload;

      // Find the item in inventory
      const item = state.character.equipment.inventory.find(
        (i) => i.instanceId === instanceId
      );
      if (!item) return state;

      const template = getTemplateById(item.templateId);
      if (!template) return state;

      const { equipment, unequipped } = equipItemUtil(state.character.equipment, item);

      const displayName = getEquipmentDisplayName(item, true);
      const log: GameLog = {
        timestamp: state.time,
        message: unequipped
          ? `装备了${displayName}，替换了原有装备`
          : `装备了${displayName}`,
        type: 'system',
      };

      return {
        ...state,
        character: {
          ...state.character,
          equipment,
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'UNEQUIP_ITEM': {
      const { slot } = action.payload;
      const currentEquipped = state.character.equipment.equipped[slot];

      if (!currentEquipped) return state;

      const newEquipment = unequipItemUtil(state.character.equipment, slot);

      const displayName = getEquipmentDisplayName(currentEquipped, true);
      const log: GameLog = {
        timestamp: state.time,
        message: `卸下了${displayName}`,
        type: 'system',
      };

      return {
        ...state,
        character: {
          ...state.character,
          equipment: newEquipment,
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'ADD_EQUIPMENT': {
      const { equipment: newItem } = action.payload;
      const updatedEquipment = addToInventory(state.character.equipment, newItem);

      if (!updatedEquipment) {
        // Inventory full
        const log: GameLog = {
          timestamp: state.time,
          message: '装备背包已满，无法获得新装备',
          type: 'system',
        };
        return {
          ...state,
          logs: [...state.logs, log].slice(-100),
        };
      }

      const displayName = getEquipmentDisplayName(newItem, true);
      const log: GameLog = {
        timestamp: state.time,
        message: `获得了装备：${displayName}`,
        type: 'system',
      };

      return {
        ...state,
        character: {
          ...state.character,
          equipment: updatedEquipment,
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'REMOVE_EQUIPMENT': {
      const { instanceId } = action.payload;
      const updatedEquipment = removeFromInventory(state.character.equipment, instanceId);

      return {
        ...state,
        character: {
          ...state.character,
          equipment: updatedEquipment,
        },
      };
    }

    case 'ENHANCE_EQUIPMENT': {
      // Enhancement logic - simplified version
      const { instanceId } = action.payload;

      // Find the item (either equipped or in inventory)
      let item: EquipmentInstance | undefined;
      let isEquipped = false;
      let equippedSlot: EquipmentSlot | undefined;

      for (const [slot, equipped] of Object.entries(state.character.equipment.equipped)) {
        if (equipped?.instanceId === instanceId) {
          item = equipped;
          isEquipped = true;
          equippedSlot = slot as EquipmentSlot;
          break;
        }
      }

      if (!item) {
        item = state.character.equipment.inventory.find((i) => i.instanceId === instanceId);
      }

      if (!item) return state;

      const template = getTemplateById(item.templateId);
      if (!template) return state;

      // Check if max level reached
      if (item.enhanceLevel >= (template.maxEnhanceLevel || 10)) {
        return state;
      }

      // Calculate cost
      const baseCost = 100 * template.grade;
      const levelMultiplier = Math.pow(1.5, item.enhanceLevel);
      const cost = Math.floor(baseCost * levelMultiplier);

      if (state.character.spiritStones < cost) return state;

      // Enhance the item
      const enhancedItem: EquipmentInstance = {
        ...item,
        enhanceLevel: item.enhanceLevel + 1,
      };

      // Recompute stats
      enhancedItem.computedStats = computeInstanceStats(enhancedItem);

      // Update equipment state
      let newEquipment = { ...state.character.equipment };

      if (isEquipped && equippedSlot) {
        newEquipment = {
          ...newEquipment,
          equipped: {
            ...newEquipment.equipped,
            [equippedSlot]: enhancedItem,
          },
        };
      } else {
        newEquipment = {
          ...newEquipment,
          inventory: newEquipment.inventory.map((i) =>
            i.instanceId === instanceId ? enhancedItem : i
          ),
        };
      }

      const displayName = getEquipmentDisplayName(enhancedItem, true);
      const log: GameLog = {
        timestamp: state.time,
        message: `强化成功！${displayName}提升至+${enhancedItem.enhanceLevel}`,
        type: 'system',
      };

      return {
        ...state,
        character: {
          ...state.character,
          spiritStones: state.character.spiritStones - cost,
          equipment: newEquipment,
        },
        logs: [...state.logs, log].slice(-100),
      };
    }

    // ========== Storyline Actions ==========
    case 'INIT_STORY': {
      const initialState = createInitialStoryState();

      // Check for immediately available nodes
      const context = {
        character: state.character,
        storyState: initialState,
        clanState: state.clanState,
        worldEvents: state.worldEvents,
        gameTime: state.time,
      };

      const availableNodes = getAvailableNodes(initialState, context);
      const availableNodeIds = availableNodes.map(n => n.id);

      // Auto-start any auto-trigger nodes
      let updatedState: StoryState = {
        ...initialState,
        initialized: true,
        availableNodeIds,
      };

      const autoTriggerNodes = availableNodes.filter(n => n.autoTrigger);
      for (const node of autoTriggerNodes) {
        updatedState = storyStartNode(updatedState, node.id, state.time);
      }

      const log: GameLog = {
        timestamp: state.time,
        message: '踏上修仙之路...',
        type: 'event',
      };

      return {
        ...state,
        storylineState: updatedState,
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'START_STORY_NODE': {
      if (!state.storylineState) return state;

      const { nodeId } = action.payload;
      const node = getStoryNodeById(nodeId);
      if (!node) return state;

      const updatedStoryState = storyStartNode(state.storylineState, nodeId, state.time);

      // Apply onStartEffects
      let updatedCharacter = state.character;
      let updatedClanState = state.clanState;

      if (node.onStartEffects) {
        const effectResults = computeEffectResults(node.onStartEffects);

        // Apply spirit stones
        if (effectResults.spiritStonesChange !== 0) {
          updatedCharacter = {
            ...updatedCharacter,
            spiritStones: updatedCharacter.spiritStones + effectResults.spiritStonesChange,
          };
        }

        // Apply wudao points
        if (effectResults.wudaoPointsChange !== 0) {
          updatedCharacter = {
            ...updatedCharacter,
            skillPoints: {
              ...updatedCharacter.skillPoints,
              wudaoPoints: updatedCharacter.skillPoints.wudaoPoints + effectResults.wudaoPointsChange,
              totalPointsEarned: updatedCharacter.skillPoints.totalPointsEarned + effectResults.wudaoPointsChange,
            },
          };
        }

        // Apply cultivation
        if (effectResults.cultivationChange !== 0) {
          updatedCharacter = {
            ...updatedCharacter,
            cultivationValue: updatedCharacter.cultivationValue + effectResults.cultivationChange,
          };
        }

        // Apply contribution and affinity to clan
        if (updatedClanState && (effectResults.contributionChange !== 0 || effectResults.affinityChange !== 0)) {
          updatedClanState = {
            ...updatedClanState,
            totalContributions: updatedClanState.totalContributions + effectResults.contributionChange,
            clanAffinity: Math.max(0, Math.min(100, updatedClanState.clanAffinity + effectResults.affinityChange)),
          };
        }
      }

      const log: GameLog = {
        timestamp: state.time,
        message: `任务开始: ${node.chineseName}`,
        type: 'event',
      };

      return {
        ...state,
        character: updatedCharacter,
        clanState: updatedClanState,
        storylineState: updatedStoryState,
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'ADVANCE_STORY_DIALOGUE': {
      if (!state.storylineState) return state;

      const { nodeId } = action.payload;
      const updatedStoryState = storyAdvanceDialogue(state.storylineState, nodeId);

      return {
        ...state,
        storylineState: updatedStoryState,
      };
    }

    case 'MAKE_STORY_CHOICE': {
      if (!state.storylineState) return state;

      const { nodeId, choiceId } = action.payload;
      const { state: updatedStoryState, effects } = storyMakeChoice(state.storylineState, nodeId, choiceId);

      // Apply choice effects
      let updatedCharacter = state.character;
      let updatedClanState = state.clanState;

      if (effects.length > 0) {
        const effectResults = computeEffectResults(effects);

        // Apply spirit stones
        if (effectResults.spiritStonesChange !== 0) {
          updatedCharacter = {
            ...updatedCharacter,
            spiritStones: updatedCharacter.spiritStones + effectResults.spiritStonesChange,
          };
        }

        // Apply wudao points
        if (effectResults.wudaoPointsChange !== 0) {
          updatedCharacter = {
            ...updatedCharacter,
            skillPoints: {
              ...updatedCharacter.skillPoints,
              wudaoPoints: updatedCharacter.skillPoints.wudaoPoints + effectResults.wudaoPointsChange,
              totalPointsEarned: updatedCharacter.skillPoints.totalPointsEarned + effectResults.wudaoPointsChange,
            },
          };
        }

        // Apply cultivation
        if (effectResults.cultivationChange !== 0) {
          updatedCharacter = {
            ...updatedCharacter,
            cultivationValue: updatedCharacter.cultivationValue + effectResults.cultivationChange,
          };
        }

        // Apply contribution and affinity to clan
        if (updatedClanState && (effectResults.contributionChange !== 0 || effectResults.affinityChange !== 0)) {
          updatedClanState = {
            ...updatedClanState,
            totalContributions: updatedClanState.totalContributions + effectResults.contributionChange,
            clanAffinity: Math.max(0, Math.min(100, updatedClanState.clanAffinity + effectResults.affinityChange)),
          };
        }

        // Add items to inventory
        const newInventoryItems = [...updatedCharacter.inventory.items];
        for (const item of effectResults.items) {
          const existingItem = newInventoryItems.find(i => i.itemId === item.itemId);
          if (existingItem) {
            existingItem.quantity += item.quantity;
          } else {
            newInventoryItems.push({ ...item });
          }
        }
        updatedCharacter = {
          ...updatedCharacter,
          inventory: { ...updatedCharacter.inventory, items: newInventoryItems },
        };
      }

      const log: GameLog = {
        timestamp: state.time,
        message: '做出了选择',
        type: 'event',
      };

      return {
        ...state,
        character: updatedCharacter,
        clanState: updatedClanState,
        storylineState: updatedStoryState,
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'COMPLETE_STORY_NODE': {
      if (!state.storylineState) return state;

      const { nodeId } = action.payload;
      const node = getStoryNodeById(nodeId);
      if (!node) return state;

      const { state: updatedStoryState, effects } = storyCompleteNode(state.storylineState, nodeId, state.time);

      // Apply completion effects
      let updatedCharacter = state.character;
      let updatedClanState = state.clanState;

      if (effects.length > 0) {
        const effectResults = computeEffectResults(effects);

        // Apply spirit stones
        if (effectResults.spiritStonesChange !== 0) {
          updatedCharacter = {
            ...updatedCharacter,
            spiritStones: updatedCharacter.spiritStones + effectResults.spiritStonesChange,
          };
        }

        // Apply wudao points
        if (effectResults.wudaoPointsChange !== 0) {
          updatedCharacter = {
            ...updatedCharacter,
            skillPoints: {
              ...updatedCharacter.skillPoints,
              wudaoPoints: updatedCharacter.skillPoints.wudaoPoints + effectResults.wudaoPointsChange,
              totalPointsEarned: updatedCharacter.skillPoints.totalPointsEarned + effectResults.wudaoPointsChange,
            },
          };
        }

        // Apply cultivation
        if (effectResults.cultivationChange !== 0) {
          updatedCharacter = {
            ...updatedCharacter,
            cultivationValue: updatedCharacter.cultivationValue + effectResults.cultivationChange,
          };
        }

        // Apply contribution and affinity to clan
        if (updatedClanState && (effectResults.contributionChange !== 0 || effectResults.affinityChange !== 0)) {
          updatedClanState = {
            ...updatedClanState,
            totalContributions: updatedClanState.totalContributions + effectResults.contributionChange,
            clanAffinity: Math.max(0, Math.min(100, updatedClanState.clanAffinity + effectResults.affinityChange)),
          };
        }

        // Add items to inventory
        const newInventoryItems = [...updatedCharacter.inventory.items];
        for (const item of effectResults.items) {
          const existingItem = newInventoryItems.find(i => i.itemId === item.itemId);
          if (existingItem) {
            existingItem.quantity += item.quantity;
          } else {
            newInventoryItems.push({ ...item });
          }
        }
        updatedCharacter = {
          ...updatedCharacter,
          inventory: { ...updatedCharacter.inventory, items: newInventoryItems },
        };

        // Handle join_clan effect
        for (const effect of effects) {
          if (effect.type === 'join_clan' && !updatedClanState?.founded) {
            const clanName = effect.target || 'Azure Cloud Sect';
            const chineseClanName = effect.chineseTarget || '青云宗';
            const initialClanState = createInitialClanState();
            updatedClanState = {
              ...initialClanState,
              clanName,
              chineseClanName,
              founded: true,
              joinedAt: { ...state.time },
            };
          }
        }
      }

      // Check for chapter completion
      let finalStoryState = updatedStoryState;
      if (checkChapterComplete(finalStoryState)) {
        const { state: chapterCompleteState, effects: chapterEffects } = storyCompleteChapter(finalStoryState, state.time);
        finalStoryState = chapterCompleteState;

        if (chapterEffects.length > 0) {
          const chapterResults = computeEffectResults(chapterEffects);

          if (chapterResults.spiritStonesChange !== 0) {
            updatedCharacter = {
              ...updatedCharacter,
              spiritStones: updatedCharacter.spiritStones + chapterResults.spiritStonesChange,
            };
          }

          if (chapterResults.wudaoPointsChange !== 0) {
            updatedCharacter = {
              ...updatedCharacter,
              skillPoints: {
                ...updatedCharacter.skillPoints,
                wudaoPoints: updatedCharacter.skillPoints.wudaoPoints + chapterResults.wudaoPointsChange,
                totalPointsEarned: updatedCharacter.skillPoints.totalPointsEarned + chapterResults.wudaoPointsChange,
              },
            };
          }
        }
      }

      // Re-check available nodes after completion
      const context = {
        character: updatedCharacter,
        storyState: finalStoryState,
        clanState: updatedClanState,
        worldEvents: state.worldEvents,
        gameTime: state.time,
      };

      const availableNodes = getAvailableNodes(finalStoryState, context);
      finalStoryState = {
        ...finalStoryState,
        availableNodeIds: availableNodes.map(n => n.id),
      };

      const log: GameLog = {
        timestamp: state.time,
        message: `任务完成: ${node.chineseName}`,
        type: 'event',
      };

      return {
        ...state,
        character: updatedCharacter,
        clanState: updatedClanState,
        storylineState: finalStoryState,
        logs: [...state.logs, log].slice(-100),
      };
    }

    case 'CHECK_STORY_CONDITIONS': {
      if (!state.storylineState || !state.storylineState.initialized) return state;

      const context = {
        character: state.character,
        storyState: state.storylineState,
        clanState: state.clanState,
        worldEvents: state.worldEvents,
        gameTime: state.time,
      };

      const availableNodes = getAvailableNodes(state.storylineState, context);
      const availableNodeIds = availableNodes.map(n => n.id);

      // Check for new available nodes that weren't available before
      const newAvailable = availableNodeIds.filter(id => !state.storylineState!.availableNodeIds.includes(id));

      // Auto-start any auto-trigger nodes
      let updatedState: StoryState = {
        ...state.storylineState,
        availableNodeIds,
      };

      const autoTriggerNodes = availableNodes.filter(n =>
        n.autoTrigger && !state.storylineState!.activeNodes.some(an => an.nodeId === n.id)
      );

      const logs: GameLog[] = [];

      for (const node of autoTriggerNodes) {
        updatedState = storyStartNode(updatedState, node.id, state.time);
        logs.push({
          timestamp: state.time,
          message: `新任务: ${node.chineseName}`,
          type: 'event',
        });
      }

      // Notify about new available non-auto nodes
      for (const nodeId of newAvailable) {
        const node = getStoryNodeById(nodeId);
        if (node && !node.autoTrigger) {
          updatedState = {
            ...updatedState,
            pendingNotification: nodeId,
          };
          break; // Only one notification at a time
        }
      }

      return {
        ...state,
        storylineState: updatedState,
        logs: [...state.logs, ...logs].slice(-100),
      };
    }

    case 'APPLY_STORY_EFFECTS': {
      const { effects } = action.payload;
      if (effects.length === 0) return state;

      const effectResults = computeEffectResults(effects);
      let updatedCharacter = state.character;
      let updatedClanState = state.clanState;

      if (effectResults.spiritStonesChange !== 0) {
        updatedCharacter = {
          ...updatedCharacter,
          spiritStones: updatedCharacter.spiritStones + effectResults.spiritStonesChange,
        };
      }

      if (effectResults.wudaoPointsChange !== 0) {
        updatedCharacter = {
          ...updatedCharacter,
          skillPoints: {
            ...updatedCharacter.skillPoints,
            wudaoPoints: updatedCharacter.skillPoints.wudaoPoints + effectResults.wudaoPointsChange,
            totalPointsEarned: updatedCharacter.skillPoints.totalPointsEarned + effectResults.wudaoPointsChange,
          },
        };
      }

      if (effectResults.cultivationChange !== 0) {
        updatedCharacter = {
          ...updatedCharacter,
          cultivationValue: updatedCharacter.cultivationValue + effectResults.cultivationChange,
        };
      }

      if (updatedClanState && (effectResults.contributionChange !== 0 || effectResults.affinityChange !== 0)) {
        updatedClanState = {
          ...updatedClanState,
          totalContributions: updatedClanState.totalContributions + effectResults.contributionChange,
          clanAffinity: Math.max(0, Math.min(100, updatedClanState.clanAffinity + effectResults.affinityChange)),
        };
      }

      return {
        ...state,
        character: updatedCharacter,
        clanState: updatedClanState,
      };
    }

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
    // Combat actions
    startCombat: (enemy: CombatEnemy) => void;
    playerAttack: (skillId: string) => void;
    playerDefend: () => void;
    playerObserve: () => void;
    playerUseItem: (itemId: string) => void;
    playerFlee: () => void;
    enemyAction: () => void;
    endCombat: (victory: boolean) => void;
    collectRewards: () => void;
    triggerRandomEncounter: () => void;
    // Skill Tree actions
    learnSkillNode: (nodeId: string, treeType: 'main' | 'element') => void;
    resetSkillTreeAction: (tree: SkillTreeType | ElementTreeType, treeType: 'main' | 'element') => void;
    awardSkillPoints: (amount: number) => void;
    // Spirit Beast actions
    captureBeast: (beast: SpiritBeast) => void;
    feedBeast: (beastId: string, feedItemId: string) => void;
    trainBeast: (beastId: string, intensity: number) => void;
    setActiveBeast: (beastId: string | null) => void;
    beastBreakthrough: (beastId: string) => void;
    // Talent actions
    selectStartingTalents: (option: TalentSelectionOption) => void;
    selectBreakthroughTalent: (talentId: string, realm: string) => void;
    performFateChange: (removeId: string, addId: string, cost: number) => void;
    generateBreakthroughOptions: (realmName: string) => void;
    clearTalentOptions: () => void;
    setShowTalentSelection: (show: boolean) => void;
    refreshTalents: (cost: number) => void;
    // World Event actions
    triggerWorldEvent: (eventId: string) => void;
    discoverEvent: (eventId: string, source: IntelSourceType) => void;
    markNewsRead: (newsId: string) => void;
    // Clan actions
    joinClan: (clanName: string, chineseClanName: string) => void;
    doClanActivity: (activityId: string, locationId: string, npcId?: string) => void;
    resolveClanEvent: (eventId: string, choiceId?: string) => void;
    updateNPCRelationship: (npcId: string, affection?: number, trust?: number, respect?: number) => void;
    // Equipment actions
    equipItem: (instanceId: string) => void;
    unequipItem: (slot: EquipmentSlot) => void;
    addEquipment: (equipment: EquipmentInstance) => void;
    removeEquipment: (instanceId: string) => void;
    enhanceEquipment: (instanceId: string) => void;
    // Storyline actions
    initStory: () => void;
    startStoryNode: (nodeId: string) => void;
    advanceStoryDialogue: (nodeId: string) => void;
    makeStoryChoice: (nodeId: string, choiceId: string) => void;
    completeStoryNode: (nodeId: string) => void;
    checkStoryConditions: () => void;
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
    // Combat actions
    startCombat: useCallback((enemy: CombatEnemy) => dispatch({ type: 'START_COMBAT', payload: { enemy } }), []),
    playerAttack: useCallback((skillId: string) => dispatch({ type: 'PLAYER_ATTACK', payload: { skillId } }), []),
    playerDefend: useCallback(() => dispatch({ type: 'PLAYER_DEFEND' }), []),
    playerObserve: useCallback(() => dispatch({ type: 'PLAYER_OBSERVE' }), []),
    playerUseItem: useCallback((itemId: string) => dispatch({ type: 'PLAYER_USE_ITEM', payload: { itemId } }), []),
    playerFlee: useCallback(() => dispatch({ type: 'PLAYER_FLEE' }), []),
    enemyAction: useCallback(() => dispatch({ type: 'ENEMY_ACTION' }), []),
    endCombat: useCallback((victory: boolean) => dispatch({ type: 'END_COMBAT', payload: { victory } }), []),
    collectRewards: useCallback(() => dispatch({ type: 'COLLECT_REWARDS' }), []),
    triggerRandomEncounter: useCallback(() => dispatch({ type: 'TRIGGER_RANDOM_ENCOUNTER' }), []),
    // Skill Tree actions
    learnSkillNode: useCallback((nodeId: string, treeType: 'main' | 'element') =>
      dispatch({ type: 'LEARN_SKILL_NODE', payload: { nodeId, treeType } }), []),
    resetSkillTreeAction: useCallback((tree: SkillTreeType | ElementTreeType, treeType: 'main' | 'element') =>
      dispatch({ type: 'RESET_SKILL_TREE', payload: { tree, treeType } }), []),
    awardSkillPoints: useCallback((amount: number) =>
      dispatch({ type: 'AWARD_SKILL_POINTS', payload: { amount } }), []),
    // Spirit Beast actions
    captureBeast: useCallback((beast: SpiritBeast) =>
      dispatch({ type: 'CAPTURE_BEAST', payload: { beast } }), []),
    feedBeast: useCallback((beastId: string, feedItemId: string) =>
      dispatch({ type: 'FEED_BEAST', payload: { beastId, feedItemId } }), []),
    trainBeast: useCallback((beastId: string, intensity: number) =>
      dispatch({ type: 'TRAIN_BEAST', payload: { beastId, intensity } }), []),
    setActiveBeast: useCallback((beastId: string | null) =>
      dispatch({ type: 'SET_ACTIVE_BEAST', payload: { beastId } }), []),
    beastBreakthrough: useCallback((beastId: string) =>
      dispatch({ type: 'BEAST_BREAKTHROUGH', payload: { beastId } }), []),
    // Talent actions
    selectStartingTalents: useCallback((option: TalentSelectionOption) =>
      dispatch({ type: 'SELECT_STARTING_TALENTS', payload: option }), []),
    selectBreakthroughTalent: useCallback((talentId: string, realm: string) =>
      dispatch({ type: 'SELECT_BREAKTHROUGH_TALENT', payload: { talentId, realm } }), []),
    performFateChange: useCallback((removeId: string, addId: string, cost: number) =>
      dispatch({ type: 'PERFORM_FATE_CHANGE', payload: { removeId, addId, cost } }), []),
    generateBreakthroughOptions: useCallback((realmName: string) =>
      dispatch({ type: 'GENERATE_BREAKTHROUGH_OPTIONS', payload: { realmName } }), []),
    clearTalentOptions: useCallback(() =>
      dispatch({ type: 'CLEAR_TALENT_OPTIONS' }), []),
    setShowTalentSelection: useCallback((show: boolean) =>
      dispatch({ type: 'SET_SHOW_TALENT_SELECTION', payload: show }), []),
    refreshTalents: useCallback((cost: number) =>
      dispatch({ type: 'REFRESH_TALENTS', payload: { cost } }), []),
    // World Event actions
    triggerWorldEvent: useCallback((eventId: string) =>
      dispatch({ type: 'TRIGGER_WORLD_EVENT', payload: { eventId } }), []),
    discoverEvent: useCallback((eventId: string, source: IntelSourceType) =>
      dispatch({ type: 'DISCOVER_EVENT', payload: { eventId, source } }), []),
    markNewsRead: useCallback((newsId: string) =>
      dispatch({ type: 'MARK_NEWS_READ', payload: { newsId } }), []),
    // Clan actions
    joinClan: useCallback((clanName: string, chineseClanName: string) =>
      dispatch({ type: 'JOIN_CLAN', payload: { clanName, chineseClanName } }), []),
    doClanActivity: useCallback((activityId: string, locationId: string, npcId?: string) =>
      dispatch({ type: 'DO_CLAN_ACTIVITY', payload: { activityId, locationId, npcId } }), []),
    resolveClanEvent: useCallback((eventId: string, choiceId?: string) =>
      dispatch({ type: 'RESOLVE_CLAN_EVENT', payload: { eventId, choiceId } }), []),
    updateNPCRelationship: useCallback((npcId: string, affection?: number, trust?: number, respect?: number) =>
      dispatch({ type: 'UPDATE_NPC_RELATIONSHIP', payload: { npcId, affection, trust, respect } }), []),
    // Equipment actions
    equipItem: useCallback((instanceId: string) =>
      dispatch({ type: 'EQUIP_ITEM', payload: { instanceId } }), []),
    unequipItem: useCallback((slot: EquipmentSlot) =>
      dispatch({ type: 'UNEQUIP_ITEM', payload: { slot } }), []),
    addEquipment: useCallback((equipment: EquipmentInstance) =>
      dispatch({ type: 'ADD_EQUIPMENT', payload: { equipment } }), []),
    removeEquipment: useCallback((instanceId: string) =>
      dispatch({ type: 'REMOVE_EQUIPMENT', payload: { instanceId } }), []),
    enhanceEquipment: useCallback((instanceId: string) =>
      dispatch({ type: 'ENHANCE_EQUIPMENT', payload: { instanceId } }), []),
    // Storyline actions
    initStory: useCallback(() =>
      dispatch({ type: 'INIT_STORY' }), []),
    startStoryNode: useCallback((nodeId: string) =>
      dispatch({ type: 'START_STORY_NODE', payload: { nodeId } }), []),
    advanceStoryDialogue: useCallback((nodeId: string) =>
      dispatch({ type: 'ADVANCE_STORY_DIALOGUE', payload: { nodeId } }), []),
    makeStoryChoice: useCallback((nodeId: string, choiceId: string) =>
      dispatch({ type: 'MAKE_STORY_CHOICE', payload: { nodeId, choiceId } }), []),
    completeStoryNode: useCallback((nodeId: string) =>
      dispatch({ type: 'COMPLETE_STORY_NODE', payload: { nodeId } }), []),
    checkStoryConditions: useCallback(() =>
      dispatch({ type: 'CHECK_STORY_CONDITIONS' }), []),
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

export const useWorldEvents = () => {
  const { state } = useGame();
  return state.worldEvents;
};

export const useClanState = () => {
  const { state } = useGame();
  return state.clanState;
};

export const useEquipment = () => {
  const { state } = useGame();
  return state.character.equipment;
};

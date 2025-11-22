# Talent System Integration TODO

This document lists the integration points that need to be implemented to fully integrate the Talent System with other game systems.

## 1. Combat System Integration

### File: `/src/utils/combat.ts`

#### 1.1 Apply Damage Bonuses
- [ ] In `executeSkill()`, apply talent damage bonuses:
  - `damageBonus` - General damage increase
  - `swordDamageBonus` - Sword skill damage increase (check skill tree type)
  - `beastCombatBonus` - When player has active beast
  - `executeDamageBonus` - When target HP below `executeThreshold`
  - `sameElementDamageBonus` - After consecutive same-element skills

#### 1.2 Apply Defensive Bonuses
- [ ] In damage calculation, apply:
  - `damageReduction` - Reduce incoming damage
  - `critDamageReduction` - Reduce crit damage (first hit only if `firstCritDamageReduction`)
  - `hpBonus` - Increase max HP when creating combat unit
  - `shieldOnLowHpPercent` - Grant shield when HP drops below `lowHpThreshold`

#### 1.3 Apply Qi Bonuses
- [ ] In crit handling, apply:
  - `qiGainBonus` - Extra Qi on critical hit
  - `qiCapBonus` - Increase max Qi capacity

#### 1.4 Apply Combat Exp Bonuses
- [ ] In `generateLoot()` or reward calculation:
  - `combatExpBonus` - Modify cultivation exp from combat
  - `longBattleBonus` - Extra exp for battles lasting 10+ rounds

#### 1.5 Track Combat Stats
- [ ] Increment `behaviorStats.combatCount` after each combat victory

---

## 2. Cultivation System Integration

### File: `/src/utils/cultivation.ts`

#### 2.1 Apply Cultivation Exp Bonuses
- [ ] In `calculateCultivationGain()`:
  - `cultivationExpBonus` - General cultivation bonus
  - `idleExpBonus` - Bonus/penalty during closed-door cultivation
  - Check activity type and apply appropriate bonus

#### 2.2 Apply Breakthrough Bonuses
- [ ] In `attemptBreakthrough()`:
  - `breakthroughBonus` - Increase breakthrough success chance

#### 2.3 Trigger Breakthrough Talent Selection
- [ ] After successful breakthrough (realm change), trigger talent selection:
  - Call `generateBreakthroughOptions(realmName)` action
  - This should be done in GameContext reducer, not in cultivation.ts

#### 2.4 Track Cultivation Stats
- [ ] Increment `behaviorStats.cultivationTicks` during closed-door cultivation

---

## 3. Market System Integration

### File: `/src/utils/market.ts` and `/src/context/GameContext.tsx`

#### 3.1 Apply Price Insight
- [ ] In MarketPanel component:
  - If `priceInsightLevel >= 1`, show price estimate range
  - If `priceInsightLevel >= 2`, show price trend prediction

#### 3.2 Apply Trade Profit Bonus
- [ ] In BUY_ITEM and SELL_ITEM actions:
  - `tradeProfitBonus` - Better buy/sell rates

#### 3.3 Apply Stockpile Combat Bonus
- [ ] Track unique item types in inventory
  - Apply `stockpileCombatBonus` per type (max 5 types = 25%)

#### 3.4 Apply Asset Exp Gain
- [ ] In daily tick (when `isNewDay`):
  - Calculate total assets (spirit stones + inventory value)
  - Grant `assetExpRate` percentage as cultivation exp

#### 3.5 Track Trade Stats
- [ ] Increment `behaviorStats.tradeCount` on buy/sell

---

## 4. Spirit Beast System Integration

### File: `/src/utils/spiritBeast.ts` and `/src/context/GameContext.tsx`

#### 4.1 Apply Capture Rate Bonus
- [ ] In beast capture logic (when implemented):
  - `captureRateBonus` - Increase capture success rate

#### 4.2 Apply Affinity Cap Bonus
- [ ] In affinity calculations:
  - `affinityCapBonus` - Increase max affinity (100 + bonus)

#### 4.3 Apply Beast Encounter Bonus
- [ ] In random encounter logic:
  - `beastEncounterBonus` - Increase beast encounter rate while traveling

#### 4.4 Apply Mood/Training Bonuses
- [ ] In `feedBeast()`:
  - `moodBoostBonus` - Increase mood improvement from feeding
- [ ] In `trainBeast()`:
  - `beastTrainingExpBonus` - Increase training exp

#### 4.5 Track Beast Interaction Stats
- [ ] Increment `behaviorStats.beastInteractions` on feed/train/capture

---

## 5. Skill Tree Integration

### File: `/src/constants/talents.ts` (already partially implemented)

#### 5.1 Apply Skill Tree Tier Bonuses
- [ ] In skill tree UI/unlocking:
  - `skillTreeTierBonus` - Unlock higher tier nodes earlier
  - Example: "Sword Seed" unlocks Tier 2 sword at start

#### 5.2 Apply Element Tier Bonuses
- [ ] In element tree UI/unlocking:
  - `elementTierBonus` - Unlock higher tier element nodes

#### 5.3 Apply Spell Cost Reduction
- [ ] In skill cost calculation:
  - `spellCostReduction` - Reduce MP cost of spells

---

## 6. World Event Integration

### File: `/src/context/GameContext.tsx` (when events are implemented)

#### 6.1 Apply Event Frequency Bonus
- [ ] In random event triggering:
  - `eventFrequencyBonus` - Increase/decrease event rates

#### 6.2 Apply Bad Event Stat Gain
- [ ] After surviving negative events:
  - `badEventStatGain` - Grant permanent stat bonus

#### 6.3 Apply Element Damage by Event
- [ ] In combat during active world events:
  - `elementDamageByEvent` - Bonus damage matching event element

#### 6.4 Track Event Stats
- [ ] Increment `behaviorStats.eventsEncountered` on event completion

---

## 7. UI Integration

### Already Implemented:
- [x] TalentPanel component
- [x] TalentSelectionModal for starting talents
- [x] BreakthroughTalentModal for breakthrough talents
- [x] FateChangeModal for late-game talent changes

### Remaining UI Tasks:
- [ ] Add talent icons/images to make UI more visual
- [ ] Add tooltips with detailed effect descriptions
- [ ] Show active talent effects in combat UI
- [ ] Add talent preview in character creation flow

---

## 8. Save/Load Compatibility

### File: `/src/context/GameContext.tsx`

- [x] Talents are saved as part of character state
- [ ] Add migration for old saves without talent data
- [ ] Ensure `behaviorStats` defaults are applied on load

---

## Implementation Priority

### High Priority (Core Functionality):
1. Combat damage bonuses
2. Cultivation exp bonuses
3. Breakthrough talent selection trigger

### Medium Priority (Enhanced Gameplay):
4. Market bonuses
5. Spirit beast bonuses
6. Skill tree integration

### Low Priority (Polish):
7. World event integration
8. UI enhancements
9. Save migration

---

## Code Examples

### Example: Applying Damage Bonus in Combat

```typescript
// In combat.ts executeSkill function
import { computeTalentBonuses } from '../constants/talents';

function calculateDamage(attacker: CombatUnit, character: Character, baseDamage: number) {
  const bonuses = computeTalentBonuses(character.talents);

  let damage = baseDamage;

  // Apply general damage bonus
  damage *= (1 + bonuses.damageBonus / 100);

  // Apply sword damage bonus if applicable
  if (skill.type === 'sword') {
    damage *= (1 + bonuses.swordDamageBonus / 100);
  }

  // Apply execute bonus
  if (target.combatStats.hp / target.combatStats.maxHp <= bonuses.executeThreshold / 100) {
    damage *= (1 + bonuses.executeDamageBonus / 100);
  }

  return Math.floor(damage);
}
```

### Example: Triggering Breakthrough Talent Selection

```typescript
// In GameContext.tsx ATTEMPT_BREAKTHROUGH case
case 'ATTEMPT_BREAKTHROUGH': {
  const { character, success, log } = attemptBreakthrough(state.character, state.time);

  // ... existing logic ...

  // Trigger talent selection on successful realm advancement
  if (success && character.realmStage === 1) { // New realm
    const realmName = getRealmDisplayName(character.realm, 1);
    // Schedule talent selection
    return {
      ...newState,
      showTalentSelection: true,
      talentSelectionType: 'breakthrough',
      breakthroughTalentOptions: generateBreakthroughOptions(
        character.talents,
        character.behaviorStats,
        3
      ),
      breakthroughRealmName: realmName,
    };
  }

  return newState;
}
```

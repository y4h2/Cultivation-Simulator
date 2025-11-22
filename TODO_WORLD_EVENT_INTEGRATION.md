# World Event System Integration TODO

This document outlines the remaining integration tasks for the World Event System to fully connect with other game systems.

## Completed Tasks

- [x] Type definitions for world events (`/src/types/worldEvent.ts`)
- [x] JSON data file with 8 sample events (`/src/data/worldEvents.json`)
- [x] Constants and helper functions (`/src/constants/worldEvents.ts`)
- [x] WorldEventPanel component (`/src/components/WorldEventPanel.tsx`)
- [x] EventNewsModal component (`/src/components/EventNewsModal.tsx`)
- [x] Updated game types to include worldEvents
- [x] GameContext with world event state management
- [x] i18n translations for Chinese and English
- [x] Tab navigation and App integration

## Pending Integration Tasks

### 1. Market Price Integration

**Location**: `/src/utils/market.ts`

Apply event price modifiers when calculating market prices:

```typescript
import { computeEventModifiers, getPriceModifier } from '../constants/worldEvents';

// In updateMarketPrices or getItemPrice functions:
const eventModifiers = computeEventModifiers(worldEvents.activeEvents);
const priceModifier = getPriceModifier(eventModifiers, item.category);
const finalPrice = basePrice * (1 + priceModifier / 100);
```

### 2. Combat Encounter Integration

**Location**: `/src/utils/combat.ts` or `/src/context/GameContext.tsx`

Apply event encounter rate modifiers:

```typescript
import { computeEventModifiers, getEncounterModifier } from '../constants/worldEvents';

// When checking for random encounters:
const eventModifiers = computeEventModifiers(worldEvents.activeEvents);
const encounterBonus = getEncounterModifier(eventModifiers, 'beasts');
const adjustedEncounterRate = baseRate * (1 + encounterBonus / 100);
```

### 3. Cultivation Efficiency Integration

**Location**: `/src/utils/cultivation.ts`

Apply event cultivation bonuses:

```typescript
import { computeEventModifiers } from '../constants/worldEvents';

// In processCultivation:
const eventModifiers = computeEventModifiers(worldEvents.activeEvents);
const cultivationBonus = eventModifiers.cultivationBonus;
const adjustedExp = baseExp * (1 + cultivationBonus / 100);
```

### 4. Beast Capture Rate Integration

**Location**: `/src/utils/spiritBeast.ts`

Apply event capture rate modifiers:

```typescript
import { computeEventModifiers } from '../constants/worldEvents';

// In capture logic:
const eventModifiers = computeEventModifiers(worldEvents.activeEvents);
const captureBonus = eventModifiers.captureRateBonus;
const adjustedCaptureRate = baseRate * (1 + captureBonus / 100);
```

### 5. Element Damage Integration

**Location**: `/src/utils/combat.ts`

Apply event element damage bonuses in combat:

```typescript
import { computeEventModifiers } from '../constants/worldEvents';

// When calculating skill damage:
const eventModifiers = computeEventModifiers(worldEvents.activeEvents);
const elementBonus = eventModifiers.elementDamageBonus[skill.element] || 0;
const adjustedDamage = baseDamage * (1 + elementBonus / 100);
```

### 6. Item Drop Rate Integration

**Location**: `/src/utils/combat.ts` (in generateLoot)

Apply event drop rate modifiers:

```typescript
import { computeEventModifiers } from '../constants/worldEvents';

// When generating loot:
const eventModifiers = computeEventModifiers(worldEvents.activeEvents);
const dropBonus = eventModifiers.dropRateBonus[item.category] || 0;
const adjustedDropRate = baseDropRate * (1 + dropBonus / 100);
```

### 7. Secret Realm Access

**Location**: New feature to implement

When `unlockedAreas` contains 'secret_realm', allow access to special dungeons:

```typescript
const eventModifiers = computeEventModifiers(worldEvents.activeEvents);
const secretRealmAvailable = eventModifiers.unlockedAreas.includes('secret_realm');
```

### 8. Special Boss Encounters

**Location**: `/src/utils/combat.ts`

When `activeBosses` array is not empty, chance for special boss fights:

```typescript
const eventModifiers = computeEventModifiers(worldEvents.activeEvents);
if (eventModifiers.activeBosses.length > 0) {
  // Chance to spawn event boss instead of regular enemy
}
```

## Additional Features to Implement

### 1. Tianji Oracle Purchase System

Allow players to purchase accurate intel from Tianji Oracle:

- Add UI button to purchase Tianji intel
- Deduct spirit stones
- Set event as discovered with high reliability

### 2. Black Market Intel System

Special policy/ban information available early:

- Add NPC or interface for black market
- Policy events revealed early for a price

### 3. Event Participation Tracking

Track player participation in events:

- Mark events as participated when player engages
- Affect outcome based on player actions
- Record in event history

### 4. Chain Event Triggering

Implement chain events (e.g., boss escape after secret realm):

```typescript
// When event ends, check for chain events
if (eventDef.chainEvents && eventDef.chainEvents.length > 0) {
  // Random chance to trigger chain event
}
```

### 5. Talent-Event Interaction

Events should check for talent effects:

- `disaster_fate` increases negative event probability
- `world_resonance` provides element damage during matching events
- `nature_spirit` increases beast/plant encounter during beast events

### 6. Save/Load Integration

Ensure worldEvents state is properly saved and loaded:

- Already part of GameState, should work automatically
- Test save/load with active events

## Testing Checklist

- [ ] Events trigger correctly on game tick
- [ ] Phase transitions work properly
- [ ] Event effects are calculated correctly
- [ ] News is generated for phase changes
- [ ] Event cooldowns work
- [ ] Timed events trigger on correct months
- [ ] Random events respect probability weights
- [ ] UI displays active events correctly
- [ ] News modal works
- [ ] Market price modifiers apply
- [ ] Combat modifiers apply
- [ ] Cultivation bonuses apply
- [ ] Save/load preserves event state

## Sample Events Reference

| Event ID | Name | Scope | Duration | Key Effects |
|----------|------|-------|----------|-------------|
| evt_north_beast_riot | Northern Beast Riot | Regional | 30 days | Beast encounters +50%, materials +30% price |
| evt_alchemy_competition | Grand Alchemy Competition | Global | 15 days | Herbs +30%, pills +20% price |
| evt_fire_vein_eruption | Fire Vein Eruption | Regional | 20 days | Fire damage +15%, fire materials -20% price |
| evt_secret_realm_opening | Secret Realm Opening | Global | 30 days | Rare drops +50%, boss encounters +30% |
| evt_spirit_field_harvest | Spirit Field Harvest | Minor | 5 days | Herbs -25% price, +50% drop rate |
| evt_merchant_caravan | Merchant Caravan | Minor | 3 days | All items -10% price |
| evt_sect_competition | Annual Sect Competition | Global | 10 days | Combat cultivation +20% |
| evt_beast_tide | Beast Tide | Regional | 15 days | Beast encounters +100%, capture -30% |

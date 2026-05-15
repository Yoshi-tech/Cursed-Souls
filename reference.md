# Cursed-Souls Developer Reference

**Repository:** [Yoshi-tech/Cursed-Souls](https://github.com/Yoshi-tech/Cursed-Souls)

**Last Updated:** 2026-05-15

---

## Project Overview

Cursed-Souls is a **top-down roguelike arena game** where players assume the role of cursed spirits battling mythological demons through endless waves of combat. The game features a unique **corruption mechanic** tied to a perk upgrade system—greed and excessive upgrades corrupt abilities, creating strategic tension between power and risk.

### Core Concept
- **Genre:** Roguelike, Arena Combat, Action
- **Player Role:** Cursed Spirits
- **Enemies:** Mythological Demons
- **Gameplay Loop:** Survive endless waves, collect perks, manage corruption risk

---

## Technology Stack

### Primary Technologies
- **Framework:** [Phaser.js](https://phaser.io/) (v3.x recommended)
  - 2D game engine for web
  - Ideal for top-down arena games
  - Built-in physics, input handling, animations
  
- **Language:** TypeScript (99.1% of codebase)
  - Type-safe game logic
  - Better IDE support and refactoring
  - Easier collaboration and maintenance
  
- **Markup:** HTML (0.9% of codebase)
  - Game canvas container
  - UI scaffolding

### Build & Development Setup
- **Build Tool:** Likely Webpack, Vite, or similar (infer from `package.json`)
- **Type Checking:** TypeScript compiler
- **Development Server:** Local dev environment with live reloading

---

## Game Architecture

### High-Level Components

#### 1. **Game Loop & State Management**
- **Main Scene:** Manages gameplay state (playing, paused, game over)
- **Wave System:** Handles enemy spawning and progression
- **Collision Detection:** Phaser physics for combat interactions
- **Input Handling:** Keyboard/controller input for player movement and attacks

#### 2. **Player Character (Cursed Spirit)**
- **Stats:** Health, damage, attack speed, movement speed
- **Abilities:** Combat moves, special abilities
- **Perk System:** Upgrade mechanism that affects abilities
- **Corruption Tracker:** Tracks greed-induced corruption

#### 3. **Perk/Upgrade System**
- **Perk Types:** Damage buffs, speed boosts, ability enhancements, utility upgrades
- **Greed Mechanic:** Each upgrade increases corruption level
- **Corruption Effects:** 
  - Visual/gameplay degradation of abilities
  - Reduced effectiveness of corrupted abilities
  - Potential gameplay penalties
- **Strategic Decision:** Players must balance power gain vs. corruption risk

#### 4. **Enemy System**
- **Enemy Types:** Various mythological demon archetypes
- **Spawn Waves:** Progressive difficulty scaling
- **AI Behavior:** Pathfinding, attack patterns, special abilities
- **Enemy Loot:** Drops perks/resources on defeat

#### 5. **Combat System**
- **Player Attacks:** Melee/ranged combat mechanics
- **Enemy Attacks:** Incoming damage, attack patterns
- **Physics:** Collision-based damage registration
- **Visual Feedback:** Damage numbers, hit effects, knockback

#### 6. **UI & HUD**
- **Health Display:** Player health bar
- **Wave Counter:** Current wave number
- **Perk UI:** Available perks to select
- **Corruption Meter:** Visual corruption indicator
- **Game Over Screen:** Score, stats, restart option

#### 7. **Persistence (Optional)**
- **High Scores:** Leaderboard/best runs
- **Game Settings:** Audio, difficulty, visual options

---

## Key Mechanics

### Wave System
```
Wave 1 → Defeat enemies → Perk selection → Wave 2 → ...
├─ Wave difficulty scales with progression
├─ Enemy count increases
└─ Perk pool may expand
```

### Corruption Mechanic (Core Innovation)
```
Player upgrades ability
    ↓
Corruption level increases
    ↓
At high corruption:
  - Ability effectiveness reduced
  - Visual distortion/effects applied
  - Gameplay penalties triggered
    ↓
Strategic tension: Do I upgrade again?
```

### Perk Collection & Selection
- Enemies drop perks on defeat
- Player chooses from 3-4 random perks (common roguelike pattern)
- Each perk increases corruption
- Corruption resets per run (or persists—clarify design intent)

---

## Project Structure (Expected)

```
Cursed-Souls/
├── src/
│   ├── main.ts                 # Entry point
│   ├── scenes/
│   │   ├── GameScene.ts        # Main gameplay scene
│   │   ├── MenuScene.ts        # Main menu
│   │   └── GameOverScene.ts    # End game screen
│   ├── entities/
│   │   ├── Player.ts           # Player character class
│   │   ├── Enemy.ts            # Enemy base class
│   │   └── Boss.ts             # Boss enemy variants
│   ├── systems/
│   │   ├── PerkSystem.ts       # Upgrade/perk logic
│   │   ├── CorruptionSystem.ts # Corruption mechanics
│   │   ├── WaveSystem.ts       # Wave spawning & difficulty
│   │   └── CombatSystem.ts     # Damage, collision, effects
│   ├── data/
│   │   ├── perks.ts            # Perk definitions
│   │   ├── enemies.ts          # Enemy configs
│   │   └── balance.ts          # Game balance constants
│   ├── ui/
│   │   ├── HUD.ts              # Heads-up display
│   │   └── PerkSelector.ts     # Perk selection UI
│   └── utils/
│       ├── math.ts             # Math utilities
│       └── config.ts           # Game config constants
├── assets/
│   ├── sprites/                # Character, enemy, item sprites
│   ├── animations/             # Animation data
│   ├── audio/                  # Music, SFX
│   └── fonts/                  # Custom fonts
├── index.html                  # Game canvas container
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
├── webpack.config.js (or vite.config.js)
└── README.md                   # Project overview
```

---

## Development Workflow

### Setup
1. Clone repository
2. Install dependencies: `npm install` or `yarn install`
3. Start dev server: `npm run dev` or `yarn dev`
4. Open `http://localhost:xxxx` in browser

### Building
```bash
npm run build  # Produces optimized game bundle
```

### Workflow Tips
- **Iterative Balance:** Adjust perk power, corruption rates, wave difficulty in `data/balance.ts`
- **Asset Pipeline:** Use sprite sheets for animations; optimize with TexturePacker or similar
- **State Debugging:** Log corruption level, perk selections, and wave progress for testing

---

## Core Systems Deep Dive

### Perk System
**Responsibility:** Manage player upgrades, apply stat bonuses, track corruption

**Key Functions:**
- `applyPerk(perk: Perk)` — Apply perk effects to player
- `getAvailablePerks()` — Generate 3-4 random perks for selection
- `calculateCorruptionIncrease(perk)` — Determine corruption added per perk

**Perk Data Structure:**
```typescript
interface Perk {
  id: string;
  name: string;
  description: string;
  effect: (player: Player) => void;
  corruptionCost: number;
  icon: string;
}
```

### Corruption System
**Responsibility:** Track and apply corruption effects

**Mechanics:**
- Tracks cumulative corruption level (0–100 or similar scale)
- At thresholds (25%, 50%, 75%, 100%), apply visual/gameplay effects
- Affects ability effectiveness: `effectivenessFactor = 1 - (corruptionLevel * 0.01)`

**Effects at Corruption Milestones:**
- **25%:** Slight visual distortion on player sprite
- **50%:** Ability cooldowns increase, damage slightly reduced
- **75%:** Enemies gain buffs, player movement speed reduced
- **100%:** Catastrophic corruption—extreme penalties or game over

### Wave System
**Responsibility:** Spawn enemies, manage difficulty progression

**Parameters:**
- `enemiesPerWave` — Scales with wave number
- `enemyHealthMultiplier` — Enemy HP increases per wave
- `difficultyMultiplier` — Overall difficulty scalar
- `perkDropChance` — Probability of perk drops per enemy

**Example Progression:**
```
Wave 1:  3 enemies, 1x health, 1x difficulty
Wave 2:  5 enemies, 1.2x health, 1.1x difficulty
Wave 3:  7 enemies, 1.4x health, 1.2x difficulty
Wave 10: 21 enemies, 2.7x health, 1.9x difficulty
```

### Combat System
**Responsibility:** Handle attacks, damage, hit registration

**Key Components:**
- **Collision Detection:** Phaser.Physics.Arcade for overlap checks
- **Damage Calculation:** `damage = baseDamage * (1 - corruptionFactor) * modifier`
- **Visual Feedback:** Floating damage numbers, hit flash, knockback
- **Status Effects:** Stun, slow, poison (if applicable)

---

## Extending the Game

### Adding a New Perk
1. Define perk in `data/perks.ts`:
   ```typescript
   const fireStrikePerk: Perk = {
     id: 'fire-strike',
     name: 'Fire Strike',
     description: 'Attacks inflict burn damage',
     effect: (player) => { player.attackDamage *= 1.25; },
     corruptionCost: 15,
     icon: 'fire-strike-icon'
   };
   ```
2. Add to perk pool in `systems/PerkSystem.ts`
3. Implement ability visual effect (if special)

### Adding a New Enemy Type
1. Create enemy class extending base `Enemy.ts`
2. Define in `data/enemies.ts` with stats and behavior
3. Register in `systems/WaveSystem.ts` spawn pool
4. Add sprite asset

### Tuning Difficulty
- Adjust `DIFFICULTY_CURVE` in `data/balance.ts`
- Tweak `CORRUPTION_MULTIPLIER` to make corruption progress faster/slower
- Modify `PERK_POOL_SIZE` for more/fewer upgrade choices

### Adding New Scenes
1. Create scene class extending `Phaser.Scene`
2. Implement `preload()`, `create()`, `update()`
3. Register in main config

---

## Performance Considerations

### Optimization Tips
- **Object Pooling:** Reuse bullet/effect objects instead of creating/destroying
- **Culling:** Only update/render sprites visible on screen
- **Physics Optimization:** Use simplified collision shapes for enemies
- **Asset Compression:** Minimize sprite/audio file sizes

### Profiling
- Use browser DevTools performance tab to identify bottlenecks
- Monitor frame rate at high enemy counts (stress test)
- Watch for memory leaks in long play sessions

---

## Common Pitfalls & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Game feels slow/sluggish | Too many enemies or physics checks | Reduce enemy count, use simpler collision shapes, profile |
| Corruption resets unexpectedly | Design ambiguity | Clarify: does corruption reset per run or persist? Update logic accordingly |
| Perks feel unbalanced | Power creep or underpowered options | Use `data/balance.ts` to centralize perk stats; A/B test |
| UI doesn't display correctly | Canvas scaling issues | Ensure Phaser config matches screen dimensions |
| Enemy AI behavior is erratic | Pathfinding conflicts or timer overlap | Use state machines for AI; separate pathfinding from attack logic |

---

## Testing Strategy

### Manual Testing
- **Wave Progression:** Play through 10+ waves; verify difficulty ramps smoothly
- **Corruption Mechanic:** Collect many perks; confirm corruption effects trigger at thresholds
- **Edge Cases:** Play with 0 perks, max corruption, minimum health
- **Performance:** Run on low-end devices; verify playable at 60 FPS (or target framerate)

### Unit Testing (Optional)
- Test perk application logic
- Test corruption calculation
- Test wave difficulty scaling

---

## Design References & Inspiration

### Similar Games (Mechanics Reference)
- **Vampire Survivors:** Endless waves, auto-leveling system, screen-filling enemies
- **Hades:** Roguelike progression, corruption/meta mechanic (Damnation), perk selection
- **Nuclear Throne:** Top-down combat, mutation system (similar to corruption)

### Roguelike Design Pillars
1. **Replayability:** Random perk selection, procedural difficulty
2. **Progression Pacing:** Clear milestone (wave count) and power increase (perks)
3. **Strategic Depth:** Corruption risk vs. reward trade-off
4. **Accessibility:** Clear feedback, visual indicators for game state

---

## Resources & Documentation

### External Links
- [Phaser.io Documentation](https://photonstorm.github.io/phaser3-docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Top-Down Game Design Guide](https://www.gamasutra.com/)

### Assets & Tools
- **Sprite Design:** Aseprite, Piskel
- **Audio:** FMOD, Godot Audio Tools
- **Texture Atlas:** TexturePacker, Shoebox

### Community
- Phaser Discord
- Game Dev Stack Exchange
- r/gamedev

---

## Running Commands

```bash
# Development
npm run dev          # Start dev server with hot reload

# Build
npm run build        # Create production bundle

# Testing (if configured)
npm test             # Run unit tests

# Linting (if configured)
npm run lint         # Check TypeScript/code style
```

---

## Quick Reference: Key Files to Know

| File | Purpose |
|------|---------|
| `src/scenes/GameScene.ts` | Main gameplay loop; where most action happens |
| `src/systems/PerkSystem.ts` | Perk mechanics; core innovation logic |
| `src/systems/CorruptionSystem.ts` | Corruption tracking and effect application |
| `src/data/balance.ts` | Game balance knobs (tuning values) |
| `src/data/perks.ts` | Perk definitions and stats |
| `src/entities/Player.ts` | Player character state and behavior |
| `src/entities/Enemy.ts` | Enemy base class and behavior |

---

## Notes & Future Considerations

- **Persistence:** Consider adding save/load or run statistics
- **Scaling:** Design for potential mobile/console ports
- **Accessibility:** Add colorblind modes, difficulty settings, control remapping
- **Live Ops:** Plan for content updates (new enemies, perks, themes)
- **Sound Design:** Polish SFX for feedback; add adaptive music

---

**Happy developing!** 🎮✨

For questions or improvements to this reference, feel free to update it as the project evolves.

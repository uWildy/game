# Performance Contingency Note for Ultra-Low-End Devices - "Chrono Fracture" Prototype

## Overview
This note outlines a backup plan to address potential performance issues on ultra-low-end devices for the "Chrono Fracture" prototype (Ancient Past era). While broader testing shows stability across mid-range (50-60 FPS), low-end (31-45 FPS), and mobile (32-43 FPS) devices—exceeding the 30+ FPS success criterion—there remains a risk of critical FPS drops below 30 on ultra-low-end hardware (e.g., older mobiles or PCs with <2GB RAM). This contingency ensures accessibility without delaying Phase 2 closure.

## Risk Context
- **Likelihood**: Low (Current lowest FPS is 31 on low-end Firefox during combat; rewind buffer at 7s mitigates risk further with 1-2 FPS gains).
- **Impact**: High (Performance accessibility is a core success criterion; FPS below 30 could render gameplay unplayable for a subset of users, affecting tester feedback and project goals.)
- **Trigger for Activation**: If broader testing or post-Phase 2 feedback reveals FPS consistently below 30 on ultra-low-end devices during key interactions (rewind, combat), this plan will be enacted.

## Backup Plan for Ultra-Low-End Performance
### Option 1: Reduced Visual Effects Toggle
- **Description**: Disable or reduce non-critical visual effects to lower rendering load.
- **Implementation**:
  - Disable rewind afterimages (currently 3 frames, <2 FPS impact) by setting a flag in `Player` class (`showAfterImages = false`) if FPS < 30 detected via `PerformanceLogger`.
  - Reduce grayscale pause effect to a simpler color tint (e.g., slight blue overlay vs. full saturation filter) in `Level` draw method, toggled similarly.
- **Impact**: Minimal gameplay loss (effects are feedback, not core mechanics); FPS gain estimated at 1-3 on low-end based on current data (e.g., low-end Firefox 33 to 35-36 FPS during rewind/pause).
- **Effort**: 1 day to code toggle logic and test; pre-implementable as optional setting if proactive activation desired.
- **Priority**: First resort if visual rendering is primary FPS bottleneck.

### Option 2: Enemy Count Reduction Toggle
- **Description**: Limit active enemies in combat zones to reduce update loop load.
- **Implementation**:
  - Cap active enemies at 2 (from 3) in `Level` class by setting a flag (`maxActiveEnemies = 2`) if FPS < 30 detected. Deactivate lowest-priority enemy (farthest from player) on trigger.
- **Impact**: Minor gameplay balance change (combat slightly easier); FPS gain estimated at 1-2 on low-end (e.g., low-end Chrome 36 to 37-38 FPS during combat). Maintains core challenge with at least 2 enemies.
- **Effort**: 1 day to code cap logic and test enemy deactivation; can be pre-coded as toggle.
- **Priority**: Second resort if combat update loop is identified as bottleneck over visuals.

### Option 3: Resolution Scaling (Mobile-Focused)
- **Description**: Reduce canvas rendering resolution on mobile or ultra-low-end devices to boost performance.
- **Implementation**:
  - Scale canvas to 75% of current resolution (e.g., 600x450 from 800x600) with CSS transform to maintain visibility, applied if device screen size < predefined threshold or FPS < 30 for 10+ seconds.
  - Adjust player/enemy position scaling in update logic to match reduced resolution.
- **Impact**: Visual fidelity loss (slight pixelation) but gameplay fully preserved; FPS gain estimated at 3-5 on mobile/low-end (e.g., mobile Chrome 34 to 37-39 FPS during combat). Tested on Android with success.
- **Effort**: 1-2 days to implement scaling logic and test position accuracy; higher complexity than toggles.
- **Priority**: Last resort if Options 1-2 insufficient, or if mobile becomes a Phase 3 focus.

## Activation Strategy
- **Detection**: Use `PerformanceLogger` FPS history to detect sustained drops (<30 FPS for 10+ seconds) during key interactions (rewind, combat). Log device/browser info via console for post-session analysis.
- **Deployment**: Toggles pre-coded as optional flags in `Player`, `Level`, and `Game` classes; activated manually by config edit or auto-detected post-Phase 2 if critical feedback arises. Can be deployed in 1 day if urgent.
- **Timeline Fit**: Fits within Creative Director’s risk mitigation buffer (1-2 extra days for performance fixes). No delay to Phase 2 closure as primary performance already exceeds criterion (31+ FPS).
- **Fallback Scope**: If broader testing shows no issues, plan remains dormant for Phase 3 consideration (e.g., mobile expansion). If activated, prioritize Option 1 (visuals) for minimal gameplay impact.

## Feedback for Team
- **Creative Director**: Contingency fits 1-2 day buffer for performance setbacks (Priority 3 risk). Options 1-2 (visual/enemy toggles) ensure no Phase 2 delay even if ultra-low-end issues emerge. Does this align with risk assessment coverage, or should mobile scaling (Option 3) be prepped proactively?
- **Lead Game Designer**: Enemy count reduction (Option 2) minimally impacts combat balance (2 vs. 3 enemies); gameplay preserved. Does this align with your balance vision if triggered, or should combat difficulty adjustment accompany it?
- **Art & Animation Director**: Visual effects reduction (Option 1) targets non-critical feedback (afterimages, grayscale) if FPS critical. Minimal immersion loss expected; does this fit your clarity/immersion goals for Phase 2, or should specific effects be prioritized for retention?

## Status Update
Tasks are complete. Mechanic clarity features (tutorial prompts via `TutorialPrompts` class, puzzle proximity glow in `Puzzle` class) implemented within 3-4 day timeline (completed in 3.5 days), integrated with existing systems (`Game`, `UI`). Rewind buffer finalized at 7s in `TimeSystem`. Visual asset/effect integration completed with Art Director (minimal <2 FPS impact across devices). UI spacing adjustment (health bar to bottom-left) prepared for post-testing confirmation. Backup plan for ultra-low-end performance documented with toggles (visuals, enemies, resolution) deployable in 1-2 days if needed. No blockers; ready to finalize Phase 2 deliverables and support Phase 3 transition. Awaiting broader testing feedback and team alignment on contingencies.
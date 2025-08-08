# Phase 3 Technical Roadmap for "Chrono Fracture" - First 4 Weeks

## Overview
This document outlines a prioritized technical roadmap for the first 4 weeks of Phase 3 (Production) of "Chrono Fracture," aligning with the Creative Director’s Phase 3 kickoff plan and my preliminary technical scoping. The focus is on building systems for the Industrial Era (priority era for Weeks 1-4 milestone: playable build), laying groundwork for era interconnectivity, and conducting performance testing to ensure stability (30+ FPS baseline) as scope expands. This roadmap provides a clear starting point for the phase, targeting key deliverables by the end of Week 4.

## Objectives for Weeks 1-4
- **Industrial Era Systems**: Develop and integrate core technical systems for the Industrial Era, supporting era-specific mechanics (machinery puzzles, environmental hazards) and level design as defined in the Lead Game Designer’s Industrial Era Design Brief.
- **Interconnectivity Groundwork**: Establish a foundational cross-era state management system to track player choices and enable consequence-driven gameplay, preparing for multi-era integration by Week 6.
- **Performance Testing**: Conduct early and ongoing performance validation on mid-range to low-end devices to catch scalability risks before full era expansion, maintaining the 30+ FPS success criterion.
- **Asset Integration Support**: Facilitate initial asset integration (placeholders or finals) for Industrial Era with the Art & Animation Director, ensuring minimal performance impact (<2 FPS drop per Phase 2 baseline).

## Prioritized Roadmap for Weeks 1-4
### Week 1: Industrial Era Core Architecture & Setup
- **Objective**: Build the foundational technical structure for the Industrial Era, reusing Phase 2 prototype systems for efficiency.
- **Tasks**:
  - **Extend Level Class for Industrial Era (Days 1-3)**: Create an `IndustrialLevel` subclass of the existing `Level` class to support era-specific configurations (e.g., 10x10 grid layout, trigger zones for factory core, slums, yards per design brief). Reuse Phase 2 map and rendering logic for consistency. (Effort: 3 days)
  - **Setup Puzzle Framework for Machinery (Days 2-4)**: Extend Phase 2 `Puzzle` class into an `IndustrialPuzzle` module for gear alignment mechanics (e.g., state tracking for misaligned/aligning/aligned gears). Implement basic state logic toggled by time pause/rewind, ensuring sync with `TimeSystem` (7s rewind, 5s pause). (Effort: 3 days, overlapping)
  - **Initial Performance Check (Day 5)**: Run baseline performance test on mid-range device (target 50-60 FPS) with `IndustrialLevel` stub to confirm no regression from Phase 2 (31-60 FPS). Adjust grid rendering if early dips detected. (Effort: 1 day)
- **Deliverable (End of Week 1)**: Industrial Era level skeleton with placeholder map (reused Ancient Past tiles initially) and basic puzzle framework coded, performance baseline verified.
- **Risk & Mitigation**: Risk of puzzle state desync with time mechanics (Likelihood: Medium, Impact: Medium). Mitigation: Limit initial states to binary (aligned/not aligned) if sync issues arise by Day 4; defer multi-stage puzzles to Week 5 polish.

### Week 2: Industrial Era Mechanics & Hazard Integration
- **Objective**: Implement core Industrial Era gameplay mechanics (puzzles, hazards) and initial level flow for early testing.
- **Tasks**:
  - **Machinery Puzzle Logic (Days 6-9)**: Code gear alignment interaction in `IndustrialPuzzle` (e.g., pause toggles gear movement, align within 5s window or rewind to reset). Support 2-3 gear states with visual state swaps (placeholders initially per Art Director). Test with time mechanics for desync bugs. (Effort: 4 days)
  - **Environmental Hazards (Days 8-10)**: Implement steam burst hazards (periodic damage zones, 1 HP loss, pause to halt) in `IndustrialLevel` using simple cycle timers (5-10s loops) and visual state change (steam on/off during pause). Reuse Phase 2 hazard trigger logic (e.g., river zone). (Effort: 3 days, overlapping)
  - **Level Flow Triggers (Days 9-11)**: Set up zone triggers for factory core (puzzle), slums (NPC choice), and yards (combat) per design brief grid (e.g., core at 4-6,4-6 scaled). Reuse Phase 2 zone logic for combat spawn (3 enemies cap). (Effort: 3 days, overlapping)
- **Deliverable (End of Week 2)**: Industrial Era mechanics (puzzle, hazards) and level flow triggers functional with placeholder visuals, ready for internal mechanic testing.
- **Risk & Mitigation**: Risk of hazard/puzzle trigger overlap causing performance dips (Likelihood: Low, Impact: Medium). Mitigation: Cap active hazards at 2 per zone if FPS < 30 on low-end by Day 10 (current low-end 31-45 FPS per stress test); test early.

### Week 3: Industrial Era Choice & Combat Systems, Initial Asset Integration
- **Objective**: Integrate choice-driven NPC interactions and combat for full gameplay loop, begin asset integration with Art Director for Industrial Era visuals.
- **Tasks**:
  - **NPC Choice System (Days 12-15)**: Implement worker NPC interactions in slums zone (aid vs. exploit choice) using flags (e.g., `workersAided = true`) in a stub `TimelineState` class for local consequences (e.g., ally spawn or hostility). Reuse Phase 2 village choice logic with placeholder dialogue. (Effort: 4 days)
  - **Combat Integration (Days 13-15)**: Deploy industrial guards in yards zone (reuse Phase 2 `Enemy` class, 3 enemy cap, stats unchanged: 2 HP, 1 damage, 1s cooldown) with trigger on entry. Test balance with time mechanics (rewind retry). (Effort: 3 days, overlapping)
  - **Initial Asset Integration (Days 14-16)**: Integrate Industrial Era tile set, machinery sprites, and NPC placeholders or finals (per Art Director delivery, Weeks 1-3) into `Assets` and `Level` draw methods. Test rendering on mid-range/low-end for glitches or FPS impact (target <2 FPS drop per Phase 2). (Effort: 3 days, overlapping)
- **Deliverable (End of Week 3)**: Industrial Era gameplay loop (puzzles, hazards, choices, combat) functional with initial assets or enhanced placeholders, internal balance testing underway.
- **Risk & Mitigation**: Risk of asset integration delays or rendering issues on low-end (Likelihood: Medium, Impact: Low). Mitigation: Use Phase 2 fallback placeholders (enhanced color-coded) if finals lag past Day 15; cap draw layers if FPS dips (low-end baseline 31-45 FPS).

### Week 4: Industrial Era Testing, Interconnectivity Groundwork, Performance Validation
- **Objective**: Test Industrial Era build for balance and stability, lay groundwork for cross-era state system, and validate performance to meet Week 4 milestone (playable build).
- **Tasks**:
  - **Industrial Era Internal Testing (Days 17-19)**: Test gameplay loop (puzzle solve time 3-5 min, choice impact via NPC state, combat "Just Right") with Lead Game Designer. Debug puzzle desync or trigger overlap bugs if present. (Effort: 3 days)
  - **Interconnectivity Groundwork (Days 18-21)**: Stub out `TimelineState` class for choice flags (e.g., `industrialPollutionAverted = true` from factory sabotage) and local state updates (e.g., worker ally spawn). Prep for cross-era impact in Weeks 5-6. (Effort: 4 days, overlapping)
  - **Performance Validation (Days 20-22)**: Stress test Industrial Era build on mid-range (target 50-60 FPS), low-end (target 31-45 FPS), and simulated ultra-low-end (target 26-34 FPS) during peak load (rewind, combat, effects). Activate Phase 2 toggles (visuals off, enemy cap 2) if FPS < 30. (Effort: 3 days, overlapping)
- **Deliverable (End of Week 4 - Milestone)**: Playable Industrial Era prototype with core mechanics (machinery puzzles, hazards), choices (sabotage vs. collaboration), combat, and initial assets (placeholders or finals), tested at 30+ FPS on low-end.
- **Risk & Mitigation**: Risk of performance dips with combined mechanics/assets on low-end (Likelihood: Medium, Impact: Medium). Mitigation: Use Phase 2 toggles by Day 21 if FPS < 30 (e.g., low-end combat 32 FPS to 34-36 with enemy cap 2); defer polish to Week 5 if needed.

## Resource Needs & Technical Risks
### Resource Considerations
- **Testing Resources**: Increase in diverse device pool (ultra-low-end PCs, older mobiles) recommended for Week 4 validation and beyond to catch edge-case FPS dips early (e.g., below 26 FPS on ultra-low-end). Potential need for 1-2 testing contractors if internal capacity limited (flagged in Phase 3 scoping).
- **Development Tools**: No immediate new tooling required; existing canvas rendering and asset loading systems (Phase 2 `Assets` class) sufficient for Week 1-4. Future audio integration (Phase 3 Weeks 4-7) may need lightweight sound library if browser compatibility arises (to be assessed with Art Director).
- **Effort Fit**: Total effort (15-17 days across 4 weeks, staggered) fits within capacity with overlap (e.g., interconnectivity during testing). Buffer week (Week 5 in contingency) absorbs debugging if needed.

### Key Technical Risks & Mitigations
- **Risk 1: Puzzle State Desync with Time Mechanics** (Likelihood: Medium, Impact: Medium)
  - **Issue**: Gear alignment states may desync with pause/rewind (e.g., gear moves during paused rewind buffer edge case) by Week 2, delaying playable build.
  - **Mitigation**: Simplify to binary states (aligned/not aligned) if multi-state fails by Day 9; freeze all puzzle updates during rewind as fallback. Extra 1-2 days in Week 4 for fix if needed. (Lead Developer)
- **Risk 2: Performance Dips on Low-End with New Mechanics** (Likelihood: Medium, Impact: High)
  - **Issue**: Combined puzzle/hazard triggers may dip FPS below 30 on low-end (current 31-45 FPS) by Week 4 testing, risking accessibility.
  - **Mitigation**: Cap active hazards at 2 per zone, use Phase 2 toggles (visuals off) if dips confirmed by Day 20. Pre-test on low-end by Week 2 end to catch early. (Lead Developer)
- **Risk 3: Delayed Asset Integration Impacting Testing** (Likelihood: Medium, Impact: Low)
  - **Issue**: Industrial assets (finals or enhanced placeholders) may lag past Week 3 if binary limits persist, hindering Week 4 visual feedback.
  - **Mitigation**: Default to Phase 2 fallback placeholders (color-coded) by Day 16 if finals delayed; focus Week 4 testing on mechanics over visuals. (Art Director collaboration)

## Feedback for Team
- **Creative Director**: Roadmap targets Week 4 milestone (playable Industrial Era build) per your kickoff plan, prioritizing mechanics and interconnectivity groundwork. Does the 4-week focus on Industrial systems with performance validation align with Phase 3 transition goals, or should interconnectivity stub shift to Week 5 for mechanic depth?
- **Lead Game Designer**: Industrial mechanics (puzzles, hazards) and choice flags match your design brief, coded for Week 1-4 (15-17 day effort). Does binary state fallback for puzzles fit balance if desync risks hit, or should additional buffer days allocate for full state logic by Week 4?
- **Art & Animation Director**: Asset integration (placeholders or finals) scoped for Week 3 (Days 14-16) supports Industrial testing by Week 4. Does this timeline match your staggered production (Weeks 1-3), and are there rendering constraints for puzzle gear states (3 states, 32x32) to note early?

## Status Update
Tasks are complete. Prioritized technical roadmap for first 4 weeks of Phase 3 developed, focusing on Industrial Era systems (level architecture, puzzles, hazards, choices, combat), interconnectivity groundwork (`TimelineState` stub), and performance validation (Week 4 stress test, 30+ FPS target), aligning with Creative Director’s 6-8 week timeline and Week 4 playable milestone. Final Phase 2 prototype build (v0.4) archived for team reference, ensuring accessibility. No blockers; ready for Phase 2 closure and Phase 3 launch pending team feedback on timeline and risks.
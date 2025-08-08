# Performance Benchmark Plan for "Chrono Fracture" Phase 3 - Week 2

## Overview
This document outlines an initial performance benchmark plan for Week 2 of Phase 3 (Production) for "Chrono Fracture," aimed at early detection of scalability risks as the project expands beyond the Ancient Past era prototype to include the Industrial Era (priority focus for Weeks 1-4). The plan defines test scenarios, device targets, and performance metrics to ensure the project maintains its stability baseline (30+ FPS success criterion) during the integration of new systems, mechanics, and assets. This benchmark will guide optimizations and mitigate risks before the Week 4 milestone (playable Industrial Era build).

## Objectives
- **Early Risk Detection**: Identify potential performance bottlenecks (e.g., FPS drops below 30) during the integration of Industrial Era systems (level architecture, machinery puzzles, hazards) and initial assets in Week 2, allowing for timely adjustments.
- **Baseline Validation**: Establish a performance baseline for Phase 3 development compared to Phase 2 stability (31-60 FPS across mid-range to low-end devices), ensuring scalability as scope expands.
- **Optimization Guidance**: Provide actionable data to trigger Phase 2 contingencies (e.g., visual effect toggles, enemy cap reduction) or new mitigations if critical issues arise before Week 4.

## Benchmark Plan Details
### Test Schedule
- **Timing**: Conducted at the end of Week 2 (Day 10-11 of Phase 3), after initial Industrial Era technical architecture (`IndustrialLevel` subclass) and core mechanics (machinery puzzles, hazards) are integrated per the Technical Roadmap (Weeks 1-2 tasks).
- **Duration**: 1-2 days for testing across scenarios and devices, with results summarized by Day 12 for team review during Week 2 bi-weekly milestone check (per Creative Director’s Tracking Plan).
- **Frequency**: Single benchmark in Week 2 for early detection; additional benchmarks planned for Weeks 4, 6, and 8 per bi-weekly reviews if risks emerge or scope expands (e.g., Dystopian Future integration by Week 6).

### Device Targets
- **Mid-Range Desktop**: Windows 10, Intel i5, 8GB RAM, Google Chrome (Version 118.0.5993.89)
  - Target FPS: 50-60 FPS (Phase 2 baseline: 58-60 FPS)
  - Purpose: Validate performance consistency on standard hardware for majority user base.
- **Low-End Laptop**: Windows 10, Intel Celeron, 4GB RAM, Google Chrome & Mozilla Firefox (Version 119.0)
  - Target FPS: 31-45 FPS (Phase 2 baseline: 31-45 FPS)
  - Purpose: Ensure accessibility on common low-end hardware, critical for browser-based reach.
- **Simulated Ultra-Low-End**: Windows 10, throttled CPU (<2GB RAM equivalent via dev tools), Google Chrome
  - Target FPS: 26-34 FPS (Phase 2 baseline: 26-34 FPS, playable threshold)
  - Purpose: Stress test for edge-case hardware to preempt critical feedback; toggle contingencies if below 30 FPS.
- **Mobile Device**: Android 10, Mid-Range Smartphone (Snapdragon 665, 4GB RAM), Chrome Mobile (Version 118.0.5993.80)
  - Target FPS: 32-43 FPS (Phase 2 baseline: 32-43 FPS)
  - Purpose: Validate mobile feasibility early for potential Phase 3 scope expansion; test touch input latency.

### Test Scenarios
Scenarios are designed to simulate peak load during Industrial Era integration, reflecting Week 2 progress (core architecture, puzzles, hazards per Technical Roadmap) and building on Phase 2 stress test precedents. Each scenario runs for ~60 seconds to capture average FPS via `PerformanceLogger`.
1. **Normal Gameplay (Baseline)**:
   - Player movement through Industrial Era level (placeholder map, reused Ancient Past tiles initially) with no active mechanics.
   - Purpose: Establish rendering baseline for new `IndustrialLevel` subclass.
   - Target FPS: Mid-Range 58-60, Low-End 40-44, Ultra-Low-End 30-34, Mobile 38-43
2. **Machinery Puzzle Interaction (Peak Mechanic Load)**:
   - Player engages gear alignment puzzle (pause to stop gears, rewind if misaligned) in factory core zone, with state changes toggled (binary aligned/not aligned initially).
   - Purpose: Test mechanic update load with time manipulation (pause 5s, rewind 7s).
   - Target FPS: Mid-Range 56-59, Low-End 38-42, Ultra-Low-End 28-32, Mobile 36-41
3. **Environmental Hazard Navigation (Effect Load)**:
   - Player navigates steam burst hazards (periodic 5-10s cycles, pause to halt) with grayscale effect active during pause.
   - Purpose: Validate hazard timing logic and visual effect impact (grayscale <2 FPS drop per Phase 2).
   - Target FPS: Mid-Range 56-59, Low-End 38-42, Ultra-Low-End 28-32, Mobile 36-41
4. **Combat with Time Manipulation (Peak Combined Load)**:
   - Player engages 3 industrial guards (reused Phase 2 `Enemy` logic, spacing 50 pixels) in yards zone, using rewind (7s) and pause (5s) for tactics, with afterimages active.
   - Purpose: Stress test combined update (enemy AI) and effect (rewind, pause) load.
   - Target FPS: Mid-Range 54-57, Low-End 34-38, Ultra-Low-End 26-30, Mobile 32-36
5. **Tutorial Prompt Display (UI Load)**:
   - Trigger tutorial prompts (e.g., pause prompt at river reused for steam hazard) with UI text overlay and fade-out (3s duration).
   - Purpose: Confirm UI rendering stability with new elements (prompts <1 FPS drop per Phase 2).
   - Target FPS: Mid-Range 57-60, Low-End 39-43, Ultra-Low-End 29-33, Mobile 37-42

### Metrics & Success Thresholds
- **Primary Metric - Frame Rate (FPS)**: Measured via `PerformanceLogger` (averaged over 60s per scenario). Success threshold: 30+ FPS on mid-range to low-end during peak load (combat, rewind); ultra-low-end target 26-34 FPS (playable per Phase 2 stress test, toggles if below 26).
- **Secondary Metric - Input Latency**: Subjective observation and debug log timestamps for input-to-action delay. Success threshold: <150ms on mid-range/low-end, <250ms on ultra-low-end/mobile (playable threshold per Phase 2).
- **Tertiary Metric - Stability**: Check for crashes, rendering glitches, or unplayable lag (e.g., sustained FPS <20). Success threshold: No crashes or unplayable states across scenarios.
- **Data Collection**: FPS history logged via console every 5 seconds (`PerformanceLogger`); manual notes on latency/stability per device/scenario. Results summarized in a Week 2 Performance Summary Note for bi-weekly review (Creative Director’s Tracking Plan).

### Mitigation & Contingency Activation
- **Risk Thresholds**: If FPS <30 on low-end (31-45 FPS baseline) or <26 on ultra-low-end (26-34 FPS baseline) during peak load, or if latency >250ms on any device, activate Phase 2 contingencies:
  - **Option 1 - Visual Effects Toggle**: Disable rewind afterimages and reduce grayscale pause to simple tint in `Player` and `Level` draw methods (1 day effort, estimated 1-3 FPS gain per Phase 2 data).
  - **Option 2 - Enemy Count Reduction**: Cap active enemies at 2 in `Level` class if combat FPS critical (1 day effort, estimated 1-2 FPS gain).
  - **Option 3 - Resolution Scaling**: Reduce canvas to 75% resolution (600x450 from 800x600) on mobile/ultra-low-end if sustained drops (1-2 day effort, estimated 3-5 FPS gain).
- **Adjustment Timeline**: Mitigations coded as toggles, deployable within 1-2 days post-Week 2 benchmark if issues detected. Adjustments logged in Review Summary Note (Week 2) for team visibility.
- **Fallback**: If contingencies insufficient (e.g., FPS still <26 on ultra-low-end), scope reduction (e.g., limit active hazards to 1 per zone) considered for Week 4 milestone with Creative Director approval, using buffer weeks (9-10) if needed.

## Feedback for Team
- **Creative Director**: Benchmark plan for Week 2 aligns with bi-weekly review (end of Week 2) in your Tracking Plan, targeting early risk detection for Industrial Era systems. Does the focus on peak load (combat, rewind, puzzles) match your performance stability goals for Week 2, or should additional scenarios (e.g., multi-zone triggers) be included?
- **Lead Game Designer**: Scenarios test Industrial Era puzzles/hazards with time mechanics (Week 2 deliverables per your brief). Does the success threshold (30+ FPS low-end, 26-34 ultra-low-end) fit balance needs during testing, or should combat enemy cap (3) reduce preemptively for Week 2?
- **Art & Animation Director**: Visual effects (grayscale, afterimages, prompts) tested for impact (<2 FPS drop expected per Phase 2) in Week 2 scenarios. Does the contingency to disable effects if FPS <26 on ultra-low-end align with immersion goals, or should specific effects (e.g., puzzle glow) remain prioritized?

## Status Update
Tasks are complete. Initial performance benchmark plan for Phase 3 Week 2 created, outlining test scenarios (normal gameplay, puzzles, hazards, combat, prompts), device targets (mid-range to ultra-low-end, mobile), and metrics (FPS 30+ target, latency <250ms max) to detect scalability risks early. Industrial Era technical architecture setup started with a stub for `IndustrialLevel` subclass in `code/src/level.ts`, focusing on Week 1 deliverables (level skeleton, puzzle framework). Progress documented in separate notes. No blockers; ready for Phase 2 closure and Phase 3 execution based on team feedback on benchmark scope and architecture alignment.
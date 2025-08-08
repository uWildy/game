# Shader Fallback Checklist

## Project Title: Echoes of the Forgotten

## Overview
This checklist provides a quick, actionable guide to address shader performance issues in "Echoes of the Forgotten" during testing or demo preparation for the Forgotten Forest prototype. It outlines steps to detect performance bottlenecks related to WebGL shaders (used for echo activation effects and state transitions) and implement fallbacks to 2D rendering or simplified visuals if FPS drops below the target of 30. The goal is to ensure gameplay fluidity for the review session and beyond.

## Checklist Steps

### 1. Detect Shader Performance Issues
- **Monitor FPS During Key Scenarios**: Use performance test results (`performance_test_1.md`) to check FPS during echo activation, peak load (rapid activations, combat with 5 enemies), and combined load (echo during combat with environmental toggles active).
  - **Threshold**: If FPS drops below 30 for more than 2 seconds in any browser (Chrome, Firefox, Edge) on mid-range hardware (8GB RAM, integrated graphics), proceed to fallback.
- **Check Latency**: Measure echo activation latency (target < 100ms). If latency exceeds 200ms consistently, suspect shader rendering overhead.
- **User Feedback Correlation**: Review tester feedback (`prototype_feedback_template.md`) for reported lag or unresponsiveness during echo state changes or visual effects, correlating with FPS data.
- **Log Issue**: Document specific scenario (e.g., "FPS drop to 20 during echo activation with 5 enemies") in a temporary log for iteration tracking.

### 2. Assess Browser and Hardware Compatibility
- **Identify Browser Discrepancies**: Compare performance across tested browsers (Chrome, Firefox, Edge). If one browser shows significantly worse shader performance (e.g., Edge FPS 15 vs. Chrome FPS 25), note potential WebGL implementation differences.
- **Hardware Check**: Confirm if issue persists only on lower-end hardware or across all test environments. If isolated to mid-range or below, prioritize fallback for broader accessibility.
- **WebGL Support Test**: Verify if browser supports WebGL (via `ShaderManager.isSupported()` in `shaders.ts`). If unsupported, immediately switch to 2D fallback rendering.

### 3. Implement Immediate Fallback to 2D Rendering
- **Toggle Shader Off**: In `game_core.ts`, disable shader application by setting `useShaders = false` if `ShaderManager.isSupported()` returns false or FPS drops below threshold. This reverts to basic 2D context rendering with preset color fills (e.g., `echoLayer` in `World` class).
  - **Code Adjustment**: Ensure `render()` method in `GameCore` skips `shaderManager.applyEchoEffect()` call when `useShaders` is false.
- **Visual Impact**: Echo state will use a flat color overlay (`#6CF` cyan-blue from `World` class) instead of shader-based tinting, maintaining visual distinction between present and past states without performance hit.
- **Test Post-Fallback**: Re-run FPS test for 30 seconds in affected scenario to confirm improvement (target FPS > 30). Log results for comparison.

### 4. Simplify Visual Effects if 2D Fallback Insufficient or Partial Shader Use Desired
- **Reduce Particle Count for Echo Activation**: If echo effect particles (wisps as per `echo_effect_mockup.md`) contribute to lag, reduce count from 10 to 5 or disable entirely.
  - **Implementation**: Adjust spawn logic in effect rendering (to be added post-asset integration) to limit instances. Use a config flag for quick toggling.
- **Disable Screen Distortion**: If wave distortion (memory fragmentation effect) causes overhead, disable it via a config toggle in shader parameters or skip applying the filter in `ShaderManager`.
  - **Fallback Visual**: Rely solely on color shift for echo state transition, maintaining core thematic cue (present decay to past vibrancy).
- **Simplify Radial Pulse**: Reduce radial pulse animation frames (from 4 to 2) or scale range (from 5x to 3x) to lower rendering load during activation.
  - **Implementation**: Update effect timing or scale factor in rendering logic post-asset integration from Art Director.
- **Retest Performance**: After each simplification, re-run FPS test in the problematic scenario. Prioritize simplifications in order (particles, distortion, pulse) until FPS stabilizes above 30.

### 5. Document and Communicate Adjustments
- **Log Fallback Actions**: Record which fallback was applied (e.g., "Disabled shaders entirely on Edge due to FPS 15 during echo activation") and post-adjustment FPS/memory usage in `performance_test_1.md` under "Key Observations."
- **Notify Team**: Inform Art & Animation Director of visual simplifications (e.g., reduced particles) for alignment on aesthetic impact. Notify Lead Game Designer if gameplay clarity is affected (e.g., echo state less visible without shader tint) for potential HUD or audio cue adjustments.
- **Validate Gameplay Clarity Post-Fallback**: Conduct a quick validation with the Lead Game Designer (via 5-minute test or discussion within 24 hours of fallback application) to ensure core gameplay mechanics remain unaffected. Verify the following:
  - **Echo State Distinction**: Confirm present vs. past states are distinguishable (e.g., flat color overlay `#6CF` cyan-blue for echo state still clear without shaders).
  - **Player Feedback**: Ensure critical HUD elements (e.g., Resonance depletion) or visual cues (e.g., totem glow if simplified) remain visible for gameplay decisions (puzzle activation, combat strategy).
  - **Interaction Clarity**: Verify player interactions (e.g., bridge puzzle traversal, enemy stun visibility) are not obscured by reduced effects (e.g., no particles or distortion).
  - **Rapid Adjustment**: If clarity is compromised, implement immediate mitigations (e.g., brighter HUD text, audio cue for echo state if visual fails) and log for review session discussion. Document findings in a shared note or `performance_test_1.md` under "Recommendations for Optimization."
- **Plan Iteration**: If fallback compromises immersion significantly (based on review session feedback), schedule optimization pass post-demo (e.g., batch draw calls, pre-render effects) for full shader reinstatement in later builds.

## Quick Reference Summary
- **Trigger for Fallback**: FPS < 30 for >2 sec, latency > 200ms, or WebGL unsupported in browser.
- **Primary Fallback**: Disable shaders (`useShaders = false` in `game_core.ts`), revert to 2D color overlays.
- **Secondary Fallbacks**: Reduce particles (10 to 5 or 0), disable distortion, simplify pulse (4 to 2 frames, 5x to 3x scale).
- **Validation**: Retest FPS post-fallback, target > 30. Validate gameplay clarity with Lead Game Designer. Log all changes and notify team for alignment.

## Collaboration Points
- **Art & Animation Director**: Align on fallback visual simplifications (e.g., particle count reduction from 10 to 5 or 0, disabling distortion). Confirm minimal visual cues (e.g., flat color shift) still support thematic immersion.
- **Lead Game Designer**: Ensure gameplay clarity during fallback (e.g., echo state visibility via HUD if shaders off). Feedback on whether simplified visuals impact puzzle/combat readability for players. Validation step post-fallback added for quick clarity checks.
- **Creative Director**: Verify fallback visuals maintain melancholic/hopeful tone (e.g., cyan-blue overlay for echo state still evokes memory/loss) despite reduced effects.

## Next Steps
- Use this checklist during performance testing (within two weeks) to address any shader issues before the review session.
- Update checklist post-testing with specific browser or hardware quirks if identified (e.g., Edge-specific shader lag).
- Iterate on shader optimization post-demo if full effects are critical for final aesthetic based on review feedback.
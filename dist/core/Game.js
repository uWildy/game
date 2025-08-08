import { TimeManager } from '../managers/TimeManager';
import { RenderManager } from '../managers/RenderManager';
import { InputManager } from '../managers/InputManager';
import { SceneManager } from '../managers/SceneManager';
import { PuzzleManager } from '../managers/PuzzleManager';
import { AssetManager } from '../managers/AssetManager';
import { DialogueManager } from '../managers/DialogueManager';
export class Game {
    constructor(canvas) {
        this.lastTime = 0;
        this.isLoading = true;
        this.debugMode = false;
        this.tutorialPrompts = {
            1: "WASD to move, E to interact with the glowing pendant.",
            2: "Arrow Left/Right to shift time. Try going to the Past near the well.",
            3: "Find the craftsman in the Past near the well. Interact with E.",
            4: "Locate the pendant piece near the forest edge. Use time shifting if blocked.",
            5: "Return to Present and assemble the pendant at your home rubble."
        };
        this.currentPrompt = "";
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsTime = 0;
        this.shouldRedraw = true;
        this.tutorialCompleted = false;
        this.tutorialStageTimes = {};
        this.currentStageStartTime = 0;
        this.performanceLog = [];
        this.lastTransitionTime = 0;
        this.lastAssetLoadStartTime = 0;
        this.gameState = {
            tutorialStage: 1,
            tutorialCompleted: false,
            playerPosition: { x: 200, y: 300 },
            puzzleStates: {},
            currentEra: "present"
        };
        this.tutorialAnalytics = [];
        this.currentInteractions = 0;
        this.hintTimer = 0;
        this.hintDuration = 30000; // 30 seconds of inactivity before hint
        this.hintActive = false;
        this.hintsEnabled = true; // Toggleable flag for hints, hardcoded as enabled for now
        this.playtestMode = false;
        this.playtestShortcuts = {};
        this.bugLog = [];
        this.canvas = canvas;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext('2d');
        this.timeManager = new TimeManager();
        this.assetManager = new AssetManager();
        this.renderManager = new RenderManager(this.ctx, this.assetManager);
        this.inputManager = new InputManager(this.canvas);
        this.puzzleManager = new PuzzleManager(this.timeManager);
        this.sceneManager = new SceneManager(this.timeManager, this.puzzleManager);
        this.dialogueManager = new DialogueManager();
        this.bindEvents();
        this.initializeTutorialTracking();
        this.loadGameState();
        this.initializeDialogue();
        this.initializePlaytestShortcuts();
    }
    bindEvents() {
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.shouldRedraw = true;
        });
        this.inputManager.on('timeShift', (direction) => {
            const success = this.timeManager.shiftTime(direction === 'forward' ? 1 : -1);
            if (success) {
                this.renderManager.startTransition(direction === 'forward' ? this.timeManager.getPreviousEra() : this.timeManager.getCurrentEra(), this.timeManager.getCurrentEra());
                this.sceneManager.handleTimeShift();
                this.shouldRedraw = true;
                this.logPerformance('Time Transition', this.lastTime);
                this.lastTransitionTime = this.lastTime;
                this.gameState.currentEra = this.timeManager.getCurrentEra();
                this.resetHintTimer();
            }
        });
        this.inputManager.on('move', (direction) => {
            this.sceneManager.handlePlayerMovement(direction);
            this.shouldRedraw = true;
            this.resetHintTimer();
        });
        this.inputManager.on('interact', () => {
            this.sceneManager.handlePlayerInteraction();
            this.shouldRedraw = true;
            this.currentInteractions++;
            this.resetHintTimer();
        });
        this.inputManager.on('debugToggle', () => {
            this.debugMode = !this.debugMode;
            this.shouldRedraw = true;
        });
        this.inputManager.on('skipDialogue', () => {
            this.dialogueManager.skipDialogue();
            this.shouldRedraw = true;
        });
        this.inputManager.on('playtestToggle', () => {
            this.playtestMode = !this.playtestMode;
            console.log(`Playtest Mode: ${this.playtestMode ? 'Enabled' : 'Disabled'} (F2)`);
            this.shouldRedraw = true;
        });
        this.inputManager.on('playtestSkipStage', () => {
            if (this.playtestMode) {
                const currentStage = this.sceneManager.getTutorialStage();
                if (currentStage < 5) {
                    console.log(`Playtest: Skipping to Stage ${currentStage + 1}`);
                    this.playtestShortcuts[`skipToStage${currentStage + 1}`]();
                    this.shouldRedraw = true;
                }
            }
        });
        this.inputManager.on('playtestReset', () => {
            if (this.playtestMode) {
                console.log("Playtest: Resetting to Stage 1");
                this.playtestShortcuts['resetToStage1']();
                this.shouldRedraw = true;
            }
        });
        this.inputManager.on('resetDialogueHistory', () => {
            if (this.playtestMode) {
                this.dialogueManager.resetDialogueHistory();
                console.log("Playtest: Dialogue history reset");
            }
        });
    }
    initializeTutorialTracking() {
        this.sceneManager.subscribeToTutorialEvent((event, data) => {
            if (event.startsWith('stage')) {
                const stage = parseInt(event.replace('stage', ''));
                if (this.currentStageStartTime > 0 && stage > 1 && this.tutorialStageTimes[stage - 1] === undefined) {
                    const timeSpent = (this.lastTime - this.currentStageStartTime) / 1000;
                    console.log(`Time spent on Stage ${stage - 1}: ${timeSpent.toFixed(2)} seconds`);
                    this.tutorialStageTimes[stage - 1] = timeSpent;
                    this.tutorialAnalytics.push({
                        stage: stage - 1,
                        startTime: this.currentStageStartTime / 1000,
                        endTime: this.lastTime / 1000,
                        interactions: this.currentInteractions
                    });
                    this.currentInteractions = 0;
                }
                this.currentStageStartTime = this.lastTime;
                this.gameState.tutorialStage = stage;
                this.hintTimer = 0;
                this.hintActive = false;
            }
            if (event === 'stage5') {
                this.tutorialCompleted = true;
                this.gameState.tutorialCompleted = true;
                console.log("Tutorial completed. Prompts disabled.");
                this.saveGameState();
                // Log final analytics for stage 5
                this.tutorialAnalytics.push({
                    stage: 5,
                    startTime: this.currentStageStartTime / 1000,
                    endTime: this.lastTime / 1000,
                    interactions: this.currentInteractions
                });
                this.logTutorialAnalytics();
                this.currentInteractions = 0;
            }
            // Trigger dialogue based on tutorial events
            this.dialogueManager.triggerDialogue(event, this.gameState);
        });
    }
    logTutorialAnalytics() {
        console.log("Tutorial Analytics Summary:");
        this.tutorialAnalytics.forEach(analytic => {
            const duration = analytic.endTime - analytic.startTime;
            console.log(`Stage ${analytic.stage}: Duration = ${duration.toFixed(2)}s, Interactions = ${analytic.interactions}`);
            if (duration > 60) {
                console.warn(`Potential pacing issue in Stage ${analytic.stage}: Took ${duration.toFixed(2)}s, which might indicate player confusion.`);
            }
            if (analytic.interactions > 10 && analytic.stage < 3) {
                console.warn(`High interaction count in Stage ${analytic.stage}: ${analytic.interactions} interactions, might indicate unclear objectives.`);
            }
        });
    }
    initializeDialogue() {
        this.dialogueManager.subscribeToDialogueChange((text, speaker) => {
            this.currentMonologue = text ? `${speaker}: ${text}` : "";
            this.shouldRedraw = true;
            if (text) {
                this.logPerformance('Dialogue Rendering', this.lastTime);
            }
        });
    }
    initializePlaytestShortcuts() {
        this.playtestShortcuts['skipToStage2'] = () => {
            this.sceneManager['tutorialStage'] = 2;
            this.sceneManager['tutorialProgress'] = { moved: true, interacted: true, timeShifted: false, pendantPickedUp: true, craftsmanTalked: false, pendantPiecePickedUp: false };
            this.gameState.tutorialStage = 2;
            this.dialogueManager['dialogueHistory'] = { "elara_pendant_pickup": true };
            this.saveGameState();
            console.log("Playtest: Skipped to Stage 2");
        };
        this.playtestShortcuts['skipToStage3'] = () => {
            this.sceneManager['tutorialStage'] = 3;
            this.sceneManager['tutorialProgress'] = { moved: true, interacted: true, timeShifted: true, pendantPickedUp: true, craftsmanTalked: false, pendantPiecePickedUp: false };
            this.gameState.tutorialStage = 3;
            this.dialogueManager['dialogueHistory'] = { "elara_pendant_pickup": true, "elara_first_timeshift": true };
            this.timeManager['currentEra'] = 0; // Set to Past
            this.gameState.currentEra = "past";
            this.saveGameState();
            console.log("Playtest: Skipped to Stage 3, Era set to Past");
        };
        this.playtestShortcuts['skipToStage4'] = () => {
            this.sceneManager['tutorialStage'] = 4;
            this.sceneManager['tutorialProgress'] = { moved: true, interacted: true, timeShifted: true, pendantPickedUp: true, craftsmanTalked: true, pendantPiecePickedUp: false };
            this.gameState.tutorialStage = 4;
            this.dialogueManager['dialogueHistory'] = { "elara_pendant_pickup": true, "elara_first_timeshift": true, "craftsman_interaction": true };
            this.timeManager['currentEra'] = 0; // Set to Past
            this.gameState.currentEra = "past";
            this.saveGameState();
            console.log("Playtest: Skipped to Stage 4, Era set to Past");
        };
        this.playtestShortcuts['skipToStage5'] = () => {
            this.sceneManager['tutorialStage'] = 5;
            this.sceneManager['tutorialProgress'] = { moved: true, interacted: true, timeShifted: true, pendantPickedUp: true, craftsmanTalked: true, pendantPiecePickedUp: true };
            this.gameState.tutorialStage = 5;
            this.dialogueManager['dialogueHistory'] = { "elara_pendant_pickup": true, "elara_first_timeshift": true, "craftsman_interaction": true, "elara_pendant_piece": true };
            this.timeManager['currentEra'] = 1; // Set to Present
            this.gameState.currentEra = "present";
            this.tutorialCompleted = false; // Temporarily set to false to show prompt
            this.saveGameState();
            console.log("Playtest: Skipped to Stage 5, Era set to Present");
        };
        this.playtestShortcuts['resetToStage1'] = () => {
            this.sceneManager['tutorialStage'] = 1;
            this.sceneManager['tutorialProgress'] = { moved: false, interacted: false, timeShifted: false, pendantPickedUp: false, craftsmanTalked: false, pendantPiecePickedUp: false };
            this.gameState.tutorialStage = 1;
            this.gameState.tutorialCompleted = false;
            this.tutorialCompleted = false;
            this.dialogueManager.resetDialogueHistory();
            this.timeManager['currentEra'] = 1; // Set to Present
            this.gameState.currentEra = "present";
            const player = this.sceneManager.getCurrentScene().entities[0];
            if (player) {
                player.moveTo(200, 300);
            }
            this.tutorialAnalytics = [];
            this.currentInteractions = 0;
            this.currentStageStartTime = this.lastTime;
            this.saveGameState();
            console.log("Playtest: Reset to Stage 1, Era set to Present, History cleared");
        };
    }
    saveGameState() {
        const playerPos = this.sceneManager.getCurrentScene().entities[0].getPosition();
        this.gameState.playerPosition = playerPos;
        this.gameState.puzzleStates = {
            bridge_puzzle: {
                past: this.puzzleManager.getPuzzleState('bridge_puzzle', 'past'),
                present: this.puzzleManager.getPuzzleState('bridge_puzzle', 'present'),
                future: this.puzzleManager.getPuzzleState('bridge_puzzle', 'future'),
                solved: this.puzzleManager.isPuzzleSolved('bridge_puzzle')
            },
            well_puzzle: {
                past: this.puzzleManager.getPuzzleState('well_puzzle', 'past'),
                present: this.puzzleManager.getPuzzleState('well_puzzle', 'present'),
                future: this.puzzleManager.getPuzzleState('well_puzzle', 'future'),
                solved: this.puzzleManager.isPuzzleSolved('well_puzzle')
            }
        };
        localStorage.setItem('chronoFractureGameState', JSON.stringify(this.gameState));
        console.log("Game state saved.");
    }
    loadGameState() {
        const savedState = localStorage.getItem('chronoFractureGameState');
        if (savedState) {
            try {
                this.gameState = JSON.parse(savedState);
                this.tutorialCompleted = this.gameState.tutorialCompleted || false;
                this.tutorialStageTimes = {}; // Reset timing stats on load for fresh tracking if needed
                console.log("Game state loaded successfully.");
            }
            catch (e) {
                console.error("Failed to parse saved game state. Resetting to default.", e);
                this.gameState = {
                    tutorialStage: 1,
                    tutorialCompleted: false,
                    playerPosition: { x: 200, y: 300 },
                    puzzleStates: {},
                    currentEra: "present"
                };
            }
        }
    }
    async start() {
        this.isLoading = true;
        this.lastAssetLoadStartTime = performance.now();
        await this.loadAssets();
        const loadDuration = performance.now() - this.lastAssetLoadStartTime;
        this.logPerformance('Asset Loading Complete', this.lastTime, loadDuration);
        this.isLoading = false;
        this.sceneManager.loadInitialScene();
        if (this.gameState.tutorialStage > 1) {
            // Apply saved player position if available
            const player = this.sceneManager.getCurrentScene().entities[0];
            if (player) {
                player.moveTo(this.gameState.playerPosition.x, this.gameState.playerPosition.y);
            }
            // Set era based on saved state
            if (this.gameState.currentEra === "past") {
                this.timeManager['currentEra'] = 0;
            }
            else if (this.gameState.currentEra === "future") {
                this.timeManager['currentEra'] = 2;
            }
            else {
                this.timeManager['currentEra'] = 1;
            }
            // Update scene manager tutorial stage
            this.sceneManager['tutorialStage'] = this.gameState.tutorialStage;
        }
        this.currentPrompt = this.tutorialCompleted ? "" : this.tutorialPrompts[this.gameState.tutorialStage] || "";
        this.currentStageStartTime = 0;
        this.gameLoop(0);
    }
    async loadAssets() {
        const assets = [
            'sprites/player_past.png',
            'sprites/player_present.png',
            'sprites/player_future.png',
            'environments/past_tree.png',
            'environments/present_tree.png',
            'environments/future_tree.png',
            'environments/past_bridge.png',
            'environments/present_bridge.png',
            'environments/future_bridge.png',
            'environments/past_well.png',
            'environments/present_well.png',
            'environments/future_well.png',
            'environments/pendant_present.png',
            'environments/pendant_piece_past.png',
            'environments/log_past.png',
            'environments/log_present.png',
            'environments/boulder_past.png'
        ];
        await this.assetManager.preloadAssets(assets);
    }
    gameLoop(currentTime) {
        if (this.isLoading) {
            this.renderLoadingScreen();
            requestAnimationFrame(this.gameLoop.bind(this));
            return;
        }
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.update(deltaTime);
        if (this.shouldRedraw || this.renderManager.isTransitioning()) {
            this.render();
            this.shouldRedraw = false;
        }
        this.updateFps(currentTime);
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    update(deltaTime) {
        this.sceneManager.update(deltaTime);
        this.renderManager.updateTransition(deltaTime);
        this.dialogueManager.update(deltaTime);
        this.dialogueManager.setPerformanceFallback(this.fps); // Check FPS for fallback rendering
        const tutorialStage = this.sceneManager.getTutorialStage();
        this.currentPrompt = this.tutorialCompleted ? "" : this.tutorialPrompts[tutorialStage] || "";
        if (this.lastTime > 0 && !this.hintActive && tutorialStage <= 5 && !this.tutorialCompleted) {
            this.hintTimer += deltaTime;
            if (this.hintTimer >= this.hintDuration) {
                this.hintActive = true;
                this.shouldRedraw = true;
                console.log("Hint activated: Player inactive for 30 seconds.");
            }
        }
        // Auto-save every 30 seconds if tutorial is not completed
        if (this.lastTime - (this.gameState.lastSaveTime || 0) >= 30000 && !this.tutorialCompleted) {
            this.saveGameState();
            this.gameState.lastSaveTime = this.lastTime;
        }
    }
    resetHintTimer() {
        this.hintTimer = 0;
        if (this.hintActive) {
            this.hintActive = false;
            this.shouldRedraw = true;
        }
    }
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.renderManager.render(this.sceneManager.getCurrentScene(), this.timeManager.getCurrentEra());
        if (this.debugMode || this.playtestMode) {
            this.renderDebugOverlay();
        }
        if (this.currentPrompt) {
            this.renderTutorialPrompt();
        }
        const dialogue = this.dialogueManager.getCurrentDialogue();
        if (dialogue) {
            this.renderMonologue(dialogue.text, dialogue.speaker);
        }
        if (this.hintActive && this.hintsEnabled) {
            this.renderHintGlow();
        }
    }
    renderLoadingScreen() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas);
    }
}

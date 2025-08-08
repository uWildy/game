import { Scene } from '../core/Scene';
import { Player } from '../entities/Player';
export class SceneManager {
    constructor(timeManager, puzzleManager) {
        this.scenes = {};
        this.tutorialStage = 1;
        this.tutorialProgress = {
            moved: false,
            interacted: false,
            timeShifted: false
        };
        this.timeManager = timeManager;
        this.puzzleManager = puzzleManager;
        this.currentScene = new Scene('default');
        this.player = new Player(200, 300);
    }
    loadInitialScene() {
        this.currentScene = new Scene('hub_1');
        this.scenes['hub_1'] = this.currentScene;
        this.currentScene.addEntity(this.player);
        this.currentScene.initializePuzzles(this.puzzleManager);
        this.currentScene.initializeTutorialObjectives();
    }
    update(deltaTime) {
        this.timeManager.update(deltaTime);
        this.currentScene.update(deltaTime, this.timeManager.getCurrentEra());
        this.updateTutorialProgress();
    }
    getCurrentScene() {
        return this.currentScene;
    }
    handlePlayerMovement(direction) {
        const era = this.timeManager.getCurrentEra();
        const objects = this.currentScene.getObjectsForEra(era);
        this.player.move(direction, objects);
        if (this.tutorialStage === 1) {
            this.tutorialProgress.moved = true;
        }
    }
    handlePlayerInteraction() {
        this.currentScene.handleInteraction(this.player.getPosition(), this.timeManager.getCurrentEra());
        if (this.tutorialStage === 1) {
            this.tutorialProgress.interacted = true;
        }
    }
    handleTimeShift() {
        if (this.tutorialStage === 2) {
            this.tutorialProgress.timeShifted = true;
        }
    }
    updateTutorialProgress() {
        if (this.tutorialStage === 1 && this.tutorialProgress.moved && this.tutorialProgress.interacted) {
            this.tutorialStage = 2;
            // Trigger narrative cue for time shifting
            console.log("Tutorial Stage 2: Introduce Time Shifting");
        }
        else if (this.tutorialStage === 2 && this.tutorialProgress.timeShifted) {
            this.tutorialStage = 3;
            console.log("Tutorial Stage 3: First Cross-Era Interaction");
        }
    }
    getTutorialStage() {
        return this.tutorialStage;
    }
}

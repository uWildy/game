import { TimeManager } from './TimeManager';
import { PuzzleManager } from './PuzzleManager';
import { Scene } from '../core/Scene';
import { Player } from '../entities/Player';

export class SceneManager {
    private timeManager: TimeManager;
    private puzzleManager: PuzzleManager;
    private currentScene: Scene;
    private scenes: Record<string, Scene> = {};
    private player: Player;
    private tutorialStage: number = 1;
    private tutorialProgress: Record<string, boolean> = {
        moved: false,
        interacted: false,
        timeShifted: false
    };

    constructor(timeManager: TimeManager, puzzleManager: PuzzleManager) {
        this.timeManager = timeManager;
        this.puzzleManager = puzzleManager;
        this.currentScene = new Scene('default');
        this.player = new Player(200, 300);
    }

    public loadInitialScene(): void {
        this.currentScene = new Scene('hub_1');
        this.scenes['hub_1'] = this.currentScene;
        this.currentScene.addEntity(this.player);
        this.currentScene.initializePuzzles(this.puzzleManager);
        this.currentScene.initializeTutorialObjectives();
    }

    public update(deltaTime: number): void {
        this.timeManager.update(deltaTime);
        this.currentScene.update(deltaTime, this.timeManager.getCurrentEra());
        this.updateTutorialProgress();
    }

    public getCurrentScene(): Scene {
        return this.currentScene;
    }

    public handlePlayerMovement(direction: string): void {
        const era = this.timeManager.getCurrentEra();
        const objects = this.currentScene.getObjectsForEra(era);
        this.player.move(direction, objects);
        if (this.tutorialStage === 1) {
            this.tutorialProgress.moved = true;
        }
    }

    public handlePlayerInteraction(): void {
        this.currentScene.handleInteraction(this.player.getPosition(), this.timeManager.getCurrentEra());
        if (this.tutorialStage === 1) {
            this.tutorialProgress.interacted = true;
        }
    }

    public handleTimeShift(): void {
        if (this.tutorialStage === 2) {
            this.tutorialProgress.timeShifted = true;
        }
    }

    private updateTutorialProgress(): void {
        if (this.tutorialStage === 1 && this.tutorialProgress.moved && this.tutorialProgress.interacted) {
            this.tutorialStage = 2;
            // Trigger narrative cue for time shifting
            console.log("Tutorial Stage 2: Introduce Time Shifting");
        } else if (this.tutorialStage === 2 && this.tutorialProgress.timeShifted) {
            this.tutorialStage = 3;
            console.log("Tutorial Stage 3: First Cross-Era Interaction");
        }
    }

    public getTutorialStage(): number {
        return this.tutorialStage;
    }
}
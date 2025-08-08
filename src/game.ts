import { Player } from './player';
import { TimeSystem } from './timeSystem';
import { Level } from './level';
import { InputHandler } from './input';
import { UI } from './ui';
import { Debug } from './debug';
import { Assets } from './assets';
import { PerformanceLogger } from './performanceLogger';
import { VisualEffects } from './visualEffects';
import { TutorialPrompts } from './tutorialPrompts';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private player: Player;
    private timeSystem: TimeSystem;
    private currentLevel: Level;
    private inputHandler: InputHandler;
    private ui: UI;
    private debug: Debug;
    private assets: Assets;
    private performanceLogger: PerformanceLogger;
    private visualEffects: VisualEffects;
    private tutorialPrompts: TutorialPrompts;
    private width: number;
    private height: number;
    private lastTime: number = 0;
    private playerHealth: number = 3;
    private lastPlayerPos: { x: number, y: number } = { x: 100, y: 100 };

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.width = this.canvas.width = 800;
        this.height = this.canvas.height = 600;
        this.assets = new Assets(this);
        this.player = new Player(this, 100, 100);
        this.timeSystem = new TimeSystem(this);
        this.currentLevel = new Level(this, 'TimelessNexus');
        this.inputHandler = new InputHandler(this);
        this.ui = new UI(this);
        this.debug = new Debug(this);
        this.performanceLogger = new PerformanceLogger(this.canvas);
        this.visualEffects = new VisualEffects(this);
        this.tutorialPrompts = new TutorialPrompts(this);
        this.loadAssets();
    }

    private loadAssets(): void {
        this.assets.loadAssets().then(() => {
            console.log('Assets loaded successfully');
        }).catch(err => {
            console.error('Asset loading failed:', err);
        });
    }

    public start(): void {
        this.animate(0);
    }

    private animate(timeStamp: number): void {
        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;

        this.performanceLogger.update(timeStamp);
        this.update(deltaTime);
        this.draw();
        requestAnimationFrame(this.animate.bind(this));
    }

    private update(deltaTime: number): void {
        this.player.update(deltaTime);
        this.timeSystem.update(deltaTime);
        this.currentLevel.update(deltaTime);
        this.visualEffects.updateTransition(deltaTime);
        this.tutorialPrompts.update(deltaTime);

        // Check for enemy attacks or hazards (basic placeholder for player damage)
        if (this.currentLevel.getLevelId() === 'AncientPast') {
            const enemies = this.currentLevel['getEnemies']();
            if (enemies) {
                const playerPos = this.player.getPosition();
                enemies.forEach(enemy => {
                    const enemyPos = enemy['getPosition']();
                    const distance = Math.sqrt(Math.pow(playerPos.x - enemyPos.x, 2) + Math.pow(playerPos.y - enemyPos.y, 2));
                    if (distance < 50) { // Adjusted attack range
                        // Simulate attack (since enemy class logs it, just reduce health)
                        this.playerHealth -= 1;
                        this.debug.logAction(`Player Hit`, `Health: ${this.playerHealth}`);
                        if (this.playerHealth <= 0) {
                            this.handlePlayerDeath();
                        }
                    }
                });
            }
        }

        // Update last safe position for rewind on death
        const currentPos = this.player.getPosition();
        if (this.playerHealth > 0) {
            this.lastPlayerPos = { x: currentPos.x, y: currentPos.y };
        }
    }

    private draw(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.currentLevel.draw(this.ctx);
        this.player.draw(this.ctx);
        this.ui.draw(this.ctx);
        this.debug.draw(this.ctx);
        this.performanceLogger.draw(this.ctx);
        this.visualEffects.drawTransition();
        this.tutorialPrompts.draw(this.ctx);
    }

    private handlePlayerDeath(): void {
        const energy = this.timeSystem['timeEnergy'];
        if (energy >= 20) {
            this.timeSystem['timeEnergy'] -= 20;
            this.player.setPosition(this.lastPlayerPos.x, this.lastPlayerPos.y);
            this.playerHealth = 3;
            this.debug.logAction(`Player Death`, `Rewind to last safe position with energy cost`);
        } else {
            this.player.setPosition(100, 100); // Reset to spawn
            this.playerHealth = 3;
            this.debug.logAction(`Player Death`, `Reset to spawn - no energy for rewind`);
        }
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public getPlayer(): Player {
        return this.player;
    }

    public getTimeSystem(): TimeSystem {
        return this.timeSystem;
    }

    public getCurrentLevel(): Level {
        return this.currentLevel;
    }

    public changeLevel(levelId: string): void {
        if (this.visualEffects.isTransitionActive()) return;
        this.visualEffects.startPortalTransition(levelId);
        this.debug.logAction(`Level Transition Started`, `to ${levelId}`);
    }
}
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
    constructor(canvasId) {
        this.lastTime = 0;
        this.playerHealth = 3;
        this.lastPlayerPos = { x: 100, y: 100 };
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
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
    loadAssets() {
        this.assets.loadAssets().then(() => {
            console.log('Assets loaded successfully');
        }).catch(err => {
            console.error('Asset loading failed:', err);
        });
    }
    start() {
        this.animate(0);
    }
    animate(timeStamp) {
        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;
        this.performanceLogger.update(timeStamp);
        this.update(deltaTime);
        this.draw();
        requestAnimationFrame(this.animate.bind(this));
    }
    update(deltaTime) {
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
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.currentLevel.draw(this.ctx);
        this.player.draw(this.ctx);
        this.ui.draw(this.ctx);
        this.debug.draw(this.ctx);
        this.performanceLogger.draw(this.ctx);
        this.visualEffects.drawTransition();
        this.tutorialPrompts.draw(this.ctx);
    }
    handlePlayerDeath() {
        const energy = this.timeSystem['timeEnergy'];
        if (energy >= 20) {
            this.timeSystem['timeEnergy'] -= 20;
            this.player.setPosition(this.lastPlayerPos.x, this.lastPlayerPos.y);
            this.playerHealth = 3;
            this.debug.logAction(`Player Death`, `Rewind to last safe position with energy cost`);
        }
        else {
            this.player.setPosition(100, 100); // Reset to spawn
            this.playerHealth = 3;
            this.debug.logAction(`Player Death`, `Reset to spawn - no energy for rewind`);
        }
    }
    getCanvas() {
        return this.canvas;
    }
    getPlayer() {
        return this.player;
    }
    getTimeSystem() {
        return this.timeSystem;
    }
    getCurrentLevel() {
        return this.currentLevel;
    }
    changeLevel(levelId) {
        if (this.visualEffects.isTransitionActive())
            return;
        this.visualEffects.startPortalTransition(levelId);
        this.debug.logAction(`Level Transition Started`, `to ${levelId}`);
    }
}

import { Game } from './game';
import { Debug } from './debug';

export class TimeSystem {
    private game: Game;
    private currentEra: string = 'Present';
    private timeFlow: number = 1; // 1 = normal, -1 = rewind, 0 = paused
    private eras: string[] = ['AncientPast', 'Present', 'DystopianFuture'];
    private timeEnergy: number = 100; // Resource for time manipulation
    private maxEnergy: number = 100;
    private debug: Debug;
    private rewindBuffer: { playerPos: { x: number, y: number }, time: number }[] = [];
    private maxRewindTime: number = 7000; // Adjusted to 7 seconds in milliseconds
    private rewindStartTime: number = 0;

    constructor(game: Game) {
        this.game = game;
        this.debug = game['debug'];
    }

    public update(deltaTime: number): void {
        if (this.timeFlow !== 0) {
            this.timeEnergy -= Math.abs(this.timeFlow) * 0.1;
            if (this.timeEnergy < 0) {
                this.timeEnergy = 0;
                this.timeFlow = 1; // Reset to normal if energy depletes
                this.debug.logTimeFlowChange(this.timeFlow);
            }
        }

        // Store player position for rewind buffer if time flow is normal
        if (this.timeFlow === 1) {
            const playerPos = this.game.getPlayer().getPosition();
            const now = Date.now();
            this.rewindBuffer.push({ playerPos: { x: playerPos.x, y: playerPos.y }, time: now });
            // Clean up buffer to keep only last 7 seconds
            this.rewindBuffer = this.rewindBuffer.filter(entry => now - entry.time <= this.maxRewindTime);
        }

        // Apply rewind if active
        if (this.timeFlow === -1 && this.rewindBuffer.length > 0) {
            const elapsedRewind = Date.now() - this.rewindStartTime;
            if (elapsedRewind >= this.maxRewindTime || this.timeEnergy <= 0) {
                this.timeFlow = 1; // Stop rewind after max time or energy depletion
                this.debug.logTimeFlowChange(this.timeFlow);
            } else {
                const lastState = this.rewindBuffer.pop();
                if (lastState) {
                    this.game.getPlayer().setPosition(lastState.playerPos.x, lastState.playerPos.y);
                }
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Drawing moved to UI class
    }

    public changeEra(era: string): void {
        if (this.eras.includes(era) && this.timeEnergy > 20) {
            this.currentEra = era;
            this.timeEnergy -= 20;
            this.game.changeLevel(era);
            this.debug.logEraSwitch(era);
        }
    }

    public setTimeFlow(flow: number): void {
        if (this.timeEnergy > 0 || flow === 1) {
            this.timeFlow = flow;
            if (flow === -1) {
                this.rewindStartTime = Date.now();
            }
            this.debug.logTimeFlowChange(flow);
        }
    }

    public getCurrentEra(): string {
        return this.currentEra;
    }

    public getTimeFlow(): number {
        return this.timeFlow;
    }

    private getTimeFlowLabel(): string {
        if (this.timeFlow === 1) return 'Normal';
        if (this.timeFlow === -1) return 'Rewind';
        return 'Paused';
    }

    public rechargeEnergy(amount: number): void {
        this.timeEnergy = Math.min(this.maxEnergy, this.timeEnergy + amount);
    }
}
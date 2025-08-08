export class TimeSystem {
    constructor(game) {
        this.currentEra = 'Present';
        this.timeFlow = 1; // 1 = normal, -1 = rewind, 0 = paused
        this.eras = ['AncientPast', 'Present', 'DystopianFuture'];
        this.timeEnergy = 100; // Resource for time manipulation
        this.maxEnergy = 100;
        this.rewindBuffer = [];
        this.maxRewindTime = 7000; // Adjusted to 7 seconds in milliseconds
        this.rewindStartTime = 0;
        this.game = game;
        this.debug = game['debug'];
    }
    update(deltaTime) {
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
            }
            else {
                const lastState = this.rewindBuffer.pop();
                if (lastState) {
                    this.game.getPlayer().setPosition(lastState.playerPos.x, lastState.playerPos.y);
                }
            }
        }
    }
    draw(ctx) {
        // Drawing moved to UI class
    }
    changeEra(era) {
        if (this.eras.includes(era) && this.timeEnergy > 20) {
            this.currentEra = era;
            this.timeEnergy -= 20;
            this.game.changeLevel(era);
            this.debug.logEraSwitch(era);
        }
    }
    setTimeFlow(flow) {
        if (this.timeEnergy > 0 || flow === 1) {
            this.timeFlow = flow;
            if (flow === -1) {
                this.rewindStartTime = Date.now();
            }
            this.debug.logTimeFlowChange(flow);
        }
    }
    getCurrentEra() {
        return this.currentEra;
    }
    getTimeFlow() {
        return this.timeFlow;
    }
    getTimeFlowLabel() {
        if (this.timeFlow === 1)
            return 'Normal';
        if (this.timeFlow === -1)
            return 'Rewind';
        return 'Paused';
    }
    rechargeEnergy(amount) {
        this.timeEnergy = Math.min(this.maxEnergy, this.timeEnergy + amount);
    }
}

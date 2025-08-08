export class UI {
    constructor(game) {
        this.game = game;
        this.timeSystem = game.getTimeSystem();
        this.canvas = game.getCanvas();
    }
    draw(ctx) {
        // Era Indicator
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 150, 40);
        ctx.fillStyle = 'white';
        ctx.font = '18px Arial';
        ctx.fillText(`Era: ${this.timeSystem.getCurrentEra()}`, 20, 35);
        // Time Flow Indicator
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 60, 150, 40);
        ctx.fillStyle = 'white';
        ctx.font = '18px Arial';
        const timeFlowLabel = this.getTimeFlowLabel();
        ctx.fillText(`Time: ${timeFlowLabel}`, 20, 85);
        // Time Energy Bar
        const energy = this.timeSystem['timeEnergy'];
        const maxEnergy = this.timeSystem['maxEnergy'];
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 110, 150, 30);
        ctx.fillStyle = 'green';
        ctx.fillRect(15, 115, (energy / maxEnergy) * 140, 20);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(15, 115, 140, 20);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(`${Math.round(energy)} / ${maxEnergy}`, 60, 130);
        // Player Health (Placeholder)
        const playerHealth = this.game['playerHealth'] || 3;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 150, 150, 30);
        ctx.fillStyle = 'red';
        ctx.fillRect(15, 155, playerHealth * 40, 20);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(15, 155, 120, 20);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(`Health: ${playerHealth}`, 60, 170);
    }
    getTimeFlowLabel() {
        const flow = this.timeSystem.getTimeFlow();
        if (flow === 1)
            return 'Normal';
        if (flow === -1)
            return 'Rewind';
        return 'Paused';
    }
}

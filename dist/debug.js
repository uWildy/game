export class Debug {
    constructor(game) {
        this.log = [];
        this.maxLogs = 50;
        this.game = game;
        this.timeSystem = game.getTimeSystem();
        this.player = game.getPlayer();
    }
    logAction(action, details = '') {
        const timestamp = new Date().toLocaleTimeString();
        const era = this.timeSystem.getCurrentEra();
        const pos = this.player.getPosition();
        const logEntry = `[${timestamp}] [Era: ${era}] [Pos: ${Math.round(pos.x)},${Math.round(pos.y)}] ${action} ${details}`;
        this.log.push(logEntry);
        if (this.log.length > this.maxLogs) {
            this.log.shift();
        }
        console.log(logEntry);
    }
    logEraSwitch(newEra) {
        this.logAction(`Era Switch`, `to ${newEra}`);
    }
    logTimeFlowChange(flow) {
        const label = flow === 1 ? 'Normal' : flow === 0 ? 'Paused' : 'Rewind';
        this.logAction(`Time Flow Change`, `to ${label}`);
    }
    draw(ctx) {
        // Optional: Render debug log on canvas for in-game visibility (limited to last 5 entries)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.game.getCanvas().width - 300, 10, 290, 120);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        const recentLogs = this.log.slice(-5);
        recentLogs.forEach((log, index) => {
            ctx.fillText(log, this.game.getCanvas().width - 290, 30 + index * 20);
        });
    }
}

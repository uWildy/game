export class PerformanceLogger {
    constructor(canvas) {
        this.canvas = canvas;
        this.frameCount = 0;
        this.lastTime = 0;
        this.fps = 0;
        this.logInterval = 5000; // Log every 5 seconds
        this.lastLogTime = 0;
        this.fpsHistory = [];
        this.lastTime = performance.now();
        this.lastLogTime = performance.now();
    }
    update(currentTime) {
        this.frameCount++;
        const deltaTime = currentTime - this.lastTime;
        if (deltaTime >= 1000) { // Update FPS every second
            this.fps = Math.round(this.frameCount * 1000 / deltaTime);
            this.frameCount = 0;
            this.lastTime = currentTime;
            this.fpsHistory.push(this.fps);
            if (this.fpsHistory.length > 60) { // Keep last 60 seconds of FPS data
                this.fpsHistory.shift();
            }
        }
        // Periodic logging for tester data
        if (currentTime - this.lastLogTime >= this.logInterval) {
            console.log(`[Performance] Current FPS: ${this.fps}, Avg FPS (last 60s): ${this.getAverageFPS()}`);
            this.lastLogTime = currentTime;
        }
    }
    draw(ctx) {
        // Display FPS counter in top-right corner for testers
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.canvas.width - 100, 10, 90, 30);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(`FPS: ${this.fps}`, this.canvas.width - 90, 30);
    }
    getFPS() {
        return this.fps;
    }
    getAverageFPS() {
        if (this.fpsHistory.length === 0)
            return 0;
        return Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);
    }
    getFPSHistory() {
        return [...this.fpsHistory];
    }
}

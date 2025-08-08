export class PerformanceLogger {
    private frameCount: number = 0;
    private lastTime: number = 0;
    private fps: number = 0;
    private logInterval: number = 5000; // Log every 5 seconds
    private lastLogTime: number = 0;
    private fpsHistory: number[] = [];

    constructor(private canvas: HTMLCanvasElement) {
        this.lastTime = performance.now();
        this.lastLogTime = performance.now();
    }

    public update(currentTime: number): void {
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

    public draw(ctx: CanvasRenderingContext2D): void {
        // Display FPS counter in top-right corner for testers
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.canvas.width - 100, 10, 90, 30);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(`FPS: ${this.fps}`, this.canvas.width - 90, 30);
    }

    public getFPS(): number {
        return this.fps;
    }

    public getAverageFPS(): number {
        if (this.fpsHistory.length === 0) return 0;
        return Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);
    }

    public getFPSHistory(): number[] {
        return [...this.fpsHistory];
    }
}
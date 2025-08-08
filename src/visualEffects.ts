import { Game } from './game';

export class VisualEffects {
    private game: Game;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private portalSwirlFrames: { id: string, color: string }[] = [];
    private currentPortalFrame: number = 0;
    private isTransitioning: boolean = false;
    private transitionTargetEra: string = '';
    private transitionElapsed: number = 0;
    private transitionDuration: number = 1500; // 1.5 seconds
    private width: number = 32;
    private height: number = 32;

    constructor(game: Game) {
        this.game = game;
        this.canvas = game.getCanvas();
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.loadPortalSwirl();
    }

    private loadPortalSwirl(): void {
        // Placeholder for loading portal swirl animation
        // In a real environment, this would load assets/effects/portal_swirl.png
        // For now, simulate frames as color changes or simple animations
        this.portalSwirlFrames = Array(5).fill(null).map((_, i) => ({
            id: `frame_${i}`,
            color: 'green' // Placeholder, would be image data
        }));
    }

    public applyGrayscalePause(): void {
        // Apply grayscale filter to environment during pause
        if (this.game.getTimeSystem().getTimeFlow() === 0) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'saturation';
            this.ctx.fillStyle = 'hsl(0, 0%, 50%)'; // Grayscale approximation
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
    }

    public startPortalTransition(targetEra: string): void {
        this.isTransitioning = true;
        this.transitionTargetEra = targetEra;
        this.transitionElapsed = 0;
        this.currentPortalFrame = 0;
    }

    public updateTransition(deltaTime: number): void {
        if (!this.isTransitioning) return;

        this.transitionElapsed += deltaTime;
        if (this.transitionElapsed >= this.transitionDuration) {
            this.isTransitioning = false;
            const levelId = this.transitionTargetEra;
            this.game['currentLevel'] = new Level(this.game, levelId);
            // Reset player position based on level
            if (levelId === 'AncientPast') {
                this.game.getPlayer().setPosition(5 * 16 * 4, 5 * 16 * 4); // Grid 5,2 scaled
            } else {
                this.game.getPlayer().setPosition(100, 100);
            }
            this.game['debug'].logAction(`Level Change`, `to ${levelId}`);
            return;
        }

        // Update animation frame (5 frames over 1.5s = ~300ms per frame)
        const frameIndex = Math.floor(this.transitionElapsed / 300) % 5;
        this.currentPortalFrame = frameIndex;
    }

    public drawTransition(): void {
        if (!this.isTransitioning) return;

        const playerPos = this.game.getPlayer().getPosition();
        const scale = this.transitionElapsed / this.transitionDuration * 2;
        const alpha = 1 - (this.transitionElapsed / this.transitionDuration);

        this.ctx.save();
        this.ctx.translate(playerPos.x + this.width / 2, playerPos.y + this.height / 2);
        this.ctx.scale(scale, scale);
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = this.portalSwirlFrames[this.currentPortalFrame].color;
        this.ctx.fillRect(-16, -16, 32, 32); // Placeholder for swirl sprite
        this.ctx.restore();

        // Fade to white effect
        this.ctx.fillStyle = `rgba(255, 255, 255, ${(this.transitionElapsed / this.transitionDuration) * 0.8})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public isTransitionActive(): boolean {
        return this.isTransitioning;
    }
}
import { Scene } from '../core/Scene';
import { TransitionManager } from './TransitionManager';
import { AssetManager } from './AssetManager';

export class RenderManager {
    private ctx: CanvasRenderingContext2D;
    private transitionManager: TransitionManager;
    private assetManager: AssetManager;

    constructor(ctx: CanvasRenderingContext2D, assetManager: AssetManager) {
        this.ctx = ctx;
        this.assetManager = assetManager;
        this.transitionManager = new TransitionManager();
    }

    public render(scene: Scene, era: string): void {
        this.ctx.save();
        this.applyEraFilter();
        scene.render(this.ctx, this.assetManager, era);
        this.renderOverlayIfNeeded();
        this.ctx.restore();
    }

    private applyEraFilter(): void {
        const filter = this.transitionManager.getTransitionFilter();
        this.ctx.filter = filter;
    }

    private renderOverlayIfNeeded(): void {
        const overlay = this.transitionManager.getOverlayEffect();
        if (overlay) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.restore();
        }
    }

    public startTransition(fromEra: string, toEra: string): void {
        this.transitionManager.startTransition(fromEra, toEra);
    }

    public updateTransition(deltaTime: number): void {
        this.transitionManager.update(deltaTime);
    }

    public isTransitioning(): boolean {
        return this.transitionManager.isTransitioning();
    }
}
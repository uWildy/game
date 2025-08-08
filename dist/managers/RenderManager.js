import { TransitionManager } from './TransitionManager';
export class RenderManager {
    constructor(ctx, assetManager) {
        this.ctx = ctx;
        this.assetManager = assetManager;
        this.transitionManager = new TransitionManager();
    }
    render(scene, era) {
        this.ctx.save();
        this.applyEraFilter();
        scene.render(this.ctx, this.assetManager, era);
        this.renderOverlayIfNeeded();
        this.ctx.restore();
    }
    applyEraFilter() {
        const filter = this.transitionManager.getTransitionFilter();
        this.ctx.filter = filter;
    }
    renderOverlayIfNeeded() {
        const overlay = this.transitionManager.getOverlayEffect();
        if (overlay) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.restore();
        }
    }
    startTransition(fromEra, toEra) {
        this.transitionManager.startTransition(fromEra, toEra);
    }
    updateTransition(deltaTime) {
        this.transitionManager.update(deltaTime);
    }
    isTransitioning() {
        return this.transitionManager.isTransitioning();
    }
}

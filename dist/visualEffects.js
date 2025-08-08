export class VisualEffects {
    constructor(game) {
        this.portalSwirlFrames = [];
        this.currentPortalFrame = 0;
        this.isTransitioning = false;
        this.transitionTargetEra = '';
        this.transitionElapsed = 0;
        this.transitionDuration = 1500; // 1.5 seconds
        this.width = 32;
        this.height = 32;
        this.game = game;
        this.canvas = game.getCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.loadPortalSwirl();
    }
    loadPortalSwirl() {
        // Placeholder for loading portal swirl animation
        // In a real environment, this would load assets/effects/portal_swirl.png
        // For now, simulate frames as color changes or simple animations
        this.portalSwirlFrames = Array(5).fill(null).map((_, i) => ({
            id: `frame_${i}`,
            color: 'green' // Placeholder, would be image data
        }));
    }
    applyGrayscalePause() {
        // Apply grayscale filter to environment during pause
        if (this.game.getTimeSystem().getTimeFlow() === 0) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'saturation';
            this.ctx.fillStyle = 'hsl(0, 0%, 50%)'; // Grayscale approximation
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
    }
    startPortalTransition(targetEra) {
        this.isTransitioning = true;
        this.transitionTargetEra = targetEra;
        this.transitionElapsed = 0;
        this.currentPortalFrame = 0;
    }
    updateTransition(deltaTime) {
        if (!this.isTransitioning)
            return;
        this.transitionElapsed += deltaTime;
        if (this.transitionElapsed >= this.transitionDuration) {
            this.isTransitioning = false;
            const levelId = this.transitionTargetEra;
            this.game['currentLevel'] = new Level(this.game, levelId);
            // Reset player position based on level
            if (levelId === 'AncientPast') {
                this.game.getPlayer().setPosition(5 * 16 * 4, 5 * 16 * 4); // Grid 5,2 scaled
            }
            else {
                this.game.getPlayer().setPosition(100, 100);
            }
            this.game['debug'].logAction(`Level Change`, `to ${levelId}`);
            return;
        }
        // Update animation frame (5 frames over 1.5s = ~300ms per frame)
        const frameIndex = Math.floor(this.transitionElapsed / 300) % 5;
        this.currentPortalFrame = frameIndex;
    }
    drawTransition() {
        if (!this.isTransitioning)
            return;
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
    isTransitionActive() {
        return this.isTransitioning;
    }
}

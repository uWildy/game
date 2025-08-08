export class Puzzle {
    constructor(game) {
        this.stones = [];
        this.totalStones = 3;
        this.isCompleted = false;
        this.game = game;
        this.debug = game['debug'];
        this.initializeStones();
    }
    initializeStones() {
        // Place stones in Ancient Ruins area (based on grid 1-2,4-5 scaled to canvas)
        const baseX = 100;
        const baseY = 80;
        for (let i = 0; i < this.totalStones; i++) {
            this.stones.push({
                x: baseX + i * 50,
                y: baseY,
                aligned: false,
                moving: true,
                showGlow: false
            });
        }
    }
    update(deltaTime, timeFlow) {
        if (this.isCompleted)
            return;
        // Simulate stone movement if not paused
        if (timeFlow === 1) {
            this.stones.forEach(stone => {
                if (stone.moving) {
                    stone.y += Math.sin(Date.now() * 0.002) * 0.5; // Slow oscillation
                }
            });
        }
        // Check player interaction for alignment (placeholder logic)
        const playerPos = this.game.getPlayer().getPosition();
        this.stones.forEach((stone, index) => {
            const distance = Math.sqrt(Math.pow(playerPos.x - stone.x, 2) + Math.pow(playerPos.y - stone.y, 2));
            const inRange = distance < 20;
            stone.showGlow = inRange && timeFlow === 0;
            if (!stone.aligned && inRange) {
                if (timeFlow === 0) { // Align only if time is paused
                    stone.aligned = true;
                    stone.moving = false;
                    this.debug.logAction(`Puzzle`, `Stone ${index + 1} aligned`);
                }
            }
        });
        // Check if puzzle is complete
        if (this.stones.every(stone => stone.aligned)) {
            this.isCompleted = true;
            this.debug.logAction(`Puzzle`, `Completed - Narrative trigger`);
            this.game.getTimeSystem().rechargeEnergy(50); // Reward energy
        }
    }
    draw(ctx) {
        this.stones.forEach((stone, index) => {
            ctx.fillStyle = stone.aligned ? 'gold' : 'gray';
            ctx.fillRect(stone.x, stone.y, 20, 20);
            if (stone.showGlow) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.strokeRect(stone.x - 2, stone.y - 2, 24, 24);
            }
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(`S${index + 1}`, stone.x + 5, stone.y + 12);
        });
        if (this.isCompleted) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(this.game.getCanvas().width / 2 - 150, this.game.getCanvas().height / 2 - 50, 300, 100);
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.fillText('Vision: A fractured time... your actions echo.', this.game.getCanvas().width / 2 - 140, this.game.getCanvas().height / 2);
            ctx.fillText('Energy Recharged +50%', this.game.getCanvas().width / 2 - 70, this.game.getCanvas().height / 2 + 30);
        }
    }
    isPuzzleComplete() {
        return this.isCompleted;
    }
}

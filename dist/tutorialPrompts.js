export class TutorialPrompts {
    constructor(game) {
        this.prompts = [];
        this.game = game;
        this.canvas = game.getCanvas();
        this.initializePrompts();
    }
    initializePrompts() {
        this.prompts = [
            {
                id: 'pause',
                text: 'Press 2 to pause time and freeze hazards.',
                triggerCondition: () => {
                    const playerPos = this.game.getPlayer().getPosition();
                    return playerPos.x >= 448 && playerPos.x <= 512 && playerPos.y >= 320 && playerPos.y <= 384;
                },
                duration: 3000, // 3 seconds
                shown: false,
                elapsed: 0,
                x: this.canvas.width / 2 - 150,
                y: this.canvas.height / 2
            },
            {
                id: 'rewind',
                text: 'Press 3 to rewind time and retry actions. Costs energy.',
                triggerCondition: () => {
                    const debug = this.game['debug'];
                    const log = debug['log'];
                    return log.some(entry => entry.includes('Player Hit') && !this.prompts.find(p => p.id === 'rewind')?.shown);
                },
                duration: 3000,
                shown: false,
                elapsed: 0,
                x: this.canvas.width / 2 - 150,
                y: this.canvas.height / 2
            },
            {
                id: 'puzzle',
                text: 'Pause time to stop stones and align them.',
                triggerCondition: () => {
                    const playerPos = this.game.getPlayer().getPosition();
                    return playerPos.x >= 64 && playerPos.x <= 128 && playerPos.y >= 256 && playerPos.y <= 320;
                },
                duration: 3000,
                shown: false,
                elapsed: 0,
                x: this.canvas.width / 2 - 150,
                y: this.canvas.height / 2
            }
        ];
    }
    update(deltaTime) {
        this.prompts.forEach(prompt => {
            if (!prompt.shown && prompt.triggerCondition()) {
                prompt.shown = true;
                prompt.elapsed = 0;
                this.game['debug'].logAction(`Tutorial Prompt`, `Showing ${prompt.id}`);
            }
            if (prompt.shown && prompt.elapsed < prompt.duration) {
                prompt.elapsed += deltaTime;
            }
        });
    }
    draw(ctx) {
        this.prompts.forEach(prompt => {
            if (prompt.shown && prompt.elapsed < prompt.duration) {
                const alpha = 1 - (prompt.elapsed / prompt.duration);
                ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.7})`;
                ctx.fillRect(prompt.x, prompt.y - 20, 300, 40);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.font = '14px Arial';
                ctx.fillText(prompt.text, prompt.x + 10, prompt.y + 5);
            }
        });
    }
}

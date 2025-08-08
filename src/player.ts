import { Game } from './game';
import { Assets } from './assets';

export class Player {
    private game: Game;
    private x: number;
    private y: number;
    private width: number = 32;
    private height: number = 32;
    private speed: number = 5;
    private direction: string = 'right';
    private assets: Assets;
    private rewindAfterImages: { x: number, y: number, opacity: number }[] = [];
    private attackCooldown: number = 500; // 0.5 seconds in milliseconds
    private lastAttack: number = 0;

    constructor(game: Game, x: number, y: number) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.assets = game['assets'] || new Assets(game);
    }

    public update(deltaTime: number): void {
        const input = this.game['inputHandler'].getInput();
        if (input['ArrowLeft']) {
            this.x -= this.speed;
            this.direction = 'left';
        }
        if (input['ArrowRight']) {
            this.x += this.speed;
            this.direction = 'right';
        }
        if (input['ArrowUp']) {
            this.y -= this.speed;
            this.direction = 'up';
        }
        if (input['ArrowDown']) {
            this.y += this.speed;
            this.direction = 'down';
        }

        // Attack input (placeholder for combat)
        if (input['Space'] && Date.now() - this.lastAttack >= this.attackCooldown) {
            this.attack();
            this.lastAttack = Date.now();
        }

        // Boundary checks
        const canvas = this.game.getCanvas();
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));

        // Update rewind afterimages if time flow is rewind
        const timeFlow = this.game.getTimeSystem().getTimeFlow();
        if (timeFlow === -1) {
            this.rewindAfterImages.push({ x: this.x, y: this.y, opacity: 0.5 });
            if (this.rewindAfterImages.length > 3) {
                this.rewindAfterImages.shift();
            }
        } else {
            this.rewindAfterImages = [];
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Draw rewind afterimages if active
        const timeFlow = this.game.getTimeSystem().getTimeFlow();
        if (timeFlow === -1 && this.rewindAfterImages.length > 0) {
            this.rewindAfterImages.forEach((image, index) => {
                ctx.globalAlpha = image.opacity - (index * 0.2);
                if (this.assets.isLoaded() && this.assets.getImage('player')) {
                    ctx.drawImage(this.assets.getImage('player')!, image.x, image.y, this.width, this.height);
                } else {
                    ctx.fillStyle = 'blue';
                    ctx.fillRect(image.x, image.y, this.width, this.height);
                }
            });
            ctx.globalAlpha = 1;
        }

        // Draw current player sprite
        if (this.assets.isLoaded()) {
            const playerImage = this.assets.getImage('player');
            if (playerImage) {
                ctx.drawImage(playerImage, this.x, this.y, this.width, this.height);
                return;
            }
        }
        // Fallback if assets aren't loaded
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    private attack(): void {
        // Placeholder for attack logic
        const enemies = this.game.getCurrentLevel()['getEnemies']();
        if (enemies) {
            const playerPos = this.getPosition();
            enemies.forEach(enemy => {
                const enemyPos = enemy['getPosition']();
                const distance = Math.sqrt(Math.pow(playerPos.x - enemyPos.x, 2) + Math.pow(playerPos.y - enemyPos.y, 2));
                if (distance < 50) {
                    enemy['takeDamage'](1);
                    this.game['debug'].logAction(`Player Attack`, `Hit enemy for 1 damage`);
                }
            });
        }
    }

    public getPosition(): { x: number, y: number } {
        return { x: this.x, y: this.y };
    }

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
}
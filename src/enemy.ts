import { Game } from './game';
import { Player } from './player';

export class Enemy {
    private game: Game;
    private x: number;
    private y: number;
    private width: number = 32;
    private height: number = 32;
    private health: number = 2;
    private attackDamage: number = 1;
    private attackCooldown: number = 1000; // 1 second in milliseconds
    private lastAttack: number = 0;
    private speed: number = 2;
    private active: boolean = false;

    constructor(game: Game, x: number, y: number) {
        this.game = game;
        this.x = x;
        this.y = y;
    }

    public update(deltaTime: number): void {
        if (!this.active || this.health <= 0) return;

        const player = this.game.getPlayer();
        const playerPos = player.getPosition();

        // Simple AI: Move toward player if in range
        const distance = Math.sqrt(Math.pow(playerPos.x - this.x, 2) + Math.pow(playerPos.y - this.y, 2));
        if (distance < 200) { // Detection range
            const dx = playerPos.x - this.x;
            const dy = playerPos.y - this.y;
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;

            // Attack if close enough
            if (distance < 40 && Date.now() - this.lastAttack >= this.attackCooldown) {
                this.attack(player);
                this.lastAttack = Date.now();
            }
        }

        // Boundary check
        const canvas = this.game.getCanvas();
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.active || this.health <= 0) return;

        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(`HP: ${this.health}`, this.x, this.y - 10);
    }

    public takeDamage(amount: number): void {
        this.health -= amount;
        if (this.health <= 0) {
            this.active = false;
            this.game['debug'].logAction(`Enemy Defeated`, `at ${Math.round(this.x)},${Math.round(this.y)}`);
        }
    }

    public attack(player: Player): void {
        // Placeholder for player damage logic (to be implemented with health system)
        this.game['debug'].logAction(`Enemy Attack`, `Player hit for ${this.attackDamage}`);
    }

    public setActive(active: boolean): void {
        this.active = active;
    }

    public isActive(): boolean {
        return this.active && this.health > 0;
    }

    public getPosition(): { x: number, y: number } {
        return { x: this.x, y: this.y };
    }
}
export class Enemy {
    constructor(game, x, y) {
        this.width = 32;
        this.height = 32;
        this.health = 2;
        this.attackDamage = 1;
        this.attackCooldown = 1000; // 1 second in milliseconds
        this.lastAttack = 0;
        this.speed = 2;
        this.active = false;
        this.game = game;
        this.x = x;
        this.y = y;
    }
    update(deltaTime) {
        if (!this.active || this.health <= 0)
            return;
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
    draw(ctx) {
        if (!this.active || this.health <= 0)
            return;
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(`HP: ${this.health}`, this.x, this.y - 10);
    }
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.active = false;
            this.game['debug'].logAction(`Enemy Defeated`, `at ${Math.round(this.x)},${Math.round(this.y)}`);
        }
    }
    attack(player) {
        // Placeholder for player damage logic (to be implemented with health system)
        this.game['debug'].logAction(`Enemy Attack`, `Player hit for ${this.attackDamage}`);
    }
    setActive(active) {
        this.active = active;
    }
    isActive() {
        return this.active && this.health > 0;
    }
    getPosition() {
        return { x: this.x, y: this.y };
    }
}

import { CanvasRenderingContext2D, Canvas } from 'canvas';
import { ShaderManager } from './shaders';

export class GameCore {
    private canvas: Canvas;
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private resonance: number = 100;
    private maxResonance: number = 100;
    private resonanceRegenRate: number = 0.5;
    private isEchoActive: boolean = false;
    private echoDuration: number = 30;
    private echoTimer: number = 0;
    private player: Player;
    private world: World;
    private environment: Environment;
    private enemies: Enemy[];
    private shaderManager: ShaderManager | null = null;
    private useShaders: boolean = false;

    constructor(canvas: Canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.width = canvas.width;
        this.height = canvas.height;
        this.player = new Player(this.width / 2, this.height / 2);
        this.world = new World();
        this.environment = new Environment();
        this.enemies = [
            new Enemy(300, 200, 0),
            new Enemy(350, 220, 1),
            new Enemy(320, 240, 2)
        ]; // Sample enemies for prototype
        this.init();
    }

    private init(): void {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        document.addEventListener('keydown', (e) => this.handleInput(e));
        // Initialize shader manager for visual effects
        this.shaderManager = new ShaderManager();
        this.shaderManager.initialize(this.canvas as unknown as HTMLCanvasElement);
        this.useShaders = this.shaderManager.isSupported();
    }

    private resizeCanvas(): void {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    private handleInput(e: KeyboardEvent): void {
        switch (e.key) {
            case 'ArrowUp':
                this.player.move(0, -5);
                break;
            case 'ArrowDown':
                this.player.move(0, 5);
                break;
            case 'ArrowLeft':
                this.player.move(-5, 0);
                break;
            case 'ArrowRight':
                this.player.move(5, 0);
                break;
            case 'e':
                this.activateEcho();
                break;
            case 'q':
                this.player.activateShield();
                break; // Placeholder for Shaman's Whisper shield
        }
    }

    private activateEcho(): void {
        if (this.resonance >= 20 && !this.isEchoActive) {
            this.isEchoActive = true;
            this.echoTimer = this.echoDuration;
            this.resonance -= 20;
            this.environment.activateEchoStates();
            this.stunEnemies();
        }
    }

    private stunEnemies(): void {
        this.enemies.forEach(enemy => {
            const distance = Math.sqrt(
                Math.pow(this.player.getX() - enemy.getX(), 2) +
                Math.pow(this.player.getY() - enemy.getY(), 2)
            );
            if (distance < 100) { // Stun enemies within 100 pixels
                enemy.stun(3); // 3-second stun as per design specs
            }
        });
    }

    private updateEcho(deltaTime: number): void {
        if (this.isEchoActive) {
            this.echoTimer -= deltaTime;
            this.resonance -= 5 * deltaTime; // Sustain cost: 5 per second
            if (this.echoTimer <= 0 || this.resonance <= 0) {
                this.isEchoActive = false;
                this.environment.deactivateEchoStates();
            }
        }
        if (!this.isEchoActive && this.resonance < this.maxResonance) {
            this.resonance += this.resonanceRegenRate * deltaTime;
            this.resonance = Math.min(this.resonance, this.maxResonance);
        }
    }

    public update(deltaTime: number): void {
        this.updateEcho(deltaTime);
        this.player.update(deltaTime, this.environment);
        this.world.update(deltaTime, this.isEchoActive);
        this.environment.update(deltaTime, this.isEchoActive);
        this.enemies.forEach(enemy => enemy.update(deltaTime, this.isEchoActive));
    }

    public render(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
        if (this.useShaders && this.shaderManager) {
            this.shaderManager.applyEchoEffect(this.isEchoActive);
        }
        this.world.render(this.ctx, this.isEchoActive);
        this.environment.render(this.ctx, this.isEchoActive);
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.player.render(this.ctx);
        this.renderHUD();
    }

    private renderHUD(): void {
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Resonance: ${Math.round(this.resonance)}/${this.maxResonance}`, 10, 30);
        if (this.isEchoActive) {
            this.ctx.fillText(`Echo Active: ${Math.round(this.echoTimer)}s`, 10, 50);
        }
    }
}

class Player {
    private x: number;
    private y: number;
    private speed: number = 5;
    private width: number = 30;
    private height: number = 30;
    private hasShield: boolean = false;
    private shieldTimer: number = 0;
    private isOnBridge: boolean = false;
    private lastBridgeId: number | null = null;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public move(dx: number, dy: number): void {
        this.x += dx * this.speed;
        this.y += dy * this.speed;
    }

    public activateShield(): void {
        this.hasShield = true;
        this.shieldTimer = 10; // 10 seconds duration as per specs
    }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }

    public update(deltaTime: number, environment: Environment): void {
        if (this.hasShield) {
            this.shieldTimer -= deltaTime;
            if (this.shieldTimer <= 0) {
                this.hasShield = false;
            }
        }
        environment.checkPlayerCollision(this.x, this.y, this);
    }

    public setOnBridge(bridgeId: number | null): void {
        if (bridgeId !== null) {
            this.isOnBridge = true;
            this.lastBridgeId = bridgeId;
        } else {
            this.isOnBridge = false;
        }
    }

    public isOnBridgeArea(): boolean {
        return this.isOnBridge;
    }

    public getLastBridgeId(): number | null {
        return this.lastBridgeId;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#00F';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        if (this.hasShield) {
            ctx.strokeStyle = '#0F0';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - this.width / 2 - 5, this.y - this.height / 2 - 5, this.width + 10, this.height + 10);
        }
    }
}

class World {
    private normalLayer: string = '#333';
    private echoLayer: string = '#6CF';

    public update(deltaTime: number, isEchoActive: boolean): void {
        // Placeholder for world state updates
    }

    public render(ctx: CanvasRenderingContext2D, isEchoActive: boolean): void {
        ctx.fillStyle = isEchoActive ? this.echoLayer : this.normalLayer;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
}

class Environment {
    private objects: EchoObject[] = [];
    private activeStates: Set<number> = new Set();

    constructor() {
        // Initialize with a sample bridge object for Forgotten Forest prototype
        this.objects.push(new EchoObject(200, 300, 100, 20, 0)); // Bridge at (200,300), ID 0
    }

    public activateEchoStates(): void {
        this.objects.forEach(obj => {
            if (obj.isEchoTriggered) {
                this.activeStates.add(obj.id);
                obj.setActive(true);
            }
        });
    }

    public deactivateEchoStates(): void {
        this.objects.forEach(obj => {
            this.activeStates.delete(obj.id);
            obj.setActive(false);
        });
    }

    public checkPlayerCollision(playerX: number, playerY: number, player: Player): void {
        const bridge = this.objects.find(obj => obj.id === 0);
        if (bridge) {
            const isOnBridgeNow = this.isPlayerOnObject(playerX, playerY, bridge);
            if (isOnBridgeNow && bridge.isActive) {
                player.setOnBridge(bridge.id);
            } else if (!bridge.isActive && player.isOnBridgeArea() && player.getLastBridgeId() === bridge.id) {
                console.log("Player fell off bridge due to echo deactivation");
                // Placeholder: Reset player position to start of bridge or apply minor damage
                player.move(-50, 0); // Move player back to start of bridge (temporary logic)
                player.setOnBridge(null);
            } else if (!isOnBridgeNow) {
                player.setOnBridge(null);
            }
        }
    }

    private isPlayerOnObject(playerX: number, playerY: number, obj: EchoObject): boolean {
        return playerX > obj.x && playerX < obj.x + obj.width &&
               playerY > obj.y && playerY < obj.y + obj.height;
    }

    public update(deltaTime: number, isEchoActive: boolean): void {
        // Placeholder for environmental updates
    }

    public render(ctx: CanvasRenderingContext2D, isEchoActive: boolean): void {
        this.objects.forEach(obj => {
            obj.render(ctx, isEchoActive);
        });
    }
}

class EchoObject {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public id: number;
    public isEchoTriggered: boolean = true;
    public isActive: boolean = false;

    constructor(x: number, y: number, width: number, height: number, id: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.id = id;
    }

    public setActive(active: boolean): void {
        this.isActive = active;
    }

    public render(ctx: CanvasRenderingContext2D, isEchoActive: boolean): void {
        if (isEchoActive && this.isEchoTriggered) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.7)'; // Green for active echo state
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else if (!isEchoActive) {
            ctx.fillStyle = 'rgba(100, 100, 100, 0.3)'; // Dim gray for inactive present state
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

class Enemy {
    private x: number;
    private y: number;
    private id: number;
    private width: number = 25;
    private height: number = 25;
    private isStunned: boolean = false;
    private stunTimer: number = 0;

    constructor(x: number, y: number, id: number) {
        this.x = x;
        this.y = y;
        this.id = id;
    }

    public stun(duration: number): void {
        this.isStunned = true;
        this.stunTimer = duration; // Duration in seconds
    }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }

    public update(deltaTime: number, isEchoActive: boolean): void {
        if (this.isStunned) {
            this.stunTimer -= deltaTime;
            if (this.stunTimer <= 0) {
                this.isStunned = false;
            }
        } else {
            // Placeholder for patrol behavior in full implementation
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.isStunned ? 'rgba(255, 0, 0, 0.5)' : '#F00';
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
}
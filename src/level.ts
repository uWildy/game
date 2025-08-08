import { Game } from './game';
import { Assets } from './assets';
import { VillageState } from './villageState';
import { Puzzle } from './puzzle';
import { Enemy } from './enemy';

export class Level {
    private game: Game;
    private levelId: string;
    private backgroundColor: string;
    private assets: Assets;
    private tileSize: number = 16;
    private map: number[][] = []; // 0 = empty, 1 = ground, 2 = obstacle, 3 = hazard
    private villageState: VillageState | null = null;
    private puzzle: Puzzle | null = null;
    private enemies: Enemy[] = [];
    private triggerZones: { x: number, y: number, width: number, height: number, type: string, activated: boolean }[] = [];

    constructor(game: Game, levelId: string) {
        this.game = game;
        this.levelId = levelId;
        this.backgroundColor = this.setBackgroundColor(levelId);
        this.assets = game['assets'] || new Assets(game);
        this.initializeMap(levelId);
        this.initializeLevelElements(levelId);
    }

    private initializeMap(levelId: string): void {
        if (levelId === 'AncientPast') {
            // Based on 10x10 grid from design doc (scaled for canvas rendering)
            this.map = [
                [2, 2, 2, 2, 2, 2, 2, 2, 2, 2], // Row 0: Trees
                [2, 1, 1, 1, 1, 1, 1, 1, 2, 2], // Row 1: Ruins area
                [2, 1, 1, 1, 1, 1, 1, 1, 2, 2], // Row 2: Ruins area
                [2, 1, 1, 1, 1, 1, 1, 1, 2, 2], // Row 3: Shaman NPC
                [2, 1, 1, 1, 1, 1, 1, 1, 2, 2], // Row 4: Village
                [2, 1, 1, 1, 1, 1, 1, 1, 2, 2], // Row 5: Village + Spawn
                [2, 1, 1, 1, 1, 1, 1, 1, 2, 2], // Row 6: Combat zone
                [2, 1, 1, 1, 1, 3, 3, 1, 2, 2], // Row 7: River hazard
                [2, 2, 2, 1, 1, 3, 3, 1, 2, 2], // Row 8: River hazard
                [2, 2, 2, 2, 1, 1, 1, 1, 2, 2]  // Row 9: Exit portal
            ];
        } else {
            // Default simple grid for other levels (e.g., TimelessNexus)
            this.map = Array(10).fill(null).map(() => Array(10).fill(1));
        }
    }

    private initializeLevelElements(levelId: string): void {
        if (levelId === 'AncientPast') {
            this.villageState = new VillageState();
            this.puzzle = new Puzzle(this.game);
            // Initialize enemies in combat zone (grid 6-7,6-7 scaled to canvas ~400,400)
            this.enemies = [
                new Enemy(this.game, 400, 400),
                new Enemy(this.game, 450, 400),
                new Enemy(this.game, 400, 450)
            ];
            // Trigger zones (scaled grid positions to canvas pixels, tileSize * 4 for visibility)
            this.triggerZones = [
                { x: 400, y: 400, width: 100, height: 100, type: 'combat', activated: false }, // Combat zone
                { x: 80, y: 80, width: 100, height: 60, type: 'puzzle', activated: false }     // Puzzle zone (unused for now)
            ];
        }
    }

    public update(deltaTime: number): void {
        if (this.levelId === 'AncientPast') {
            const timeFlow = this.game.getTimeSystem().getTimeFlow();
            this.puzzle?.update(deltaTime, timeFlow);

            // Check combat trigger zone
            const playerPos = this.game.getPlayer().getPosition();
            const combatZone = this.triggerZones.find(zone => zone.type === 'combat');
            if (combatZone && !combatZone.activated) {
                if (playerPos.x >= combatZone.x && playerPos.x <= combatZone.x + combatZone.width &&
                    playerPos.y >= combatZone.y && playerPos.y <= combatZone.y + combatZone.height) {
                    this.enemies.forEach(enemy => enemy.setActive(true));
                    combatZone.activated = true;
                    this.game['debug'].logAction(`Trigger`, `Combat zone activated`);
                    // Placeholder for village damage state (assuming combat choice)
                    this.villageState?.setDamaged(true);
                }
            }

            // Update active enemies
            this.enemies.forEach(enemy => enemy.update(deltaTime));
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, this.game.getCanvas().width, this.game.getCanvas().height);

        // Apply grayscale effect for pause if active
        const timeFlow = this.game.getTimeSystem().getTimeFlow();
        if (timeFlow === 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'saturation';
            ctx.fillStyle = 'hsl(0, 0%, 50%)'; // Grayscale approximation
            ctx.fillRect(0, 0, this.game.getCanvas().width, this.game.getCanvas().height);
            ctx.restore();
        }

        // Draw tiles if assets are loaded
        if (this.assets.isLoaded()) {
            const tileImage = this.levelId === 'AncientPast' 
                ? this.assets.getImage('ancientPastTile') 
                : this.assets.getImage('timelessNexusTile');
            const villageIntact = this.assets.getImage('villageIntact') || null;
            const villageDamaged = this.assets.getImage('villageDamaged') || null;
            if (tileImage) {
                for (let y = 0; y < this.map.length; y++) {
                    for (let x = 0; x < this.map[y].length; x++) {
                        const scaledX = x * this.tileSize * 4;
                        const scaledY = y * this.tileSize * 4;
                        const tileType = this.map[y][x];
                        if (tileType === 1) {
                            ctx.drawImage(tileImage, scaledX, scaledY, this.tileSize * 4, this.tileSize * 4);
                        } else if (tileType === 3 && this.levelId === 'AncientPast') {
                            ctx.fillStyle = timeFlow === 0 ? 'lightblue' : 'blue'; // Ice when paused
                            ctx.fillRect(scaledX, scaledY, this.tileSize * 4, this.tileSize * 4);
                        }
                        // Draw village huts (grid 4-5,3-4)
                        if (this.levelId === 'AncientPast' && x >= 3 && x <= 4 && y >= 4 && y <= 5) {
                            if (this.villageState?.getIsDamaged()) {
                                if (villageDamaged) {
                                    ctx.drawImage(villageDamaged, scaledX, scaledY, this.tileSize * 4, this.tileSize * 4);
                                } else {
                                    ctx.fillStyle = 'brown';
                                    ctx.fillRect(scaledX, scaledY, this.tileSize * 4, this.tileSize * 4);
                                }
                            } else {
                                if (villageIntact) {
                                    ctx.drawImage(villageIntact, scaledX, scaledY, this.tileSize * 4, this.tileSize * 4);
                                } else {
                                    ctx.fillStyle = 'greenyellow';
                                    ctx.fillRect(scaledX, scaledY, this.tileSize * 4, this.tileSize * 4);
                                }
                            }
                        }
                    }
                }
            }
        }

        // Draw level-specific elements
        if (this.levelId === 'AncientPast') {
            this.puzzle?.draw(ctx);
            this.enemies.forEach(enemy => enemy.draw(ctx));
        }

        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Level: ${this.levelId}`, this.game.getCanvas().width - 150, 30);
    }

    private setBackgroundColor(levelId: string): string {
        switch (levelId) {
            case 'AncientPast':
                return '#4a6f3a'; // Forest green
            case 'Present':
                return '#5a7fa3'; // Sky blue
            case 'DystopianFuture':
                return '#3a3a4f'; // Dark gray
            case 'TimelessNexus':
                return '#2a2a3a'; // Dark purple
            default:
                return '#000000'; // Black
        }
    }

    public getLevelId(): string {
        return this.levelId;
    }

    public getEnemies(): Enemy[] {
        return this.enemies.filter(enemy => enemy.isActive());
    }
}
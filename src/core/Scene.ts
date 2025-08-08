import { PuzzleManager } from '../managers/PuzzleManager';
import { AssetManager } from '../managers/AssetManager';

export class Scene {
    private name: string;
    private objects: Record<string, any[]> = {
        past: [],
        present: [],
        future: []
    };
    private entities: any[] = [];
    private puzzleManager: PuzzleManager | null = null;
    private interactables: Record<string, any[]> = {
        past: [],
        present: [],
        future: []
    };
    private tutorialObjectives: Record<string, any[]> = {
        present: [],
        past: []
    };
    private lastInteractionResult: any = null;

    constructor(name: string) {
        this.name = name;
        this.initializeObjects();
        this.initializeInteractables();
    }

    private initializeObjects(): void {
        this.objects['past'] = [{ id: 'ancient_tree', x: 100, y: 200, width: 50, height: 100 }];
        this.objects['present'] = [{ id: 'grown_tree', x: 100, y: 200, width: 80, height: 150 }];
        this.objects['future'] = [{ id: 'decayed_tree', x: 100, y: 200, width: 60, height: 120 }];
        this.objects['past'].push({ id: 'bridge', x: 300, y: 200, width: 100, height: 20, puzzleId: 'bridge_puzzle' });
        this.objects['present'].push({ id: 'bridge', x: 300, y: 200, width: 100, height: 20, puzzleId: 'bridge_puzzle' });
        this.objects['future'].push({ id: 'bridge', x: 300, y: 200, width: 100, height: 20, puzzleId: 'bridge_puzzle' });
        this.objects['past'].push({ id: 'well', x: 450, y: 150, width: 40, height: 40, puzzleId: 'well_puzzle' });
        this.objects['present'].push({ id: 'well', x: 450, y: 150, width: 40, height: 40, puzzleId: 'well_puzzle' });
        this.objects['future'].push({ id: 'well', x: 450, y: 150, width: 40, height: 40, puzzleId: 'well_puzzle' });
        this.objects['past'].push({ id: 'fallen_log', x: 600, y: 300, width: 80, height: 20 });
        this.objects['present'].push({ id: 'decayed_log', x: 600, y: 300, width: 80, height: 10 });
    }

    private initializeInteractables(): void {
        this.interactables['past'] = [{ id: 'destroy_bridge', x: 320, y: 210, width: 20, height: 20, action: 'destroyBridge', puzzleId: 'bridge_puzzle' }];
        this.interactables['present'] = [{ id: 'repair_bridge', x: 320, y: 210, width: 20, height: 20, action: 'repairBridge', puzzleId: 'bridge_puzzle' }];
        this.interactables['past'].push({ id: 'take_bucket', x: 470, y: 170, width: 20, height: 20, action: 'takeBucket', puzzleId: 'well_puzzle' });
        this.interactables['present'].push({ id: 'place_bucket', x: 470, y: 170, width: 20, height: 20, action: 'placeBucket', puzzleId: 'well_puzzle' });
    }

    public initializePuzzles(puzzleManager: PuzzleManager): void {
        this.puzzleManager = puzzleManager;
    }

    public initializeTutorialObjectives(): void {
        this.tutorialObjectives['present'] = [
            { id: 'pendant', x: 250, y: 350, width: 20, height: 20, stage: 1, action: 'pickupPendant' }
        ];
        this.tutorialObjectives['past'] = [
            { id: 'craftsman', x: 400, y: 180, width: 32, height: 32, stage: 3, action: 'talkToCraftsman' },
            { id: 'pendant_piece', x: 650, y: 280, width: 20, height: 20, stage: 4, action: 'pickupPendantPiece' },
            { id: 'boulder', x: 620, y: 310, width: 30, height: 30, stage: 4, action: 'pushBoulder', alternate: true }
        ];
        // Add final assembly point for Stage 5 in Present
        this.tutorialObjectives['present'].push({ id: 'assemble_pendant', x: 250, y: 350, width: 20, height: 20, stage: 5, action: 'assemblePendant' });
    }

    public update(deltaTime: number, era: string): void {
        this.entities.forEach(entity => entity.update(deltaTime));
    }

    public render(ctx: CanvasRenderingContext2D, assetManager?: AssetManager, era: string = 'present'): void {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const eraObjects = this.objects[era] || [];
        eraObjects.forEach(obj => {
            if (obj.puzzleId && this.puzzleManager) {
                const puzzleState = this.puzzleManager.getPuzzleState(obj.puzzleId, era);
                if (obj.id === 'bridge' && !puzzleState.bridgeIntact) return;
                if (obj.id === 'well' && puzzleState.bucketPresent) {
                    ctx.fillStyle = '#0000ff';
                    ctx.fillRect(obj.x + 10, obj.y + 10, 10, 10);
                }
            }
            if (assetManager) {
                let assetPath = '';
                if (obj.id.includes('tree')) {
                    assetPath = `environments/${era}_tree.png`;
                } else if (obj.id === 'bridge') {
                    assetPath = `environments/${era}_bridge.png`;
                } else if (obj.id === 'well') {
                    assetPath = `environments/${era}_well.png`;
                } else if (obj.id.includes('log')) {
                    assetPath = `environments/log_${era}.png`;
                }
                const img = assetManager.getImage(assetPath);
                if (img) {
                    ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
                    return;
                }
            }
            ctx.fillStyle = obj.id.includes('tree') ? '#4a2f10' : obj.id.includes('bridge') ? '#8B4513' : obj.id.includes('well') ? '#696969' : obj.id.includes('log') ? '#3a2510' : '#fff';
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        });

        this.entities.forEach(entity => entity.render(ctx, era, assetManager));

        const eraInteractables = this.interactables[era] || [];
        eraInteractables.forEach(interactable => {
            if (interactable.puzzleId && this.puzzleManager && this.puzzleManager.isPuzzleSolved(interactable.puzzleId)) return;
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(interactable.x, interactable.y, interactable.width, interactable.height);
        });

        const eraObjectives = this.tutorialObjectives[era] || [];
        eraObjectives.forEach(obj => {
            if (assetManager) {
                let assetPath = '';
                if (obj.id === 'pendant') {
                    assetPath = 'environments/pendant_present.png';
                } else if (obj.id === 'pendant_piece') {
                    assetPath = 'environments/pendant_piece_past.png';
                } else if (obj.id === 'boulder') {
                    assetPath = 'environments/boulder_past.png';
                }
                const img = assetManager.getImage(assetPath);
                if (img) {
                    ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
                    return;
                }
            }
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        });

        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(`Scene: ${this.name}`, 10, 30);
        ctx.fillText(`Era: ${era.charAt(0).toUpperCase() + era.slice(1)}`, 10, 60);
    }

    public handleInteraction(playerPos: { x: number, y: number }, era: string): void {
        this.lastInteractionResult = null;
        if (this.puzzleManager) {
            const interactables = this.interactables[era] || [];
            for (const item of interactables) {
                if (
                    playerPos.x < item.x + item.width &&
                    playerPos.x + 32 > item.x &&
                    playerPos.y < item.y + item.height &&
                    playerPos.y + 32 > item.y
                ) {
                    this.puzzleManager.updatePuzzleState(item.puzzleId, era, item.action);
                    this.lastInteractionResult = item;
                    break;
                }
            }
        }
        const objectives = this.tutorialObjectives[era] || [];
        for (const obj of objectives) {
            if (
                playerPos.x < obj.x + obj.width &&
                playerPos.x + 32 > obj.x &&
                playerPos.y < obj.y + obj.height &&
                playerPos.y + 32 > obj.y
            ) {
                console.log(`Tutorial Interaction: ${obj.action}`);
                this.lastInteractionResult = obj;
                break;
            }
        }
    }

    public getInteractionResult(): any {
        return this.lastInteractionResult;
    }

    public getObjectsForEra(era: string): any[] {
        const eraObjects = this.objects[era] || [];
        return eraObjects.filter(obj => {
            if (obj.puzzleId && this.puzzleManager) {
                const puzzleState = this.puzzleManager.getPuzzleState(obj.puzzleId, era);
                if (obj.id === 'bridge' && !puzzleState.bridgeIntact) return false;
            }
            return true;
        });
    }

    public getTutorialObjectives(era: string): any[] {
        return this.tutorialObjectives[era] || [];
    }
}
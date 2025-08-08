import { AssetManager } from '../managers/AssetManager';

export class Player {
    private x: number;
    private y: number;
    private width: number = 32;
    private height: number = 32;
    private speed: number = 5;
    private eraSpritePaths: Record<string, string> = {
        past: 'sprites/player_past.png',
        present: 'sprites/player_present.png',
        future: 'sprites/player_future.png'
    };
    private currentFrame: number = 0;
    private frameCount: number = 4; // 4 frames for walk cycle
    private frameTimer: number = 0;
    private frameDuration: number = 100; // ~10 FPS for animation (100ms per frame)
    private isMoving: boolean = false;
    private direction: string = 'right'; // Default direction

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public move(direction: string, objects: any[] = []): void {
        let newX = this.x;
        let newY = this.y;

        switch (direction) {
            case 'up':
                newY -= this.speed;
                break;
            case 'down':
                newY += this.speed;
                break;
            case 'left':
                newX -= this.speed;
                break;
            case 'right':
                newX += this.speed;
                break;
        }

        if (!this.checkCollision(newX, newY, objects)) {
            this.x = newX;
            this.y = newY;
            this.isMoving = true;
            this.direction = direction;
        } else {
            this.isMoving = false;
        }
    }

    public moveTo(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    private checkCollision(newX: number, newY: number, objects: any[]): boolean {
        for (const obj of objects) {
            if (
                newX < obj.x + obj.width &&
                newX + this.width > obj.x &&
                newY < obj.y + obj.height &&
                newY + this.height > obj.y
            ) {
                return true;
            }
        }
        return false;
    }

    public update(deltaTime: number): void {
        if (this.isMoving) {
            this.frameTimer += deltaTime;
            if (this.frameTimer >= this.frameDuration) {
                this.frameTimer = 0;
                this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            }
        } else {
            this.currentFrame = 0; // Reset to first frame or idle frame when not moving
            this.frameTimer = 0;
        }
        this.isMoving = false; // Reset moving state each update
    }

    public render(ctx: CanvasRenderingContext2D, era: string = 'present', assetManager?: AssetManager): void {
        if (assetManager) {
            const spritePath = this.eraSpritePaths[era] || this.eraSpritePaths['present'];
            const img = assetManager.getImage(spritePath);
            if (img) {
                // Calculate frame offset for walk animation based on direction
                let frameOffsetX = 0;
                let frameOffsetY = 0;
                const frameWidth = 32; // Assuming each frame is 32x32px in the spritesheet
                const frameHeight = 32;
                
                if (this.isMoving) {
                    frameOffsetX = this.currentFrame * frameWidth;
                    // Adjust Y offset based on direction (assuming spritesheet layout: Down, Left, Right, Up rows)
                    if (this.direction === 'down') {
                        frameOffsetY = 0 * frameHeight;
                    } else if (this.direction === 'left') {
                        frameOffsetY = 1 * frameHeight;
                    } else if (this.direction === 'right') {
                        frameOffsetY = 2 * frameHeight;
                    } else if (this.direction === 'up') {
                        frameOffsetY = 3 * frameHeight;
                    }
                } else {
                    // Idle animation (first frame or specific idle frames if defined)
                    frameOffsetX = 0;
                    frameOffsetY = this.direction === 'down' ? 0 : 
                                   this.direction === 'left' ? 1 * frameHeight : 
                                   this.direction === 'right' ? 2 * frameHeight : 
                                   3 * frameHeight;
                }
                
                // Draw the specific frame from the spritesheet
                ctx.drawImage(
                    img, 
                    frameOffsetX, 
                    frameOffsetY, 
                    frameWidth, 
                    frameHeight, 
                    this.x, 
                    this.y, 
                    this.width, 
                    this.height
                );
                return;
            }
        }
        // Fallback rendering if no image or assetManager is unavailable
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    public getPosition(): { x: number, y: number } {
        return { x: this.x, y: this.y };
    }
}
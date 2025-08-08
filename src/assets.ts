import { Game } from './game';

export class Assets {
    private game: Game;
    private images: { [key: string]: HTMLImageElement } = {};
    private loaded: boolean = false;

    constructor(game: Game) {
        this.game = game;
    }

    public loadAssets(): Promise<void> {
        return new Promise((resolve, reject) => {
            const assetsToLoad = [
                { id: 'player', src: 'assets/sprites/player.png' },
                { id: 'ancientPastTile', src: 'assets/tiles/ancient_past.png' },
                { id: 'timelessNexusTile', src: 'assets/tiles/timeless_nexus.png' }
            ];

            let loadedCount = 0;
            const totalAssets = assetsToLoad.length;

            assetsToLoad.forEach(asset => {
                const img = new Image();
                img.onload = () => {
                    loadedCount++;
                    this.images[asset.id] = img;
                    if (loadedCount === totalAssets) {
                        this.loaded = true;
                        resolve();
                    }
                };
                img.onerror = (err) => reject(`Failed to load asset: ${asset.src}`);
                img.src = asset.src;
            });
        });
    }

    public getImage(id: string): HTMLImageElement | undefined {
        return this.images[id];
    }

    public isLoaded(): boolean {
        return this.loaded;
    }
}
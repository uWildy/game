export class Assets {
    constructor(game) {
        this.images = {};
        this.loaded = false;
        this.game = game;
    }
    loadAssets() {
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
    getImage(id) {
        return this.images[id];
    }
    isLoaded() {
        return this.loaded;
    }
}

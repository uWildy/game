export class AssetManager {
    constructor() {
        this.images = {};
        this.loaded = 0;
        this.total = 0;
        this.basePath = './assets/';
    }
    preloadAssets(assetList) {
        return new Promise((resolve, reject) => {
            this.total = assetList.length;
            this.loaded = 0;
            if (this.total === 0) {
                resolve();
                return;
            }
            assetList.forEach(assetPath => {
                const fullPath = this.basePath + assetPath;
                const img = new Image();
                img.onload = () => this.onAssetLoaded(resolve);
                img.onerror = () => this.onAssetError(assetPath, reject);
                img.src = fullPath;
                this.images[assetPath] = img;
            });
        });
    }
    onAssetLoaded(resolve) {
        this.loaded++;
        if (this.loaded === this.total) {
            resolve();
        }
    }
    onAssetError(assetPath, reject) {
        reject(`Failed to load asset: ${assetPath}`);
    }
    getImage(assetPath) {
        return this.images[assetPath];
    }
}

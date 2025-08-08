export class AssetManager {
    private images: Record<string, HTMLImageElement> = {};
    private loaded: number = 0;
    private total: number = 0;
    private basePath: string = './assets/';

    public preloadAssets(assetList: string[]): Promise<void> {
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

    private onAssetLoaded(resolve: () => void): void {
        this.loaded++;
        if (this.loaded === this.total) {
            resolve();
        }
    }

    private onAssetError(assetPath: string, reject: (reason: string) => void): void {
        reject(`Failed to load asset: ${assetPath}`);
    }

    public getImage(assetPath: string): HTMLImageElement | undefined {
        return this.images[assetPath];
    }
}
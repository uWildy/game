export class VillageState {
    private isDamaged: boolean = false;

    public setDamaged(damaged: boolean): void {
        this.isDamaged = damaged;
    }

    public getIsDamaged(): boolean {
        return this.isDamaged;
    }
}
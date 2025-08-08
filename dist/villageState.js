export class VillageState {
    constructor() {
        this.isDamaged = false;
    }
    setDamaged(damaged) {
        this.isDamaged = damaged;
    }
    getIsDamaged() {
        return this.isDamaged;
    }
}

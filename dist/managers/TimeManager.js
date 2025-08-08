export class TimeManager {
    constructor() {
        this.currentEra = 1; // 0: Past, 1: Present, 2: Future
        this.previousEra = 1;
        this.eras = ['past', 'present', 'future'];
        this.cooldown = 0;
        this.cooldownDuration = 2000; // 2 seconds in milliseconds
        this.onTimeShift = [];
    }
    getCurrentEra() {
        return this.eras[this.currentEra];
    }
    getPreviousEra() {
        return this.eras[this.previousEra];
    }
    shiftTime(direction) {
        if (this.cooldown > 0)
            return false;
        const newEra = this.currentEra + direction;
        if (newEra >= 0 && newEra < this.eras.length) {
            const oldEra = this.eras[this.currentEra];
            this.previousEra = this.currentEra;
            this.currentEra = newEra;
            this.cooldown = this.cooldownDuration;
            this.notifyTimeShift(oldEra, this.eras[this.currentEra]);
            return true;
        }
        return false;
    }
    update(deltaTime) {
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
            if (this.cooldown < 0)
                this.cooldown = 0;
        }
    }
    subscribeToTimeShift(callback) {
        this.onTimeShift.push(callback);
    }
    notifyTimeShift(fromEra, toEra) {
        this.onTimeShift.forEach(callback => callback(fromEra, toEra));
    }
}

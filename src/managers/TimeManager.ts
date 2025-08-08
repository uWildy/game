export class TimeManager {
    private currentEra: number = 1; // 0: Past, 1: Present, 2: Future
    private previousEra: number = 1;
    private eras: string[] = ['past', 'present', 'future'];
    private cooldown: number = 0;
    private cooldownDuration: number = 2000; // 2 seconds in milliseconds
    private onTimeShift: ((fromEra: string, toEra: string) => void)[] = [];

    public getCurrentEra(): string {
        return this.eras[this.currentEra];
    }

    public getPreviousEra(): string {
        return this.eras[this.previousEra];
    }

    public shiftTime(direction: number): boolean {
        if (this.cooldown > 0) return false;

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

    public update(deltaTime: number): void {
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime;
            if (this.cooldown < 0) this.cooldown = 0;
        }
    }

    public subscribeToTimeShift(callback: (fromEra: string, toEra: string) => void): void {
        this.onTimeShift.push(callback);
    }

    private notifyTimeShift(fromEra: string, toEra: string): void {
        this.onTimeShift.forEach(callback => callback(fromEra, toEra));
    }
}
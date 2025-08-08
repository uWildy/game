import { Game } from './game';
import { TimeSystem } from './timeSystem';

export class InputHandler {
    private game: Game;
    private input: { [key: string]: boolean } = {};
    private timeSystem: TimeSystem;

    constructor(game: Game) {
        this.game = game;
        this.timeSystem = game.getTimeSystem();
        this.setupListeners();
    }

    private setupListeners(): void {
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            this.input[e.key] = true;

            // Time manipulation controls
            if (e.key === '1') this.timeSystem.setTimeFlow(1); // Normal
            if (e.key === '2') this.timeSystem.setTimeFlow(0); // Pause
            if (e.key === '3') this.timeSystem.setTimeFlow(-1); // Rewind

            // Era switching
            if (e.key === 'q') this.timeSystem.changeEra('AncientPast');
            if (e.key === 'w') this.timeSystem.changeEra('Present');
            if (e.key === 'e') this.timeSystem.changeEra('DystopianFuture');
        });

        window.addEventListener('keyup', (e: KeyboardEvent) => {
            this.input[e.key] = false;
        });
    }

    public getInput(): { [key: string]: boolean } {
        return this.input;
    }
}
export class InputHandler {
    constructor(game) {
        this.input = {};
        this.game = game;
        this.timeSystem = game.getTimeSystem();
        this.setupListeners();
    }
    setupListeners() {
        window.addEventListener('keydown', (e) => {
            this.input[e.key] = true;
            // Time manipulation controls
            if (e.key === '1')
                this.timeSystem.setTimeFlow(1); // Normal
            if (e.key === '2')
                this.timeSystem.setTimeFlow(0); // Pause
            if (e.key === '3')
                this.timeSystem.setTimeFlow(-1); // Rewind
            // Era switching
            if (e.key === 'q')
                this.timeSystem.changeEra('AncientPast');
            if (e.key === 'w')
                this.timeSystem.changeEra('Present');
            if (e.key === 'e')
                this.timeSystem.changeEra('DystopianFuture');
        });
        window.addEventListener('keyup', (e) => {
            this.input[e.key] = false;
        });
    }
    getInput() {
        return this.input;
    }
}

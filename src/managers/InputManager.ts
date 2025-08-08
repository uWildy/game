type InputCallback = (data?: any) => void;
type KeyMap = Record<string, boolean>;

export class InputManager {
    private canvas: HTMLCanvasElement;
    private keys: KeyMap = {};
    private listeners: Record<string, InputCallback[]> = {};

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.bindEvents();
    }

    private bindEvents(): void {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === 'ArrowLeft') this.emit('timeShift', 'backward');
            if (e.key === 'ArrowRight') this.emit('timeShift', 'forward');
            if (e.key === 'w') this.emit('move', 'up');
            if (e.key === 's') this.emit('move', 'down');
            if (e.key === 'a') this.emit('move', 'left');
            if (e.key === 'd') this.emit('move', 'right');
            if (e.key === 'e') this.emit('interact');
            if (e.key === 'F1') this.emit('debugToggle');
            if (e.key === 'F2') this.emit('playtestToggle');
            if (e.key === 'F3') this.emit('playtestSkipStage');
            if (e.key === 'F4') this.emit('playtestReset');
            if (e.key === ' ') this.emit('skipDialogue');
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    public on(event: string, callback: InputCallback): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    private emit(event: string, data?: any): void {
        const callbacks = this.listeners[event];
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    public isKeyDown(key: string): boolean {
        return !!this.keys[key.toLowerCase()];
    }
}
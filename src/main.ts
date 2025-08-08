import { Game } from './core/Game';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    const game = new Game(canvas);
    game.start();
});
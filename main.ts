import { GameCore } from './game_core';

const canvas = document.createElement('canvas') as unknown as Canvas;
document.body.appendChild(canvas);
const game = new GameCore(canvas);

let lastTime = 0;
function gameLoop(timestamp: number): void {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    game.update(deltaTime);
    game.render();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
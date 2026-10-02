import { Game } from "./game";

const canvas = document.getElementById("game");
if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Missing game canvas");

const game = new Game(canvas);
if (import.meta.env.DEV) {
  (window as unknown as { __mochi: Game }).__mochi = game;
}
game.start();

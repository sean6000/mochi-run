import { aabb, Camera, overlapX, overlapY, resizeCanvas, TILE, type Rect } from "./engine";
import { Input } from "./input";
import { LEVELS, parseLevel, type Level, type Mover } from "./levels";
import {
  drawFlag,
  drawGroundTile,
  drawHero,
  drawMover,
  drawSky,
  drawSlime,
  drawSpike,
  drawStar,
} from "./draw";

const PW = 34;
const PH = 40;
const GRAVITY = 1750;
const JUMP = -920;
const SPEED = 260;
const COYOTE = 0.12;
const BUFFER = 0.12;

type Screen = "title" | "play" | "dead" | "clear" | "win";

function must<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el as T;
}

export class Game {
  canvas: HTMLCanvasElement;
  cam = new Camera();
  input = new Input();
  screen: Screen = "title";
  levelIndex = 0;
  px = 0;
  py = 0;
  vx = 0;
  vy = 0;
  grounded = false;
  coyote = 0;
  buffer = 0;
  time = 0;
  world: Level = parseLevel(LEVELS[0]);
  overlay = must<HTMLDivElement>("overlay");
  overlayTitle = must<HTMLHeadingElement>("overlay-title");
  overlaySub = must<HTMLParagraphElement>("overlay-sub");
  overlayBtn = must<HTMLButtonElement>("overlay-btn");
  hudLevel = must<HTMLSpanElement>("hud-level");
  hudStars = must<HTMLSpanElement>("hud-stars");
  hudHint = must<HTMLSpanElement>("hud-hint");
  ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = resizeCanvas(canvas, this.cam);
    window.addEventListener("resize", () => {
      this.ctx = resizeCanvas(this.canvas, this.cam);
    });
    this.overlayBtn.addEventListener("click", () => this.onOverlay());
    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && this.screen !== "play") this.onOverlay();
    });
    this.loadLevel(0);
    this.showOverlay("Mochi Run", "Collect stars. Reach the flag.", "Start");
  }

  start() {
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      this.update(dt);
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  onOverlay() {
    if (this.screen === "title" || this.screen === "dead") {
      this.loadLevel(this.levelIndex);
      this.hideOverlay();
      this.screen = "play";
      return;
    }
    if (this.screen === "clear") {
      this.levelIndex += 1;
      this.loadLevel(this.levelIndex);
      this.hideOverlay();
      this.screen = "play";
      return;
    }
    if (this.screen === "win") {
      this.levelIndex = 0;
      this.loadLevel(0);
      this.hideOverlay();
      this.screen = "play";
    }
  }

  showOverlay(title: string, sub: string, btn: string) {
    this.overlay.classList.remove("hidden");
    this.overlayTitle.textContent = title;
    this.overlaySub.textContent = sub;
    this.overlayBtn.textContent = btn;
  }

  hideOverlay() {
    this.overlay.classList.add("hidden");
  }

  loadLevel(i: number) {
    const parsed = parseLevel(LEVELS[i]);
    this.world = {
      ...parsed,
      slimes: parsed.slimes.map((s) => ({ ...s })),
    };
    this.px = parsed.spawn.x;
    this.py = parsed.spawn.y;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    this.coyote = 0;
    this.buffer = 0;
    this.cam.x = 0;
    this.cam.y = 0;
    this.hudLevel.textContent = `Level ${i + 1} · ${parsed.name}`;
    this.updateStarHud();
  }

  playerRect(): Rect {
    return { x: this.px, y: this.py, w: PW, h: PH };
  }

  solids(): Rect[] {
    return [
      ...this.world.solids,
      ...this.world.movers.map((m) => ({ x: m.x, y: m.y, w: m.w, h: 20 })),
    ];
  }

  update(dt: number) {
    this.time += dt;
    const jumpTap = this.input.consumeJump();
    if (this.screen !== "play") return;

    if (jumpTap) this.buffer = BUFFER;
    else this.buffer = Math.max(0, this.buffer - dt);

    const ax = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    this.vx = ax * SPEED;
    this.vy += GRAVITY * dt;

    for (const m of this.world.movers) {
      m.x += m.dir * 70 * dt;
      if (m.x < m.minX) {
        m.x = m.minX;
        m.dir = 1;
      }
      if (m.x + m.w > m.maxX) {
        m.x = m.maxX - m.w;
        m.dir = -1;
      }
    }

    this.px += this.vx * dt;
    this.resolve("x");
    this.py += this.vy * dt;
    const wasGrounded = this.grounded;
    this.grounded = false;
    this.resolve("y");

    if (this.grounded) this.coyote = COYOTE;
    else this.coyote = Math.max(0, this.coyote - dt);

    if (this.buffer > 0 && this.coyote > 0) {
      this.vy = JUMP;
      this.grounded = false;
      this.coyote = 0;
      this.buffer = 0;
    }

    const ride = this.world.movers.find((m: Mover) => {
      const pr = this.playerRect();
      return this.grounded && pr.y + pr.h <= m.y + 6 && pr.x + pr.w > m.x && pr.x < m.x + m.w;
    });
    if (ride && wasGrounded) this.px += ride.dir * 70 * dt;

    for (const s of this.world.stars) {
      if (s.collected) continue;
      if (aabb(this.playerRect(), { x: s.x - 12, y: s.y - 12, w: 24, h: 24 })) {
        s.collected = true;
        this.updateStarHud();
      }
    }

    for (const e of this.world.slimes) {
      e.x += e.dir * 50 * dt;
      const ahead = e.dir > 0 ? e.x + e.w + 2 : e.x - 6;
      const foot = { x: ahead, y: e.y + e.h + 2, w: 4, h: 8 };
      const wall = { x: ahead, y: e.y + 4, w: 4, h: 12 };
      const onFloor = this.world.solids.some((t) => aabb(foot, t));
      const hitWall = this.world.solids.some((t) => aabb(wall, t));
      if (!onFloor || hitWall) e.dir *= -1;
      const er = { x: e.x, y: e.y, w: e.w, h: e.h };
      if (!aabb(this.playerRect(), er)) continue;
      const stomping = this.vy > 80 && this.py + PH - 10 < e.y + 12;
      if (stomping) {
        this.vy = JUMP * 0.7;
        e.y = 9999;
      } else {
        this.die();
        return;
      }
    }

    for (const sp of this.world.spikes) {
      if (aabb(this.playerRect(), sp)) {
        this.die();
        return;
      }
    }

    const flagHit = { x: this.world.flag.x, y: this.world.flag.y, w: 40, h: TILE + 30 };
    if (aabb(this.playerRect(), flagHit)) {
      if (this.world.stars.every((s) => s.collected)) this.finishLevel();
      else this.hudHint.textContent = "Grab every star first!";
    }

    if (this.py > this.world.h + 80) this.die();

    this.cam.follow(this.px, this.py, this.world.w, this.world.h, dt);
  }

  resolve(axis: "x" | "y") {
    const pr = this.playerRect();
    for (const s of this.solids()) {
      if (!aabb(pr, s)) continue;
      if (axis === "x") {
        const ox = overlapX(pr, s);
        this.px -= ox;
        this.vx = 0;
        pr.x = this.px;
      } else {
        const oy = overlapY(pr, s);
        this.py -= oy;
        pr.y = this.py;
        if (oy > 0) {
          this.vy = 0;
          this.grounded = true;
        } else {
          this.vy = Math.max(this.vy, 0);
        }
      }
    }
  }

  die() {
    this.screen = "dead";
    this.showOverlay("Ouch!", "Mochi bounced off. Try again.", "Retry");
  }

  finishLevel() {
    if (this.levelIndex >= LEVELS.length - 1) {
      this.screen = "win";
      this.showOverlay("You win!", "All three levels cleared. Sweet!", "Play again");
    } else {
      this.screen = "clear";
      this.showOverlay("Nice!", `${this.world.name} complete.`, "Next");
    }
  }

  updateStarHud() {
    const got = this.world.stars.filter((s) => s.collected).length;
    const total = this.world.stars.length;
    this.hudStars.textContent = `Stars ${got} / ${total}`;
    this.hudHint.textContent = "Arrows / WASD · Space to jump";
  }

  render() {
    const ctx = this.ctx;
    const w = this.cam.w;
    const h = this.cam.h;
    drawSky(ctx, this.cam.x, this.cam.y, w, h);
    ctx.save();
    ctx.translate(-this.cam.x, -this.cam.y);

    const tops = new Set(
      this.world.solids
        .filter((s) => !this.world.solids.some((o) => o.x === s.x && o.y === s.y - TILE))
        .map((s) => `${s.x},${s.y}`),
    );
    for (const s of this.world.solids) {
      drawGroundTile(ctx, s, tops.has(`${s.x},${s.y}`));
    }
    for (const m of this.world.movers) {
      drawMover(ctx, { x: m.x, y: m.y, w: m.w, h: 20 });
    }
    for (const sp of this.world.spikes) drawSpike(ctx, sp);
    for (const st of this.world.stars) {
      if (!st.collected) drawStar(ctx, st.x, st.y, this.time);
    }
    drawFlag(ctx, this.world.flag.x, this.world.flag.y, this.time);
    for (const e of this.world.slimes) {
      if (e.y < 9000) drawSlime(ctx, e.x, e.y, e.w, e.h, e.dir, this.time);
    }
    drawHero(ctx, this.px, this.py, PW, PH, this.vx, this.grounded, this.time);
    ctx.restore();
  }
}

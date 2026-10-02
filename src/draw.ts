import { TILE, type Rect } from "./engine";

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function drawSky(ctx: CanvasRenderingContext2D, camX: number, camY: number, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#c9efff");
  g.addColorStop(1, "#ffe8f0");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 8; i++) {
    const cx = ((i * 220 - camX * 0.25) % (w + 200)) - 80;
    const cy = 50 + ((i * 37) % 90) - camY * 0.08;
    cloud(ctx, cx, cy, 40 + (i % 3) * 8);
  }
}

function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.arc(x, y, s * 0.55, 0, Math.PI * 2);
  ctx.arc(x + s * 0.5, y - s * 0.15, s * 0.45, 0, Math.PI * 2);
  ctx.arc(x + s, y, s * 0.6, 0, Math.PI * 2);
  ctx.fill();
}

export function drawGroundTile(ctx: CanvasRenderingContext2D, r: Rect, top: boolean) {
  ctx.fillStyle = "rgba(74,59,85,0.12)";
  roundRect(ctx, r.x + 3, r.y + 6, r.w, r.h, 10);
  ctx.fill();
  ctx.fillStyle = top ? "#8ee0a8" : "#c9a27a";
  roundRect(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fill();
  if (top) {
    ctx.fillStyle = "#b8f0c8";
    roundRect(ctx, r.x + 4, r.y + 4, r.w - 8, 12, 6);
    ctx.fill();
  } else {
    ctx.fillStyle = "#a9845e";
    ctx.fillRect(r.x + 10, r.y + 14, 8, 8);
    ctx.fillRect(r.x + 28, r.y + 26, 6, 6);
  }
}

export function drawSpike(ctx: CanvasRenderingContext2D, r: Rect) {
  ctx.fillStyle = "rgba(74,59,85,0.12)";
  ctx.beginPath();
  ctx.moveTo(r.x + r.w / 2 + 2, r.y + 4);
  ctx.lineTo(r.x + r.w + 2, r.y + r.h + 4);
  ctx.lineTo(r.x + 2, r.y + r.h + 4);
  ctx.fill();
  ctx.fillStyle = "#ff8fb3";
  ctx.beginPath();
  ctx.moveTo(r.x + r.w / 2, r.y);
  ctx.lineTo(r.x + r.w, r.y + r.h);
  ctx.lineTo(r.x, r.y + r.h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffe6ef";
  ctx.beginPath();
  ctx.moveTo(r.x + r.w / 2, r.y + 8);
  ctx.lineTo(r.x + r.w * 0.62, r.y + r.h * 0.55);
  ctx.lineTo(r.x + r.w * 0.38, r.y + r.h * 0.55);
  ctx.fill();
}

export function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const bob = Math.sin(t * 3 + x * 0.01) * 4;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(t * 0.6);
  ctx.fillStyle = "rgba(255,210,80,0.35)";
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd24a";
  starPath(ctx, 0, 0, 5, 12, 5);
  ctx.fill();
  ctx.restore();
}

function starPath(ctx: CanvasRenderingContext2D, x: number, y: number, spikes: number, outer: number, inner: number) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / spikes - Math.PI / 2;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function drawFlag(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  ctx.fillStyle = "#8b6b4a";
  roundRect(ctx, x + 8, y, 6, TILE + 24, 3);
  ctx.fill();
  const wave = Math.sin(t * 3) * 4;
  ctx.fillStyle = "#7fd9b5";
  ctx.beginPath();
  ctx.moveTo(x + 14, y + 4);
  ctx.lineTo(x + 52 + wave, y + 16);
  ctx.lineTo(x + 14, y + 30);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(x + 18, y + 10, 6, 6);
  ctx.fillRect(x + 28, y + 16, 6, 6);
}

export function drawMover(ctx: CanvasRenderingContext2D, r: Rect) {
  ctx.fillStyle = "rgba(74,59,85,0.12)";
  roundRect(ctx, r.x + 3, r.y + 5, r.w, 22, 12);
  ctx.fill();
  ctx.fillStyle = "#a8d8ff";
  roundRect(ctx, r.x, r.y, r.w, 20, 12);
  ctx.fill();
  ctx.fillStyle = "#fff";
  roundRect(ctx, r.x + 10, r.y + 5, r.w - 20, 6, 4);
  ctx.fill();
}

export function drawSlime(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  dir: number,
  t: number,
) {
  const squash = 1 + Math.sin(t * 6) * 0.06;
  ctx.save();
  ctx.translate(x + w / 2, y + h);
  ctx.scale(dir, squash);
  ctx.fillStyle = "rgba(74,59,85,0.12)";
  roundRect(ctx, -w / 2 + 2, -h + 4, w, h, 16);
  ctx.fill();
  ctx.fillStyle = "#c9b6ff";
  roundRect(ctx, -w / 2, -h, w, h, 16);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-8, -h + 16, 6, 0, Math.PI * 2);
  ctx.arc(8, -h + 16, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4a3b55";
  ctx.beginPath();
  ctx.arc(-7, -h + 16, 2.5, 0, Math.PI * 2);
  ctx.arc(9, -h + 16, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  vx: number,
  grounded: boolean,
  t: number,
) {
  const bounce = grounded ? Math.abs(Math.sin(t * 8 * Math.min(1, Math.abs(vx) / 80))) * 2 : 0;
  ctx.save();
  ctx.translate(x + w / 2, y + h - bounce);
  const face = vx < -8 ? -1 : 1;
  ctx.scale(face, 1);

  ctx.fillStyle = "rgba(74,59,85,0.15)";
  ctx.beginPath();
  ctx.ellipse(2, 4, w * 0.48, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff3dd";
  roundRect(ctx, -w / 2, -h, w, h - 6, 16);
  ctx.fill();
  ctx.fillStyle = "#ffd6e8";
  ctx.beginPath();
  ctx.ellipse(-8, -h * 0.45, 7, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(8, -h * 0.45, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4a3b55";
  ctx.beginPath();
  ctx.arc(-7, -h * 0.52, 3.2, 0, Math.PI * 2);
  ctx.arc(7, -h * 0.52, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(-6, -h * 0.55, 1.2, 0, Math.PI * 2);
  ctx.arc(8, -h * 0.55, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#4a3b55";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -h * 0.38, 6, 0.15, Math.PI - 0.15);
  ctx.stroke();

  ctx.fillStyle = "#ffc9a3";
  roundRect(ctx, -10, -4, 7, 8, 3);
  roundRect(ctx, 3, -4, 7, 8, 3);
  ctx.fill();
  ctx.restore();
}

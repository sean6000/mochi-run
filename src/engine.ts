export const TILE = 48;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function aabb(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function overlapX(a: Rect, b: Rect) {
  const left = a.x + a.w - b.x;
  const right = b.x + b.w - a.x;
  return left < right ? left : -right;
}

export function overlapY(a: Rect, b: Rect) {
  const top = a.y + a.h - b.y;
  const bottom = b.y + b.h - a.y;
  return top < bottom ? top : -bottom;
}

export class Camera {
  x = 0;
  y = 0;
  w = 800;
  h = 450;

  follow(targetX: number, targetY: number, worldW: number, worldH: number, dt: number) {
    const goalX = targetX - this.w * 0.4;
    const goalY = targetY - this.h * 0.62;
    const k = 1 - Math.pow(0.001, dt);
    this.x += (goalX - this.x) * k;
    this.y += (goalY - this.y) * k;
    this.x = Math.max(0, Math.min(this.x, Math.max(0, worldW - this.w)));
    this.y = Math.max(0, Math.min(this.y, Math.max(0, worldH - this.h)));
  }
}

export function resizeCanvas(canvas: HTMLCanvasElement, cam: Camera) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.max(1, Math.floor(w * dpr));
  canvas.height = Math.max(1, Math.floor(h * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cam.w = w;
  cam.h = h;
  return ctx;
}

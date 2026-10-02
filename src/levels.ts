import { TILE, type Rect } from "./engine";

export interface LevelDef {
  name: string;
  rows: string[];
}

export interface Star {
  x: number;
  y: number;
  collected: boolean;
}

export interface Slime {
  x: number;
  y: number;
  w: number;
  h: number;
  dir: number;
}

export interface Mover {
  x: number;
  y: number;
  w: number;
  minX: number;
  maxX: number;
  dir: number;
}

export interface Level {
  w: number;
  h: number;
  solids: Rect[];
  spikes: Rect[];
  stars: Star[];
  slimes: Slime[];
  movers: Mover[];
  spawn: { x: number; y: number };
  flag: { x: number; y: number };
  name: string;
}

export const LEVELS: LevelDef[] = [
  {
    name: "Sunny Meadow",
    rows: [
      "........................................",
      "........................................",
      "........................................",
      "..............*.........................",
      "............#####.......................",
      "........................................",
      "........*...............*...............",
      ".......###.............###........F.....",
      "..................................##....",
      "S.......................................",
      "########################################",
      "########################################",
    ],
  },
  {
    name: "Cloud Steps",
    rows: [
      "................................................",
      "................................................",
      "..........................................F.....",
      "........................................###.....",
      "..................................###...........",
      "..............................*.................",
      "...........................#####................",
      ".....................*..........................",
      "..................#####.....MMM.................",
      "..............*.^...............................",
      "...........####.................................",
      "S......###......................................",
      "################################################",
    ],
  },
  {
    name: "Berry Hill",
    rows: [
      "................................................",
      "................................................",
      "..........................................F.....",
      "........................................###.....",
      "..................................*..###........",
      "................................####............",
      "................*.e........####.................",
      "...............####...MMM.......................",
      "...........*.^^.................................",
      "S.........###...................................",
      "########........................................",
      "########........................................",
      "################################################",
    ],
  },
];

export function parseLevel(def: LevelDef): Level {
  const h = def.rows.length;
  const w = def.rows[0].length;
  const solids: Rect[] = [];
  const spikes: Rect[] = [];
  const stars: Star[] = [];
  const slimes: Slime[] = [];
  const movers: Mover[] = [];
  let spawn = { x: TILE, y: TILE };
  let flag = { x: 0, y: 0 };

  for (let ty = 0; ty < h; ty++) {
    for (let tx = 0; tx < w; tx++) {
      const c = def.rows[ty][tx];
      const x = tx * TILE;
      const y = ty * TILE;
      if (c === "#") solids.push({ x, y, w: TILE, h: TILE });
      if (c === "^") spikes.push({ x: x + 6, y: y + TILE * 0.45, w: TILE - 12, h: TILE * 0.55 });
      if (c === "*") stars.push({ x: x + TILE / 2, y: y + TILE / 2, collected: false });
      if (c === "e") slimes.push({ x: x + 6, y: y + 16, w: 36, h: 28, dir: 1 });
      if (c === "S") spawn = { x: x + 8, y: y };
      if (c === "F") flag = { x, y: y - 24 };
      if (c === "M") {
        const prev = tx > 0 && def.rows[ty][tx - 1] === "M";
        if (!prev) {
          let len = 0;
          while (tx + len < w && def.rows[ty][tx + len] === "M") len++;
          const pw = len * TILE;
          movers.push({
            x,
            y: y + 8,
            w: pw,
            minX: x - TILE * 2,
            maxX: x + TILE * 3,
            dir: 1,
          });
        }
      }
    }
  }

  return { w: w * TILE, h: h * TILE, solids, spikes, stars, slimes, movers, spawn, flag, name: def.name };
}

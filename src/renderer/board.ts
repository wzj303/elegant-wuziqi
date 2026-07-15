import type { Board, Player } from '../engine/types';
import {
  BOARD_SIZE, CELL_SIZE, BOARD_FRAME, INNER_MARGIN,
  STONE_RADIUS, STAR_POINT_RADIUS, COLORS, STAR_POINTS,
  gridToPixel, getCanvasSize,
} from './constants';

// ========= 主入口 =========

export function clearCanvas(ctx: CanvasRenderingContext2D): void {
  const { width, height } = getCanvasSize();
  ctx.clearRect(0, 0, width, height);
}

export function drawBoard(ctx: CanvasRenderingContext2D): void {
  const { width, height } = getCanvasSize();

  // ① 整体投影
  ctx.save();
  ctx.shadowColor = COLORS.shadow;
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  roundRect(ctx, 2, 2, width - 4, height - 4, 8);
  ctx.fillStyle = COLORS.frameOuter;
  ctx.fill();
  ctx.restore();

  // ② 内凹刻线
  const ins = 5;
  ctx.strokeStyle = COLORS.frameEdge;
  ctx.lineWidth = 1.5;
  roundRect(ctx, ins, ins, width - ins * 2, height - ins * 2, 5);
  ctx.stroke();

  // ③ 棋盘面
  const bx = BOARD_FRAME, by = BOARD_FRAME;
  const bw = width - BOARD_FRAME * 2, bh = height - BOARD_FRAME * 2;
  ctx.fillStyle = COLORS.board;
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = '#b8a080';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(bx, by, bw, bh);

  // ④ 网格
  drawGrid(ctx);
  // ⑤ 星位
  drawStarPoints(ctx);
}

// ========= 网格 =========

function drawGrid(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = COLORS.gridLine;
  ctx.lineWidth = 0.6;
  ctx.lineCap = 'round';
  const s = gridToPixel(0);
  const e = gridToPixel(BOARD_SIZE - 1);
  for (let i = 0; i < BOARD_SIZE; i++) {
    const p = gridToPixel(i);
    ctx.beginPath(); ctx.moveTo(s, p); ctx.lineTo(e, p); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p, s); ctx.lineTo(p, e); ctx.stroke();
  }
}

// ========= 星位 =========

function drawStarPoints(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = COLORS.starPoint;
  for (const [r, c] of STAR_POINTS) {
    ctx.beginPath();
    ctx.arc(gridToPixel(c), gridToPixel(r), STAR_POINT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ========= 棋子 =========

export function drawStones(ctx: CanvasRenderingContext2D, board: Board): void {
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++)
      if (board[r][c] !== 0) drawSingleStone(ctx, r, c, board[r][c] as Player);
}

export function drawSingleStone(
  ctx: CanvasRenderingContext2D, row: number, col: number, player: Player,
): void {
  const cx = gridToPixel(col), cy = gridToPixel(row);
  const R = STONE_RADIUS;

  // 投影
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.30)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2.5;

  // 径向渐变：左上强高光 → 底色 → 暗边缘
  const g = ctx.createRadialGradient(
    cx - R * 0.38, cy - R * 0.38, R * 0.06,
    cx, cy, R,
  );

  if (player === 1) {
    g.addColorStop(0, '#6a6a6a');
    g.addColorStop(0.35, '#3a3a3a');
    g.addColorStop(0.75, COLORS.blackStone);
    g.addColorStop(1, '#0a0a0a');
  } else {
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.35, '#fafaf6');
    g.addColorStop(0.75, COLORS.whiteStone);
    g.addColorStop(1, '#c8c4b8');
  }

  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();

  // 白子细边
  if (player === 2) {
    ctx.strokeStyle = COLORS.whiteStoneBorder;
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }
}

// ========= 工具 =========

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

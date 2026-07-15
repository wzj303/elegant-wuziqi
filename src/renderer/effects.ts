import type { Player } from '../engine/types';
import { STONE_RADIUS, MARKER_RADIUS, COLORS, gridToPixel } from './constants';
import { drawSingleStone } from './board';

/** 半透明预览棋子 */
export function drawGhostPiece(
  ctx: CanvasRenderingContext2D, row: number, col: number, player: Player,
): void {
  ctx.save();
  ctx.globalAlpha = 0.32;
  drawSingleStone(ctx, row, col, player);
  ctx.restore();
}

/** 最后落子红点 + 细环 */
export function drawLastMoveMarker(
  ctx: CanvasRenderingContext2D, row: number, col: number,
): void {
  const cx = gridToPixel(col), cy = gridToPixel(row);

  // 外环
  ctx.strokeStyle = COLORS.lastMoveMarker;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, STONE_RADIUS - 1, 0, Math.PI * 2);
  ctx.stroke();

  // 中心红点
  ctx.fillStyle = COLORS.lastMoveMarker;
  ctx.beginPath();
  ctx.arc(cx, cy, MARKER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
}

/** 胜利高亮 — 金色光晕 + 缩放脉冲感 */
export function drawWinHighlight(
  ctx: CanvasRenderingContext2D,
  line: [number, number][],
): void {
  ctx.save();

  // 先画半透明大光晕
  for (const [r, c] of line) {
    const cx = gridToPixel(c), cy = gridToPixel(r);
    ctx.shadowColor = COLORS.winGlow;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = COLORS.winGlow;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, STONE_RADIUS + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // 再画实心细环
  for (const [r, c] of line) {
    const cx = gridToPixel(c), cy = gridToPixel(r);
    ctx.strokeStyle = '#e6b800';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, STONE_RADIUS + 1, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

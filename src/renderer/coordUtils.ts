// ============================================================
// 画布坐标 ↔ 棋盘坐标 转换工具
// ============================================================

import { BOARD_SIZE, CELL_SIZE, STONE_RADIUS, BOARD_FRAME, INNER_MARGIN, gridToPixel } from './constants';

// 第一根网格线的画布位置
const GRID_ORIGIN = BOARD_FRAME + INNER_MARGIN;

export function pixelToGrid(
  canvasX: number,
  canvasY: number,
): { row: number; col: number } | null {
  const col = Math.round((canvasX - GRID_ORIGIN) / CELL_SIZE);
  const row = Math.round((canvasY - GRID_ORIGIN) / CELL_SIZE);

  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    return null;
  }

  // 检查是否距离交叉点过远
  const cx = gridToPixel(col);
  const cy = gridToPixel(row);
  const dist = Math.sqrt((canvasX - cx) ** 2 + (canvasY - cy) ** 2);

  if (dist > STONE_RADIUS) {
    return null;
  }

  return { row, col };
}

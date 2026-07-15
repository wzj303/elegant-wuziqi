export const BOARD_SIZE = 15;
export const CELL_SIZE = 38;
export const BOARD_FRAME = 30;
export const INNER_MARGIN = 14;
export const STONE_RADIUS = 17;
export const MARKER_RADIUS = 5;
export const STAR_POINT_RADIUS = 3;

export const COLORS = {
  // 外木框
  frameOuter: '#c4a882',
  frameEdge: '#a68b6a',
  // 棋盘面
  board: '#ecdcc0',
  // 网格 & 星位
  gridLine: '#5a4e3a',
  starPoint: '#5a4e3a',
  // 黑子
  blackStone: '#1e1e1e',
  blackStoneHighlight: '#5c5c5c',
  // 白子
  whiteStone: '#f7f6f0',
  whiteStoneHighlight: '#ffffff',
  whiteStoneBorder: '#c8c4b8',
  // 特效
  lastMoveMarker: '#d94a4a',
  winGlow: '#f0c828',
  shadow: 'rgba(0,0,0,0.24)',
} as const;

export const STAR_POINTS: readonly [number, number][] = [
  [3, 3], [3, 7], [3, 11],
  [7, 3], [7, 7], [7, 11],
  [11, 3], [11, 7], [11, 11],
];

export function gridToPixel(grid: number): number {
  return BOARD_FRAME + INNER_MARGIN + grid * CELL_SIZE;
}

export function getCanvasSize(): { width: number; height: number } {
  const s = BOARD_FRAME * 2 + INNER_MARGIN * 2 + CELL_SIZE * (BOARD_SIZE - 1);
  return { width: s, height: s };
}

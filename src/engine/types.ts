// ============================================================
// 五子棋核心类型定义 — 纯数据层，零 UI 依赖
// ============================================================

/** 棋盘格子：0=空, 1=黑子, 2=白子 */
export type Cell = 0 | 1 | 2;

/** 玩家颜色 */
export type Player = 1 | 2;

/** 棋盘：board[row][col]，15×15 */
export type Board = Cell[][];

/** 游戏阶段 */
export enum GamePhase {
  PLAYING = 'PLAYING',
  BLACK_WIN = 'BLACK_WIN',
  WHITE_WIN = 'WHITE_WIN',
  DRAW = 'DRAW',
}

/** 单步落子记录 */
export interface Move {
  row: number;
  col: number;
  player: Player;
}

/** 不可变快照 — React / Canvas 的唯一数据源 */
export interface GameSnapshot {
  /** 深拷贝的 15×15 棋盘 */
  board: Board;
  /** 当前轮次 */
  currentPlayer: Player;
  /** 游戏阶段 */
  phase: GamePhase;
  /** 最后一步（用于标记红点） */
  lastMove: Move | null;
  /** 五连坐标（5 个 [row,col]），或 null */
  winningLine: [number, number][] | null;
  /** 已落子数（1-indexed） */
  moveNumber: number;
}

/** placeMove 返回值 */
export interface PlaceMoveResult {
  success: boolean;
  phase: GamePhase;
  winningLine?: [number, number][];
  error?: 'OUT_OF_BOUNDS' | 'CELL_OCCUPIED' | 'GAME_OVER';
}

/** undo 返回值 */
export interface UndoResult {
  undoneMoves: Move[];
  success: boolean;
}

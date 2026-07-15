import {
  type Cell,
  type Player,
  type Board,
  type Move,
  type GameSnapshot,
  type PlaceMoveResult,
  type UndoResult,
  GamePhase,
} from './types';

export class GameEngine {
  static readonly BOARD_SIZE = 15;

  /** 4 个扫描方向：[dr, dc] — 水平、垂直、右下斜、右上斜 */
  private static readonly DIRECTIONS: readonly [number, number][] = [
    [0, 1],  // 水平 →
    [1, 0],  // 垂直 ↓
    [1, 1],  // 右下 ↘
    [1, -1], // 左下 ↙
  ];

  // ---- 内部状态 ----
  private board: Board;
  private currentPlayer: Player;
  private phase: GamePhase;
  private moveHistory: Move[];
  private winningLine: [number, number][] | null;
  private moveCount: number;

  constructor() {
    this.board = this.createEmptyBoard();
    this.currentPlayer = 1;
    this.phase = GamePhase.PLAYING;
    this.moveHistory = [];
    this.winningLine = null;
    this.moveCount = 0;
  }

  // ============== 公开 API ==============

  /** 在指定位置落子，返回结果 */
  placeMove(row: number, col: number): PlaceMoveResult {
    // 校验游戏状态
    if (this.phase !== GamePhase.PLAYING) {
      return { success: false, phase: this.phase, error: 'GAME_OVER' };
    }

    // 校验坐标合法性
    if (!this.isInBounds(row, col)) {
      return { success: false, phase: this.phase, error: 'OUT_OF_BOUNDS' };
    }

    if (!this.isEmpty(row, col)) {
      return { success: false, phase: this.phase, error: 'CELL_OCCUPIED' };
    }

    // 落子
    const player = this.currentPlayer;
    this.board[row][col] = player;
    this.moveCount++;

    const move: Move = { row, col, player };
    this.moveHistory.push(move);

    // 胜负判定
    const line = this.checkWin(row, col, player);
    if (line) {
      this.winningLine = line;
      this.phase = player === 1 ? GamePhase.BLACK_WIN : GamePhase.WHITE_WIN;
      return {
        success: true,
        phase: this.phase,
        winningLine: line,
      };
    }

    // 平局判定
    if (this.checkDraw()) {
      this.phase = GamePhase.DRAW;
      return { success: true, phase: this.phase };
    }

    // 换手
    this.switchPlayer();

    return { success: true, phase: this.phase };
  }

  /** 悔棋：弹出最后一步，恢复状态 */
  undo(): UndoResult {
    if (this.moveHistory.length === 0) {
      return { undoneMoves: [], success: false };
    }

    const lastMove = this.moveHistory.pop()!;
    this.board[lastMove.row][lastMove.col] = 0;
    this.currentPlayer = lastMove.player;
    this.winningLine = null;
    this.phase = GamePhase.PLAYING;
    this.moveCount--;

    return { undoneMoves: [lastMove], success: true };
  }

  /** 重新开始 */
  restart(): void {
    this.board = this.createEmptyBoard();
    this.currentPlayer = 1;
    this.phase = GamePhase.PLAYING;
    this.moveHistory = [];
    this.winningLine = null;
    this.moveCount = 0;
  }

  /** 获取不可变快照（React 通过此方法读取状态） */
  getSnapshot(): GameSnapshot {
    return {
      board: this.cloneBoard(),
      currentPlayer: this.currentPlayer,
      phase: this.phase,
      lastMove: this.moveHistory.length > 0
        ? { ...this.moveHistory[this.moveHistory.length - 1] }
        : null,
      winningLine: this.winningLine
        ? this.winningLine.map(([r, c]) => [r, c] as [number, number])
        : null,
      moveNumber: this.moveCount,
    };
  }

  // ---- 只读查询 ----

  getCurrentPlayer(): Player {
    return this.currentPlayer;
  }

  getPhase(): GamePhase {
    return this.phase;
  }

  canUndo(): boolean {
    return this.moveHistory.length > 0;
  }

  getMoveCount(): number {
    return this.moveCount;
  }

  getBoard(): Board {
    return this.board;
  }

  // ---- 校验（AI 候选生成也可复用） ----

  isInBounds(row: number, col: number): boolean {
    return row >= 0 && row < GameEngine.BOARD_SIZE
      && col >= 0 && col < GameEngine.BOARD_SIZE;
  }

  isEmpty(row: number, col: number): boolean {
    return this.board[row][col] === 0;
  }

  isValidMove(row: number, col: number): boolean {
    return this.isInBounds(row, col) && this.isEmpty(row, col);
  }

  // ============== 内部方法 ==============

  /**
   * O(1) 胜负判定：仅从最后落子点沿 4 个方向扫描
   * @returns 5 个连续同色棋子的坐标，或 null
   */
  private checkWin(
    row: number,
    col: number,
    player: Player,
  ): [number, number][] | null {
    for (const [dr, dc] of GameEngine.DIRECTIONS) {
      const line: [number, number][] = [[row, col]];

      // 正方向扫描
      for (let step = 1; step <= 4; step++) {
        const r = row + dr * step;
        const c = col + dc * step;
        if (this.isInBounds(r, c) && this.board[r][c] === player) {
          line.push([r, c]);
        } else {
          break;
        }
      }

      // 反方向扫描
      for (let step = 1; step <= 4; step++) {
        const r = row - dr * step;
        const c = col - dc * step;
        if (this.isInBounds(r, c) && this.board[r][c] === player) {
          line.unshift([r, c]);
        } else {
          break;
        }
      }

      if (line.length >= 5) {
        // 取前 5 个（从最左/最上开始）
        return line.slice(0, 5);
      }
    }

    return null;
  }

  /** 平局判定：棋盘满且无胜者 */
  private checkDraw(): boolean {
    return this.moveCount >= GameEngine.BOARD_SIZE * GameEngine.BOARD_SIZE;
  }

  /** 切换玩家 */
  private switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
  }

  /** 深拷贝棋盘 */
  private cloneBoard(): Board {
    return this.board.map(row => [...row]);
  }

  /** 创建空棋盘 */
  private createEmptyBoard(): Board {
    return Array.from(
      { length: GameEngine.BOARD_SIZE },
      () => Array<Cell>(GameEngine.BOARD_SIZE).fill(0),
    );
  }
}

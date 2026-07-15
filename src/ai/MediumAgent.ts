// ============================================================
// MediumAgent — 中等难度：优先防守，拦截玩家连子
// ============================================================

import type { Cell, Player } from '../engine/types';
import type { AIAgent, Difficulty } from './types';
import { isEmptyBoard, generateCandidates } from './boardUtils';

const SIZE = 15;

/** 4 个扫描方向 */
const DIRECTIONS: [number, number][] = [
  [0, 1], [1, 0], [1, 1], [1, -1],
];

export interface MediumAgentConfig {
  /** 防守加权系数（默认 1.6，越大越保守） */
  defenseWeight?: number;
}

const DEFAULT_CONFIG: Required<MediumAgentConfig> = {
  defenseWeight: 1.6,
};

export class MediumAgent implements AIAgent {
  readonly name = 'MediumAgent';
  readonly difficulty: Difficulty = 'medium';
  private config: Required<MediumAgentConfig>;

  constructor(config?: MediumAgentConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  getBestMove(board: Cell[][], player: Player): [number, number] {
    if (isEmptyBoard(board)) {
      return [7, 7];
    }

    const opponent: Player = player === 1 ? 2 : 1;
    const candidates = generateCandidates(board, 2);

    if (candidates.length === 0) {
      return [7, 7];
    }

    let bestScore = -Infinity;
    let bestMove: [number, number] = candidates[0];

    for (const [r, c] of candidates) {
      // 模拟 AI 在此落子 → 进攻分
      board[r][c] = player;
      const offense = this.evaluateCell(board, r, c, player);
      board[r][c] = 0;

      // 模拟对手在此落子 → 防守分
      board[r][c] = opponent;
      const defense = this.evaluateCell(board, r, c, opponent);
      board[r][c] = 0;

      const score = defense * this.config.defenseWeight + offense;

      if (score > bestScore) {
        bestScore = score;
        bestMove = [r, c];
      }
    }

    return bestMove;
  }

  dispose(): void {
    // 无需清理
  }

  // ============== 内部方法 ==============

  /**
   * 评估在 (row, col) 处已有一枚 player 棋子的局面下，
   * 该位置沿四个方向的棋型总得分。
   * 调用方负责在调用前临时放置该棋子，调用后还原。
   */
  private evaluateCell(
    board: Cell[][],
    row: number,
    col: number,
    player: Player,
  ): number {
    let score = 0;

    for (const [dr, dc] of DIRECTIONS) {
      let count = 1; // 包含 (row, col) 自身
      let openEnds = 0;

      // 正方向扫描
      let step = 1;
      while (
        row + dr * step >= 0 && row + dr * step < SIZE
        && col + dc * step >= 0 && col + dc * step < SIZE
        && board[row + dr * step][col + dc * step] === player
      ) {
        count++;
        step++;
      }
      if (
        row + dr * step >= 0 && row + dr * step < SIZE
        && col + dc * step >= 0 && col + dc * step < SIZE
        && board[row + dr * step][col + dc * step] === 0
      ) {
        openEnds++;
      }

      // 反方向扫描
      step = 1;
      while (
        row - dr * step >= 0 && row - dr * step < SIZE
        && col - dc * step >= 0 && col - dc * step < SIZE
        && board[row - dr * step][col - dc * step] === player
      ) {
        count++;
        step++;
      }
      if (
        row - dr * step >= 0 && row - dr * step < SIZE
        && col - dc * step >= 0 && col - dc * step < SIZE
        && board[row - dr * step][col - dc * step] === 0
      ) {
        openEnds++;
      }

      score += this.patternScore(count, openEnds);
    }

    return score;
  }

  /** 根据连续子数和开放端数返回棋型分数 */
  private patternScore(count: number, openEnds: number): number {
    if (count >= 5) return 100000;      // 五连（必胜）
    if (openEnds === 0) return 0;       // 两端封死，无威胁

    if (count === 4) {
      return openEnds === 2 ? 10000 : 5000; // 活四 : 冲四
    }
    if (count === 3) {
      return openEnds === 2 ? 2000 : 500;   // 活三 : 眠三
    }
    if (count === 2) {
      return openEnds === 2 ? 300 : 80;     // 活二 : 眠二
    }
    // count === 1
    return openEnds === 2 ? 10 : 0;         // 孤子
  }
}

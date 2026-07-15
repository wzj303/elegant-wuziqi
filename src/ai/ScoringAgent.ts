// ============================================================
// ScoringAgent — 初级电脑 AI：规则评分 + 浅层 minimax
// ============================================================

import type { Cell, Player } from '../engine/types';
import type { AIAgent, Difficulty, PatternWeights, ScoringAgentConfig } from './types';
import { evaluatePosition } from './evaluate';
import { isEmptyBoard, generateCandidates } from './boardUtils';

const DEFAULT_WEIGHTS: PatternWeights = {
  five: 100000,
  liveFour: 10000,
  rushFour: 1000,
  liveThree: 1000,
  sleepThree: 100,
  liveTwo: 100,
  sleepTwo: 10,
};

const DEFAULT_CONFIG: Required<ScoringAgentConfig> = {
  weights: DEFAULT_WEIGHTS,
  maxDepth: 2,
  candidateRadius: 2,
};

interface ResolvedConfig {
  weights: PatternWeights;
  maxDepth: number;
  candidateRadius: number;
}

export class ScoringAgent implements AIAgent {
  readonly name = 'ScoringAgent';
  readonly difficulty: Difficulty = 'hard';
  private config: ResolvedConfig;

  constructor(config?: ScoringAgentConfig) {
    const merged = { ...DEFAULT_CONFIG, ...config };
    this.config = {
      ...merged,
      weights: { ...DEFAULT_WEIGHTS, ...config?.weights },
    };
  }

  getBestMove(board: Cell[][], player: Player): [number, number] {
    // 空棋盘：占天元（中心）
    if (isEmptyBoard(board)) {
      return [7, 7];
    }

    const candidates = generateCandidates(board, this.config.candidateRadius);
    if (candidates.length === 0) {
      return [7, 7]; // fallback
    }

    let bestScore = -Infinity;
    let bestMove: [number, number] = candidates[0];

    for (const [r, c] of candidates) {
      board[r][c] = player;

      let score: number;
      if (this.config.maxDepth > 0) {
        score = this.minimax(board, this.config.maxDepth - 1, -Infinity, Infinity, false, player);
      } else {
        score = evaluatePosition(board, player, this.config.weights)
          - evaluatePosition(board, (player === 1 ? 2 : 1) as Player, this.config.weights);
      }

      board[r][c] = 0; // 回溯

      if (score > bestScore) {
        bestScore = score;
        bestMove = [r, c];
      }
    }

    return bestMove;
  }

  dispose(): void {
    // 纯本地实现，无需清理
  }

  // ============== 内部方法 ==============

  /** Minimax + Alpha-Beta 剪枝 */
  private minimax(
    board: Cell[][],
    depth: number,
    alpha: number,
    beta: number,
    maximizing: boolean,
    player: Player,
  ): number {
    const opponent: Player = player === 1 ? 2 : 1;
    const currentPlayer = maximizing ? player : opponent;

    // 终止条件：深度耗尽
    if (depth === 0) {
      return evaluatePosition(board, player, this.config.weights)
        - evaluatePosition(board, opponent, this.config.weights);
    }

    const candidates = generateCandidates(board, this.config.candidateRadius);
    if (candidates.length === 0) {
      return evaluatePosition(board, player, this.config.weights)
        - evaluatePosition(board, opponent, this.config.weights);
    }

    if (maximizing) {
      let maxEval = -Infinity;
      for (const [r, c] of candidates) {
        board[r][c] = currentPlayer;
        const evalScore = this.minimax(board, depth - 1, alpha, beta, false, player);
        board[r][c] = 0;
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break; // 剪枝
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const [r, c] of candidates) {
        board[r][c] = currentPlayer;
        const evalScore = this.minimax(board, depth - 1, alpha, beta, true, player);
        board[r][c] = 0;
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break; // 剪枝
      }
      return minEval;
    }
  }
}

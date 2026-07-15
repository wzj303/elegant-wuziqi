// ============================================================
// EasyAgent — 简单难度：随机落子，降低入门门槛
// ============================================================

import type { Cell, Player } from '../engine/types';
import type { AIAgent, Difficulty } from './types';
import { generateCandidates } from './boardUtils';

export class EasyAgent implements AIAgent {
  readonly name = 'EasyAgent';
  readonly difficulty: Difficulty = 'easy';

  getBestMove(board: Cell[][], _player: Player): [number, number] {
    const candidates = generateCandidates(board, 2);

    if (candidates.length === 0) {
      return [7, 7]; // 棋盘全空 → 天元
    }

    const idx = Math.floor(Math.random() * candidates.length);
    return candidates[idx];
  }

  dispose(): void {
    // 无需清理
  }
}

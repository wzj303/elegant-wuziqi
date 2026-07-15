// ============================================================
// 棋盘评估函数 — 纯函数，对给定棋局打分
// ============================================================

import type { Cell, Player } from '../engine/types';
import type { PatternWeights } from './types';

const SIZE = 15;
const DIRECTIONS: [number, number][] = [
  [0, 1], [1, 0], [1, 1], [1, -1],
];

/**
 * 对单个玩家在棋盘上的局势打分
 * 沿四个方向扫描，统计各类棋型数量 × 权重
 */
export function evaluatePosition(
  board: Cell[][],
  player: Player,
  weights: PatternWeights,
): number {
  let score = 0;
  const visited = new Set<string>();

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== player) continue;

      for (const [dr, dc] of DIRECTIONS) {
        const key = `${r},${c},${dr},${dc}`;
        if (visited.has(key)) continue;

        // 扫描该方向上的连续同色子
        let count = 1;
        let openStart = false;
        let openEnd = false;

        // 正方向
        let step = 1;
        while (r + dr * step >= 0 && r + dr * step < SIZE
          && c + dc * step >= 0 && c + dc * step < SIZE
          && board[r + dr * step][c + dc * step] === player) {
          visited.add(`${r + dr * step},${c + dc * step},${dr},${dc}`);
          count++;
          step++;
        }
        // 检查正方向端点是否开放
        if (r + dr * step >= 0 && r + dr * step < SIZE
          && c + dc * step >= 0 && c + dc * step < SIZE
          && board[r + dr * step][c + dc * step] === 0) {
          openEnd = true;
        }

        // 反方向
        step = 1;
        while (r - dr * step >= 0 && r - dr * step < SIZE
          && c - dc * step >= 0 && c - dc * step < SIZE
          && board[r - dr * step][c - dc * step] === player) {
          visited.add(`${r - dr * step},${c - dc * step},${dr},${dc}`);
          count++;
          step++;
        }
        // 检查反方向端点是否开放
        if (r - dr * step >= 0 && r - dr * step < SIZE
          && c - dc * step >= 0 && c - dc * step < SIZE
          && board[r - dr * step][c - dc * step] === 0) {
          openStart = true;
        }

        visited.add(key);
        score += patternScore(count, openStart, openEnd, weights);
      }
    }
  }

  return score;
}

/** 根据连续数和两端开闭状态，匹配棋型并返回权重 */
function patternScore(
  count: number,
  openStart: boolean,
  openEnd: boolean,
  weights: PatternWeights,
): number {
  const open = openStart && openEnd;
  const halfOpen = (openStart && !openEnd) || (!openStart && openEnd);

  if (count >= 5) return weights.five;
  if (count === 4 && open) return weights.liveFour;
  if (count === 4 && halfOpen) return weights.rushFour;
  if (count === 3 && open) return weights.liveThree;
  if (count === 3 && halfOpen) return weights.sleepThree;
  if (count === 2 && open) return weights.liveTwo;
  if (count === 2 && halfOpen) return weights.sleepTwo;

  return 0;
}

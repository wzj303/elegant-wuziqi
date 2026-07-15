// ============================================================
// 共享棋盘工具函数 — 所有 AI Agent 复用
// ============================================================

import type { Cell } from '../engine/types';

const SIZE = 15;

/** 检查棋盘是否为空 */
export function isEmptyBoard(board: Cell[][]): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== 0) return false;
    }
  }
  return true;
}

/**
 * 生成候选落子位置：已有棋子周围 radius 格内的所有空位
 * 使用二维布尔数组去重，避免字符串分配
 */
export function generateCandidates(
  board: Cell[][],
  radius: number = 2,
): [number, number][] {
  const seen: boolean[][] = Array.from({ length: SIZE }, () => new Array(SIZE).fill(false));
  const candidates: [number, number][] = [];

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== 0) {
        for (let dr = -radius; dr <= radius; dr++) {
          for (let dc = -radius; dc <= radius; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 && nr < SIZE
              && nc >= 0 && nc < SIZE
              && board[nr][nc] === 0
              && !seen[nr][nc]
            ) {
              seen[nr][nc] = true;
              candidates.push([nr, nc]);
            }
          }
        }
      }
    }
  }

  return candidates;
}

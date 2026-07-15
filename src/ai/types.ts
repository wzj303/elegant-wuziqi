// ============================================================
// AI 可插拔契约 — 所有 AI 实现（本地/远程/CNN/Worker）的共同接口
// ============================================================

import type { Cell, Player } from '../engine/types';

/** 难度等级 */
export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

/** 玩家选择的先后手（PvE 模式） */
export type PlayerColor = 'black' | 'white' | 'random';

export const PLAYER_COLOR_LABEL: Record<PlayerColor, string> = {
  black: '执黑先手',
  white: '执白后手',
  random: '随机分配',
};

/**
 * AI Agent 接口
 * - MVP: ScoringAgent（同步，本地规则评分）
 * - 未来: RemoteAgent（异步，调用云端 CNN 模型 API）
 * - 未来: WebWorkerAgent（异步，Worker 线程运行 minimax）
 */
export interface AIAgent {
  /** 稳定标识符，用于调试/日志 */
  readonly name: string;

  /** 难度等级 */
  readonly difficulty: Difficulty;

  /**
   * 给定棋局和 AI 颜色，返回最佳落子 [row, col]
   * 同步/异步均可 — 调用方始终使用 await
   */
  getBestMove(board: Cell[][], player: Player): Promise<[number, number]> | [number, number];

  /** 可选清理（关闭 WS、终止 Worker 等） */
  dispose?(): void;
}

/** 棋型权重配置 */
export interface PatternWeights {
  five: number;         // 100000 — 必胜/必堵
  liveFour: number;     // 10000  — 活四（双头无挡）
  rushFour: number;     // 1000   — 冲四（单头）
  liveThree: number;    // 1000   — 活三
  sleepThree: number;   // 100    — 眠三
  liveTwo: number;      // 100    — 活二
  sleepTwo: number;     // 10     — 眠二
}

/** ScoringAgent 配置 */
export interface ScoringAgentConfig {
  weights?: Partial<PatternWeights>;
  /** minimax 搜索深度（默认 2） */
  maxDepth?: number;
  /** 仅考虑已有棋子周围 N 格内的候选（默认 2） */
  candidateRadius?: number;
}

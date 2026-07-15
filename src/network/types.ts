// ============================================================
// WebSocket 消息 Schema — MVP 阶段仅定义类型，不做实现
// 未来只需在 App 层接入 WS，placeMove() 入口不变
// ============================================================

import type { Player, Board, GamePhase, Move } from '../engine/types';

/** 客户端发出的走子消息 */
export interface WSMoveMessage {
  type: 'move';
  row: number;
  col: number;
  player: Player;
  gameId: string;
}

/** 服务端推送的游戏状态同步 */
export interface WSGameStateMessage {
  type: 'game_state';
  board: Board;
  currentPlayer: Player;
  phase: GamePhase;
  lastMove: Move | null;
}

/** 服务端可能下发的消息联合 */
export type WSServerMessage =
  | WSMoveMessage       // 对手的走子
  | WSGameStateMessage; // 完整状态同步（断线重连）

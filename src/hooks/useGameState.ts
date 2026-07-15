import { useRef, useState, useCallback, useEffect } from 'react';
import { GameEngine } from '../engine/GameEngine';
import type { GameSnapshot, Player } from '../engine/types';
import { GamePhase } from '../engine/types';
import type { AIAgent } from '../ai/types';

export interface UseGameStateOptions {
  mode: 'pvp' | 'pve';
  aiAgent?: AIAgent;
  aiColor?: Player;
  onMoveCommitted?: (move: { row: number; col: number; player: Player }) => void;
}

export interface UseGameStateReturn {
  snapshot: GameSnapshot;
  placeMove: (row: number, col: number) => boolean;
  undo: () => boolean;
  restart: () => void;
  canUndo: boolean;
  isAiThinking: boolean;
  boardDisabled: boolean;
  engineRef: React.RefObject<GameEngine | null>;
}

export function useGameState(options: UseGameStateOptions): UseGameStateReturn {
  const { mode } = options;
  const aiColor: Player = options.aiColor ?? 2;

  const engineRef = useRef<GameEngine>(new GameEngine());
  const [snapshot, setSnapshot] = useState<GameSnapshot>(
    () => engineRef.current.getSnapshot(),
  );
  const [isAiThinking, setIsAiThinking] = useState(false);

  // 用 ref 存储可变值，避免 useCallback 闭包陈旧
  const aiAgentRef = useRef(options.aiAgent);
  aiAgentRef.current = options.aiAgent;
  const aiColorRef = useRef(aiColor);
  aiColorRef.current = aiColor;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const onMoveCommittedRef = useRef(options.onMoveCommitted);
  onMoveCommittedRef.current = options.onMoveCommitted;
  const isAiThinkingRef = useRef(false);

  const refresh = useCallback(() => {
    setSnapshot(engineRef.current.getSnapshot());
  }, []);

  // ===== AI 触发逻辑 =====
  // 当 snapshot 更新后，检查是否需要 AI 走子
  useEffect(() => {
    if (modeRef.current !== 'pve') return;
    if (!aiAgentRef.current) return;

    const engine = engineRef.current;
    if (engine.getPhase() !== GamePhase.PLAYING) return;
    if (engine.getCurrentPlayer() !== aiColorRef.current) return;
    if (isAiThinkingRef.current) return;

    isAiThinkingRef.current = true;
    setIsAiThinking(true);

    const board = engine.getSnapshot().board;
    const agent = aiAgentRef.current;
    const color = aiColorRef.current;

    // 延迟执行，让 React 先渲染 "AI 思考中" 状态
    const timer = window.setTimeout(() => {
      Promise.resolve(agent.getBestMove(board, color)).then(([row, col]) => {
        // 检查游戏状态未被重置
        if (
          engine.getPhase() === GamePhase.PLAYING
          && engine.getCurrentPlayer() === color
          && engine.isValidMove(row, col)
        ) {
          engine.placeMove(row, col);
          onMoveCommittedRef.current?.({ row, col, player: color });
          refresh();
        }
        isAiThinkingRef.current = false;
        setIsAiThinking(false);
      }).catch(() => {
        // AI 异常时恢复 UI，避免永久卡在"思考中"
        isAiThinkingRef.current = false;
        setIsAiThinking(false);
      });
    }, 200);

    return () => {
      clearTimeout(timer);
      isAiThinkingRef.current = false;
      setIsAiThinking(false);
    };
  }, [snapshot, refresh]);

  // ===== 玩家操作 =====

  const placeMove = useCallback((row: number, col: number): boolean => {
    const engine = engineRef.current;
    if (engine.getPhase() !== GamePhase.PLAYING) return false;

    // PvE 模式下，只有玩家回合才能落子
    if (modeRef.current === 'pve' && engine.getCurrentPlayer() === aiColorRef.current) {
      return false;
    }

    const currentPlayer = engine.getCurrentPlayer();
    const result = engine.placeMove(row, col);
    if (result.success) {
      refresh();
      onMoveCommittedRef.current?.({ row, col, player: currentPlayer });
      return true;
    }
    return false;
  }, [refresh]);

  const undo = useCallback((): boolean => {
    const engine = engineRef.current;
    const isPvE = modeRef.current === 'pve';
    const aiFirst = aiColorRef.current === 1;

    // PvE: AI 先手时只有 1 步（AI 的首步），悔棋会陷入死循环
    if (isPvE && aiFirst && engine.getMoveCount() < 2) {
      return false;
    }

    // PvE 模式下，一次悔棋弹两步（AI + 玩家）
    if (isPvE && engine.getMoveCount() >= 2) {
      engine.undo(); // AI 的走子
      const result = engine.undo(); // 玩家的走子
      if (result.success) {
        isAiThinkingRef.current = false;
        setIsAiThinking(false);
        refresh();
      }
      return result.success;
    }

    const result = engine.undo();
    if (result.success) {
      refresh();
    }
    return result.success;
  }, [refresh]);

  const restart = useCallback(() => {
    isAiThinkingRef.current = false;
    setIsAiThinking(false);
    engineRef.current.restart();
    refresh();
  }, [refresh]);

  const boardDisabled =
    snapshot.phase !== GamePhase.PLAYING
    || isAiThinking
    || (mode === 'pve' && snapshot.currentPlayer === aiColor);

  // PvE 下 AI 先手且仅有 1 步时禁止悔棋（撤销会导致 AI 立即重下）
  const aiFirstUndoBlocked = mode === 'pve' && aiColor === 1 && snapshot.moveNumber === 1;

  return {
    snapshot,
    placeMove,
    undo,
    restart,
    canUndo: snapshot.moveNumber > 0 && !isAiThinking && !aiFirstUndoBlocked,
    isAiThinking,
    boardDisabled,
    engineRef,
  };
}

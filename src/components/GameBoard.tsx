import { useRef, useState, useEffect } from 'react';
import type { GameSnapshot } from '../engine/types';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import { getCanvasSize } from '../renderer/constants';
import { clearCanvas, drawBoard, drawStones } from '../renderer/board';
import {
  drawGhostPiece,
  drawLastMoveMarker,
  drawWinHighlight,
} from '../renderer/effects';

interface GameBoardProps {
  snapshot: GameSnapshot;
  disabled: boolean;
  showGhost: boolean;
  onMove: (row: number, col: number) => void;
}

export default function GameBoard({
  snapshot,
  disabled,
  showGhost,
  onMove,
}: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverPos, setHoverPos] = useState<[number, number] | null>(null);

  useCanvasInteraction({
    canvasRef,
    disabled,
    onMove,
    onHoverChange: setHoverPos,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = getCanvasSize();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // —— 绘制顺序 ——
    clearCanvas(ctx);
    drawBoard(ctx);           // 木框 + 棋盘面 + 网格 + 星位
    drawStones(ctx, snapshot.board);

    if (snapshot.winningLine) {
      drawWinHighlight(ctx, snapshot.winningLine);
    }
    if (snapshot.lastMove) {
      drawLastMoveMarker(ctx, snapshot.lastMove.row, snapshot.lastMove.col);
    }
    if (
      showGhost
      && !disabled
      && hoverPos
      && snapshot.board[hoverPos[0]][hoverPos[1]] === 0
    ) {
      drawGhostPiece(ctx, hoverPos[0], hoverPos[1], snapshot.currentPlayer);
    }
  }, [snapshot, hoverPos, showGhost, disabled]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        cursor: disabled ? 'default' : 'pointer',
        flexShrink: 0,
      }}
    />
  );
}

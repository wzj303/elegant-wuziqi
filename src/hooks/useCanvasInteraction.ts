// ============================================================
// Canvas 鼠标/触摸交互 Hook
// ============================================================

import { useEffect, type RefObject } from 'react';
import { pixelToGrid } from '../renderer/coordUtils';
import { getCanvasSize, BOARD_SIZE } from '../renderer/constants';

interface UseCanvasInteractionOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  disabled: boolean;
  onMove: (row: number, col: number) => void;
  onHoverChange: (pos: [number, number] | null) => void;
}

export function useCanvasInteraction({
  canvasRef,
  disabled,
  onMove,
  onHoverChange,
}: UseCanvasInteractionOptions): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = getCanvasSize();

    const toCanvasCoords = (e: MouseEvent): { x: number; y: number } => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { x, y } = toCanvasCoords(e);
      const grid = pixelToGrid(x, y);
      if (grid) {
        onHoverChange([grid.row, grid.col]);
      } else {
        onHoverChange(null);
      }
    };

    const handleMouseLeave = () => {
      onHoverChange(null);
    };

    const handleClick = (e: MouseEvent) => {
      if (disabled) return;
      const { x, y } = toCanvasCoords(e);
      const grid = pixelToGrid(x, y);
      if (grid) {
        onMove(grid.row, grid.col);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
    };
  }, [canvasRef, disabled, onMove, onHoverChange]);
}

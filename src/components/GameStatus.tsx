import { GamePhase } from '../engine/types';
import type { Player } from '../engine/types';

interface GameStatusProps {
  phase: GamePhase;
  currentPlayer: Player;
  moveNumber: number;
  isAiThinking: boolean;
}

const NAME: Record<Player, string> = { 1: '黑棋', 2: '白棋' };

/** 步数统计行 — 避免 PLAYING / WIN 分支重复 */
function MoveStats({ blackMoves, whiteMoves }: { blackMoves: number; whiteMoves: number }) {
  return (
    <div style={s.statRow}>
      <span style={s.statItem}>
        <span style={{ ...s.statDot, background: '#2c2c2c' }} />
        黑棋 {blackMoves} 步
      </span>
      <span style={s.statSep}>·</span>
      <span style={s.statItem}>
        <span style={{ ...s.statDot, background: '#f2efe6', border: '1px solid #c8c0b0' }} />
        白棋 {whiteMoves} 步
      </span>
    </div>
  );
}

export default function GameStatus({
  phase, currentPlayer, moveNumber, isAiThinking,
}: GameStatusProps) {
  const blackMoves = Math.ceil(moveNumber / 2);
  const whiteMoves = Math.floor(moveNumber / 2);

  return (
    <div style={s.box}>
      <style>{animCSS}</style>

      {phase === GamePhase.PLAYING && (
        isAiThinking ? (
          <div style={s.think}>
            <span style={s.thinkDot} /> AI 思考中
          </div>
        ) : (
          <>
            <div style={s.turnRow}>
              <span style={{
                ...s.stone,
                background: currentPlayer === 1 ? '#2c2c2c' : '#f2efe6',
                border: `2px solid ${currentPlayer === 1 ? '#2c2c2c' : '#c8c0b0'}`,
              }} />
              <span style={s.name}>{NAME[currentPlayer]}</span>
              <span style={s.label}>回合</span>
            </div>
            <div style={s.sub}>第 {moveNumber + 1} 手</div>
            {moveNumber > 0 && <MoveStats blackMoves={blackMoves} whiteMoves={whiteMoves} />}
          </>
        )
      )}

      {phase !== GamePhase.PLAYING && (
        <div className="win-banner" style={s.winWrap}>
          <div style={{
            ...s.winText,
            color: phase === GamePhase.BLACK_WIN ? '#1e1e1e'
                 : phase === GamePhase.WHITE_WIN ? '#9a9a9a'
                 : '#6b5e4a',
          }}>
            {phase === GamePhase.DRAW
              ? '平局'
              : `${NAME[phase === GamePhase.BLACK_WIN ? 1 : 2]}获胜`}
          </div>
          <div className="win-emoji" style={s.winEmoji}>
            {phase === GamePhase.DRAW ? '🤝' : '🎉'}
          </div>
          <div style={s.winSub}>共 {moveNumber} 手</div>
          {moveNumber > 0 && <MoveStats blackMoves={blackMoves} whiteMoves={whiteMoves} />}
        </div>
      )}
    </div>
  );
}

// ===== 胜利动画 keyframes =====

const animCSS = `
@keyframes win-pop {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes win-emoji-bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.4); }
  70% { transform: scale(0.85); }
  100% { transform: scale(1); }
}
.win-banner { animation: win-pop 0.45s ease-out both; }
.win-emoji   { animation: win-emoji-bounce 0.55s ease-out 0.15s both; }
`;

// ===== 行内样式 =====

const s: Record<string, React.CSSProperties> = {
  box: {
    background: '#faf8f3',
    border: '1px solid #e6ded0',
    borderRadius: 10,
    padding: '16px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 52,
    overflow: 'hidden',
  },

  /* 回合 */
  turnRow:    { display: 'flex', alignItems: 'center', gap: 8 },
  stone:      { width: 20, height: 20, borderRadius: '50%', flexShrink: 0 },
  name:       { fontSize: 17, fontWeight: 700, color: '#3a3028' },
  label:      { fontSize: 13, color: '#b0a090' },
  sub:        { fontSize: 12, color: '#c8bca8', marginTop: 2 },
  think:      { fontSize: 14, fontWeight: 600, color: '#d98a3a', display: 'flex', alignItems: 'center', gap: 6 },
  thinkDot:   { width: 8, height: 8, borderRadius: '50%', background: '#d98a3a', display: 'inline-block' },

  /* 步数统计 */
  statRow:    { display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 },
  statItem:   { fontSize: 12, color: '#8b7b6b', display: 'flex', alignItems: 'center', gap: 4 },
  statDot:    { width: 8, height: 8, borderRadius: '50%', display: 'inline-block', flexShrink: 0 },
  statSep:    { fontSize: 10, color: '#c8bca8' },

  /* 胜利 */
  winWrap:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  winText:    { fontSize: 26, fontWeight: 800, letterSpacing: 2, lineHeight: 1.1 },
  winEmoji:   { fontSize: 30, marginTop: 2 },
  winSub:     { fontSize: 12, color: '#c8bca8', marginTop: 4 },
};

import { useGameState } from '../hooks/useGameState';
import { GamePhase, type Player } from '../engine/types';
import type { AIAgent } from '../ai/types';
import { DIFFICULTY_LABEL } from '../ai/types';
import GameBoard from './GameBoard';
import GameStatus from './GameStatus';
import GameControls from './GameControls';

interface GamePageProps {
  mode: 'pvp' | 'pve';
  aiAgent?: AIAgent;
  aiColor?: Player;
  onBack: () => void;
  onSwitchMode: (mode: 'pvp' | 'pve') => void;
}

const MODE: Record<string, string> = { pvp: '双人对战', pve: '人机对战' };

/** 根据 AI 颜色反推玩家执什么颜色 */
function playerSide(aiColor?: Player): string | null {
  if (aiColor === undefined) return null;
  return aiColor === 1 ? '你执白 ○' : '你执黑 ●';
}

export default function GamePage({ mode, aiAgent, aiColor, onBack, onSwitchMode }: GamePageProps) {
  const { snapshot, placeMove, undo, restart, canUndo, isAiThinking, boardDisabled }
    = useGameState({ mode, aiAgent, aiColor });

  const other = mode === 'pvp' ? 'pve' : 'pvp';
  const side = playerSide(aiColor);

  return (
    <div style={s.wrap}>
      <div style={s.left}>
        <h1 style={s.logo}>优雅五子棋</h1>
        <GameBoard snapshot={snapshot} disabled={boardDisabled}
          showGhost={snapshot.phase === GamePhase.PLAYING && !isAiThinking}
          onMove={placeMove} />
      </div>

      <div style={s.right}>
        {/* 模式 */}
        <div style={s.sec}>
          <div style={s.secTit}>对战模式</div>
          <div style={s.card}>
            <div style={s.modeRow}>
              <span style={s.mode}>{MODE[mode]}</span>
              {mode === 'pve' && aiAgent && (
                <span style={s.diff}>
                  {DIFFICULTY_LABEL[aiAgent.difficulty]}
                </span>
              )}
            </div>
            {side && <div style={s.side}>{side}</div>}
            <button style={s.switch} onClick={() => onSwitchMode(other)}>
              切换至{MODE[other]}
            </button>
          </div>
        </div>

        {/* 状态 */}
        <div style={s.sec}>
          <div style={s.secTit}>对局状态</div>
          <GameStatus phase={snapshot.phase} currentPlayer={snapshot.currentPlayer}
            moveNumber={snapshot.moveNumber} isAiThinking={isAiThinking} />
        </div>

        {/* 操作 */}
        <div style={s.sec}>
          <div style={s.secTit}>操作</div>
          <GameControls canUndo={canUndo} isAiThinking={isAiThinking}
            onUndo={undo} onRestart={restart} onQuit={onBack} />
        </div>
      </div>
    </div>
  );
}

const W = 204;

const s: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex', gap: 28, alignItems: 'flex-start',
    justifyContent: 'center', padding: '12px 10px 30px',
  },
  left: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
  },
  logo: {
    fontSize: 22, fontWeight: 700, color: '#3a3028',
    letterSpacing: 4, marginBottom: 10, userSelect: 'none',
  },
  right: {
    width: W, display: 'flex', flexDirection: 'column', paddingTop: 2,
  },

  sec:     { marginBottom: 18 },
  secTit:  { fontSize: 10, color: '#c4b8a4', letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' as const },

  card:    {
    background: '#faf8f3', border: '1px solid #e6ded0', borderRadius: 10,
    padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5,
  },
  mode:    { fontSize: 16, fontWeight: 700, color: '#3a3028' },
  modeRow: { display: 'flex', alignItems: 'center', gap: 8 },
  diff:    {
    fontSize: 11, fontWeight: 600, color: '#8b7355',
    background: '#f0e8da', padding: '1px 10px', borderRadius: 8,
  },
  side:    {
    fontSize: 12, color: '#7a6b5b', marginTop: 2,
  },
  switch:  {
    fontSize: 12, color: '#8b7355', background: 'none', border: 'none',
    cursor: 'pointer', textAlign: 'left' as const, padding: 0,
  },
};

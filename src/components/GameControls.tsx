interface GameControlsProps {
  canUndo: boolean;
  isAiThinking: boolean;
  onUndo: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export default function GameControls({ canUndo, isAiThinking, onUndo, onRestart, onQuit }: GameControlsProps) {
  return (
    <div style={s.col}>
      <button style={{ ...s.btn, ...(canUndo && !isAiThinking ? s.undo : s.disabled) }}
        disabled={!canUndo || isAiThinking} onClick={onUndo}>
        ↩ 悔棋
      </button>
      <button style={{ ...s.btn, ...s.primary }} disabled={isAiThinking}
        onClick={() => { if (window.confirm('确定再来一局？')) onRestart(); }}>
        ↻ 再来一局
      </button>
      <div style={s.spacer} />
      <button style={{ ...s.btn, ...s.quit }}
        onClick={() => { if (window.confirm('确定退出？')) onQuit(); }}>
        退出游戏
      </button>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  col: {
    display: 'flex', flexDirection: 'column', gap: 8,
    width: '100%', padding: '0 4px',
  },
  btn: {
    width: '100%', padding: '10px 0', fontSize: 14, fontWeight: 500,
    border: '1px solid #d8d0c4', borderRadius: 9,
    cursor: 'pointer', transition: 'all 0.18s',
    background: '#faf8f3', color: '#5a4e3e',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  undo:     { background: '#faf8f3', border: '1px solid #d8d0c4', color: '#5a4e3e' },
  primary:  { background: '#3a3028', color: '#efe4d0', border: '1px solid #3a3028', fontWeight: 600 },
  quit:     { background: '#faf8f3', border: '1px solid #e6ded0', color: '#b8a898', fontSize: 13 },
  disabled: { opacity: 0.28, cursor: 'not-allowed' },
  spacer:   { height: 4 },
};

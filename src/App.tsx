import { useState, useRef, useCallback } from 'react';
import type { AIAgent, Difficulty, PlayerColor } from './ai/types';
import type { Player } from './engine/types';
import { ScoringAgent } from './ai/ScoringAgent';
import { EasyAgent } from './ai/EasyAgent';
import { MediumAgent } from './ai/MediumAgent';
import ModeSelectPage from './components/ModeSelectPage';
import GamePage from './components/GamePage';

/** 根据难度创建对应的 AI Agent */
function createAgent(difficulty: Difficulty): AIAgent {
  switch (difficulty) {
    case 'easy':   return new EasyAgent();
    case 'medium': return new MediumAgent();
    case 'hard':   return new ScoringAgent();
  }
}

/** 根据玩家选择的先后手，决定 AI 执什么颜色 */
function resolveAiColor(playerColor: PlayerColor): Player {
  if (playerColor === 'black') return 2;       // 玩家执黑 → AI 执白
  if (playerColor === 'white') return 1;       // 玩家执白 → AI 执黑
  return (Math.random() < 0.5 ? 1 : 2) as Player; // 随机
}

export default function App() {
  const [page, setPage] = useState<'menu' | 'game'>('menu');
  const [mode, setMode] = useState<'pvp' | 'pve'>('pvp');
  const [gameKey, setGameKey] = useState(0);
  const aiRef = useRef<AIAgent>(new ScoringAgent());
  const aiColorRef = useRef<Player>(2);

  const handleSelect = useCallback((m: 'pvp' | 'pve', diff?: Difficulty, color?: PlayerColor) => {
    setMode(m);
    if (m === 'pve' && diff && color) {
      aiRef.current = createAgent(diff);
      aiColorRef.current = resolveAiColor(color);
    }
    setGameKey(k => k + 1);
    setPage('game');
  }, []);

  const handleBack = useCallback(() => {
    setPage('menu');
  }, []);

  const handleSwitchMode = useCallback((m: 'pvp' | 'pve') => {
    if (m === 'pve') {
      // PvE 需要配置难度和先后手，返回菜单重新选择
      setPage('menu');
      return;
    }
    setMode(m);
    setGameKey(k => k + 1);
  }, []);

  if (page === 'menu') {
    return <ModeSelectPage onSelect={handleSelect} />;
  }

  return (
    <div className="app">
      <GamePage
        key={gameKey}
        mode={mode}
        aiAgent={mode === 'pve' ? aiRef.current : undefined}
        aiColor={mode === 'pve' ? aiColorRef.current : undefined}
        onBack={handleBack}
        onSwitchMode={handleSwitchMode}
      />
    </div>
  );
}

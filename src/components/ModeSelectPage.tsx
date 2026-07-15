import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { Difficulty, PlayerColor } from '../ai/types';
import { DIFFICULTY_LABEL, PLAYER_COLOR_LABEL } from '../ai/types';

interface ModeSelectPageProps {
  onSelect: (mode: 'pvp' | 'pve', difficulty?: Difficulty, playerColor?: PlayerColor) => void;
}

const DIFFICULTIES: { key: Difficulty; icon: string; desc: string }[] = [
  { key: 'easy',   icon: '🌱', desc: '随机落子 · 入门练习' },
  { key: 'medium', icon: '🛡️', desc: '优先防守 · 拦截连子' },
  { key: 'hard',   icon: '⚔️',  desc: '攻守兼备 · 博弈搜索' },
];

const COLORS: { key: PlayerColor; icon: string }[] = [
  { key: 'black',  icon: '●' },
  { key: 'white',  icon: '○' },
  { key: 'random', icon: '?' },
];

export default function ModeSelectPage({ onSelect }: ModeSelectPageProps) {
  const [showPvEConfig, setShowPvEConfig] = useState(false);
  const [selDiff, setSelDiff] = useState<Difficulty>('medium');
  const [selColor, setSelColor] = useState<PlayerColor>('random');

  const handleStartPvE = () => {
    onSelect('pve', selDiff, selColor);
  };

  // ========== 模式选择页 ==========

  if (!showPvEConfig) {
    return (
      <div style={s.page}>
        <style>{anim}</style>

        {/* 标题 */}
        <div className="fade-in" style={s.hero}>
          <div style={s.icons}>
            <span style={s.b}>●</span>
            <span style={s.w}>○</span>
          </div>
          <h1 style={s.title}>优雅五子棋</h1>
          <p style={s.sub}>Elegant Gomoku · 选择模式开始对弈</p>
        </div>

        {/* 卡片 */}
        <div className="fade-in" style={s.cards}>
          <button className="mode-card" style={s.card}
            onClick={() => onSelect('pvp')}>
            <div style={s.icon}>👥</div>
            <div style={s.cardTitle}>双人对战</div>
            <div style={s.desc}>同一设备轮流落子<br />面对面博弈</div>
            <div style={s.tag}>PvP</div>
          </button>

          <button className="mode-card" style={s.card}
            onClick={() => setShowPvEConfig(true)}>
            <div style={s.icon}>🤖</div>
            <div style={s.cardTitle}>人机对战</div>
            <div style={s.desc}>与 AI 对局锻炼棋力<br />三种难度 · 自选先后手</div>
            <div style={{ ...s.tag, color: '#5a7a5a', background: '#e4efe0' }}>PvE</div>
          </button>
        </div>

        <p style={s.foot}>15×15 标准棋盘 · 黑先白后 · 五连即胜</p>
      </div>
    );
  }

  // ========== PvE 配置页 ==========

  return (
    <div style={s.page}>
      <style>{anim}</style>

      {/* 标题 */}
      <div className="fade-in" style={s.hero}>
        <div style={s.icons}>
          <span style={s.iconLarge}>🤖</span>
        </div>
        <h1 style={s.title}>人机对战</h1>
        <p style={s.sub}>选择难度与先后手，开始对局</p>
      </div>

      {/* 难度选择 */}
      <div className="fade-in" style={s.section}>
        <div style={s.sectionLabel}>选择难度</div>
        <div style={s.cards}>
          {DIFFICULTIES.map((d) => {
            const active = selDiff === d.key;
            return (
              <button key={d.key}
                style={{
                  ...s.diffCard,
                  ...(active ? s.diffCardActive : {}),
                }}
                onClick={() => setSelDiff(d.key)}>
                <div style={s.diffIcon}>{d.icon}</div>
                <div style={s.diffTitle}>{DIFFICULTY_LABEL[d.key]}</div>
                <div style={s.diffDesc}>{d.desc}</div>
                {active && <div style={s.checkMark}>✓</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 先后手选择 */}
      <div className="fade-in" style={s.section}>
        <div style={s.sectionLabel}>选择先后手</div>
        <div style={s.colorRow}>
          {COLORS.map((c) => {
            const active = selColor === c.key;
            return (
              <button key={c.key}
                style={{
                  ...s.colorBtn,
                  ...(active ? s.colorBtnActive : {}),
                }}
                onClick={() => setSelColor(c.key)}>
                <span style={{
                  ...s.colorIcon,
                  color: c.key === 'black' ? '#2c2c2c'
                       : c.key === 'white' ? '#c0b8a8'
                       : '#8b7355',
                }}>
                  {c.icon}
                </span>
                <span style={s.colorText}>{PLAYER_COLOR_LABEL[c.key]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 开始按钮 */}
      <button className="fade-in" style={s.startBtn}
        onClick={handleStartPvE}>
        开始对战
      </button>

      {/* 返回 */}
      <button className="fade-in" style={s.backBtn}
        onClick={() => setShowPvEConfig(false)}>
        ← 返回模式选择
      </button>
    </div>
  );
}

// ===== 动画 =====

const anim = `
.mode-card { animation: card-up 0.45s ease-out both; }
.mode-card:nth-child(2) { animation-delay: 0.1s; }
.fade-in  { animation: fade-in 0.35s ease-out both; }
@keyframes card-up {
  0% { opacity: 0; transform: translateY(24px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
`;

// ===== 样式 =====

const F = '"PingFang SC","Microsoft YaHei","Noto Sans SC",-apple-system,sans-serif';

const s: Record<string, CSSProperties> = {
  page: {
    width: '100%', minHeight: '100vh', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '40px 24px', fontFamily: F,
  },

  /* 标题 */
  hero:       { textAlign: 'center', marginBottom: 36 },
  icons:      { display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 12 },
  b:          { fontSize: 26, color: '#2c2c2c' },
  w:          { fontSize: 26, color: '#c0b8a8' },
  iconLarge:  { fontSize: 38 },
  title:      { fontSize: 38, fontWeight: 800, color: '#3a3028', letterSpacing: 6, margin: 0, lineHeight: 1.1 },
  sub:        { fontSize: 14, color: '#a89880', marginTop: 10, letterSpacing: 1 },

  /* 模式卡片 */
  cards:  { display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 580 },
  card:   {
    width: 230, padding: '32px 20px 26px', borderRadius: 16,
    border: '1.5px solid #e6ded0', background: '#fefcf8',
    cursor: 'pointer', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    fontFamily: F, transition: 'all 0.22s',
  },
  icon:      { fontSize: 38, marginBottom: 2 },
  cardTitle: { fontSize: 18, fontWeight: 700, color: '#3a3028' },
  desc:      { fontSize: 13, color: '#a09080', lineHeight: 1.7 },
  tag:       {
    marginTop: 8, fontSize: 11, fontWeight: 600, color: '#8b7355',
    background: '#f0e8da', padding: '2px 14px', borderRadius: 10, letterSpacing: 1,
  },

  /* 配置区段 */
  section:     { width: '100%', maxWidth: 580, marginBottom: 22 },
  sectionLabel:{ fontSize: 13, fontWeight: 600, color: '#8b7355', textAlign: 'center',
                  marginBottom: 14, letterSpacing: 2 },

  /* 难度卡片 */
  diffCard: {
    width: 168, padding: '24px 14px 18px', borderRadius: 14,
    border: '1.5px solid #e6ded0', background: '#fefcf8',
    cursor: 'pointer', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    fontFamily: F, transition: 'all 0.2s', position: 'relative',
  },
  diffCardActive: {
    border: '2px solid #8b7355',
    background: '#faf6ef',
    boxShadow: '0 0 0 3px rgba(139,115,85,0.12)',
  },
  diffIcon:  { fontSize: 36, marginBottom: 2 },
  diffTitle: { fontSize: 18, fontWeight: 700, color: '#3a3028' },
  diffDesc:  { fontSize: 12, color: '#a09080', lineHeight: 1.5 },
  checkMark: {
    position: 'absolute', top: -6, right: -6,
    width: 22, height: 22, borderRadius: '50%',
    background: '#8b7355', color: '#fff',
    fontSize: 12, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    lineHeight: 1,
  },

  /* 先后手选择 */
  colorRow: {
    display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
  },
  colorBtn: {
    width: 150, padding: '14px 10px', borderRadius: 12,
    border: '1.5px solid #e6ded0', background: '#fefcf8',
    cursor: 'pointer', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    fontFamily: F, transition: 'all 0.2s',
  },
  colorBtnActive: {
    border: '2px solid #8b7355',
    background: '#faf6ef',
    boxShadow: '0 0 0 3px rgba(139,115,85,0.12)',
  },
  colorIcon: { fontSize: 24, lineHeight: 1 },
  colorText:{ fontSize: 13, fontWeight: 600, color: '#5a4e3e' },

  /* 按钮 */
  startBtn: {
    marginTop: 8, width: 200, padding: '13px 0', borderRadius: 12,
    border: 'none', background: '#3a3028', color: '#efe4d0',
    fontSize: 16, fontWeight: 700, cursor: 'pointer',
    fontFamily: F, transition: 'all 0.2s', letterSpacing: 4,
  },
  backBtn: {
    marginTop: 18, fontSize: 13, color: '#a89880',
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: F, transition: 'color 0.2s',
  },

  foot: { marginTop: 44, fontSize: 12, color: '#c8b898', letterSpacing: 1 },
};

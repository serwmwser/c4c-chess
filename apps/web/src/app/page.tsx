// apps/web/src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useConnectors, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi } from 'viem';
import { Chess, type Square, type Piece } from 'chess.js';
import { CONFIG } from '@/lib/config';
import { getBotMove, isBotTurn, startGameWithBot } from '@/components/chess-bot';
import { ChatBoxDynamic } from '@/components/chat-box-dynamic';
import { CreateGameForm } from '@/components/create-game-form';
import { GameLobby } from '@/components/game-lobby';
import { FriendsList } from '@/components/friends-list';
import { ProfileEditor } from '@/components/profile-editor';
import { ClaimWinnings } from '@/components/claim-winnings';
import { useGameStore } from '@/lib/game-store';
import { formatC4C } from '@/lib/utils';
// 🔥 ИСПРАВЛЕНО: STAKE_OPTIONS импортируется из @/types
import { STAKE_OPTIONS } from '@/types';

const CHESS_GAME_ABI = parseAbi(["function makeMove(string gameId, string moveNotation) external"]);

function ChessBoard() {
  const [fen, setFen] = useState<string>(() => startGameWithBot());
  const [selected, setSelected] = useState<Square | null>(null);
  const [possible, setPossible] = useState<Square[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [mode, setMode] = useState<'bot'|'pvp'>('bot');
  const [timeCtrl, setTimeCtrl] = useState(900);
  const [stake, setStake] = useState(50000);
  const [wTime, setWTime] = useState(900);
  const [bTime, setBTime] = useState(900);
  const [over, setOver] = useState<string | null>(null);
  const { address } = useAccount();
  
  // 🔥 100% БЕЗОПАСНО: прямой доступ к .data, без алиасов с ":"
  const writeRes = useWriteContract();
  const waitRes = useWaitForTransactionReceipt({ hash: writeRes.data });
  const isConfirming = waitRes.isLoading;
  const isTxSuccess = waitRes.isSuccess;

  useEffect(() => { setWTime(timeCtrl); setBTime(timeCtrl); setOver(null); }, [timeCtrl]);

  useEffect(() => {
    if (over) return;
    const g = new Chess(fen);
    const isW = g.turn() === 'w';
    if ((isW ? wTime : bTime) <= 0) { setOver(isW ? '⚪ Время вышло!' : '⚫ Время вышло!'); return; }
    const t = setInterval(() => { isW ? setWTime(p => Math.max(0, p-1)) : setBTime(p => Math.max(0, p-1)); }, 1000);
    return () => clearInterval(t);
  }, [fen, wTime, bTime, over]);

  useEffect(() => {
    if (mode === 'bot' && !over) {
      const g = new Chess(fen);
      if (isBotTurn(g) && !g.isGameOver()) {
        const t = setTimeout(() => {
          const mv = getBotMove(g); if (!mv) return;
          g.move(mv); setFen(g.fen()); setHistory(h => [...h, `${mv.from}-${mv.to}`]); setBTime(p => Math.max(0, p-4));
          if (g.isCheckmate()) setOver('⚫ Бот победил!');
        }, 4000);
        return () => clearTimeout(t);
      }
    }
  }, [fen, mode, over]);

  const getStyle = (p: Piece | undefined | null) => {
    if (!p) return {} satisfies React.CSSProperties;
    const w = p.color === 'w';
    return { fontSize: '44px', fontWeight: 900, color: w ? '#fff' : '#111827', textShadow: w ? '0 2px 4px #0009' : '0 2px 4px #fff9', userSelect: 'none', lineHeight: 1 } satisfies React.CSSProperties;
  };

  const getSym = (p: Piece | undefined | null) => {
    if (!p) return '';
    const s: Record<string, Record<'w'|'b', string>> = { p:{w:'♙',b:'♟'}, n:{w:'♘',b:'♞'}, b:{w:'♗',b:'♝'}, r:{w:'♖',b:'♜'}, q:{w:'♕',b:'♛'}, k:{w:'♔',b:'♚'} };
    return s[p.type]?.[p.color] || '';
  };

  const click = (sq: string) => {
    if (over) return;
    const s = sq as Square;
    if (selected === s) { setSelected(null); setPossible([]); return; }
    const g = new Chess(fen);
    if (selected) {
      try {
        const m = g.move({ from: selected, to: s, promotion: 'q' });
        if (m) { setFen(g.fen()); setHistory(h => [...h, `${m.from}-${m.to}`]); setPending(`${m.from}-${m.to}`); setSelected(null); setPossible([]); if(mode==='bot') setWTime(p=>Math.max(0,p-1)); if (g.isCheckmate()) setOver('⚪ Вы победили!'); return; }
      } catch {}
    }
    const piece = g.get(s);
    if (piece && piece.color === g.turn() && (mode==='pvp' || piece.color==='w')) { setSelected(s); setPossible(g.moves({ square: s, verbose: true }).map(m => m.to as Square)); }
    else { setSelected(null); setPossible([]); }
  };

  const reset = () => { setFen(startGameWithBot()); setSelected(null); setPossible([]); setHistory([]); setPending(null); setWTime(timeCtrl); setBTime(timeCtrl); setOver(null); };
  useEffect(() => { if (isTxSuccess && pending) { console.log('✅', writeRes.data); setPending(null); } }, [isTxSuccess, writeRes.data, pending]);

  const g = new Chess(fen);
  const isW = g.turn() === 'w';
  const fmt = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div style={{ marginTop: '24px', padding: '20px', background: '#1f2937', borderRadius: '16px', border: '1px solid #374151' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'white' }}>♟️ Доска</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={mode} onChange={e => { setMode(e.target.value as any); reset(); }} style={{ padding: '6px', background: '#374151', color: 'white', border: '1px solid #4b5563', borderRadius: '6px' }}>
            <option value="bot">🤖 Бот</option><option value="pvp">👥 PvP</option>
          </select>
          <select value={timeCtrl} onChange={e => { setTimeCtrl(Number(e.target.value)); reset(); }} style={{ padding: '6px', background: '#374151', color: 'white', border: '1px solid #4b5563', borderRadius: '6px' }}>
            <option value={300}>5м</option><option value={900}>15м</option><option value={3600}>1ч</option>
          </select>
          <select value={stake} onChange={e => setStake(Number(e.target.value))} style={{ padding: '6px', background: '#374151', color: 'white', border: '1px solid #4b5563', borderRadius: '6px' }}>
            {STAKE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#111827', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px' }}>
        <div><span style={{ fontSize: '12px', color: '#9ca3af' }}>⚪</span><p style={{ fontSize: '18px', fontWeight: 'bold', color: isW && !over ? '#fbbf24' : '#22c55e', margin: 0 }}>{fmt(wTime)}</p></div>
        <div style={{ textAlign: 'right' }}><span style={{ fontSize: '12px', color: '#9ca3af' }}>⚫</span><p style={{ fontSize: '18px', fontWeight: 'bold', color: !isW && !over ? '#fbbf24' : '#22c55e', margin: 0 }}>{fmt(bTime)}</p></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '1px', background: '#374151', border: '2px solid #374151', borderRadius: '8px', maxWidth: '450px', margin: '0 auto' }}>
        {['8','7','6','5','4','3','2','1'].map((r, ri) => ['a','b','c','d','e','f','g','h'].map((f, fi) => {
          const sq = `${f}${r}` as Square; const p = g.get(sq);
          return (
            <div key={sq} onClick={() => click(sq)} style={{ aspectRatio: '1', background: (fi+ri)%2===0?'#eeeed2':'#769656', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: p||possible.includes(sq)?'pointer':'default', position: 'relative', border: selected===sq?'3px solid #f59e0b':possible.includes(sq)?'3px solid #3b82f6':'none' }}>
              <span style={getStyle(p)}>{getSym(p)}</span>
              {possible.includes(sq) && !p && <div style={{ position: 'absolute', width: '20px', height: '20px', background: 'rgba(59,130,246,0.5)', borderRadius: '50%' }} />}
            </div>
          );
        }))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        {over && <p style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '18px' }}>{over}</p>}
        {g.isDraw() && !over && <p style={{ color: '#f59e0b', fontWeight: 'bold' }}>🤝 Ничья</p>}
        {mode === 'pvp' && over && (
          <ClaimWinnings gameId={`g_current_${address?.slice(2,8)}`} stake={stake} />
        )}
        {mode === 'pvp' && !over && pending && (
          <button onClick={() => writeRes.writeContract({ address: CONFIG.GAME_CONTRACT_ADDRESS, abi: CHESS_GAME_ABI, functionName: 'makeMove', args: [`g_${address?.slice(2,10)}`, pending] })} disabled={writeRes.isPending || isConfirming} style={{ marginTop: '8px', padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px' }}>📡 В блокчейн</button>
        )}
        <button onClick={reset} style={{ marginTop: '8px', padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px' }}>🔄 Новая</button>
      </div>
    </div>
  );
}

export default function App() {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const connectors = useConnectors();
  const [showModal, setShowModal] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [tab, setTab] = useState<'profile'|'lobby'|'friends'>('profile');
  const { currentPlayer } = useGameStore();
  
  // 🔥 100% БЕЗОПАСНО
  const balRes = useBalance({ address, token: CONFIG.C4C_TOKEN_ADDRESS as `0x${string}`, query: { enabled: !!address && !!chain?.id && chain.id === CONFIG.CHAIN_ID } });
  const balance = balRes.data;
  const balStatus = balRes.status;

  const [playerId] = useState(() => typeof window === 'undefined' ? 'srv' : address || `guest_${Math.random().toString(36).slice(2,8)}`);

  useEffect(() => { if(currentPlayer?.theme) document.documentElement.setAttribute('data-theme', currentPlayer.theme); }, [currentPlayer?.theme]);

  if (!isConnected) return (
    <main style={{ minHeight: '100vh', background: '#111827', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>♟️ {CONFIG.APP_NAME}</h1>
      <button onClick={() => setShowModal(true)} style={{ padding: '14px 32px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', cursor: 'pointer' }}>🔗 Войти</button>
      {showModal && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowModal(false)}>
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '16px' }} onClick={e => e.stopPropagation()}>
          {connectors.filter(c => c.type !== 'injected' && c.type !== 'walletConnect').map((c, i) => (
            <button key={i} onClick={() => { connect({ connector: c }); setShowModal(false); }} style={{ display: 'block', width: '100%', padding: '12px', margin: '8px 0', background: i===0?'#f59e0b':'#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>🔗 {c.name}</button>
          ))}
        </div>
      </div>}
      <div suppressHydrationWarning><ChatBoxDynamic playerId={playerId} opponentId={undefined} /></div>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--theme-bg)', color: 'var(--theme-text)', padding: '20px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1>♟️ {CONFIG.APP_NAME}</h1>
          <button onClick={() => disconnect()} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px' }}>Выйти</button>
        </header>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => setShowCreate(true)} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px' }}>🎮 Создать игру</button>
          <button onClick={() => setShowProfile(true)} style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px' }}>👤 Профиль</button>
        </div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
          {(['profile','lobby','friends'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '10px', background: tab===t?'#3b82f6':'transparent', color: tab===t?'white':'#9ca3af', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer' }}>{t==='profile'?'👤':t==='lobby'?'🎲':'👥'}</button>
          ))}
        </div>
        {tab==='profile' && <section style={{ padding: '24px', background: '#1f2937', borderRadius: '16px' }}>
          <h2>👤 Профиль</h2>
          <p style={{ fontFamily: 'monospace', color: '#22c55e' }}>{address}</p>
          <p style={{ fontSize: '24px', color: '#f59e0b' }}>{balStatus==='success' && balance?.formatted ? `${parseFloat(balance.formatted).toFixed(2)} C4C` : '0.00'}</p>
          {currentPlayer && <div style={{ marginTop: '16px' }}>
            {currentPlayer.avatar && <img src={currentPlayer.avatar} style={{ width: '60px', borderRadius: '50%', marginBottom: '8px' }} />}
            {currentPlayer.name && <h3 style={{ color: 'white' }}>{currentPlayer.name}</h3>}
            {currentPlayer.description && <p style={{ color: '#9ca3af', fontSize: '14px' }}>{currentPlayer.description}</p>}
          </div>}
        </section>}
        {tab==='lobby' && <section style={{ padding: '24px', background: '#1f2937', borderRadius: '16px' }}><h2>🎲 Лобби</h2><GameLobby /></section>}
        {tab==='friends' && <section style={{ padding: '24px', background: '#1f2937', borderRadius: '16px' }}><h2>👥 Друзья</h2><FriendsList /></section>}
        <ChessBoard />
        <ChatBoxDynamic playerId={playerId} opponentId={undefined} />
      </div>
      {showCreate && <CreateGameForm onClose={() => setShowCreate(false)} />}
      {showProfile && <ProfileEditor onClose={() => setShowProfile(false)} />}
    </main>
  );
}
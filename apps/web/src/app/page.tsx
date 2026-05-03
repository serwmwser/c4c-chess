// apps/web/src/app/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { walletConnect, metaMask } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useAccount, useConnect, useDisconnect, useConnectors, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi } from 'viem';
import { Chess, type Square, type Piece } from 'chess.js';
import {
  C4C_TOKEN_ADDRESS, GAME_CONTRACT_ADDRESS, CHAIN_ID, CHAIN_NAME, RPC_URL,
  APP_NAME, APP_DESCRIPTION, WALLETCONNECT_PROJECT_ID, TIME_OPTIONS, STAKE_OPTIONS,
  BOARD_THEMES, THEMES, formatTime, formatC4C, getBotMove
} from '@/lib/config';

// 🔹 Wagmi config (внутри файла, чтобы не создавать отдельный)
const wagmiConfig = createConfig({
  chains: [bsc],
  connectors: [
    metaMask({ dappMeta { name: APP_NAME, url: typeof window !== 'undefined' ? window.location.origin : 'https://c4c-chess.vercel.app' } }),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      showQrModal: true,
      meta {
        name: APP_NAME,
        description: APP_DESCRIPTION,
        url: typeof window !== 'undefined' ? window.location.origin : 'https://c4c-chess.vercel.app',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
    }),
  ],
  transports: { [bsc.id]: http(RPC_URL) },
});

const queryClient = new QueryClient();
const CHESS_ABI = parseAbi(["function makeMove(string gameId, string moveNotation) external"]);

// 🔹 Вспомогательные компоненты (внутри того же файла)
function ChatBox({ playerId }: { playerId: string }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{id:string;text:string;sender:string}[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = () => { if (!input.trim()) return; setMsgs(p => [...p, { id: `${Date.now()}`, text: input, sender: playerId }]); setInput(''); };

  if (!open) return <button onClick={() => setOpen(true)} style={{ position: 'fixed', bottom: 20, right: 20, padding: '12px 20px', background: '#3b82f6', color: '#fff', borderRadius: 10, fontWeight: 600 }}>💬 Чат</button>;

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, width: 320, height: 400, background: '#1f2937', borderRadius: 16, display: 'flex', flexDirection: 'column', border: '1px solid #374151' }}>
      <div style={{ padding: 12, borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600 }}>💬 Чат</span>
        <button onClick={() => setOpen(false)} style={{ background: 'none', color: '#9ca3af' }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {msgs.map(m => <div key={m.id} style={{ marginBottom: 8, padding: '8px 12px', background: m.sender === playerId ? '#3b82f6' : '#374151', borderRadius: 8, fontSize: 13 }}>{m.text}</div>)}
        <div ref={endRef} />
      </div>
      <div style={{ padding: 12, borderTop: '1px solid #374151', display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Сообщение..." style={{ flex: 1 }} />
        <button onClick={send} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', borderRadius: 6 }}>➤</button>
      </div>
    </div>
  );
}

function ThemeSelector({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {Object.entries(THEMES).map(([id, t]: any) => (
        <button key={id} onClick={() => onChange(id)} title={t.name} style={{ padding: 12, background: t.bg, color: t.text, border: value === id ? `2px solid ${t.accent}` : '2px solid #374151', borderRadius: 8, cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ width: 20, height: 20, background: t.accent, borderRadius: '50%', margin: '0 auto 4px' }} />
          <span style={{ fontSize: 11 }}>{t.name}</span>
        </button>
      ))}
    </div>
  );
}

function BoardSelector({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {Object.entries(BOARD_THEMES).map(([id, t]: any) => (
        <button key={id} onClick={() => onChange(id)} title={t.name} style={{ width: 40, height: 40, background: `linear-gradient(135deg, ${t.light} 50%, ${t.dark} 50%)`, border: value === id ? '3px solid #f59e0b' : '2px solid #374151', borderRadius: 8, cursor: 'pointer' }} />
      ))}
    </div>
  );
}

// 🔹 Основной компонент страницы
function ChessApp() {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const connectors = useConnectors();
  const [showModal, setShowModal] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // 🔥 Состояния игры
  const [fen, setFen] = useState<string>(() => new Chess().fen());
  const [selected, setSelected] = useState<Square | null>(null);
  const [possible, setPossible] = useState<Square[]>([]);
  const [mode, setMode] = useState<'bot'|'pvp'>('bot');
  const [timeCtrl, setTimeCtrl] = useState(900);
  const [wTime, setWTime] = useState(900);
  const [bTime, setBTime] = useState(900);
  const [over, setOver] = useState<string | null>(null);
  const [boardTheme, setBoardTheme] = useState('classic');
  
  // 🔥 Баланс (ПРЯМОЙ ДОСТУП К .data — БЕЗ АЛИАСОВ!)
  const balanceResult = useBalance({
    address: address,
    token: C4C_TOKEN_ADDRESS as `0x${string}`,
    query: { enabled: !!address && !!chain?.id && chain.id === CHAIN_ID },
  });
  const balance = balanceResult.data;
  const balanceStatus = balanceResult.status;

  // 🔥 Клиентский рендер
  useEffect(() => { setIsClient(true); }, []);

  // 🔥 Таймеры
  useEffect(() => { setWTime(timeCtrl); setBTime(timeCtrl); setOver(null); }, [timeCtrl]);

  useEffect(() => {
    if (over) return;
    const g = new Chess(fen);
    const isW = g.turn() === 'w';
    if ((isW ? wTime : bTime) <= 0) { setOver(isW ? '⚪ Время вышло!' : '⚫ Время вышло!'); return; }
    const t = setInterval(() => { isW ? setWTime(p => Math.max(0, p-1)) : setBTime(p => Math.max(0, p-1)); }, 1000);
    return () => clearInterval(t);
  }, [fen, wTime, bTime, over]);

  // 🔥 Бот (4 секунды задержка)
  useEffect(() => {
    if (mode === 'bot' && !over) {
      const g = new Chess(fen);
      if (g.turn() === 'b' && !g.isGameOver()) {
        const t = setTimeout(() => {
          const moves = g.moves({ verbose: true });
          const mv = getBotMove(moves);
          if (mv) { g.move(mv); setFen(g.fen()); setBTime(p => Math.max(0, p-4)); if (g.isCheckmate()) setOver('⚫ Бот победил!'); }
        }, 4000);
        return () => clearTimeout(t);
      }
    }
  }, [fen, mode, over]);

  // 🔥 Подключение
  const handleConnect = async (connector: any) => {
    if (isPending || isConnecting) return;
    setIsConnecting(true);
    try { await connect({ connector }); setShowModal(false); }
    catch (e) { console.error('Connect error:', e); }
    finally { setIsConnecting(false); }
  };

  // 🔥 Ход
  const click = (sq: string) => {
    if (over) return;
    const s = sq as Square;
    if (selected === s) { setSelected(null); setPossible([]); return; }
    const g = new Chess(fen);
    if (selected) {
      try {
        const m = g.move({ from: selected, to: s, promotion: 'q' });
        if (m) { setFen(g.fen()); setSelected(null); setPossible([]); if(mode==='bot') setWTime(p=>Math.max(0,p-1)); if (g.isCheckmate()) setOver('⚪ Вы победили!'); return; }
      } catch {}
    }
    const piece = g.get(s);
    if (piece && piece.color === g.turn() && (mode==='pvp' || piece.color==='w')) { setSelected(s); setPossible(g.moves({ square: s, verbose: true }).map(m => m.to as Square)); }
    else { setSelected(null); setPossible([]); }
  };

  const reset = () => { setFen(new Chess().fen()); setSelected(null); setPossible([]); setWTime(timeCtrl); setBTime(timeCtrl); setOver(null); };
  
  const g = new Chess(fen);
  const isW = g.turn() === 'w';
  const getSym = (p: Piece | null) => p ? ({p:{w:'♙',b:'♟'},n:{w:'♘',b:'♞'},b:{w:'♗',b:'♝'},r:{w:'♖',b:'♜'},q:{w:'♕',b:'♛'},k:{w:'♔',b:'♚'}} as any)[p.type]?.[p.color] : '';
  const getPieceColor = (p: Piece | null) => p?.color === 'w' ? '#111827' : '#ffffff';

  // 🔥 Заглушка
  if (!isClient) return <main style={{ minHeight: '100vh', background: '#111827', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>⏳ Загрузка...</p></main>;

  // 🔥 НЕ ПОДКЛЮЧЁН
  if (!isConnected) {
    return (
      <main style={{ minHeight: '100vh', background: '#111827', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, marginBottom: 16, fontWeight: 'bold' }}>♟️ {APP_NAME}</h1>
        <p style={{ color: '#9ca3af', marginBottom: 40, maxWidth: 450 }}>{APP_DESCRIPTION}</p>
        <button onClick={() => setShowModal(true)} disabled={isPending || isConnecting} style={{ padding: '16px 40px', background: (isPending||isConnecting)?'#6b7280':'#f59e0b', color: '#fff', borderRadius: 12, fontSize: 20, fontWeight: 'bold' }}>
          {(isPending||isConnecting)?'⏳ Подключение...':'🔗 Войти в приложение'}
        </button>
        {showModal && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#1f2937', borderRadius: 16, padding: 24, maxWidth: 400, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#fff', marginBottom: 20, textAlign: 'center' }}>Выберите кошелёк</h3>
            <button onClick={() => { const mm = connectors.find((c:any)=>c.type==='metaMask'||c.id==='io.metamask'); if(mm) handleConnect(mm); }} disabled={isPending||isConnecting} style={{ width: '100%', padding: 14, margin: '8px 0', background: '#f59e0b', color: '#fff', borderRadius: 10, fontSize: 16, fontWeight: 600 }}>🦊 MetaMask</button>
            <button onClick={() => { const wc = connectors.find((c:any)=>c.type==='walletConnect'); if(wc) handleConnect(wc); }} disabled={isPending||isConnecting||WALLETCONNECT_PROJECT_ID==='demo'} style={{ width: '100%', padding: 14, margin: '8px 0', background: (WALLETCONNECT_PROJECT_ID!=='demo')?'#3b82f6':'#6b7280', color: '#fff', borderRadius: 10, fontSize: 16, fontWeight: 600 }}>📱 WalletConnect QR</button>
            {WALLETCONNECT_PROJECT_ID==='demo' && <p style={{ fontSize: 12, color: '#fbbf24', textAlign: 'center', marginTop: 12 }}>⚠️ QR не работает с ключом 'demo'</p>}
            <button onClick={() => setShowModal(false)} style={{ width: '100%', padding: 12, margin: '16px 0 0 0', background: '#374151', color: '#fff', borderRadius: 8 }}>Закрыть</button>
          </div>
        </div>}
        <ChatBox playerId={address || 'guest'} />
      </main>
    );
  }

  // 🔥 ПОДКЛЮЧЁН
  return (
    <main style={{ minHeight: '100vh', background: '#111827', color: '#fff', padding: 20 }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20, borderBottom: '1px solid #374151' }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>♟️ {APP_NAME}</h1>
          <button onClick={() => disconnect()} style={{ padding: '10px 20px', background: '#ef4444', color: '#fff', borderRadius: 8 }}>Выйти</button>
        </header>

        <section style={{ marginTop: 32, padding: 28, background: '#1f2937', borderRadius: 16, border: '1px solid #374151' }}>
          <h2 style={{ fontSize: 20, marginBottom: 20, fontWeight: 600 }}>👤 Профиль</h2>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>Адрес кошелька</p>
          <p style={{ fontFamily: 'monospace', fontSize: 14, color: '#22c55e', wordBreak: 'break-all', background: '#111827', padding: 12, borderRadius: 8 }}>{address}</p>
          <p style={{ marginTop: 20, fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>Баланс {APP_NAME}</p>
          <p style={{ fontSize: 28, fontWeight: 'bold', color: '#f59e0b' }}>
            {balanceStatus === 'pending' && '⏳ Загрузка...'}
            {balanceStatus === 'error' && '❌ Ошибка'}
            {balanceStatus === 'success' && balance?.formatted ? `${parseFloat(balance.formatted).toFixed(2)} C4C` : '0.00 C4C'}
          </p>
          <button onClick={() => setShowCreate(true)} style={{ marginTop: 16, padding: '10px 20px', background: '#3b82f6', color: '#fff', borderRadius: 8 }}>🎮 Создать игру</button>
        </section>

        <section style={{ marginTop: 32, padding: 20, background: '#1f2937', borderRadius: 16, border: '1px solid #374151' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>♟️ Доска</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={mode} onChange={e => { setMode(e.target.value as any); reset(); }} style={{ padding: 6, background: '#374151', color: '#fff', border: '1px solid #4b5563', borderRadius: 6 }}>
                <option value="bot">🤖 Бот</option><option value="pvp">👥 PvP</option>
              </select>
              <select value={timeCtrl} onChange={e => { setTimeCtrl(Number(e.target.value)); reset(); }} style={{ padding: 6, background: '#374151', color: '#fff', border: '1px solid #4b5563', borderRadius: 6 }}>
                {TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#111827', padding: '8px 12px', borderRadius: 8, marginBottom: 12 }}>
            <div><span style={{ fontSize: 12, color: '#9ca3af' }}>⚪ Белые</span><p style={{ fontSize: 18, fontWeight: 'bold', color: isW && !over ? '#fbbf24' : '#22c55e', margin: 0 }}>{formatTime(wTime)}</p></div>
            <div style={{ textAlign: 'right' }}><span style={{ fontSize: 12, color: '#9ca3af' }}>⚫ Чёрные</span><p style={{ fontSize: 18, fontWeight: 'bold', color: !isW && !over ? '#fbbf24' : '#22c55e', margin: 0 }}>{formatTime(bTime)}</p></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2, background: '#374151', borderRadius: 8, maxWidth: 320, margin: '0 auto' }}>
            {['8','7','6','5','4','3','2','1'].map((r, ri) => ['a','b','c','d','e','f','g','h'].map((f, fi) => {
              const sq = `${f}${r}` as Square; const p = g.get(sq);
              const theme = BOARD_THEMES[boardTheme as keyof typeof BOARD_THEMES];
              const bg = (fi+ri)%2===0 ? theme.light : theme.dark;
              return (
                <div key={sq} onClick={() => click(sq)} style={{ aspectRatio: 1, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: p?'pointer':'default', fontSize: 24, color: getPieceColor(p), position: 'relative', border: selected===sq?'3px solid #f59e0b':'none' }}>
                  {getSym(p)}
                  {possible.includes(sq) && !p && <div style={{ position: 'absolute', width: 20, height: 20, background: 'rgba(59,130,246,0.5)', borderRadius: '50%' }} />}
                </div>
              );
            }))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            {over && <p style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 18 }}>{over}</p>}
            {g.isDraw() && !over && <p style={{ color: '#f59e0b', fontWeight: 'bold' }}>🤝 Ничья</p>}
            <button onClick={reset} style={{ marginTop: 8, padding: '8px 16px', background: '#3b82f6', color: '#fff', borderRadius: 6 }}>🔄 Новая игра</button>
          </div>
        </section>

        <footer style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #374151', textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
          <p>Сеть: {CHAIN_NAME} (ID: {CHAIN_ID})</p>
        </footer>
      </div>
      {showCreate && <CreateGameModal onClose={() => setShowCreate(false)} boardTheme={boardTheme} setBoardTheme={setBoardTheme} />}
      <ChatBox playerId={address || 'guest'} />
    </main>
  );
}

// 🔹 Модальное окно создания игры
function CreateGameModal({ onClose, boardTheme, setBoardTheme }: { onClose: () => void; boardTheme: string; setBoardTheme: (t: string) => void }) {
  const [time, setTime] = useState(900);
  const [stake, setStake] = useState(50000);
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: '#1f2937', borderRadius: 16, padding: 24, maxWidth: 480, width: '100%' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginBottom: 16, color: '#fff' }}>🎮 Создать игру</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ color: '#9ca3af', fontSize: 13 }}>⏱️ Время</label>
            <select value={time} onChange={e => setTime(Number(e.target.value))} style={{ width: '100%', padding: 10, background: '#374151', color: '#fff', border: '1px solid #4b5563', borderRadius: 8 }}>
              {TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: '#9ca3af', fontSize: 13 }}>💰 Ставка</label>
            <select value={stake} onChange={e => setStake(Number(e.target.value))} style={{ width: '100%', padding: 10, background: '#374151', color: '#fff', border: '1px solid #4b5563', borderRadius: 8 }}>
              {STAKE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: '#9ca3af', fontSize: 13 }}>🎨 Тема доски</label>
            <BoardSelector value={boardTheme} onChange={setBoardTheme} />
          </div>
          <button onClick={onClose} style={{ padding: 14, background: '#10b981', color: '#fff', borderRadius: 10, fontWeight: 600 }}>▶️ Создать</button>
          <button onClick={onClose} style={{ padding: 12, background: '#6b7280', color: '#fff', borderRadius: 8, fontWeight: 600 }}>Отмена</button>
        </div>
      </div>
    </div>
  );
}

// 🔹 Root компонент с провайдерами
export default function Page() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ChessApp />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
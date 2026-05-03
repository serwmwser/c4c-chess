// apps/web/src/app/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { walletConnect, metaMask } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAccount, useConnect, useDisconnect, useConnectors, useBalance } from 'wagmi';
import { Chess, type Square, type Piece } from 'chess.js';
import {
  C4C_TOKEN_ADDRESS, GAME_CONTRACT_ADDRESS, CHAIN_ID, CHAIN_NAME, RPC_URL,
  APP_NAME, APP_DESCRIPTION, WALLETCONNECT_PROJECT_ID, C4C_BUY_URL, HOW_TO_PLAY,
  TIME_OPTIONS, STAKE_OPTIONS, BOARD_THEMES, PROFILE_THEMES, LANGUAGES,
  formatTime, formatC4C, getBotMove,
  type BoardThemeId, type ProfileThemeId, type LanguageCode, type PlayerProfile, type Game, type Friend, type GameInvite
} from '@/lib/config';

// 🔹 Wagmi config — ИСПРАВЛЕНО: metadata: и dappMetadata: с двоеточиями!
const wagmiConfig = createConfig({
  chains: [bsc],
  connectors: [
    metaMask({ 
      dappMetadata: { 
        name: APP_NAME, 
        url: typeof window !== 'undefined' ? window.location.origin : 'https://c4c-chess.vercel.app' 
      } 
    }),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      showQrModal: true,
      metadata: {
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

// 🔹 Вспомогательные компоненты
function ChatBox({ playerId }: { playerId: string }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{id:string;text:string;sender:string}[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);
  const send = () => { if (!input.trim()) return; setMsgs(p => [...p, { id: `${Date.now()}`, text: input, sender: playerId }]); setInput(''); };

  if (!open) return <button onClick={() => setOpen(true)} style={{ position: 'fixed', bottom: 20, right: 20, padding: '12px 20px', background: '#3b82f6', color: '#fff', borderRadius: 10, fontWeight: 600 }}>💬 Чат</button>;

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, width: 320, height: 400, background: 'var(--card)', borderRadius: 16, display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
      <div style={{ padding: 12, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600 }}>💬 Чат</span>
        <button onClick={() => setOpen(false)} style={{ background: 'none', color: '#9ca3af', padding: 0 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {msgs.map(m => <div key={m.id} style={{ marginBottom: 8, padding: '8px 12px', background: m.sender === playerId ? '#3b82f6' : 'var(--border)', borderRadius: 8, fontSize: 13 }}>{m.text}</div>)}
        <div ref={endRef} />
      </div>
      <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Сообщение..." style={{ flex: 1 }} />
        <button onClick={send} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', borderRadius: 6 }}>➤</button>
      </div>
    </div>
  );
}

function ThemeSelector({ value, onChange }: { value: ProfileThemeId; onChange: (t: ProfileThemeId) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {Object.entries(PROFILE_THEMES).map(([id, t]: any) => (
        <button key={id} onClick={() => onChange(id as ProfileThemeId)} title={t.name} style={{ padding: 12, background: t.bg, color: t.text, border: value === id ? `2px solid ${t.accent}` : '2px solid var(--border)', borderRadius: 8, cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ width: 20, height: 20, background: t.accent, borderRadius: '50%', margin: '0 auto 4px' }} />
          <span style={{ fontSize: 11 }}>{t.name}</span>
        </button>
      ))}
    </div>
  );
}

function BoardSelector({ value, onChange }: { value: BoardThemeId; onChange: (t: BoardThemeId) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {Object.entries(BOARD_THEMES).map(([id, t]: any) => (
        <button key={id} onClick={() => onChange(id as BoardThemeId)} title={t.name} style={{ width: 40, height: 40, background: `linear-gradient(135deg, ${t.light} 50%, ${t.dark} 50%)`, border: value === id ? '3px solid var(--accent)' : '2px solid var(--border)', borderRadius: 8, cursor: 'pointer' }} />
      ))}
    </div>
  );
}

function LanguageSelector({ value, onChange }: { value: LanguageCode; onChange: (l: LanguageCode) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as LanguageCode)} style={{ padding: 8, background: 'var(--border)', color: 'var(--text)', border: '1px solid #4b5563', borderRadius: 8 }}>
      {Object.entries(LANGUAGES).map(([c, l]: any) => <option key={c} value={c}>{l.flag} {l.name}</option>)}
    </select>
  );
}

// 🔹 Основной компонент
function ChessApp() {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const connectors = useConnectors();
  
  const [showModal, setShowModal] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLobby, setShowLobby] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  
  const [isClient, setIsClient] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const [profile, setProfile] = useState<PlayerProfile>({
    id: '', name: '', theme: 'default', language: 'ru', boardTheme: 'classic'
  });
  
  const [fen, setFen] = useState<string>(() => new Chess().fen());
  const [selected, setSelected] = useState<Square | null>(null);
  const [possible, setPossible] = useState<Square[]>([]);
  const [mode, setMode] = useState<'bot'|'pvp'>('bot');
  const [timeCtrl, setTimeCtrl] = useState(900);
  const [stake, setStake] = useState(50000);
  const [wTime, setWTime] = useState(900);
  const [bTime, setBTime] = useState(900);
  const [over, setOver] = useState<string | null>(null);
  const [boardTheme, setBoardTheme] = useState<BoardThemeId>('classic');
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  
  // 🔥 Баланс: ПРЯМОЙ ДОСТУП К .data (БЕЗ АЛИАСОВ!)
  const balanceResult = useBalance({
    address: address,
    token: C4C_TOKEN_ADDRESS as `0x${string}`,
    query: { enabled: !!address && !!chain?.id && chain.id === CHAIN_ID },
  });
  const balance = balanceResult.data;
  const balanceStatus = balanceResult.status;

  useEffect(() => { 
    setIsClient(true);
    if (address) setProfile(p => ({ ...p, id: address, name: p.name || `Player ${address.slice(2,8)}` }));
  }, [address]);

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

  useEffect(() => {
    if (profile.theme && isClient) {
      document.documentElement.setAttribute('data-theme', profile.theme);
    }
  }, [profile.theme, isClient]);

  const handleConnect = async (connector: any) => {
    if (isPending || isConnecting) return;
    setIsConnecting(true);
    try { await connect({ connector }); setShowModal(false); }
    catch (e) { console.error('Connect error:', e); }
    finally { setIsConnecting(false); }
  };

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
  
  const getSym = (p: Piece | null | undefined) => {
    if (!p) return '';
    const symbols: Record<string, Record<'w'|'b', string>> = {
      p: { w: '♙', b: '♟' }, n: { w: '♘', b: '♞' }, b: { w: '♗', b: '♝' },
      r: { w: '♖', b: '♜' }, q: { w: '♕', b: '♛' }, k: { w: '♔', b: '♚' }
    };
    return symbols[p.type]?.[p.color] || '';
  };
  
  const getPieceColor = (p: Piece | null | undefined) => {
    if (!p) return '#fff';
    return p.color === 'w' ? '#111827' : '#ffffff';
  };

  const updateProfile = (updates: Partial<PlayerProfile>) => {
    setProfile(p => ({ ...p, ...updates }));
  };

  const createGame = () => {
    const newGame: Game = {
      id: `game_${Date.now()}`,
      creatorId: address || '',
      whitePlayer: address || undefined,
      timeControl: timeCtrl,
      stake,
      boardTheme,
      status: 'waiting',
      createdAt: Date.now()
    };
    setGames(prev => [...prev, newGame]);
    setShowCreate(false);
  };

  const joinGame = (gameId: string) => {
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, blackPlayer: address || undefined, status: 'active' } : g));
    setShowLobby(false);
  };

  if (!isClient) return <main className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}><p>⏳ Загрузка...</p></main>;

  if (!isConnected) {
    return (
      <main className="flex flex-col items-center justify-center" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: 20, textAlign: 'center' }}>
        <h1 className="text-2xl font-bold" style={{ fontSize: 36, marginBottom: 16 }}>♟️ {APP_NAME}</h1>
        <p className="text-gray" style={{ marginBottom: 20, maxWidth: 450 }}>{APP_DESCRIPTION}</p>
        
        <div className="card mb-4" style={{ maxWidth: 500, textAlign: 'left', fontSize: 13, lineHeight: 1.6 }}>
          <h4 className="font-bold mb-2" style={{ color: 'var(--accent)' }}>🎮 Как играть:</h4>
          <ol style={{ paddingLeft: 20, marginBottom: 12 }}>
            <li>Подключите кошелёк (MetaMask или WalletConnect)</li>
            <li>Создайте игру или присоединитесь в лобби</li>
            <li>Выберите время и ставку (50к–1М C4C)</li>
            <li>Играйте! Бот ходит через 4 секунды</li>
          </ol>
          <h4 className="font-bold mb-2" style={{ color: 'var(--success)' }}>💰 Как получить выигрыш:</h4>
          <ul style={{ paddingLeft: 20 }}>
            <li>Победитель получает 2× ставку</li>
            <li>Выигрыш зачисляется на кошелёк автоматически</li>
            <li>Проверьте баланс в профиле после игры</li>
          </ul>
        </div>
        
        <button onClick={() => setShowModal(true)} disabled={isPending || isConnecting} style={{ padding: '16px 40px', background: (isPending||isConnecting)?'#6b7280':'var(--accent)', borderRadius: 12, fontSize: 20 }}>
          {(isPending||isConnecting)?'⏳ Подключение...':'🔗 Войти в приложение'}
        </button>
        
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
            <div className="card" style={{ maxWidth: 400, width: '100%' }} onClick={e => e.stopPropagation()}>
              <h3 className="text-center font-bold mb-4">Выберите кошелёк</h3>
              <button onClick={() => { 
                const mm = connectors.find((c:any) => c.type === 'metaMask' || c.id === 'io.metamask' || c.name?.toLowerCase().includes('meta')); 
                if(mm) handleConnect(mm); 
              }} disabled={isPending||isConnecting} className="w-full mb-2" style={{ background: '#f59e0b' }}>
                🦊 MetaMask
              </button>
              <button onClick={() => { 
                const wc = connectors.find((c:any) => c.type === 'walletConnect'); 
                if(wc) handleConnect(wc); 
              }} disabled={isPending||isConnecting||WALLETCONNECT_PROJECT_ID==='demo'} className="w-full mb-2" style={{ background: (WALLETCONNECT_PROJECT_ID!=='demo')?'#3b82f6':'#6b7280' }}>
                📱 WalletConnect QR
              </button>
              {WALLETCONNECT_PROJECT_ID==='demo' && <p className="text-warning text-xs text-center mt-2">⚠️ QR не работает с ключом 'demo'</p>}
              <button onClick={() => setShowModal(false)} className="w-full mt-4" style={{ background: 'var(--border)' }}>Закрыть</button>
            </div>
          </div>
        )}
        <ChatBox playerId={address || 'guest'} />
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: 20 }}>
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-5" style={{ paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <h1 className="text-xl font-bold">♟️ {APP_NAME}</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowProfile(true)} style={{ background: 'var(--border)' }}>👤 Профиль</button>
            <button onClick={() => disconnect()} style={{ background: 'var(--error)' }}>Выйти</button>
          </div>
        </header>

        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setShowCreate(true)} className="flex-1">🎮 Создать игру</button>
          <button onClick={() => setShowLobby(true)} className="flex-1">🎲 Лобби</button>
          <button onClick={() => setShowFriends(true)} className="flex-1">👥 Друзья</button>
        </div>

        <section className="card mb-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray">Адрес кошелька</p>
              <p className="font-mono text-sm text-success" style={{ wordBreak: 'break-all' }}>{address}</p>
              
              <a 
                href={C4C_BUY_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '10px 20px', 
                  background: 'linear-gradient(135deg, #ec4899, #db2777)', 
                  color: 'white', 
                  textDecoration: 'none', 
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                <span>🛒</span> Купить C4C Tokens на Pink.Meme
              </a>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray">Баланс {APP_NAME}</p>
              <p className="text-2xl font-bold text-accent">
                {balanceStatus === 'pending' && '⏳'}
                {balanceStatus === 'error' && '❌'}
                {balanceStatus === 'success' && balance?.formatted ? `${formatC4C(parseFloat(balance.formatted))} C4C` : '0.00 C4C'}
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4" style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: 13, lineHeight: 1.6 }}>
            <h4 className="font-bold mb-2" style={{ color: 'var(--accent)' }}>🎮 Как создать игру:</h4>
            <ol style={{ paddingLeft: 20, marginBottom: 12 }}>
              <li>Нажмите "🎮 Создать игру"</li>
              <li>Выберите время партии (5м/15м/30м/1ч/24ч)</li>
              <li>Укажите ставку (50 000 – 1 000 000 C4C)</li>
              <li>Выберите тему доски и язык</li>
              <li>Пригласите друга или играйте с ботом</li>
            </ol>
            <h4 className="font-bold mb-2" style={{ color: 'var(--success)' }}>💰 Как получить выигрыш:</h4>
            <ul style={{ paddingLeft: 20 }}>
              <li>Победитель получает <strong>2× ставку</strong> (минус комиссия)</li>
              <li>Выигрыш <strong>автоматически</strong> зачисляется на ваш кошелёк</li>
              <li>Проверьте баланс в профиле после завершения игры</li>
              <li>История игр и статистика — в разделе "🎲 Лобби"</li>
            </ul>
          </div>
        </section>

        <section className="card">
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <h3 className="text-lg font-bold">♟️ Доска</h3>
            <div className="flex gap-2">
              <select value={mode} onChange={e => { setMode(e.target.value as any); reset(); }} style={{ padding: 6 }}>
                <option value="bot">🤖 Бот</option><option value="pvp">👥 PvP</option>
              </select>
              <select value={timeCtrl} onChange={e => { setTimeCtrl(Number(e.target.value)); reset(); }} style={{ padding: 6 }}>
                {TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={stake} onChange={e => setStake(Number(e.target.value))} style={{ padding: 6 }}>
                {STAKE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex justify-between mb-3 p-2" style={{ background: 'var(--card)', borderRadius: 8 }}>
            <div>
              <span className="text-xs text-gray">⚪ Белые</span>
              <p className="text-lg font-bold" style={{ color: isW && !over ? 'var(--warning)' : 'var(--success)' }}>{formatTime(wTime)}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray">⚫ Чёрные</span>
              <p className="text-lg font-bold" style={{ color: !isW && !over ? 'var(--warning)' : 'var(--success)' }}>{formatTime(bTime)}</p>
            </div>
          </div>
          
          <div className="mx-auto mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2, background: 'var(--border)', borderRadius: 8, maxWidth: 320 }}>
            {['8','7','6','5','4','3','2','1'].map((r, ri) => ['a','b','c','d','e','f','g','h'].map((f, fi) => {
              const sq = `${f}${r}` as Square; 
              const p = g.get(sq);
              const theme = BOARD_THEMES[boardTheme];
              const bg = (fi+ri)%2===0 ? theme.light : theme.dark;
              return (
                <div key={sq} onClick={() => click(sq)} style={{ aspectRatio: 1, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: p?'pointer':'default', fontSize: 24, color: getPieceColor(p), position: 'relative', border: selected===sq?'3px solid var(--accent)':'none' }}>
                  {getSym(p)}
                  {possible.includes(sq) && !p && <div style={{ position: 'absolute', width: 20, height: 20, background: 'rgba(59,130,246,0.5)', borderRadius: '50%' }} />}
                </div>
              );
            }))}
          </div>
          
          <div className="text-center">
            {over && <p className="text-error font-bold text-lg">{over}</p>}
            {g.isDraw() && !over && <p className="text-warning font-bold">🤝 Ничья</p>}
            <button onClick={reset} className="mt-2" style={{ background: '#3b82f6' }}>🔄 Новая игра</button>
          </div>
        </section>

        <footer className="text-center text-xs text-gray mt-12" style={{ paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <p>Сеть: {CHAIN_NAME} (ID: {CHAIN_ID})</p>
          <p className="mt-1">
            <a href={C4C_BUY_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              🛒 Купить C4C на Pink.Meme
            </a>
          </p>
        </footer>
      </div>

      {showCreate && <CreateGameModal onClose={() => setShowCreate(false)} boardTheme={boardTheme} setBoardTheme={setBoardTheme} timeCtrl={timeCtrl} setTimeCtrl={setTimeCtrl} stake={stake} setStake={setStake} onCreate={createGame} />}
      {showLobby && <GameLobby games={games} onJoin={joinGame} onClose={() => setShowLobby(false)} />}
      {showFriends && <FriendsList friends={friends} onClose={() => setShowFriends(false)} />}
      {showProfile && <ProfileModal profile={profile} onUpdate={updateProfile} onClose={() => setShowProfile(false)} />}
      
      <ChatBox playerId={address || 'guest'} />
    </main>
  );
}

function CreateGameModal({ onClose, boardTheme, setBoardTheme, timeCtrl, setTimeCtrl, stake, setStake, onCreate }: any) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div className="card" style={{ maxWidth: 480, width: '100%' }} onClick={e => e.stopPropagation()}>
        <h3 className="font-bold mb-4">🎮 Создать игру</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray block mb-1">⏱️ Время</label>
            <select value={timeCtrl} onChange={(e:any) => setTimeCtrl(Number(e.target.value))}>
              {TIME_OPTIONS.map((o:any) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray block mb-1">💰 Ставка</label>
            <select value={stake} onChange={(e:any) => setStake(Number(e.target.value))}>
              {STAKE_OPTIONS.map((o:any) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray block mb-1">🎨 Тема доски</label>
            <BoardSelector value={boardTheme} onChange={setBoardTheme} />
          </div>
          <div>
            <label className="text-sm text-gray block mb-1">🌐 Язык</label>
            <LanguageSelector value="ru" onChange={() => {}} />
          </div>
          <button onClick={onCreate} className="w-full" style={{ background: 'var(--success)' }}>▶️ Создать игру</button>
          <button onClick={onClose} className="w-full mt-2" style={{ background: 'var(--border)' }}>Отмена</button>
        </div>
      </div>
    </div>
  );
}

function GameLobby({ games, onJoin, onClose }: { games: Game[]; onJoin: (id:string)=>void; onClose: ()=>void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div className="card" style={{ maxWidth: 480, width: '100%' }} onClick={e => e.stopPropagation()}>
        <h3 className="font-bold mb-4">🎲 Доступные игры</h3>
        {games.filter((g:Game) => g.status === 'waiting').length === 0 ? (
          <p className="text-center text-gray">Нет игр. Создайте свою!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {games.filter((g:Game) => g.status === 'waiting').map((game:Game) => (
              <div key={game.id} className="flex justify-between items-center p-3" style={{ background: 'var(--card)', borderRadius: 8 }}>
                <div>
                  <p className="font-bold">#{game.id.slice(-6)}</p>
                  <p className="text-sm text-gray">⏱️ {formatTime(game.timeControl)} • 💰 {formatC4C(game.stake)}</p>
                </div>
                <button onClick={() => onJoin(game.id)} style={{ background: '#3b82f6', padding: '8px 16px' }}>▶️</button>
              </div>
            ))}
          </div>
        )}
        <button onClick={onClose} className="w-full mt-4" style={{ background: 'var(--border)' }}>Закрыть</button>
      </div>
    </div>
  );
}

function FriendsList({ friends, onClose }: { friends: Friend[]; onClose: ()=>void }) {
  const [newFriend, setNewFriend] = useState('');
  
  const addFriend = () => {
    if (!newFriend.trim()) return;
    setFriends(prev => [...prev, { id: `friend_${Date.now()}`, playerId: newFriend, name: `Friend ${newFriend.slice(2,6)}`, status: 'online' }]);
    setNewFriend('');
  };
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div className="card" style={{ maxWidth: 480, width: '100%' }} onClick={e => e.stopPropagation()}>
        <h3 className="font-bold mb-4">👥 Друзья</h3>
        <div className="flex gap-2 mb-4">
          <input value={newFriend} onChange={(e:any) => setNewFriend(e.target.value)} placeholder="Адрес или ID друга" />
          <button onClick={addFriend} style={{ background: '#3b82f6', padding: '10px' }}>➕</button>
        </div>
        {friends.length === 0 ? (
          <p className="text-center text-gray">Пока нет друзей</p>
        ) : (
          <div className="flex flex-col gap-2">
            {friends.map((f:Friend) => (
              <div key={f.id} className="flex justify-between items-center p-3" style={{ background: 'var(--card)', borderRadius: 8 }}>
                <div className="flex items-center gap-2">
                  {f.avatar && <img src={f.avatar} style={{ width: 32, height: 32, borderRadius: '50%' }} />}
                  <div>
                    <p className="font-bold">{f.name}</p>
                    <p className="text-xs" style={{ color: f.status === 'online' ? 'var(--success)' : 'var(--gray)' }}>● {f.status}</p>
                  </div>
                </div>
                <button style={{ background: '#10b981', padding: '6px 12px', fontSize: 12 }}>🎮 Пригласить</button>
              </div>
            ))}
          </div>
        )}
        <button onClick={onClose} className="w-full mt-4" style={{ background: 'var(--border)' }}>Закрыть</button>
      </div>
    </div>
  );
}

function ProfileModal({ profile, onUpdate, onClose }: { profile: PlayerProfile; onUpdate: (u:Partial<PlayerProfile>)=>void; onClose: ()=>void }) {
  const [name, setName] = useState(profile.name);
  const [desc, setDesc] = useState(profile.description || '');
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const [link1Name, setLink1Name] = useState(profile.links?.[0]?.[0] || '');
  const [link1Url, setLink1Url] = useState(profile.links?.[0]?.[1] || '');
  const [link2Name, setLink2Name] = useState(profile.links?.[1]?.[0] || '');
  const [link2Url, setLink2Url] = useState(profile.links?.[1]?.[1] || '');
  
  const save = () => {
    const links: [string,string][] = [];
    if (link1Name && link1Url) links.push([link1Name, link1Url]);
    if (link2Name && link2Url) links.push([link2Name, link2Url]);
    onUpdate({ name, description: desc.slice(0,500), avatar, links: links.length ? links : undefined });
    onClose();
  };
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div className="card" style={{ maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <h3 className="font-bold mb-4">✏️ Редактировать профиль</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray block mb-1">🖼️ Аватар (URL)</label>
            <input value={avatar} onChange={(e:any) => setAvatar(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="text-sm text-gray block mb-1">👤 Имя</label>
            <input value={name} onChange={(e:any) => setName(e.target.value)} placeholder="Ваше имя" maxLength={30} />
          </div>
          <div>
            <label className="text-sm text-gray block mb-1">📝 Описание (до 500 символов)</label>
            <textarea value={desc} onChange={(e:any) => setDesc(e.target.value)} placeholder="Расскажите о себе..." maxLength={500} rows={3} />
            <p className="text-xs text-gray text-right">{desc.length}/500</p>
          </div>
          <div>
            <label className="text-sm text-gray block mb-1">🔗 Социальные ссылки</label>
            <div className="flex flex-col gap-2">
              <input value={link1Name} onChange={(e:any) => setLink1Name(e.target.value)} placeholder="Название (Twitter, Discord...)" />
              <input value={link1Url} onChange={(e:any) => setLink1Url(e.target.value)} placeholder="https://..." />
              <input value={link2Name} onChange={(e:any) => setLink2Name(e.target.value)} placeholder="Название (второе)" />
              <input value={link2Url} onChange={(e:any) => setLink2Url(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray block mb-2">🎨 Тема профиля</label>
            <ThemeSelector value={profile.theme} onChange={(t:ProfileThemeId) => onUpdate({ theme: t })} />
          </div>
          <div>
            <label className="text-sm text-gray block mb-2">🎨 Тема доски</label>
            <BoardSelector value={profile.boardTheme} onChange={(t:BoardThemeId) => onUpdate({ boardTheme: t })} />
          </div>
          <div>
            <label className="text-sm text-gray block mb-2">🌐 Язык</label>
            <LanguageSelector value={profile.language} onChange={(l:LanguageCode) => onUpdate({ language: l })} />
          </div>
          <button onClick={save} className="w-full" style={{ background: 'var(--success)' }}>💾 Сохранить</button>
          <button onClick={onClose} className="w-full mt-2" style={{ background: 'var(--border)' }}>Закрыть</button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ChessApp />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
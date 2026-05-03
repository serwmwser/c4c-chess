'use client';
import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useConnectors, useBalance } from 'wagmi';
import { Chess } from 'chess.js';
import {
  C4C_TOKEN_ADDRESS, CHAIN_ID, APP_NAME, APP_DESCRIPTION, WALLETCONNECT_PROJECT_ID, C4C_BUY_URL,
  TIME_OPTIONS, STAKE_OPTIONS, BOARD_THEMES, PROFILE_THEMES, LANGUAGES,
  formatTime, formatC4C, getBotMove, getBoardThemeForProfile, PIECE_SYMBOLS,
  resetConnectionStates, saveProfileToStorage, loadProfileFromStorage
} from '@/lib/config';

const getPieceColor = (c: string) => c === 'white' ? '#fff' : '#111';
const getPieceSymbol = (p: any) => (!p || !p.type || !p.color) ? '' : (PIECE_SYMBOLS as any)[p.type]?.[p.color] || '';

function ChatBox({ playerId }: { playerId: string }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [input, setInput] = useState('');
  if (!open) return <button onClick={() => setOpen(true)} style={{ position: 'fixed', bottom: 20, right: 20, padding: '12px 20px', background: '#3b82f6', color: '#fff', borderRadius: 10 }}>💬 Чат</button>;
  return (<div style={{ position: 'fixed', bottom: 20, right: 20, width: 320, height: 400, background: 'var(--card)', borderRadius: 16, padding: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>💬 Чат</span><button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af' }}>×</button></div>
    <div style={{ flex: 1, overflowY: 'auto', marginBottom: 8 }}>{msgs.map(m => <div key={m.id} style={{ padding: '8px', background: m.sender === playerId ? '#3b82f6' : 'var(--border)', borderRadius: 6, marginBottom: 4, fontSize: 13 }}>{m.text}</div>)}</div>
    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && setMsgs(p => [...p, { id: Date.now().toString(), text: input, sender: playerId }]) && setInput('')} placeholder="Сообщение..." style={{ width: '100%', padding: 8, borderRadius: 6 }} />
  </div>);
}

function ThemeSelector({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  return (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>{Object.entries(PROFILE_THEMES as any).map(([id, t]: any) => <button key={id} onClick={() => onChange(id)} title={t.name} style={{ padding: 12, background: t.bg, color: t.text, border: value === id ? `2px solid ${t.accent}` : '2px solid var(--border)', borderRadius: 8 }}><span style={{ fontSize: 11 }}>{t.name}</span></button>)}</div>);
}
function BoardSelector({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  return (<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{Object.entries(BOARD_THEMES as any).map(([id, t]: any) => <button key={id} onClick={() => onChange(id)} title={t.name} style={{ width: 40, height: 40, background: `linear-gradient(135deg, ${t.light} 50%, ${t.dark} 50%)`, border: value === id ? '3px solid var(--accent)' : '2px solid var(--border)', borderRadius: 8 }} />)}</div>);
}
function LanguageSelector({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  return (<select value={value} onChange={e => onChange(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>{Object.entries(LANGUAGES as any).map(([c, l]: any) => <option key={c} value={c}>{l.flag} {l.name}</option>)}</select>);
}

export default function ChessApp() {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const connectors = useConnectors();

  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [profile, setProfile] = useState<any>({ id: '', name: '', theme: 'default', language: 'ru', boardTheme: 'classic', description: '', avatar: '', links: [] });
  const [fen, setFen] = useState(() => new Chess().fen());
  const [selected, setSelected] = useState<string | null>(null);
  const [possible, setPossible] = useState<string[]>([]);
  const [mode, setMode] = useState('bot');
  const [timeCtrl, setTimeCtrl] = useState(900);
  const [stake, setStake] = useState(50000);
  const [wTime, setWTime] = useState(900);
  const [bTime, setBTime] = useState(900);
  const [over, setOver] = useState<string | null>(null);
  const [boardTheme, setBoardTheme] = useState('classic');

  const balanceResult = useBalance({ address, token: C4C_TOKEN_ADDRESS as `0x${string}`, query: { enabled: !!address && !!chain?.id && chain.id === CHAIN_ID } });
  const balance = balanceResult.data;
  const balanceStatus = balanceResult.status;

  useEffect(() => {
    setIsClient(true);
    const saved = loadProfileFromStorage();
    if (saved && address) { setProfile({ ...saved, id: address }); setBoardTheme(getBoardThemeForProfile(saved.theme)); }
    else if (address) setProfile((p: any) => ({ ...p, id: address, name: p.name || `Player ${address.slice(2, 8)}` }));
  }, [address]);

  useEffect(() => { setWTime(timeCtrl); setBTime(timeCtrl); setOver(null); }, [timeCtrl]);
  useEffect(() => {
    if (over) return;
    const g = new Chess(fen); const isW = g.turn() === 'w';
    if ((isW ? wTime : bTime) <= 0) { setOver(isW ? '⚪ Время вышло!' : '⚫ Время вышло!'); return; }
    const t = setInterval(() => { isW ? setWTime(p => Math.max(0, p - 1)) : setBTime(p => Math.max(0, p - 1)); }, 1000);
    return () => clearInterval(t);
  }, [fen, wTime, bTime, over]);

  useEffect(() => {
    if (mode === 'bot' && !over) {
      const g = new Chess(fen);
      if (g.turn() === 'b' && !g.isGameOver()) {
        const t = setTimeout(() => {
          const moves = g.moves({ verbose: true });
          const mv = getBotMove(moves);
          if (mv) { g.move(mv); setFen(g.fen()); setBTime(p => Math.max(0, p - 4)); if (g.isCheckmate()) setOver('⚫ Бот победил!'); }
        }, 4000);
        return () => clearTimeout(t);
      }
    }
  }, [fen, mode, over]);

  useEffect(() => {
    if (profile.theme && isClient) document.documentElement.setAttribute('data-theme', profile.theme);
  }, [profile.theme, isClient]);

  const updateProfile = (updates: any) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    saveProfileToStorage(newProfile);
    if (updates.theme) setBoardTheme(getBoardThemeForProfile(updates.theme));
  };

  const handleConnect = async (connector: any) => {
    try { await connect({ connector }); setShowModal(false); }
    catch (e) { console.error('Connect error:', e); resetConnectionStates(); alert('❌ Ошибка подключения. Попробуйте снова.'); }
  };

  const click = (sq: string) => {
    if (over) return;
    if (selected === sq) { setSelected(null); setPossible([]); return; }
    const g = new Chess(fen);
    if (selected) {
      try {
        const m = g.move({ from: selected as any, to: sq as any, promotion: 'q' });
        if (m) { setFen(g.fen()); setSelected(null); setPossible([]); if (mode === 'bot') setWTime(p => Math.max(0, p - 1)); if (g.isCheckmate()) setOver('⚪ Вы победили!'); return; }
      } catch {}
    }
    const piece = g.get(sq as any);
    if (piece && piece.color === g.turn() && (mode === 'pvp' || piece.color === 'w')) { 
      setSelected(sq); 
      setPossible(g.moves({ square: sq as any, verbose: true }).map((m: any) => m.to)); 
    }
    else { setSelected(null); setPossible([]); }
  };

  const reset = () => { setFen(new Chess().fen()); setSelected(null); setPossible([]); setWTime(timeCtrl); setBTime(timeCtrl); setOver(null); };
  const g = new Chess(fen);

  if (!isClient) return <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>⏳ Загрузка...</p></main>;

  if (!isConnected) return (<main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
    <h1 style={{ fontSize: 36, marginBottom: 16 }}>♟️{APP_NAME}</h1>
    <p style={{ marginBottom: 24, opacity: 0.8 }}>{APP_DESCRIPTION}</p>
    <button onClick={() => setShowModal(true)} disabled={isPending} style={{ padding: '16px 48px', background: isPending ? '#6b7280' : 'var(--accent)', borderRadius: 12, fontSize: 18, fontWeight: 600 }}>{isPending ? '⏳ Подключение...' : '🔗 Войти в приложение'}</button>
    {showModal && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
      <div style={{ background: 'var(--card)', padding: 24, borderRadius: 16, maxWidth: 360, width: '100%' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ textAlign: 'center', marginBottom: 20, fontSize: 20 }}>Выберите кошелёк</h3>
        <button onClick={() => { const mm = connectors.find((c: any) => c.type === 'metaMask' || c.id?.includes('metamask')); if (mm) handleConnect(mm); }} disabled={isPending} style={{ width: '100%', padding: 14, margin: '8px 0', background: '#f59e0b', borderRadius: 10, fontSize: 16, fontWeight: 600 }}>🦊 MetaMask (браузер)</button>
        <button onClick={() => { const wc = connectors.find((c: any) => c.type === 'walletConnect'); if (wc) handleConnect(wc); }} disabled={isPending} style={{ width: '100%', padding: 14, margin: '8px 0', background: '#3b82f6', borderRadius: 10, fontSize: 16, fontWeight: 600 }}>📱 WalletConnect (QR-код)</button>
        <button onClick={() => setShowModal(false)} style={{ width: '100%', padding: 12, marginTop: 16, background: 'var(--border)', borderRadius: 8 }}>Закрыть</button>
      </div>
    </div>}
  </main>);

  return (<main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: 20 }}>
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <h1>♟️{APP_NAME}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowProfile(true)} style={{ background: 'var(--border)', padding: '8px 16px', borderRadius: 6 }}>👤 Профиль</button>
          <button onClick={() => disconnect()} style={{ background: 'var(--error)', padding: '8px 16px', borderRadius: 6 }}>Выйти</button>
        </div>
      </header>

      <section style={{ padding: 24, background: 'var(--card)', borderRadius: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <p style={{ fontSize: 13, opacity: 0.7 }}>Адрес кошелька</p>
            <p style={{ fontFamily: 'monospace', fontSize: 14, color: '#22c55e', wordBreak: 'break-all', margin: '8px 0' }}>{address}</p>
            <p style={{ fontSize: 13, opacity: 0.7, marginTop: 16 }}>Баланс {APP_NAME}</p>
            <p style={{ fontSize: 28, fontWeight: 'bold', color: 'var(--accent)' }}>{balanceStatus === 'success' && balance ? formatC4C(balance.value) : '0.00'} C4C</p>
            <a href={C4C_BUY_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 12, padding: '10px 20px', background: 'linear-gradient(135deg,#ec4899,#db2777)', color: '#fff', textDecoration: 'none', borderRadius: 10, fontSize: 14 }}>🛒 Купить C4C на Pink.Meme</a>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 13, opacity: 0.7 }}>Тема</p>
            {/* 🔥 ИСПРАВЛЕНО: явное приведение к any для динамического доступа */}
            <p style={{ fontSize: 16, fontWeight: 600 }}>{(PROFILE_THEMES as any)[profile.theme]?.name}</p>
            <p style={{ fontSize: 13, opacity: 0.7, marginTop: 8 }}>Язык</p>
            <p style={{ fontSize: 16, fontWeight: 600 }}>{(LANGUAGES as any)[profile.language]?.flag} {(LANGUAGES as any)[profile.language]?.name}</p>
          </div>
        </div>
      </section>

      <section style={{ padding: 20, background: 'var(--card)', borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18 }}>♟️ Доска</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={mode} onChange={e => { setMode(e.target.value); reset(); }} style={{ padding: 8, borderRadius: 6 }}><option value="bot">🤖 Бот</option><option value="pvp">👥 PvP</option></select>
            <select value={timeCtrl} onChange={e => { setTimeCtrl(Number(e.target.value)); reset(); }} style={{ padding: 8, borderRadius: 6 }}>{TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
            <select value={stake} onChange={e => setStake(Number(e.target.value))} style={{ padding: 8, borderRadius: 6 }}>{STAKE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'var(--bg)', borderRadius: 8, marginBottom: 16 }}>
          <div><span style={{ fontSize: 12, opacity: 0.7 }}>⚪ Белые</span><p style={{ fontSize: 20, fontWeight: 'bold', margin: 0 }}>{formatTime(wTime)}</p></div>
          <div style={{ textAlign: 'right' }}><span style={{ fontSize: 12, opacity: 0.7 }}>⚫ Чёрные</span><p style={{ fontSize: 20, fontWeight: 'bold', margin: 0 }}>{formatTime(bTime)}</p></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 1, background: 'var(--border)', borderRadius: 8, maxWidth: 320, margin: '0 auto' }}>
          {['8', '7', '6', '5', '4', '3', '2', '1'].map((r, ri) => ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((f, fi) => {
            const sq = f + r; const p = g.get(sq as any); const theme = (BOARD_THEMES as any)[boardTheme]; const bg = (fi + ri) % 2 === 0 ? theme.light : theme.dark; const pc = p?.color === 'w' ? 'white' : 'black'; const sym = getPieceSymbol(p);
            return (<div key={sq} onClick={() => click(sq)} style={{ aspectRatio: 1, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: p ? 'pointer' : 'default', fontSize: 40, color: getPieceColor(pc), position: 'relative', border: selected === sq ? '3px solid var(--accent)' : 'none' }}>{sym}</div>);
          }))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          {over && <p style={{ color: 'var(--error)', fontWeight: 'bold', marginBottom: 8 }}>{over}</p>}
          {g.isDraw() && !over && <p style={{ color: 'var(--warning)', fontWeight: 'bold', marginBottom: 8 }}>🤝 Ничья</p>}
          <button onClick={reset} style={{ padding: '10px 24px', background: '#3b82f6', borderRadius: 8 }}>🔄 Новая игра</button>
        </div>
      </section>
    </div>

    {showProfile && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowProfile(false)}>
      <div style={{ background: 'var(--card)', padding: 24, borderRadius: 16, maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ textAlign: 'center', marginBottom: 20, fontSize: 20 }}>✏️ Редактировать профиль</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={{ fontSize: 13, opacity: 0.7 }}>👤 Имя</label><input value={profile.name} onChange={e => updateProfile({ name: e.target.value })} placeholder="Ваше имя" maxLength={30} style={{ marginTop: 4 }} /></div>
          <div><label style={{ fontSize: 13, opacity: 0.7 }}>📝 Описание (до 500 символов)</label><textarea value={profile.description || ''} onChange={e => updateProfile({ description: e.target.value.slice(0, 500) })} placeholder="Расскажите о себе..." maxLength={500} rows={3} style={{ marginTop: 4 }} /><p style={{ fontSize: 11, opacity: 0.5, textAlign: 'right' }}>{(profile.description || '').length}/500</p></div>
          <div><label style={{ fontSize: 13, opacity: 0.7 }}>🖼️ Аватар (URL)</label><input value={profile.avatar || ''} onChange={e => updateProfile({ avatar: e.target.value })} placeholder="https://..." style={{ marginTop: 4 }} /></div>
          <div><label style={{ fontSize: 13, opacity: 0.7 }}>🎨 Тема профиля</label><ThemeSelector value={profile.theme} onChange={(t) => updateProfile({ theme: t })} /></div>
          <div><label style={{ fontSize: 13, opacity: 0.7 }}>🎨 Тема доски</label><BoardSelector value={boardTheme} onChange={setBoardTheme} /></div>
          <div><label style={{ fontSize: 13, opacity: 0.7 }}>🌐 Язык</label><LanguageSelector value={profile.language} onChange={(l) => updateProfile({ language: l })} /></div>
          <button onClick={() => setShowProfile(false)} style={{ padding: '12px', background: 'var(--success)', borderRadius: 8, fontWeight: 600 }}>💾 Сохранить</button>
          <button onClick={() => setShowProfile(false)} style={{ padding: '12px', background: 'var(--border)', borderRadius: 8 }}>Закрыть</button>
        </div>
      </div>
    </div>}

    <ChatBox playerId={address || 'guest'} />
  </main>);
}

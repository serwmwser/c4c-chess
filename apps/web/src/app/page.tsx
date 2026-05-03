'use client';
import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useConnectors, useBalance } from 'wagmi';
import { Chess } from 'chess.js';
import {
  C4C_TOKEN_ADDRESS, CHAIN_ID, APP_NAME, APP_DESCRIPTION, WALLETCONNECT_PROJECT_ID, C4C_BUY_URL,
  TIME_OPTIONS, STAKE_OPTIONS, BOARD_THEMES, PROFILE_THEMES, LANGUAGES,
  formatTime, formatC4C, getBotMove, getBoardThemeForProfile, PIECE_SYMBOLS,
  resetConnectionStates, saveProfileToStorage, loadProfileFromStorage,
  getOnlineGames, createGameLobby, getFriends, addFriend, sendGameInvite, processPayout
} from '@/lib/config';

const getPieceColor = (c: string) => c === 'white' ? '#fff' : '#111';
const getPieceSymbol = (p: any) => (!p || !p.type || !p.color) ? '' : (PIECE_SYMBOLS as any)[p.type]?.[p.color] || '';

export default function ChessApp() {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const connectors = useConnectors();

  const [showModal, setShowModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [tab, setTab] = useState<'profile' | 'lobby' | 'friends'>('profile');
  
  // 🔹 Профиль
  const [profile, setProfile] = useState<any>({ id: '', name: '', theme: 'default', language: 'ru', boardTheme: 'classic', description: '', avatar: '', link1Name: '', link1Url: '', link2Name: '', link2Url: '' });
  // 🔹 Игра
  const [fen, setFen] = useState(() => new Chess().fen());
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState('bot');
  const [timeCtrl, setTimeCtrl] = useState(900);
  const [stake, setStake] = useState(50000);
  const [wTime, setWTime] = useState(900);
  const [bTime, setBTime] = useState(900);
  const [over, setOver] = useState<string | null>(null);
  const [boardTheme, setBoardTheme] = useState('classic');
  // 🔹 Лобби и Друзья
  const [games, setGames] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [newFriendAddr, setNewFriendAddr] = useState('');

  const balanceResult = useBalance({ address, token: C4C_TOKEN_ADDRESS as `0x${string}`, query: { enabled: !!address && !!chain?.id && chain.id === CHAIN_ID } });
  const balance = balanceResult.data;
  const balanceStatus = balanceResult.status;

  useEffect(() => {
    setIsClient(true);
    const saved = loadProfileFromStorage();
    if (saved && address) {
      setProfile({ ...saved, id: address });
      setBoardTheme(getBoardThemeForProfile(saved.theme));
    } else if (address) {
      setProfile((p: any) => ({ ...p, id: address, name: p.name || `Player ${address.slice(2, 8)}` }));
    }
    setGames(getOnlineGames());
    setFriends(getFriends());
  }, [address]);

  useEffect(() => { setWTime(timeCtrl); setBTime(timeCtrl); setOver(null); }, [timeCtrl]);
  useEffect(() => {
    if (over) return;
    const g = new Chess(fen); const isW = g.turn() === 'w';
    if ((isW ? wTime : bTime) <= 0) {
      setOver(isW ? '⚪ Время вышло!' : '⚫ Время вышло!');
      // 🔥 Выплата победителю
      if (isW) processPayout(address || '', stake);
    }
    const t = setInterval(() => { isW ? setWTime(p => Math.max(0, p - 1)) : setBTime(p => Math.max(0, p - 1)); }, 1000);
    return () => clearInterval(t);
  }, [fen, wTime, bTime, over, address, stake]);

  useEffect(() => {
    if (mode === 'bot' && !over) {
      const g = new Chess(fen);
      if (g.turn() === 'b' && !g.isGameOver()) {
        const t = setTimeout(() => {
          const moves = g.moves({ verbose: true }); const mv = getBotMove(moves);
          if (mv) { g.move(mv); setFen(g.fen()); setBTime(p => Math.max(0, p - 4)); if (g.isCheckmate()) { setOver('⚫ Бот победил!'); processPayout(address || '', stake); } }
        }, 4000);
        return () => clearTimeout(t);
      }
    }
  }, [fen, mode, over, address, stake]);

  useEffect(() => { if (profile.theme && isClient) document.documentElement.setAttribute('data-theme', profile.theme); }, [profile.theme, isClient]);

  const updateProfile = (updates: any) => {
    const newProfile = { ...profile, ...updates }; setProfile(newProfile); saveProfileToStorage(newProfile);
    if (updates.theme) setBoardTheme(getBoardThemeForProfile(updates.theme));
  };

  const handleConnect = async (connector: any) => {
    try { await connect({ connector }); setShowModal(false); } catch (e) { resetConnectionStates(); }
  };

  const click = (sq: string) => {
    if (over) return;
    if (selected === sq) { setSelected(null); return; }
    const g = new Chess(fen);
    if (selected) {
      try { const m = g.move({ from: selected as any, to: sq as any, promotion: 'q' });
        if (m) { setFen(g.fen()); setSelected(null); if (mode === 'bot') setWTime(p => Math.max(0, p - 1)); if (g.isCheckmate()) { setOver('⚪ Вы победили!'); processPayout(address || '', stake); } return; }
      } catch {}
    }
    const piece = g.get(sq as any);
    if (piece && piece.color === g.turn()) { setSelected(sq); } else { setSelected(null); }
  };

  const reset = () => { setFen(new Chess().fen()); setSelected(null); setWTime(timeCtrl); setBTime(timeCtrl); setOver(null); };
  const g = new Chess(fen);

  // 🔥 Создание игры + отправка другу
  const handleCreateGame = () => {
    if (!address) return;
    const newGame = createGameLobby(address, timeCtrl, stake);
    setGames(getOnlineGames());
    // Если выбран друг (в будущем можно добавить селектор), здесь демо-отправка
    if (friends.length > 0) {
      sendGameInvite({ id: `inv_${Date.now()}`, from: address, to: friends[0].address, gameId: newGame.id, status: 'pending', createdAt: Date.now() });
      alert('🎮 Игра создана! Приглашение отправлено первому другу.');
    } else {
      alert('🎮 Игра создана и доступна в лобби!');
    }
  };

  const handleAddFriend = () => {
    if (!newFriendAddr || newFriendAddr.length < 6) return;
    addFriend({ address: newFriendAddr, name: `Friend ${newFriendAddr.slice(2,6)}`, status: 'offline', addedAt: Date.now() });
    setFriends(getFriends()); setNewFriendAddr('');
  };

  if (!isClient) return <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',color:'var(--text)'}}><p>⏳ Загрузка...</p></main>;

  if (!isConnected) return (<main style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',padding:20,display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center'}}>
    <h1 style={{fontSize:36,marginBottom:16}}>♟️{APP_NAME}</h1>
    <button onClick={()=>setShowModal(true)} disabled={isPending} style={{padding:'16px 48px',background:isPending?'#6b7280':'var(--accent)',borderRadius:12,fontSize:18}}>{isPending?'⏳ Подключение...':'🔗 Войти'}</button>
    {showModal && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowModal(false)}>
      <div style={{background:'var(--card)',padding:24,borderRadius:16,maxWidth:360,width:'100%'}} onClick={e=>e.stopPropagation()}>
        <h3 style={{textAlign:'center',marginBottom:20}}>Выберите кошелёк</h3>
        {connectors.map((c: any) => <button key={c.id} onClick={()=>handleConnect(c)} disabled={isPending} style={{width:'100%',padding:14,margin:'8px 0',background:'#3b82f6',borderRadius:10}}>{c.name}</button>)}
        <button onClick={()=>setShowModal(false)} style={{width:'100%',padding:12,marginTop:16,background:'var(--border)',borderRadius:8}}>Закрыть</button>
      </div>
    </div>}
  </main>);

  return (<main style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',padding:20}}>
    <div style={{maxWidth:640,margin:'0 auto'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h1>♟️{APP_NAME}</h1>
        <button onClick={()=>disconnect()} style={{background:'var(--error)',padding:'8px 16px',borderRadius:6}}>Выйти</button>
      </header>

      {/* 🔹 Навигация */}
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {(['profile','lobby','friends'] as const).map(t => <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:10,background:tab===t?'var(--accent)':'var(--card)',borderRadius:8}}>{t==='profile'?'👤 Профиль':t==='lobby'?'🎲 Лобби':'👥 Друзья'}</button>)}
      </div>

      {/* 🔹 ПРОФИЛЬ */}
      {tab==='profile' && <div style={{background:'var(--card)',padding:24,borderRadius:16}}>
        <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:16}}>
          <div style={{width:60,height:60,borderRadius:'50%',background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>♟️</div>
          <div>
            <input value={profile.name} onChange={e=>updateProfile({name:e.target.value})} placeholder="Ваше имя" style={{padding:8,borderRadius:6,marginBottom:4,width:'100%'}}/>
            <p style={{fontSize:13,opacity:0.7}}>Баланс: <span style={{fontSize:18,fontWeight:'bold',color:'var(--accent)'}}>{formatC4C(balance?.value)} C4C</span></p>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <label style={{fontSize:13,opacity:0.7}}>📝 Описание (до 500)</label>
          <textarea value={profile.description||''} onChange={e=>updateProfile({description:e.target.value.slice(0,500)})} rows={3} style={{padding:8,borderRadius:6}}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <input value={profile.link1Name||''} onChange={e=>updateProfile({link1Name:e.target.value})} placeholder="Ссылка 1 (название)" style={{padding:8,borderRadius:6}}/>
            <input value={profile.link1Url||''} onChange={e=>updateProfile({link1Url:e.target.value})} placeholder="URL" style={{padding:8,borderRadius:6}}/>
            <input value={profile.link2Name||''} onChange={e=>updateProfile({link2Name:e.target.value})} placeholder="Ссылка 2 (название)" style={{padding:8,borderRadius:6}}/>
            <input value={profile.link2Url||''} onChange={e=>updateProfile({link2Url:e.target.value})} placeholder="URL" style={{padding:8,borderRadius:6}}/>
          </div>
          <label style={{fontSize:13,opacity:0.7}}>🎨 Тема профиля</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{Object.entries(PROFILE_THEMES as any).map(([id,t]:any)=>(<button key={id} onClick={()=>updateProfile({theme:id})} style={{width:30,height:30,borderRadius:'50%',background:t.bg,border:profile.theme===id?'3px solid #fff':'2px solid var(--border)'}} title={t.name}/>))}</div>
        </div>
        <button onClick={handleCreateGame} style={{width:'100%',padding:12,marginTop:16,background:'var(--success)',borderRadius:8,fontWeight:600}}>🎮 Создать игру со ставкой</button>
      </div>}

      {/* 🔹 ЛОББИ ИГР */}
      {tab==='lobby' && <div style={{background:'var(--card)',padding:24,borderRadius:16}}>
        <h3 style={{marginBottom:12}}>🎲 Доступные игры</h3>
        {games.filter(g=>g.status==='waiting').length===0 ? <p style={{opacity:0.7}}>Нет игр. Создайте свою в профиле.</p> : 
          games.filter(g=>g.status==='waiting').map(g=>(<div key={g.id} style={{padding:12,background:'var(--bg)',borderRadius:8,marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><p style={{fontWeight:600}}>Ставка: {formatC4C(g.stake)} C4C</p><p style={{fontSize:13,opacity:0.7}}>Время: {formatTime(g.timeControl)}</p></div>
            <button onClick={()=>{reset();setTimeCtrl(g.timeControl);setStake(g.stake);setMode('pvp');setTab('profile');alert('Подключено к игре!')}} style={{padding:'8px 16px',background:'#3b82f6',borderRadius:6}}>▶️ Играть</button>
          </div>))}
      </div>}

      {/* 🔹 ДРУЗЬЯ */}
      {tab==='friends' && <div style={{background:'var(--card)',padding:24,borderRadius:16}}>
        <h3 style={{marginBottom:12}}>👥 Друзья</h3>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <input value={newFriendAddr} onChange={e=>setNewFriendAddr(e.target.value)} placeholder="Адрес кошелька друга" style={{flex:1,padding:8,borderRadius:6}}/>
          <button onClick={handleAddFriend} style={{padding:8,borderRadius:6,background:'#3b82f6'}}>➕</button>
        </div>
        {friends.length===0 ? <p style={{opacity:0.7}}>Пока нет друзей</p> : friends.map(f=>(<div key={f.address} style={{padding:10,background:'var(--bg)',borderRadius:8,marginBottom:6,display:'flex',justifyContent:'space-between'}}>
          <span>{f.name} <span style={{fontSize:11,opacity:0.5}}>({f.status})</span></span>
          <button onClick={()=>{sendGameInvite({id:`inv_${Date.now()}`,from:address||'',to:f.address,gameId:'new',status:'pending',createdAt:Date.now()});alert(`📩 Приглашение отправлено ${f.name}`);}} style={{padding:'4px 10px',background:'var(--success)',borderRadius:4,fontSize:12}}>📩 Вызвать</button>
        </div>))}
      </div>}

      {/* 🔹 ИГРОВАЯ ДОСКА */}
      <section style={{marginTop:16,padding:20,background:'var(--card)',borderRadius:16}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
          <h3>♟️ Доска</h3>
          <div style={{display:'flex',gap:8}}>
            <select value={timeCtrl} onChange={e=>setTimeCtrl(Number(e.target.value))} style={{padding:6,borderRadius:6}}>{TIME_OPTIONS.map(o=><option key={o.value}value={o.value}>{o.label}</option>)}</select>
            <select value={stake} onChange={e=>setStake(Number(e.target.value))} style={{padding:6,borderRadius:6}}>{STAKE_OPTIONS.map(o=><option key={o.value}value={o.value}>{o.label}</option>)}</select>
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
          <p style={{fontSize:14}}>⚪ {formatTime(wTime)}</p><p style={{fontSize:14}}>⚫ {formatTime(bTime)}</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:1,background:'var(--border)',borderRadius:8,maxWidth:320,margin:'0 auto'}}>
          {['8','7','6','5','4','3','2','1'].map((r,ri)=>['a','b','c','d','e','f','g','h'].map((f,fi)=>{
            const sq=f+r; const p=g.get(sq as any); const theme=(BOARD_THEMES as any)[boardTheme]; const bg=(fi+ri)%2===0?theme.light:theme.dark;
            return(<div key={sq} onClick={()=>click(sq)} style={{aspectRatio:1,background:bg,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:38,color:getPieceColor(p?.color==='w'?'white':'black'),border:selected===sq?'3px solid var(--accent)':'none'}}>{getPieceSymbol(p)}</div>);
          }))}
        </div>
        <div style={{textAlign:'center',marginTop:12}}>
          {over && <p style={{color:'var(--error)',fontWeight:'bold'}}>{over}</p>}
          <button onClick={reset} style={{padding:'8px 16px',background:'#3b82f6',borderRadius:6,marginTop:8}}>🔄 Новая игра</button>
        </div>
      </section>
    </div>
  </main>);
}

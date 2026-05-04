'use client'
import { useState, useEffect, ChangeEvent } from 'react'
import { useAccount, useConnect, useDisconnect, useConnectors, useBalance } from 'wagmi'
import { Chess } from 'chess.js'
import {
  APP_NAME, C4C_BUY_URL, TIME_OPTIONS, STAKE_OPTIONS, UI_THEMES, UI_LANGS, UI_BOARDS, UI_TRANSLATE,
  formatTime, formatC4C, getBotMove, saveProfileToStorage, loadProfileFromStorage,
  resetConnectionStates, getFriends, addFriend, processPayout,
  FIXED_CSS, injectGlobalStyles,
  validateStake, formatPrizePool, formatClockExtended,
  useApproveC4C, useCreateTokenGame, useJoinTokenGame, useClaimWinnings, useGameBalance,
  publishGameToLobby, getLobbyGames, generateGameInvite, sendInviteToChat, canJoinGame,
  GAME_BALANCE_WINDOW_TITLE, GAME_BALANCE_JOIN_BUTTON, GAME_BALANCE_CREATE_BUTTON, GAME_BALANCE_INVITE_BUTTON,
  createGameWithStake, joinGameWithStake, useGameBalanceManager, publishGameToLobbyExtended,
  getLobbyGamesExtended, generateGameInviteExtended, sendInviteToChatExtended, canJoinGameExtended,
  initClockExtended, tickClockExtended, makeMoveExtended, checkTimeWin, processTimeWin,
  SECTIONS, YOUTUBE_URL, YOUTUBE_BUTTON_TEXT, C4C_EXCHANGE_URL, SOCIAL_SECTION_TITLE, SOCIAL_LINKS, YOUTUBE_SECTION_DESCRIPTION
} from '@/lib/config'

const PIECES: any = { p:{w:'♙',b:'♟'}, n:{w:'♘',b:'♞'}, b:{w:'♗',b:'♝'}, r:{w:'♖',b:'♜'}, q:{w:'♕',b:'♛'}, k:{w:'♔',b:'♚'} }
const getPieceSymbol = (p: any) => (!p || !p.type || !p.color) ? '' : PIECES[p.type]?.[p.color] || ''

export default function Page() {
  const { address, isConnected, chain } = useAccount()
  const { connect, isPending: walletPending } = useConnect()
  const { disconnect } = useDisconnect()
  const connectors = useConnectors()

  const [showModal, setShowModal] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState<any>({ id:'', name:'', theme:'classic', boardTheme:'blue', description:'', avatar:'', link1Name:'', link1Url:'', link2Name:'', link2Url:'', lang:'ru' })
  
  const [fen, setFen] = useState(() => new Chess().fen())
  const [selected, setSelected] = useState<string|null>(null)
  const [possibleMoves, setPossibleMoves] = useState<string[]>([])
  const [over, setOver] = useState<string|null>(null)
  
  const [timeCtrl, setTimeCtrl] = useState(900)
  const [stake, setStake] = useState(5000)
  
  const [games, setGames] = useState<any[]>([])
  const [currentGame, setCurrentGame] = useState<any>(null)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [friends, setFriends] = useState<any[]>([])
  const [newFriendAddr, setNewFriendAddr] = useState('')
  const [clock, setClock] = useState<any>(null)

  const balanceResult = useBalance({ address, token: '0xaac20575371de01b4d10c4e7566d5453d72d56e7' as `0x${string}`, query: { enabled: !!address && chain?.id === 56 } })
  const balance = balanceResult.data

  const { approve, isPending: appPending } = useApproveC4C()
  const { create: createOnChain, isPending: crePending } = useCreateTokenGame()
  const { join: joinOnChain, isPending: joinPending } = useJoinTokenGame()
  const { claim, isPending: claimPending } = useClaimWinnings()
  const { balance: onChainBalance, isLoading: balLoading } = useGameBalance(currentGame?.id || null)
  const { balance: gameBalance, updateBalance } = useGameBalanceManager(currentGame?.id || null);

  useEffect(() => { if (isClient && FIXED_CSS) injectGlobalStyles(FIXED_CSS) }, [isClient])
  useEffect(() => { setIsClient(true)
    const saved = loadProfileFromStorage()
    if (saved && address) setProfile({ ...saved, id: address })
    else if (address) setProfile((p:any) => ({ ...p, id: address, name: p.name || `Player_${address.slice(2,8)}` }))
    setGames(getLobbyGamesExtended()); setFriends(getFriends())
  }, [address])

  useEffect(() => {
    if (profile.theme && isClient) { const th = (UI_THEMES as any)[profile.theme]
      if (th) { document.documentElement.style.setProperty('--bg',th.bg); document.documentElement.style.setProperty('--text',th.text); document.documentElement.style.setProperty('--accent',th.accent); document.documentElement.style.setProperty('--card',th.card) }
    }
  }, [profile.theme,isClient])

  useEffect(() => {
    if (!clock || !clock.isRunning || clock.finished) return;
    const timer = setInterval(() => setClock((prev: any) => prev ? tickClockExtended(prev) : prev), 1000);
    return () => clearInterval(timer);
  }, [clock?.isRunning, clock?.finished]);

  useEffect(() => {
    if (clock && clock.isRunning) {
      const winner = checkTimeWin(clock);
      if (winner) {
        setOver(`⏱️ Время вышло! ${winner === 'white' ? '⚪ Белые' : '⚫ Чёрные'} победили.`);
        processTimeWin(winner, currentGame?.id || '');
        claim(currentGame?.id || '');
      }
    }
  }, [clock, currentGame, over, claim]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onloadend = () => updateProfile({ avatar: reader.result }); reader.readAsDataURL(file) }
  const updateProfile = (updates: any) => { const np = { ...profile, ...updates }; setProfile(np); saveProfileToStorage(np) }
  const handleConnect = async (connector: any) => { try { await connect({ connector }); setShowModal(false) } catch { resetConnectionStates() } }

  const handleCreateGame = async () => {
    if (!validateStake(stake)) { alert('❌ Выбери ставку из списка'); return; }
    if (!address) { alert('🔗 Подключи кошелёк'); return; }
    if (!confirm(`🎮 Создать игру?\n💰 Ставка: ${formatC4C(stake)} C4C\n🏆 Фонд: ${formatPrizePool(stake)}\n⚠️ Токены спишутся в баланс игры.`)) return;
    try {
      await approve(stake); await createOnChain(timeCtrl, stake);
      const gameData = createGameWithStake(timeCtrl, stake, address);
      publishGameToLobbyExtended({
        gameId: gameData.gameId,
        creator: address,
        stake,
        currentBalance: gameData.balance,
        timeControl: timeCtrl,
        players: [address],
        status: 'waiting'
      });
      setCurrentGame(gameData); setClock(initClockExtended(timeCtrl)); setGames(getLobbyGamesExtended());
      alert('✅ Игра создана! Токены в балансе игры.');
    } catch (e: any) { alert(`❌ Ошибка: ${e.message}`); }
  };

  const handleJoinGame = async (g: any) => {
    if (!address) return alert('🔗 Подключи кошелёк');
    if (!canJoinGameExtended(g, address)) return alert('❌ Нельзя присоединиться');
    const gameId = g.gameId || g.id;
    if (!gameId) return alert('❌ Неверный идентификатор игры');
    if (!confirm(`Присоединиться? Ставка: ${formatC4C(g.stake)} C4C`)) return;
    try { 
      await approve(g.stake); await joinOnChain(gameId); 
      joinGameWithStake(gameId, g.stake, address);
      updateBalance((g.currentBalance || 0) + g.stake);
      setGames(getLobbyGamesExtended()); alert('✅ Вы в игре!'); 
    } 
    catch (e: any) { alert(`❌ Ошибка: ${e.message}`); }
  };

  const click = (sq: string) => {
    if (over) return; 
    if (selected === sq) { setSelected(null); setPossibleMoves([]); return; }
    const g = new Chess(fen);
    if (selected) {
      try {
        const m = g.move({ from: selected as any, to: sq as any, promotion: 'q' });
        if (m) {
          setFen(g.fen()); setSelected(null); setPossibleMoves([]);
          setMoveHistory((prev: string[]) => [...prev, m.san]);
          setClock((prev: any) => prev ? makeMoveExtended(prev, g.turn() === 'w' ? 'white' : 'black') : prev);
          if (g.isCheckmate()) { setOver('⚪ Вы победили!'); processPayout(address||'',stake); }
          return;
        }
      } catch {}
    }
    const piece = g.get(sq as any);
    if (piece && piece.color === g.turn()) { setSelected(sq); setPossibleMoves(g.moves({ square: sq as any, verbose: true }).map((mv:any)=>mv.to)); } 
    else { setSelected(null); setPossibleMoves([]); }
  };

  const reset = () => { setFen(new Chess().fen()); setSelected(null); setPossibleMoves([]); setOver(null); setCurrentGame(null); setMoveHistory([]); setClock(null); }
  const chess = new Chess(fen)
  const L = profile.lang || 'ru'
  const tr = (key: string) => (UI_TRANSLATE as any)?.(L, key) || key

  if (!isClient) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',color:'var(--text)'}}>⏳ Загрузка...</div>
  if (!isConnected) return <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',padding:20,display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center'}}>
    <h1 style={{fontSize:36,marginBottom:16}}>♟️{APP_NAME}</h1>
    <button onClick={()=>setShowModal(true)} disabled={walletPending} style={{padding:'16px 48px',background:walletPending?'#6b7280':'var(--accent)',borderRadius:12,fontSize:18}}>{walletPending?'⏳...':'🔗 Войти'}</button>
    {showModal && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowModal(false)}>
      <div style={{background:'var(--card)',padding:24,borderRadius:16,maxWidth:360,width:'100%'}} onClick={(e:any)=>e.stopPropagation()}>
        <h3 style={{textAlign:'center',marginBottom:20}}>Выберите кошелёк</h3>
        {connectors.map((c:any)=><button key={c.id} onClick={()=>handleConnect(c)} disabled={walletPending} style={{width:'100%',padding:14,margin:'8px 0',background:'#3b82f6',color:'#fff',borderRadius:10}}>{c.name}</button>)}
        <button onClick={()=>setShowModal(false)} style={{width:'100%',padding:12,marginTop:16,background:'var(--border)',borderRadius:8}}>Закрыть</button>
      </div>
    </div>}
  </div>

  return <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',padding:20}}>
    <div style={{maxWidth:700,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:20}}>{profile.avatar ? <img src={profile.avatar} style={{width:32,height:32,borderRadius:'50%',border:'2px solid var(--accent)'}}/> : '♟️'}</span>
          <div>
            <div style={{fontSize:22,fontWeight:700}}>{APP_NAME}</div>
            {address && <div style={{fontSize:13,opacity:.8,marginTop:4}}>Адрес: <span style={{fontFamily:'monospace'}}>{address}</span></div>}
            {balance?.value && <div style={{fontSize:13,opacity:.8}}>Баланс C4C: <strong>{formatC4C(balance.value)} C4C</strong></div>}
          </div>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <a href={C4C_BUY_URL} target="_blank" rel="noopener noreferrer" style={{background:'#10b981',color:'#fff',padding:'8px 16px',borderRadius:6,textDecoration:'none',fontWeight:600}}>Купить C4C</a>
          <a href={C4C_EXCHANGE_URL} target="_blank" rel="noopener noreferrer" style={{background:'#2563eb',color:'#fff',padding:'8px 16px',borderRadius:6,textDecoration:'none',fontWeight:600}}>Обмен C4C</a>
          <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" style={{background:'#ff0000',color:'#fff',padding:'8px 16px',borderRadius:6,textDecoration:'none',fontWeight:600}}>{YOUTUBE_BUTTON_TEXT}</a>
          <button onClick={()=>disconnect()} style={{background:'var(--error)',padding:'8px 16px',borderRadius:6,color:'#fff'}}>Выйти</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginBottom:16}}>
        {SECTIONS.map((section:any)=><button key={section.key} onClick={()=>setTab(section.key)} style={{padding:10,background:tab===section.key?'var(--accent)':'var(--card)',borderRadius:8,color:tab===section.key?'#000':'var(--text)'}}>{section.label}</button>)}
      </div>

      {tab==='profile' && <div style={{background:'var(--card)',padding:20,borderRadius:16}}>
        <div style={{display:'flex',gap:16,alignItems:'flex-start',marginBottom:16}}>
          <label style={{width:80,height:80,borderRadius:'50%',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',overflow:'hidden',border:'3px solid var(--accent)'}}>
            {profile.avatar ? <img src={profile.avatar} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{fontSize:28}}>📷</span>}
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}}/>
          </label>
          <div style={{flex:1}}>
            <input value={profile.name} onChange={(e:any)=>updateProfile({name:e.target.value})} placeholder="Ваше имя" style={{padding:10,fontWeight:600,marginBottom:6}}/>
            <p style={{fontSize:13,opacity:.7}}>Баланс: <span style={{fontSize:18,fontWeight:'bold',color:'var(--accent)'}}>{formatC4C(balance?.value)} C4C</span></p>
            <a href={C4C_BUY_URL} target="_blank" rel="noopener noreferrer" style={{display:'inline-block',marginTop:8,padding:'8px 16px',background:'linear-gradient(135deg,#ec4899,#db2777)',color:'#fff',textDecoration:'none',borderRadius:8,fontSize:13}}>🛒 Купить C4C</a>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:4}}>
          <div><label style={{fontSize:12,opacity:.7}}>🌍 Язык</label>
            <select value={profile.lang} onChange={(e:any)=>updateProfile({lang:e.target.value})} style={{width:'100%',padding:8,marginTop:4,borderRadius:6}}>
              {Object.values(UI_LANGS).map((lang:any)=><option key={lang.name} value={lang.name}>{lang.name}</option>)}
            </select>
          </div>
          <div><label style={{fontSize:12,opacity:.7}}>🎨 Тема</label>
            <select value={profile.theme} onChange={(e:any)=>updateProfile({theme:e.target.value})} style={{width:'100%',padding:8,marginTop:4,borderRadius:6}}>
              {Object.keys(UI_THEMES).map((theme:any)=><option key={theme} value={theme}>{theme}</option>)}
            </select>
          </div>
        </div>
        <p style={{fontSize:14,marginTop:12}}>Описание профиля:</p>
        <textarea value={profile.description} onChange={(e:any)=>updateProfile({description:e.target.value})} rows={4} style={{width:'100%',padding:12,borderRadius:10,marginTop:6}} placeholder="Расскажите о себе..." />
      </div>}

      {tab==='create' && <div style={{background:'var(--card)',padding:20,borderRadius:16}}>
        <h3 style={{marginBottom:12}}>🎮 Создать игру</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
          <div><label style={{fontSize:12,opacity:.7}}>⏱️ Время</label>
            <select value={timeCtrl} onChange={(e:any)=>setTimeCtrl(Number(e.target.value))} style={{width:'100%',padding:8,marginTop:4,borderRadius:6}}>
              {TIME_OPTIONS.map((o:any)=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div><label style={{fontSize:12,opacity:.7}}>💰 Ставка</label>
            <select value={stake} onChange={(e:any)=>setStake(Number(e.target.value))} style={{width:'100%',padding:8,marginTop:4,borderRadius:6}}>
              {STAKE_OPTIONS.map((val: number)=><option key={val} value={val}>{val.toLocaleString()} C4C</option>)}
            </select>
          </div>
        </div>
        <p style={{fontSize:14,marginBottom:16}}>🏆 Призовой фонд: <span style={{color:'var(--accent)'}}>{formatPrizePool(stake)}</span></p>
        <button onClick={handleCreateGame} disabled={appPending || crePending} style={{width:'100%',padding:14,background:'var(--success)',color:'#fff',borderRadius:10,fontWeight:700}}>
          {(appPending || crePending) ? '⏳ Обработка...' : GAME_BALANCE_CREATE_BUTTON}
        </button>
      </div>}

      {tab==='youtube' && <div style={{background:'var(--card)',padding:20,borderRadius:16}}>
        <h3 style={{marginBottom:12}}>▶️ YouTube</h3>
        <p style={{marginBottom:16,opacity:.8}}>{YOUTUBE_SECTION_DESCRIPTION}</p>
        <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'12px 16px',background:'#ff0000',color:'#fff',borderRadius:10,fontWeight:700,textDecoration:'none'}}>{YOUTUBE_BUTTON_TEXT}</a>
      </div>}

      {tab==='social' && <div style={{background:'var(--card)',padding:20,borderRadius:16}}>
        <h3 style={{marginBottom:12}}>{SOCIAL_SECTION_TITLE}</h3>
        <p style={{marginBottom:16,opacity:.8}}>{YOUTUBE_SECTION_DESCRIPTION}</p>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'12px 16px',background:'#ff0000',color:'#fff',borderRadius:10,fontWeight:700,textDecoration:'none'}}>{YOUTUBE_BUTTON_TEXT}</a>
          {SOCIAL_LINKS.map((item:any)=><a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',padding:'12px 16px',background:'var(--bg)',color:'var(--text)',borderRadius:10,textDecoration:'none',border:'1px solid rgba(255,255,255,0.08)'}}>{item.name}</a>)}
        </div>
      </div>}

      {tab==='lobby' && <div style={{background:'var(--card)',padding:20,borderRadius:16}}>
        <h3 style={{marginBottom:12}}>🎲 Лобби</h3>
        {games.length===0 ? <p style={{opacity:.7}}>Нет игр</p> : games.map((g:any)=>(
          <div key={g.gameId || g.id} style={{padding:12,background:'var(--bg)',borderRadius:8,marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <p style={{fontWeight:600}}>🎮 {(g.gameId || g.id).slice(0,12)}... | 👤 {g.creator.slice(2,6)}...</p>
              <p style={{fontSize:12,opacity:.6}}>💰 Баланс: {g.currentBalance ? formatC4C(g.currentBalance) : (onChainBalance || g.balance?.toLocaleString() || '0') + ' C4C'} | ⏱️ {(g.timeControl || g.timeCtrl)/60}м</p>
            </div>
            <div style={{display:'flex',gap:6}}>
              <button onClick={()=>handleJoinGame(g)} disabled={joinPending} style={{padding:'6px 12px',background:'#3b82f6',color:'#fff',borderRadius:6}}>{joinPending?'⏳...':GAME_BALANCE_JOIN_BUTTON}</button>
              {g.creator.toLowerCase() === address?.toLowerCase() && <button onClick={()=>{
                const i = generateGameInviteExtended(g.gameId || g.id);
                if(navigator.clipboard) { navigator.clipboard.writeText(i); alert('📩 Ссылка скопирована! Отправь другу или в чат.'); }
              }} style={{padding:'6px 12px',background:'#10b981',color:'#fff',borderRadius:6}}>{GAME_BALANCE_INVITE_BUTTON}</button>}
            </div>
          </div>
        ))}
      </div>}

      {tab==='friends' && <div style={{background:'var(--card)',padding:20,borderRadius:16}}>
        <h3 style={{marginBottom:12}}>👥 Друзья</h3>
        <div style={{display:'flex',gap:8,marginBottom:12}}><input value={newFriendAddr} onChange={(e:any)=>setNewFriendAddr(e.target.value)} placeholder="Адрес"/><button onClick={()=>{if(newFriendAddr.length>3){addFriend({address:newFriendAddr,name:`Friend ${newFriendAddr.slice(2,6)}`,status:'online',addedAt:Date.now()});setFriends(getFriends());setNewFriendAddr('')}}} style={{background:'#3b82f6',color:'#fff',padding:'0 16px',borderRadius:6}}>➕</button></div>
        {friends.length===0 ? <p style={{opacity:.7}}>Нет друзей</p> : friends.map((f:any)=>(<div key={f.address} style={{padding:10,background:'var(--bg)',borderRadius:8,marginBottom:6,display:'flex',justifyContent:'space-between'}}><span>{f.name}</span><button onClick={()=>alert(`📩 ${f.name}`)} style={{background:'var(--success)',color:'#fff',padding:'4px 10px',borderRadius:4}}>📩</button></div>))}
      </div>}

      <div style={{marginTop:16,background:'var(--card)',padding:16,borderRadius:16}}>
        {currentGame && (
          <div style={{padding:12,background:'var(--bg)',borderRadius:8,marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h4 style={{margin:0}}>{GAME_BALANCE_WINDOW_TITLE}</h4>
              <p style={{fontSize:20,fontWeight:'bold',color:'var(--accent)'}}>{gameBalance ? formatC4C(gameBalance.currentBalance) : (balLoading ? '⏳' : (onChainBalance || currentGame?.balance?.toLocaleString() || '0') + ' C4C')}</p>
            </div>
            {clock && <div style={{textAlign:'right',fontSize:16,fontFamily:'monospace'}}>
              <div>⚪ Белые: {formatClockExtended(clock.whiteTime)}</div>
              <div>⚫ Чёрные: {formatClockExtended(clock.blackTime)}</div>
            </div>}
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:0,maxWidth:360,margin:'0 auto',borderRadius:8,overflow:'hidden',boxShadow:'0 4px 12px rgba(0,0,0,.4)'}}>
          {['8','7','6','5','4','3','2','1'].map((r,ri)=>['a','b','c','d','e','f','g','h'].map((f,fi)=>{
            const sq=f+r; const p=chess.get(sq as any); const boardT = (UI_BOARDS as any)[profile.boardTheme] || (UI_BOARDS as any).blue; 
            const bg=(fi+ri)%2===0 ? boardT.light : boardT.dark
            return <div key={sq} onClick={()=>click(sq)} style={{aspectRatio:1,background:bg,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative',border:selected===sq?'3px solid var(--accent)':'none'}}>
              {fi===0 && <span style={{position:'absolute',top:2,left:4,fontSize:10,fontWeight:700,color:(fi+ri)%2===0?boardT.dark:boardT.light,opacity:.7,pointerEvents:'none'}}>{r}</span>}
              {ri===7 && <span style={{position:'absolute',bottom:2,right:4,fontSize:10,fontWeight:700,color:(fi+ri)%2===0?boardT.dark:boardT.light,opacity:.7,pointerEvents:'none'}}>{f}</span>}
              {possibleMoves.includes(sq) && !p && <div style={{width:'26%',height:'26%',borderRadius:'50%',background:'rgba(0,0,0,.2)'}}/>}
              {possibleMoves.includes(sq) && p && <div style={{width:'85%',height:'85%',borderRadius:'50%',border:'4px solid rgba(0,0,0,.25)'}}/>}
              {p && <span style={{fontSize:36,lineHeight:1,userSelect:'none',textShadow:'1px 2px 3px rgba(0,0,0,.3)',color:p.color==='w'?'#fff':'#111'}}>{getPieceSymbol(p)}</span>}
            </div>
          }))}
        </div>
        {moveHistory.length > 0 && <div style={{marginTop:12,maxHeight:80,overflowY:'auto',background:'var(--bg)',padding:8,borderRadius:6,fontSize:12}}><strong>📜 Ходы:</strong> {moveHistory.join(' ')}</div>}
        <div style={{textAlign:'center',marginTop:12}}>{over && <p style={{color:'var(--error)',fontWeight:'bold',fontSize:16}}>{over}</p>}
          {claimPending ? '⏳ Выплата...' : <button onClick={reset} style={{padding:'8px 20px',background:'#3b82f6',color:'#fff',borderRadius:6}}>🔄 Новая игра</button>}
        </div>
      </div>
    </div>
  </div>
}

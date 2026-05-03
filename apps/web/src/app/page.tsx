'use client'
import { useState, useEffect, ChangeEvent } from 'react'
import { useAccount, useConnect, useDisconnect, useConnectors, useBalance } from 'wagmi'
import { Chess } from 'chess.js'
import {
  APP_NAME, C4C_TOKEN_ADDRESS, CHAIN_ID, WALLETCONNECT_PROJECT_ID, C4C_BUY_URL,
  TIME_OPTIONS, STAKE_OPTIONS, UI_THEMES, UI_LANGS, UI_BOARDS, UI_TRANSLATE,
  formatTime, formatC4C, getBotMove, saveProfileToStorage, loadProfileFromStorage,
  resetConnectionStates, getOnlineGames, getFriends, addFriend, processPayout,
  FIXED_CSS, injectGlobalStyles, 
  VALID_STAKES, VALID_TIMES, validateGameConfig, createTokenGameSession, recordGameMove, getMyActiveGames
} from '@/lib/config'
import{MIN_STAKE,validateStake,useApproveC4C,useCreateTokenGame,useJoinTokenGame,generateGameInvite,sendInviteToChat,publishGameToLobby,canJoinGame}from'@/lib/config'

const PIECES: any = { p:{w:'♙',b:'♟'}, n:{w:'♘',b:'♞'}, b:{w:'♗',b:'♝'}, r:{w:'♖',b:'♜'}, q:{w:'♕',b:'♛'}, k:{w:'♔',b:'♚'} }
const getPieceSymbol = (p: any) => (!p || !p.type || !p.color) ? '' : PIECES[p.type]?.[p.color] || ''

export default function Page() {
  const { address, isConnected, chain } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const connectors = useConnectors()

  const [showModal, setShowModal] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState<any>({ id:'', name:'', theme:'classic', boardTheme:'blue', description:'', avatar:'', link1Name:'', link1Url:'', link2Name:'', link2Url:'', lang:'ru' })
  const [fen, setFen] = useState(() => new Chess().fen())
  const [selected, setSelected] = useState<string|null>(null)
  const [possibleMoves, setPossibleMoves] = useState<string[]>([])
  const [timeCtrl, setTimeCtrl] = useState(900)
  const [stake, setStake] = useState(50000)
  const [wTime, setWTime] = useState(900)
  const [bTime, setBTime] = useState(900)
  const [over, setOver] = useState<string|null>(null)
  const [games, setGames] = useState<any[]>([])
  const [currentGame, setCurrentGame] = useState<any>(null)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [friends, setFriends] = useState<any[]>([])
  const [newFriendAddr, setNewFriendAddr] = useState('')

  const balanceResult = useBalance({ address, token: C4C_TOKEN_ADDRESS as `0x${string}`, query: { enabled: !!address && !!chain?.id && chain.id === CHAIN_ID } })
  const balance = balanceResult.data

  useEffect(() => { if (isClient && FIXED_CSS) injectGlobalStyles(FIXED_CSS) }, [isClient])
  useEffect(() => { setIsClient(true)
    const saved = loadProfileFromStorage()
    if (saved && address) setProfile({ ...saved, id: address })
    else if (address) setProfile((p:any) => ({ ...p, id: address, name: p.name || `Player_${address.slice(2,8)}` }))
    setGames(getOnlineGames()); setFriends(getFriends())
  }, [address])

  useEffect(() => { setWTime(timeCtrl); setBTime(timeCtrl); setOver(null) }, [timeCtrl])
  useEffect(() => {
    if (over) return
    const g = new Chess(fen); const isW = g.turn() === 'w'
    if ((isW ? wTime : bTime) <= 0) { setOver(isW ? '⚪ Время вышло!' : '⚫ Время вышло!'); if(isW) processPayout(address||'',stake); return }
    const t = setInterval(() => { isW ? setWTime((p:number)=>Math.max(0,p-1)) : setBTime((p:number)=>Math.max(0,p-1)) }, 1000)
    return () => clearInterval(t)
  }, [fen,wTime,bTime,over,address,stake])

  useEffect(() => {
    if (!over) { const g = new Chess(fen)
      if (g.turn() === 'b' && !g.isGameOver()) {
        const t = setTimeout(() => {
          const moves = g.moves({verbose:true}); const mv = moves.length ? moves[Math.floor(Math.random()*moves.length)] : null
          if (mv) { g.move(mv); setFen(g.fen()); setBTime((p:number)=>Math.max(0,p-4)); if(g.isCheckmate()) { setOver('⚫ Бот победил!'); processPayout(address||'',stake) } }
        }, 1500); return () => clearTimeout(t)
      }
    }
  }, [fen,over,address,stake])

  useEffect(() => {
    if (profile.theme && isClient) { 
      const th = (UI_THEMES as any)[profile.theme]
      if (th) { document.documentElement.style.setProperty('--bg',th.bg); document.documentElement.style.setProperty('--text',th.text); document.documentElement.style.setProperty('--accent',th.accent); document.documentElement.style.setProperty('--card',th.card) }
    }
  }, [profile.theme,isClient])

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onloadend = () => updateProfile({ avatar: reader.result }); reader.readAsDataURL(file) }
  const updateProfile = (updates: any) => { const np = { ...profile, ...updates }; setProfile(np); saveProfileToStorage(np) }
  const handleConnect = async (connector: any) => { try { await connect({connector}); setShowModal(false) } catch { resetConnectionStates() } }

  // 🔥 Логика Фазы 7: Создание игры
  const createGame = () => {
    if (!validateGameConfig(stake, timeCtrl)) { alert('❌ Неверная ставка или время'); return }
    if (!address) { alert('❌ Подключите кошелёк'); return }
    const game = createTokenGameSession(address, stake, timeCtrl)
    if (game) {
      setCurrentGame(game); setMoveHistory([]); reset()
      alert(`✅ Игра создана!\nID: ${game.id}\nСтавка: ${formatC4C(stake)} C4C\nВремя: ${formatTime(timeCtrl)}`)
    }
  }

  const click = (sq: string) => {
    if (over) return; if (selected === sq) { setSelected(null); setPossibleMoves([]); return }
    const g = new Chess(fen)
    if (selected) { 
      try { 
        const m = g.move({ from: selected as any, to: sq as any, promotion: 'q' })
        if (m) { 
          setFen(g.fen()); setSelected(null); setPossibleMoves([])
          if(currentGame) recordGameMove(currentGame.id, m.san, g.pgn())
          setMoveHistory([...moveHistory, m.san])
          if (g.isCheckmate()) { setOver('⚪ Вы победили!'); processPayout(address||'',stake) } 
          return 
        } 
      } catch {} 
    }
    const piece = g.get(sq as any)
    if (piece && piece.color === g.turn()) { setSelected(sq); setPossibleMoves(g.moves({ square: sq as any, verbose: true }).map((m:any)=>m.to)) } 
    else { setSelected(null); setPossibleMoves([]) }
  }
  
  const reset = () => { setFen(new Chess().fen()); setSelected(null); setPossibleMoves([]); setWTime(timeCtrl); setBTime(timeCtrl); setOver(null); setCurrentGame(null); setMoveHistory([]) }
  const g = new Chess(fen)

  const L = profile.lang || 'ru'
  const tr = (key: string) => (UI_TRANSLATE as any)?.(L, key) || key

  if (!isClient) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',color:'var(--text)'}}>{tr('loading')}</div>
  if (!isConnected) return <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',padding:20,display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center'}}>
    <h1 style={{fontSize:36,marginBottom:16}}>♟️{APP_NAME}</h1>
    <button onClick={()=>setShowModal(true)} disabled={isPending} style={{padding:'16px 48px',background:isPending?'#6b7280':'var(--accent)',borderRadius:12,fontSize:18}}>{isPending?'⏳...':tr('connect')}</button>
    {showModal && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowModal(false)}>
      <div style={{background:'var(--card)',padding:24,borderRadius:16,maxWidth:360,width:'100%'}} onClick={(e:any)=>e.stopPropagation()}>
        <h3 style={{textAlign:'center',marginBottom:20}}>{tr('chooseWallet')}</h3>
        {connectors.map((c:any)=><button key={c.id} onClick={()=>handleConnect(c)} disabled={isPending} style={{width:'100%',padding:14,margin:'8px 0',background:'#3b82f6',color:'#fff',borderRadius:10}}>{c.name}</button>)}
        <button onClick={()=>setShowModal(false)} style={{width:'100%',padding:12,marginTop:16,background:'var(--border)',borderRadius:8}}>{tr('close')}</button>
      </div>
    </div>}
  </div>

  return <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',padding:20}}>
    <div style={{maxWidth:700,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h1 style={{display:'flex',alignItems:'center',gap:8}}>{profile.avatar ? <img src={profile.avatar} style={{width:32,height:32,borderRadius:'50%',border:'2px solid var(--accent)'}}/> : '♟️'} {APP_NAME}</h1>
        <button onClick={()=>disconnect()} style={{background:'var(--error)',padding:'8px 16px',borderRadius:6,color:'#fff'}}>{tr('logout')}</button>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {['profile','lobby','friends'].map((tabKey:string)=><button key={tabKey} onClick={()=>setTab(tabKey)} style={{flex:1,padding:10,background:tab===tabKey?'var(--accent)':'var(--card)',borderRadius:8,color:tab===tabKey?'#000':'var(--text)'}}>{tabKey==='profile'?tr('profile'):tabKey==='lobby'?tr('lobby'):tr('friends')}</button>)}
      </div>
      {tab==='profile' && <div style={{background:'var(--card)',padding:20,borderRadius:16}}>
        <div style={{display:'flex',gap:16,alignItems:'flex-start',marginBottom:16}}>
          <label style={{width:80,height:80,borderRadius:'50%',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',overflow:'hidden',border:'3px solid var(--accent)'}}>
            {profile.avatar ? <img src={profile.avatar} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{fontSize:28}}>📷</span>}
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}}/>
          </label>
          <div style={{flex:1}}>
            <input value={profile.name} onChange={(e:any)=>updateProfile({name:e.target.value})} placeholder="Ваше имя" style={{padding:10,fontWeight:600,marginBottom:6}}/>
            <p style={{fontSize:13,opacity:.7}}>{tr('balance')}: <span style={{fontSize:18,fontWeight:'bold',color:'var(--accent)'}}>{formatC4C(balance?.value)} C4C</span></p>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <label style={{fontSize:12,opacity:.7}}>{tr('desc')}</label>
          <textarea value={profile.description||''} onChange={(e:any)=>updateProfile({description:e.target.value.slice(0,500)})} rows={3} style={{resize:'none'}}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <input value={profile.link1Name||''} onChange={(e:any)=>updateProfile({link1Name:e.target.value})} placeholder="Ссылка 1"/>
            <input value={profile.link1Url||''} onChange={(e:any)=>updateProfile({link1Url:e.target.value})} placeholder="https://..."/>
            <input value={profile.link2Name||''} onChange={(e:any)=>updateProfile({link2Name:e.target.value})} placeholder="Ссылка 2"/>
            <input value={profile.link2Url||''} onChange={(e:any)=>updateProfile({link2Url:e.target.value})} placeholder="https://..."/>
          </div>
          <label style={{fontSize:12,opacity:.7}}>{tr('theme')}</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{Object.entries(UI_THEMES || {}).map(([id, theme]:any)=>(<button key={id} onClick={()=>updateProfile({theme:id})} style={{flex:1,padding:6,borderRadius:6,background:theme.bg,color:theme.text,border:profile.theme===id?'3px solid var(--accent)':'1px solid var(--border)'}}>{theme.name}</button>))}</div>
          <label style={{fontSize:12,opacity:.7}}>🌐 Язык</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{Object.entries(UI_LANGS || {}).map(([id, lang]:any)=>(<button key={id} onClick={()=>updateProfile({lang:id})} style={{flex:1,padding:6,borderRadius:6,background:'var(--card)',border:profile.lang===id?'2px solid var(--accent)':'1px solid var(--border)'}}>{lang.flag} {lang.name}</button>))}</div>
          <label style={{fontSize:12,opacity:.7}}>♟️ Доска</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{Object.entries(UI_BOARDS || {}).map(([id, board]:any)=>(<button key={id} onClick={()=>updateProfile({boardTheme:id})} style={{width:36,height:20,borderRadius:4,background:`linear-gradient(135deg,${board.light},${board.dark})`,border:profile.boardTheme===id?'3px solid var(--accent)':'1px solid var(--border)'}} title={id}/>))}</div>
          <button onClick={createGame} style={{width:'100%',padding:12,marginTop:8,background:'var(--success)',color:'#fff',borderRadius:8,fontWeight:600}}>🎮 Создать игру на токены</button>
        </div>
      </div>}
      {tab==='lobby' && <div style={{background:'var(--card)',padding:20,borderRadius:16}}>
        <h3 style={{marginBottom:12}}>{tr('lobby')}</h3>
        {games.length===0 ? <p style={{opacity:.7}}>{tr('noGames')}</p> : games.map((game:any)=>(<div key={game.id} style={{padding:10,background:'var(--bg)',borderRadius:8,marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><p style={{fontWeight:600}}>{tr('stake')}: {formatC4C(game.stake)}</p><p style={{fontSize:12,opacity:.6}}>{tr('time')}: {formatTime(game.timeControl)}</p></div><button onClick={()=>{reset();setTimeCtrl(game.timeControl);setStake(game.stake);setTab('profile')}} style={{padding:'6px 14px',background:'#3b82f6',color:'#fff',borderRadius:6}}>{tr('play')}</button></div>))}
      </div>}
      {tab==='friends' && <div style={{background:'var(--card)',padding:20,borderRadius:16}}>
        <h3 style={{marginBottom:12}}>{tr('friends')}</h3>
        <div style={{display:'flex',gap:8,marginBottom:12}}><input value={newFriendAddr} onChange={(e:any)=>setNewFriendAddr(e.target.value)} placeholder="Адрес"/><button onClick={()=>{if(newFriendAddr.length>3){addFriend({address:newFriendAddr,name:`Friend ${newFriendAddr.slice(2,6)}`,status:'online',addedAt:Date.now()});setFriends(getFriends());setNewFriendAddr('')}}} style={{background:'#3b82f6',color:'#fff',padding:'0 16px',borderRadius:6}}>{tr('addFriend')}</button></div>
        {friends.length===0 ? <p style={{opacity:.7}}>{tr('noFriends')}</p> : friends.map((f:any)=>(<div key={f.address} style={{padding:10,background:'var(--bg)',borderRadius:8,marginBottom:6,display:'flex',justifyContent:'space-between',alignItems:'center'}}><span>{f.name}</span><button onClick={()=>alert(`${tr('invite')} ${f.name}`)} style={{padding:'4px 10px',background:'var(--success)',color:'#fff',borderRadius:4,fontSize:12}}>{tr('invite')}</button></div>))}
      </div>}
      <div style={{marginTop:16,background:'var(--card)',padding:16,borderRadius:16}}>
        {currentGame && <div style={{marginBottom:12,padding:10,background:'var(--bg)',borderRadius:8}}>
          <p style={{fontSize:14,fontWeight:600}}>🎮 Игра: {currentGame.id}</p>
          <p style={{fontSize:12,opacity:.7}}>Ставка: {formatC4C(currentGame.stake)} C4C | Время: {formatTime(currentGame.timeControl)}</p>
        </div>}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h3>{tr('board')}</h3>
          <div style={{display:'flex',gap:8}}><select value={timeCtrl} onChange={(e:any)=>setTimeCtrl(Number(e.target.value))} style={{padding:6,borderRadius:6}}>{(TIME_OPTIONS||[]).map((o:any)=><option key={o.value} value={o.value}>{o.label}</option>)}</select><select value={stake} onChange={(e:any)=>setStake(Number(e.target.value))} style={{padding:6,borderRadius:6}}>{(STAKE_OPTIONS||[]).map((o:any)=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:0,maxWidth:360,margin:'0 auto',borderRadius:8,overflow:'hidden',boxShadow:'0 4px 12px rgba(0,0,0,.4)'}}>
          {['8','7','6','5','4','3','2','1'].map((r,ri)=>['a','b','c','d','e','f','g','h'].map((f,fi)=>{
            const sq=f+r; const p=g.get(sq as any); 
            const boardT = (UI_BOARDS as any)[profile.boardTheme] || (UI_BOARDS as any).blue;
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
        {moveHistory.length > 0 && <div style={{marginTop:12,maxHeight:80,overflowY:'auto',background:'var(--bg)',padding:8,borderRadius:6,fontSize:12}}>
          <strong>📜 Ходы:</strong> {moveHistory.join(' ')}
        </div>}
        <div style={{textAlign:'center',marginTop:12}}>{over && <p style={{color:'var(--error)',fontWeight:'bold',fontSize:16}}>{over}</p>}<button onClick={reset} style={{padding:'8px 20px',background:'#3b82f6',color:'#fff',borderRadius:6}}>{tr('newGame')}</button></div>
      </div>
    </div>
  </div>
}

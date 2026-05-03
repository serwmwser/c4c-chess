'use client'
import { useState, useEffect, ChangeEvent } from 'react'
import { useAccount, useConnect, useDisconnect, useConnectors, useBalance } from 'wagmi'
import { Chess } from 'chess.js'
import {
  C4C_TOKEN_ADDRESS, CHAIN_ID, APP_NAME, APP_DESCRIPTION,
  TIME_OPTIONS, STAKE_OPTIONS,
  formatTime, formatC4C, getBotMove, saveProfileToStorage, loadProfileFromStorage,
  resetConnectionStates, getOnlineGames, createGameLobby, getFriends, addFriend, processPayout,
  FIXED_CSS, injectGlobalStyles, SAFE_BOARD_THEMES
} from '@/lib/config'

const BRIGHT_THEMES: any = {
  sunny: { bg: '#ffecd2', text: '#2d3436', accent: '#fdcb6e', card: '#fff9c4' },
  coral: { bg: '#ff9a9e', text: '#fff', accent: '#ff6b6b', card: '#ffb3ba' },
  mint: { bg: '#a8e6cf', text: '#2d3436', accent: '#00b894', card: '#dcedc1' },
  sky: { bg: '#89f7fe', text: '#2d3436', accent: '#3498db', card: '#bae8e8' },
  lavender: { bg: '#e0c3fc', text: '#2d3436', accent: '#8e44ad', card: '#f3e5f5' },
  peach: { bg: '#ffd1ff', text: '#2d3436', accent: '#e91e63', card: '#f8bbd0' },
  lime: { bg: '#d4fc79', text: '#2d3436', accent: '#2ecc71', card: '#c8e6c9' },
  violet: { bg: '#fa709a', text: '#fff', accent: '#9b59b6', card: '#e1bee7' }
}

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
  const [profile, setProfile] = useState<any>({ id:'', name:'', theme:'sunny', boardTheme:'blue', description:'', avatar:'', link1Name:'', link1Url:'', link2Name:'', link2Url:'' })
  const [fen, setFen] = useState(() => new Chess().fen())
  const [selected, setSelected] = useState<string|null>(null)
  const [possibleMoves, setPossibleMoves] = useState<string[]>([])
  const [timeCtrl, setTimeCtrl] = useState(900)
  const [stake, setStake] = useState(50000)
  const [wTime, setWTime] = useState(900)
  const [bTime, setBTime] = useState(900)
  const [over, setOver] = useState<string|null>(null)
  const [games, setGames] = useState<any[]>([])
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
    if (profile.theme && isClient) { const t = BRIGHT_THEMES[profile.theme]
      if (t) { document.documentElement.style.setProperty('--bg',t.bg); document.documentElement.style.setProperty('--text',t.text); document.documentElement.style.setProperty('--accent',t.accent); document.documentElement.style.setProperty('--card',t.card) }
    }
  }, [profile.theme,isClient])

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onloadend = () => updateProfile({ avatar: reader.result }); reader.readAsDataURL(file) }
  const updateProfile = (updates: any) => { const np = { ...profile, ...updates }; setProfile(np); saveProfileToStorage(np) }
  const handleConnect = async (connector: any) => { try { await connect({connector}); setShowModal(false) } catch { resetConnectionStates() } }

  const click = (sq: string) => {
    if (over) return; if (selected === sq) { setSelected(null); setPossibleMoves([]); return }
    const g = new Chess(fen)
    if (selected) { try { const m = g.move({ from: selected as any, to: sq as any, promotion: 'q' }); if (m) { setFen(g.fen()); setSelected(null); setPossibleMoves([]); if (g.isCheckmate()) { setOver('⚪ Вы победили!'); processPayout(address||'',stake) } return } } catch {} }
    const piece = g.get(sq as any); if (piece && piece.color === g.turn()) { setSelected(sq); setPossibleMoves(g.moves({ square: sq as any, verbose: true }).map((m:any)=>m.to)) } else { setSelected(null); setPossibleMoves([]) }
  }
  const reset = () => { setFen(new Chess().fen()); setSelected(null); setPossibleMoves([]); setWTime(timeCtrl); setBTime(timeCtrl); setOver(null) }
  const g = new Chess(fen)

  if (!isClient) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',color:'var(--text)'}}>⏳ Загрузка...</div>

  if (!isConnected) return <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',padding:20,display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center'}}>
    <h1 style={{fontSize:36,marginBottom:16}}>♟️{APP_NAME}</h1>
    <button onClick={()=>setShowModal(true)} disabled={isPending} style={{padding:'16px 48px',background:isPending?'#6b7280':'var(--accent)',borderRadius:12,fontSize:18}}>{isPending?'⏳ Подключение...':'🔗 Войти'}</button>
    {showModal && <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowModal(false)}>
      <div style={{background:'var(--card)',padding:24,borderRadius:16,maxWidth:360,width:'100%'}} onClick={(e:any)=>e.stopPropagation()}>
        <h3 style={{textAlign:'center',marginBottom:20}}>Выберите кошелёк</h3>
        {connectors.map((c:any)=><button key={c.id} onClick={()=>handleConnect(c)} disabled={isPending} style={{width:'100%',padding:14,margin:'8px 0',background:'#3b82f6',color:'#fff',borderRadius:10}}>{c.name}</button>)}
        <button onClick={()=>setShowModal(false)} style={{width:'100%',padding:12,marginTop:16,background:'var(--border)',borderRadius:8}}>Закрыть</button>
      </div>
    </div>}
  </div>

  return <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',padding:20}}>
    <div style={{maxWidth:700,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h1 style={{display:'flex',alignItems:'center',gap:8}}>{profile.avatar ? <img src={profile.avatar} style={{width:32,height:32,borderRadius:'50%',border:'2px solid var(--accent)'}}/> : '♟️'} {APP_NAME}</h1>
        <button onClick={()=>disconnect()} style={{background:'var(--error)',padding:'8px 16px',borderRadius:6,color:'#fff'}}>Выйти</button>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {['profile','lobby','friends'].map((t:any)=><button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:10,background:tab===t?'var(--accent)':'var(--card)',borderRadius:8,color:tab===t?'#000':'var(--text)'}}>{t==='profile'?'👤 Профиль':t==='lobby'?'🎲 Лобби':'👥 Друзья'}</button>)}
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
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <label style={{fontSize:12,opacity:.7}}>📝 Описание</label>
          <textarea value={profile.description||''} onChange={(e:any)=>updateProfile({description:e.target.value.slice(0,500)})} rows={3} style={{resize:'none'}}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <input value={profile.link1Name||''} onChange={(e:any)=>updateProfile({link1Name:e.target.value})} placeholder="Ссылка 1"/>
            <input value={profile.link1Url||''} onChange={(e:any)=>updateProfile({link1Url:e.target.value})} placeholder="https://..."/>
            <input value={profile.link2Name||''} onChange={(e:any)=>updateProfile({link2Name:e.target.value})} placeholder="Ссылка 2"/>
            <input value={profile.link2Url||''} onChange={(e:any)=>updateProfile({link2Url:e.target.value})} placeholder="https://..."/>
          </div>
          <label style={{fontSize:12,opacity:.7}}>🎨 Тема</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{Object.entries(BRIGHT_THEMES).map(([id,t]:any)=>(<button key={id} onClick={()=>updateProfile({theme:id})} style={{flex:1,padding:6,borderRadius:6,background:t.bg,color:t.text,border:profile.theme===id?'3px solid var(--accent)':'1px solid var(--border)'}}>{(t as any).name||id}</button>))}</div>
          <label style={{fontSize:12,opacity:.7}}>♟️ Доска</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{Object.entries(SAFE_BOARD_THEMES).map(([id,t]:any)=>(<button key={id} onClick={()=>updateProfile({boardTheme:id})} style={{width:36,height:20,borderRadius:4,background:`linear-gradient(135deg,${t.light},${t.dark}`,border:profile.boardTheme===id?'3px solid var(--accent)':'1px solid var(--border)'}} title={id}/>))}</div>
        </div>
      </div>}
      {tab==='lobby' && <div style={{background:'var(--card)',padding:20,borderRadius:16}}>
        <h3 style={{marginBottom:12}}>🎲 Лобби</h3>
        {games.length===0 ? <p style={{opacity:.7}}>Нет игр</p> : games.map((g:any)=>(<div key={g.id} style={{padding:10,background:'var(--bg)',borderRadius:8,marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><p style={{fontWeight:600}}>Ставка: {formatC4C(g.stake)}</p><p style={{fontSize:12,opacity:.6}}>Время: {formatTime(g.timeControl)}</p></div><button onClick={()=>{reset();setTimeCtrl(g.timeControl);setStake(g.stake);setTab('profile')}} style={{padding:'6px 14px',background:'#3b82f6',color:'#fff',borderRadius:6}}>▶️</button></div>))}
      </div>}
      {tab==='friends' && <div style={{background:'var(--card)',padding:20,borderRadius:16}}>
        <h3 style={{marginBottom:12}}>👥 Друзья</h3>
        <div style={{display:'flex',gap:8,marginBottom:12}}><input value={newFriendAddr} onChange={(e:any)=>setNewFriendAddr(e.target.value)} placeholder="Адрес"/><button onClick={()=>{if(newFriendAddr.length>3){addFriend({address:newFriendAddr,name:`Friend ${newFriendAddr.slice(2,6)}`,status:'online',addedAt:Date.now()});setFriends(getFriends());setNewFriendAddr('')}}} style={{background:'#3b82f6',color:'#fff',padding:'0 16px',borderRadius:6}}>➕</button></div>
        {friends.length===0 ? <p style={{opacity:.7}}>Нет друзей</p> : friends.map((f:any)=>(<div key={f.address} style={{padding:10,background:'var(--bg)',borderRadius:8,marginBottom:6,display:'flex',justifyContent:'space-between',alignItems:'center'}}><span>{f.name}</span><button onClick={()=>alert(`📩 ${f.name}`)} style={{padding:'4px 10px',background:'var(--success)',color:'#fff',borderRadius:4,fontSize:12}}>📩</button></div>))}
      </div>}
      <div style={{marginTop:16,background:'var(--card)',padding:16,borderRadius:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h3>♟️ Доска</h3>
          <div style={{display:'flex',gap:8}}><select value={timeCtrl} onChange={(e:any)=>setTimeCtrl(Number(e.target.value))} style={{padding:6,borderRadius:6}}>{TIME_OPTIONS.map((o:any)=><option key={o.value} value={o.value}>{o.label}</option>)}</select><select value={stake} onChange={(e:any)=>setStake(Number(e.target.value))} style={{padding:6,borderRadius:6}}>{STAKE_OPTIONS.map((o:any)=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:0,maxWidth:360,margin:'0 auto',borderRadius:8,overflow:'hidden',boxShadow:'0 4px 12px rgba(0,0,0,.4)'}}>
          {['8','7','6','5','4','3','2','1'].map((r,ri)=>['a','b','c','d','e','f','g','h'].map((f,fi)=>{
            const sq=f+r; const p=g.get(sq as any); 
            // 🔥 Берёт цвета ТОЛЬКО из Патча 007 (через master-config)
            const t = (SAFE_BOARD_THEMES as any)[profile.boardTheme] || SAFE_BOARD_THEMES.blue;
            const bg=(fi+ri)%2===0 ? t.light : t.dark
            return <div key={sq} onClick={()=>click(sq)} style={{aspectRatio:1,background:bg,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative',border:selected===sq?'3px solid #fdcb6e':'none'}}>
              {fi===0 && <span style={{position:'absolute',top:2,left:4,fontSize:10,fontWeight:700,color:(fi+ri)%2===0?t.dark:t.light,opacity:.7,pointerEvents:'none'}}>{r}</span>}
              {ri===7 && <span style={{position:'absolute',bottom:2,right:4,fontSize:10,fontWeight:700,color:(fi+ri)%2===0?t.dark:t.light,opacity:.7,pointerEvents:'none'}}>{f}</span>}
              {possibleMoves.includes(sq) && !p && <div style={{width:'26%',height:'26%',borderRadius:'50%',background:'rgba(0,0,0,.2)'}}/>}
              {possibleMoves.includes(sq) && p && <div style={{width:'85%',height:'85%',borderRadius:'50%',border:'4px solid rgba(0,0,0,.25)'}}/>}
              {p && <span style={{fontSize:36,lineHeight:1,userSelect:'none',textShadow:'1px 2px 3px rgba(0,0,0,.3)',color:p.color==='w'?'#fff':'#111'}}>{getPieceSymbol(p)}</span>}
            </div>
          }))}
        </div>
        <div style={{textAlign:'center',marginTop:12}}>{over && <p style={{color:'var(--error)',fontWeight:'bold',fontSize:16}}>{over}</p>}<button onClick={reset} style={{padding:'8px 20px',background:'#3b82f6',color:'#fff',borderRadius:6}}>🔄 Новая игра</button></div>
      </div>
    </div>
  </div>
}

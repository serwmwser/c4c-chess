'use client';
import{useState,useEffect}from'react';
import{useAccount,useConnect,useDisconnect,useConnectors,useBalance}from'wagmi';
import{Chess}from'chess.js';
import{C4C_TOKEN_ADDRESS,CHAIN_ID,APP_NAME,APP_DESCRIPTION,WALLETCONNECT_PROJECT_ID,C4C_BUY_URL,TIME_OPTIONS,STAKE_OPTIONS,BOARD_THEMES,formatTime,formatC4C,getBotMove,getPieceStyle,PIECE_SYMBOLS,canConnectToMetaMask,canConnectToWalletConnect,resetConnectionStates,type BoardThemeId,type PlayerProfile}from'@/lib/config';

function getPieceColor(c:'white'|'black'){return c==='white'?'#fff':'#111';}

function ChessApp(){
  const{address,isConnected,chain}=useAccount();
  const{connect,isPending}=useConnect();
  const{disconnect}=useDisconnect();
  const connectors=useConnectors();
  const[showModal,setShowModal]=useState(false);
  const[isClient,setIsClient]=useState(false);
  const[isConnecting,setIsConnecting]=useState(false);
  const[fen,setFen]=useState<string>(()=>new Chess().fen());
  const[selected,setSelected]=useState<any>(null);
  const[possible,setPossible]=useState<any[]>([]);
  const[mode,setMode]=useState<'bot'|'pvp'>('bot');
  const[timeCtrl,setTimeCtrl]=useState(900);
  const[wTime,setWTime]=useState(900);
  const[bTime,setBTime]=useState(900);
  const[over,setOver]=useState<string|null>(null);
  const[boardTheme,setBoardTheme]=useState<BoardThemeId>('classic');
  
  const balanceResult=useBalance({address,token:C4C_TOKEN_ADDRESS as`0x${string}`,query:{enabled:!!address&&!!chain?.id&&chain.id===CHAIN_ID}});
  const balance=balanceResult.data;
  const balanceStatus=balanceResult.status;
  
  useEffect(()=>{setIsClient(true);},[]);
  useEffect(()=>{setWTime(timeCtrl);setBTime(timeCtrl);setOver(null);},[timeCtrl]);
  useEffect(()=>{if(over)return;const g=new Chess(fen);const isW=g.turn()==='w';if((isW?wTime:bTime)<=0){setOver(isW?'⚪ Время вышло!':'⚫ Время вышло!');return;}const t=setInterval(()=>{isW?setWTime(p=>Math.max(0,p-1)):setBTime(p=>Math.max(0,p-1));},1000);return()=>clearInterval(t);},[fen,wTime,bTime,over]);
  useEffect(()=>{if(mode==='bot'&&!over){const g=new Chess(fen);if(g.turn()==='b'&&!g.isGameOver()){const t=setTimeout(()=>{const moves=g.moves({verbose:true});const mv=getBotMove(moves);if(mv){g.move(mv);setFen(g.fen());setBTime(p=>Math.max(0,p-4));if(g.isCheckmate())setOver('⚫ Бот победил!');}},4000);return()=>clearTimeout(t);}}},[fen,mode,over]);
  
  const handleConnect=async(connector:any)=>{
    if(!canConnectToMetaMask()&&connector.type==='metaMask'){alert('⏳ Подождите 5 сек');return;}
    if(!canConnectToWalletConnect()&&connector.type==='walletConnect'){alert('⏳ Подождите 5 сек');return;}
    try{await connect({connector});setShowModal(false);}catch(e:any){resetConnectionStates();alert(e.message?.includes('pending')?'🔄 Уже подключается.':'❌ Ошибка подключения');}
  };
  
  const click=(sq:string)=>{
    if(over)return;
    const s=sq as any;
    if(selected===s){setSelected(null);setPossible([]);return;}
    const g=new Chess(fen);
    if(selected){try{const m=g.move({from:selected,to:s,promotion:'q'});if(m){setFen(g.fen());setSelected(null);setPossible([]);if(mode==='bot')setWTime(p=>Math.max(0,p-1));if(g.isCheckmate())setOver('⚪ Вы победили!');return;}}catch{}}
    const piece=g.get(s);
    if(piece&&piece.color===g.turn()&&(mode==='pvp'||piece.color==='w')){setSelected(s);setPossible(g.moves({square:s,verbose:true}).map((m:any)=>m.to));}
    else{setSelected(null);setPossible([]);}
  };
  
  const reset=()=>{setFen(new Chess().fen());setSelected(null);setPossible([]);setWTime(timeCtrl);setBTime(timeCtrl);setOver(null);};
  const g=new Chess(fen);
  const isW=g.turn()==='w';
  
  // 🔥 Безопасное получение символа фигуры
  const getPieceSymbol=(p:any)=>{
    if(!p||!p.type||!p.color)return'';
    return PIECE_SYMBOLS[p.type]?.[p.color]||'';
  };
  
  if(!isClient)return<main style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',display:'flex',alignItems:'center',justifyContent:'center'}}><p>⏳ Загрузка...</p></main>;
  
  if(!isConnected)return(<main style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',padding:20,display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center'}}>
    <h1 style={{fontSize:36,marginBottom:16}}>♟️{APP_NAME}</h1>
    <p style={{marginBottom:20}}>{APP_DESCRIPTION}</p>
    <button onClick={()=>setShowModal(true)}disabled={isPending||isConnecting}style={{padding:'16px 40px',background:(isPending||isConnecting)?'#6b7280':'var(--accent)',borderRadius:12}}>{(isPending||isConnecting)?'⏳ Подключение...':'🔗 Войти'}</button>
    {showModal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center'}}onClick={()=>setShowModal(false)}>
      <div style={{background:'var(--card)',padding:24,borderRadius:16,maxWidth:400,width:'100%'}}onClick={e=>e.stopPropagation()}>
        <h3 style={{textAlign:'center',marginBottom:16}}>Выберите кошелёк</h3>
        <button onClick={()=>{const mm=connectors.find((c:any)=>c.type==='metaMask'||c.id==='io.metamask');if(mm)handleConnect(mm);}}disabled={isPending||isConnecting}style={{width:'100%',padding:12,margin:'8px 0',background:'#f59e0b',borderRadius:8}}>🦊 MetaMask</button>
        <button onClick={()=>{const wc=connectors.find((c:any)=>c.type==='walletConnect');if(wc)handleConnect(wc);}}disabled={isPending||isConnecting}style={{width:'100%',padding:12,margin:'8px 0',background:'#3b82f6',borderRadius:8}}>📱 WalletConnect QR</button>
        <button onClick={()=>setShowModal(false)}style={{width:'100%',padding:12,marginTop:16,background:'var(--border)',borderRadius:8}}>Закрыть</button>
      </div>
    </div>}
  </main>);
  
  return(<main style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',padding:20}}>
    <div style={{maxWidth:640,margin:'0 auto'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:20,borderBottom:'1px solid var(--border)'}}>
        <h1>♟️{APP_NAME}</h1>
        <button onClick={()=>disconnect()}style={{background:'var(--error)',padding:'8px 16px',borderRadius:6}}>Выйти</button>
      </header>
      <section style={{padding:24,background:'var(--card)',borderRadius:16,marginBottom:16}}>
        <p style={{fontSize:13,color:'#9ca3af'}}>Адрес</p>
        <p style={{fontFamily:'monospace',fontSize:14,color:'#22c55e',wordBreak:'break-all'}}>{address}</p>
        <p style={{marginTop:16,fontSize:13,color:'#9ca3af'}}>Баланс</p>
        <p style={{fontSize:28,fontWeight:'bold',color:'var(--accent)'}}>{balanceStatus==='success'&&balance?formatC4C(balance.value):'0.00'}C4C</p>
        <a href={C4C_BUY_URL}target="_blank"rel="noopener noreferrer"style={{display:'inline-block',marginTop:12,padding:'10px 20px',background:'linear-gradient(135deg,#ec4899,#db2777)',color:'#fff',textDecoration:'none',borderRadius:10}}>🛒 Купить C4C</a>
      </section>
      <section style={{padding:20,background:'var(--card)',borderRadius:16}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
          <h3>♟️ Доска</h3>
          <select value={mode}onChange={e=>{setMode(e.target.value as any);reset();}}style={{padding:6}}><option value="bot">🤖 Бот</option><option value="pvp">👥 PvP</option></select>
          <select value={timeCtrl}onChange={e=>{setTimeCtrl(Number(e.target.value));reset();}}style={{padding:6}}>{TIME_OPTIONS.map(o=><option key={o.value}value={o.value}>{o.label}</option>)}</select>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',padding:8,background:'var(--card)',borderRadius:8,marginBottom:12}}>
          <div><span style={{fontSize:12,color:'#9ca3af'}}>⚪ Белые</span><p style={{fontSize:18,fontWeight:'bold'}}>{formatTime(wTime)}</p></div>
          <div style={{textAlign:'right'}}><span style={{fontSize:12,color:'#9ca3af'}}>⚫ Чёрные</span><p style={{fontSize:18,fontWeight:'bold'}}>{formatTime(bTime)}</p></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:2,background:'var(--border)',borderRadius:8,maxWidth:320,margin:'0 auto'}}>
          {['8','7','6','5','4','3','2','1'].map((r,ri)=>['a','b','c','d','e','f','g','h'].map((f,fi)=>{
            const sq=`${f}${r}`as any;
            const p=g.get(sq);
            const theme=BOARD_THEMES[boardTheme];
            const bg=(fi+ri)%2===0?theme.light:theme.dark;
            const pc=p?.color==='w'?'white':'black';
            const sym=getPieceSymbol(p);
            return(<div key={sq}onClick={()=>click(sq)}style={{aspectRatio:1,background:bg,display:'flex',alignItems:'center',justifyContent:'center',cursor:p?'pointer':'default',fontSize:40,color:getPieceColor(pc),position:'relative',border:selected===sq?'3px solid var(--accent)':'none'}}>{sym}</div>);
          }))}
        </div>
        <div style={{textAlign:'center',marginTop:16}}>{over&&<p style={{color:'var(--error)',fontWeight:'bold'}}>{over}</p>}<button onClick={reset}style={{marginTop:8,padding:'8px 16px',background:'#3b82f6',borderRadius:6}}>🔄 Новая игра</button></div>
      </section>
    </div>
  </main>);
}

export default function Page(){return<ChessApp/>;}

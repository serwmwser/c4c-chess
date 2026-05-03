import{createConfig,http}from'wagmi';import{bsc}from'wagmi/chains';import{walletConnect,metaMask}from'wagmi/connectors';
export const C4C_TOKEN_ADDRESS='0xaac20575371de01b4d10c4e7566d5453d72d56e7'as const;
export const GAME_CONTRACT_ADDRESS='0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005'as const;
export const C4C_BUY_URL='https://www.pink.meme/token/bsc/0xaac20575371de01b4d10c4e7566d5453d72d56e7'as const;
export const CHAIN_ID=56 as const;export const CHAIN_NAME='Binance Smart Chain'as const;
export const RPC_URL='https://bsc-dataseed.binance.org/'as const;
export const APP_NAME='C4C Chess'as const;export const APP_DESCRIPTION='Play chess, earn C4C tokens on BSC'as const;
export const WALLETCONNECT_PROJECT_ID=(typeof process!=='undefined'&&process.env.NEXT_PUBLIC_WALLETCONNECT_ID)||'286f8aa9e630099f05763481672dcdc5';
export const HOW_TO_PLAY='How to play...';
export const TIME_OPTIONS=[{label:'5 мин',value:300},{label:'15 мин',value:900},{label:'30 мин',value:1800},{label:'1 час',value:3600},{label:'24 часа',value:86400}]as const;
export const STAKE_OPTIONS=[{label:'50k',value:50000},{label:'100k',value:100000},{label:'250k',value:250000},{label:'500k',value:500000},{label:'1M',value:1000000}]as const;
export const BOARD_THEMES={classic:{name:'Классика',light:'#eeeed2',dark:'#769656'},green:{name:'Зелёная',light:'#b5cf9e',dark:'#3a5f2a'},blue:{name:'Синяя',light:'#c9e4f7',dark:'#2b5f8c'},wood:{name:'Дерево',light:'#f0d9b5',dark:'#b58863'},marble:{name:'Мрамор',light:'#f8f8f8',dark:'#4a4a4a'},neon:{name:'Неон',light:'#00ffff',dark:'#ff00ff'},minimal:{name:'Минимал',light:'#ffffff',dark:'#000000'},retro:{name:'Ретро',light:'#fff8dc',dark:'#8b4513'},}as const;
export const PROFILE_THEMES={default:{name:'Классика',bg:'#111827',text:'#f9fafb',accent:'#f59e0b',card:'#1f2937'},dark:{name:'Тёмная',bg:'#030712',text:'#f3f4f6',accent:'#6366f1',card:'#1f2937'},light:{name:'Светлая',bg:'#f9fafb',text:'#111827',accent:'#059669',card:'#ffffff'},ocean:{name:'Океан',bg:'#0c4a6e',text:'#f0f9ff',accent:'#38bdf8',card:'#1e3a5f'},forest:{name:'Лес',bg:'#064e3b',text:'#ecfdf5',accent:'#34d399',card:'#065f46'},sunset:{name:'Закат',bg:'#7c2d12',text:'#fff7ed',accent:'#fb923c',card:'#9a3412'},cyber:{name:'Кибер',bg:'#0f0f23',text:'#e0e7ff',accent:'#a78bfa',card:'#1e1b4b'},royal:{name:'Королевская',bg:'#1e1b4b',text:'#fef3c7',accent:'#fbbf24',card:'#312e81'},}as const;
export const LANGUAGES={ru:{name:'Русский',flag:'🇷🇺'},en:{name:'English',flag:'🇬🇧'}}as const;
export function formatTime(s:number){return`${Math.floor(s/60)}м${(s%60).toString().padStart(2,'0')}с`;}
export function formatC4C(a:any){return a?(parseFloat(a.toString())/1e6).toFixed(2):'0.00';}
export function getBotMove(m:any[]){return m.length?m[Math.floor(Math.random()*m.length)]:null;}
export function getBoardThemeForProfile(t:any):any{return'classic';}
export function saveProfile(p:any){if(typeof window!=='undefined')localStorage.setItem('c4c-profile',JSON.stringify(p));}
export function loadProfile():any{if(typeof window!=='undefined'){const d=localStorage.getItem('c4c-profile');return d?JSON.parse(d):null;}return null;}
export type BoardThemeId=keyof typeof BOARD_THEMES;export type ProfileThemeId=keyof typeof PROFILE_THEMES;export type LanguageCode=keyof typeof LANGUAGES;
export interface PlayerProfile{id:string;name:string;theme:ProfileThemeId;language:LanguageCode;boardTheme:BoardThemeId;[key:string]:any;}
export interface Game{id:string;creatorId:string;status:string;[key:string]:any;}
export interface Friend{id:string;name:string;[key:string]:any;}
export interface GameInvite{id:string;gameId:string;fromPlayer:string;toPlayer:string;status:"pending"|"accepted"|"declined";createdAt:number;}
export function createWagmiConfigBase(){return createConfig({chains:[bsc],connectors:[metaMask({dappMetadata:{name:APP_NAME,url:'https://c4c-chess.vercel.app'}}),walletConnect({projectId:WALLETCONNECT_PROJECT_ID,showQrModal:true,metadata:{name:APP_NAME,description:APP_DESCRIPTION,url:'https://c4c-chess.vercel.app',icons:[]}}),],transports:{[bsc.id]:http(RPC_URL)},});}
export function canConnectMetaBase():boolean{return true;}
export function canConnectWCBase():boolean{return true;}
export function resetConnBase(){}
export function getPieceStyle(c:'white'|'black'):React.CSSProperties{return{fontSize:'40px',fontWeight:900,color:c==='white'?'#fff':'#111',display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%'};}
export const PIECE_SYMBOLS:Record<string,Record<'w'|'b',string>>={p:{w:'♙',b:'♟'},n:{w:'♘',b:'♞'},b:{w:'♗',b:'♝'},r:{w:'♖',b:'♜'},q:{w:'♕',b:'♛'},k:{w:'♔',b:'♚'}};
export const CONFIG_BASE={C4C_TOKEN_ADDRESS,GAME_CONTRACT_ADDRESS,C4C_BUY_URL,CHAIN_ID,CHAIN_NAME,RPC_URL,APP_NAME,APP_DESCRIPTION,WALLETCONNECT_PROJECT_ID,HOW_TO_PLAY,TIME_OPTIONS,STAKE_OPTIONS,BOARD_THEMES,PROFILE_THEMES,LANGUAGES,formatTime,formatC4C,getBotMove,getBoardThemeForProfile,saveProfileToStorage:saveProfile,loadProfileFromStorage:loadProfile,createWagmiConfig:createWagmiConfigBase,canConnectToMetaMask:canConnectMetaBase,canConnectToWalletConnect:canConnectWCBase,resetConnectionStates:resetConnBase,getPieceStyle,PIECE_SYMBOLS,}as const;

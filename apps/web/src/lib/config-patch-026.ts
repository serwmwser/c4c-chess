// 🔹 ПАТЧ 026: Создать игру + Оповещения (старт при обоих онлайн) — Контракты: GAME=0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005 C4C=0xaac20575371de01b4d10c4e7566d5453d72d56e7
import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

// 🔹 UI ТЕМЫ И ЯЗЫКИ
export const UI_THEMES = {
  classic: { name: '🌑 Классика', bg: '#111827', text: '#f9fafb', accent: '#d4af37', card: '#1f2937' },
  light: { name: '☀️ Светлая', bg: '#f5f5f5', text: '#111111', accent: '#2563eb', card: '#ffffff' },
  wood: { name: '🪵 Дерево', bg: '#2c1e16', text: '#f4e4c1', accent: '#b58863', card: '#3d2b1f' },
  green: { name: '🌿 Фетр', bg: '#143614', text: '#e8f5e9', accent: '#4caf50', card: '#1b5e20' },
  blue: { name: '🌊 Синий', bg: '#0d1b2a', text: '#e0e7ff', accent: '#3b82f6', card: '#1b263b' },
  sepia: { name: '📜 Сепия', bg: '#f4ecd8', text: '#3e2723', accent: '#8d6e63', card: '#fff8e1' },
  monochrome: { name: '⚫ Монохром', bg: '#121212', text: '#ffffff', accent: '#9e9e9e', card: '#1e1e1e' },
  tournament: { name: '🏆 Турнир', bg: '#212121', text: '#eeeeee', accent: '#ff9800', card: '#303030' }
} as const;

export const UI_LANGS = {
  ru: { name: 'Русский', flag: '🇷🇺' },
  en: { name: 'English', flag: '🇬🇧' }
} as const;

export const UI_BOARDS = {
  classic: { name: 'Классика', light: '#eeeed2', dark: '#769656' },
  green: { name: 'Зелёная', light: '#b5cf9e', dark: '#3a5f2a' },
  blue: { name: 'Синяя', light: '#c9e4f7', dark: '#2b5f8c' }
} as const;

export const UI_TRANSLATE = {
  ru: { connect: '🔗 Войти', profile: '👤 Профиль', lobby: '🎲 Лобби', friends: '👥 Друзья', board: '♟️ Доска', newGame: '🔄 Новая игра', time: 'Время', stake: 'Ставка', desc: 'Описание', links: 'Ссылки', theme: '🎨 Тема', logout: 'Выйти', loading: '⏳ Загрузка...', chooseWallet: 'Выберите кошелёк', close: 'Закрыть', balance: 'Баланс', play: '▶️ Играть', invite: '📩 Вызвать', addFriend: '➕ Добавить', noGames: 'Нет игр', noFriends: 'Нет друзей' },
  en: { connect: '🔗 Connect', profile: '👤 Profile', lobby: '🎲 Lobby', friends: '👥 Friends', board: '♟️ Board', newGame: '🔄 New Game', time: 'Time', stake: 'Stake', desc: 'Description', links: 'Links', theme: '🎨 Theme', logout: 'Logout', loading: '⏳ Loading...', chooseWallet: 'Choose wallet', close: 'Close', balance: 'Balance', play: '▶️ Play', invite: '📩 Invite', addFriend: '➕ Add', noGames: 'No games', noFriends: 'No friends' }
} as const;

// 🔹 СЕКЦИИ И СОЦСЕТИ
export const SECTIONS = ['profile', 'lobby', 'friends', 'board', 'notifications'] as const;
export const YOUTUBE_URL = 'https://www.youtube.com/@c4c-chess';
export const YOUTUBE_BUTTON_TEXT = '📺 Смотреть видео';
export const C4C_EXCHANGE_URL = 'https://www.pink.meme/token/bsc/0xaac20575371de01b4d10c4e7566d5453d72d56e7';
export const SOCIAL_SECTION_TITLE = '🌐 Социальные сети';
export const SOCIAL_LINKS = [
  { name: 'Twitter', url: 'https://twitter.com/c4c_chess', icon: '🐦' },
  { name: 'Discord', url: 'https://discord.gg/c4c-chess', icon: '💬' },
  { name: 'Telegram', url: 'https://t.me/c4c_chess', icon: '📱' }
] as const;
export const YOUTUBE_SECTION_DESCRIPTION = 'Видео гайды и стримы по шахматам';

// 🔹 РАСШИРЕННЫЕ ТЕМЫ ДОСКИ
export const EXTENDED_BOARD_THEMES = {
  classic: { name: 'Классика', light: '#eeeed2', dark: '#769656' },
  green: { name: 'Зелёная', light: '#b5cf9e', dark: '#3a5f2a' },
  blue: { name: 'Синяя', light: '#c9e4f7', dark: '#2b5f8c' },
  wood: { name: 'Дерево', light: '#f0d9b5', dark: '#b58863' },
  marble: { name: 'Мрамор', light: '#f8f8f8', dark: '#4a4a4a' },
  neon: { name: 'Неон', light: '#00ffff', dark: '#ff00ff' },
  minimal: { name: 'Минимал', light: '#ffffff', dark: '#000000' },
  retro: { name: 'Ретро', light: '#fff8dc', dark: '#8b4513' }
} as const;

export const PIECE_STYLES = {
  classic: { fontSize: '40px', fontWeight: 900, color: 'white' },
  modern: { fontSize: '42px', fontWeight: 700, color: 'white' },
  minimal: { fontSize: '38px', fontWeight: 600, color: 'white' }
} as const;

// 🔹 СТИЛИ
export const FIXED_CSS = "*{box-sizing:border-box;padding:0;margin:0}:root{--bg:#1a1a2e;--text:#f0f0f0;--accent:#fdcb6e;--card:#16213e;--border:#0f3460;--success:#00b894;--error:#e94560;--warning:#fdcb6e}html,body{max-width:100vw;overflow-x:hidden;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,sans-serif;transition:background .3s,color .3s}button{font-family:inherit;cursor:pointer;border:none;border-radius:8px;transition:all .2s;background:var(--accent);color:#000;padding:10px 20px;font-weight:600}button:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px)}button:disabled{opacity:.5;cursor:not-allowed}input,select,textarea{font-family:inherit;background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:8px;width:100%;transition:border .2s}input:focus,select:focus,textarea:focus{outline:none;border-color:var(--accent)}[data-theme='sunny']{--bg:#ffecd2;--text:#2d3436;--accent:#fdcb6e;--card:#fff9c4;--border:#ffeaa7}[data-theme='coral']{--bg:#ff9a9e;--text:#fff;--accent:#ff6b6b;--card:#ffb3ba;--border:#ff7675}[data-theme='mint']{--bg:#a8e6cf;--text:#2d3436;--accent:#00b894;--card:#dcedc1;--border:#81ecec}[data-theme='sky']{--bg:#89f7fe;--text:#2d3436;--accent:#3498db;--card:#bae8e8;--border:#74b9ff}[data-theme='lavender']{--bg:#e0c3fc;--text:#2d3436;--accent:#8e44ad;--card:#f3e5f5;--border:#d1c4e9}[data-theme='peach']{--bg:#ffd1ff;--text:#2d3436;--accent:#e91e63;--card:#f8bbd0;--border:#f48fb1}[data-theme='lime']{--bg:#d4fc79;--text:#2d3436;--accent:#2ecc71;--card:#c8e6c9;--border:#a5d6a7}[data-theme='violet']{--bg:#fa709a;--text:#fff;--accent:#9b59b6;--card:#e1bee7;--border:#f3e5f5}";

export function injectGlobalStyles(css: string) {
  if (typeof document === 'undefined') return;
  let style = document.getElementById('c4c-patch-styles');
  if (!style) { style = document.createElement('style'); style.id = 'c4c-patch-styles'; document.head.appendChild(style); }
  style.textContent = css;
}

export function areBothPlayersOnline(player1: string, player2: string): boolean {
  if (typeof window === 'undefined') return false;
  const presence = JSON.parse(localStorage.getItem('c4c-presence') || '{}');
  const now = Date.now();
  const p1 = presence[player1]; const p2 = presence[player2];
  return p1?.isOnline && p2?.isOnline && (now - p1.lastSeen) < 10000 && (now - p2.lastSeen) < 10000;
}

// 🔹 ДРУЗЬЯ И ВЫПЛАТЫ
export function getFriends(): any[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('c4c-friends') || '[]');
}

export function addFriend(friend: any): void {
  const friends = getFriends();
  if (!friends.find((f: any) => f.address === friend.address)) {
    friends.push(friend); localStorage.setItem('c4c-friends', JSON.stringify(friends));
  }
}

export function processPayout(winner: string, amount: number) {
  console.log(`[PAYOUT] ${amount} C4C -> ${winner}`);
  return { success: true, hash: `0x${Date.now().toString(16)}` };
}

export function getLobbyGames() {
  return typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('c4c_lobby') || '[]') : [];
}

// 🔹 КОНСТАНТЫ КОНТРАКТОВ
export const C4C_TOKEN_ADDRESS = '0xaac20575371de01b4d10c4e7566d5453d72d56e7' as `0x${string}`;
export const GAME_CONTRACT_ADDRESS = '0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005' as `0x${string}`;
export const CHAIN_ID = 56;
export const DECIMALS = 6;

// 🔹 ABI КОНТРАКТОВ
export const C4C_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)'
] as const;

export const GAME_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_gameToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_feeRecipient",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "gameId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "stake",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timeLimit",
        "type": "uint256"
      }
    ],
    "name": "GameCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "gameId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isDraw",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "payout",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "fee",
        "type": "uint256"
      }
    ],
    "name": "GameFinished",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "gameId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "challenger",
        "type": "address"
      }
    ],
    "name": "GameJoined",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "gameId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "StakeDeposited",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "FEE_BASE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PLATFORM_FEE_BPS",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "checkAllowance",
    "outputs": [
      {
        "internalType": "bool",
        "name": "allowed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "gameId",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "stake",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timeLimit",
        "type": "uint256"
      }
    ],
    "name": "createGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "gameId",
        "type": "bytes32"
      }
    ],
    "name": "depositStake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "gameId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isDraw",
        "type": "bool"
      }
    ],
    "name": "finishGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gameToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "games",
    "outputs": [
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "challenger",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "stake",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "creatorPaid",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "challengerPaid",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isDraw",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "finished",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timeLimit",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFeeRecipient",
    "outputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "gameId",
        "type": "bytes32"
      }
    ],
    "name": "getGame",
    "outputs": [
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "challenger",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "stake",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "creatorPaid",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "challengerPaid",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isDraw",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "finished",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timeLimit",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTokenAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformFeeRecipient",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// 🔹 КОНСТАНТЫ ИГРЫ
export const TIME_CONTROLS = [
  { label: '5 мин', value: 300 },
  { label: '15 мин', value: 900 },
  { label: '30 мин', value: 1800 },
  { label: '1 час', value: 3600 },
  { label: '3 часа', value: 10800 },
  { label: '24 часа', value: 86400 }
] as const;

export const STAKE_LEVELS = [5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000] as const;
export const MIN_STAKE = 5000;

// 🔹 УТИЛИТЫ
export function toWei(amount: number): bigint {
  return parseUnits(amount.toString(), DECIMALS);
}

export function fromWei(amount: bigint | number | undefined): string {
  if (!amount) return '0 C4C';
  const val = typeof amount === 'bigint' ? Number(amount) : amount;
  return (val / 10 ** DECIMALS).toLocaleString() + ' C4C';
}

export function validateStake(stake: number): boolean {
  return STAKE_LEVELS.includes(stake as typeof STAKE_LEVELS[number]);
}

export function formatPrizePool(stake: number): string {
  return (stake * 2).toLocaleString() + ' C4C';
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60); const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// 🔹 ХУКИ WAGMI V2
export function useApproveC4C() {
  const { writeContract, data: txHash, isPending, isSuccess } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });

  const approve = (amount: number) => writeContract({
    address: C4C_TOKEN_ADDRESS,
    abi: [{ name: 'approve', type: 'function', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] }],
    functionName: 'approve',
    args: [GAME_CONTRACT_ADDRESS, toWei(amount)],
    chainId: CHAIN_ID
  });

  return { approve, txHash, isPending, isConfirming, isSuccess };
}

export function useCreateTokenGame() {
  const { writeContract, data: txHash, isPending, isSuccess } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });

  const create = (timeCtrl: number, stake: number) => writeContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: [{ name: 'createGame', type: 'function', inputs: [{ name: 'gameId', type: 'bytes32' }, { name: 'stake', type: 'uint256' }, { name: 'timeLimit', type: 'uint256' }], outputs: [] }],
    functionName: 'createGame',
    args: [`0x${Math.random().toString(16).slice(2, 66)}` as `0x${string}`, toWei(stake), BigInt(timeCtrl)],
    chainId: CHAIN_ID
  });

  return { create, txHash, isPending, isConfirming, isSuccess };
}

export function useJoinTokenGame() {
  const { writeContract, data: txHash, isPending, isSuccess } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });

  const join = (gameId: string) => writeContract({
    address: GAME_CONTRACT_ADDRESS,
    abi: [{ name: 'depositStake', type: 'function', inputs: [{ name: 'gameId', type: 'bytes32' }], outputs: [] }],
    functionName: 'depositStake',
    args: [gameId as `0x${string}`],
    chainId: CHAIN_ID
  });

  return { join, txHash, isPending, isConfirming, isSuccess };
}

// 🔹 ИНТЕРФЕЙС И ФУНКЦИИ ОПОВЕЩЕНИЙ
export interface GameNotification {
  id: string;
  type: 'game_start' | 'invite' | 'timeout_win' | 'claim_ready';
  title: string;
  message: string;
  gameId?: string;
  opponentName?: string;
  myColor?: 'w' | 'b';
  timestamp: number;
  read: boolean;
}

export function createNotification(
  type: GameNotification['type'],
  title: string,
  message: string,
  gameId?: string,
  opponentName?: string,
  myColor?: 'w' | 'b'
): string {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const notification: GameNotification = {
    id,
    type,
    title,
    message,
    gameId,
    opponentName,
    myColor,
    timestamp: Date.now(),
    read: false
  };

  const existing = JSON.parse(localStorage.getItem('c4c_notifications') || '[]') as GameNotification[];
  existing.unshift(notification);
  localStorage.setItem('c4c_notifications', JSON.stringify(existing.slice(0, 50))); // Макс 50

  return id;
}

export function getNotifications(filter: 'all' | 'unread'): GameNotification[] {
  const notifications = JSON.parse(localStorage.getItem('c4c_notifications') || '[]') as GameNotification[];
  return filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
}

export function markNotificationRead(id: string): void {
  const notifications = JSON.parse(localStorage.getItem('c4c_notifications') || '[]') as GameNotification[];
  const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem('c4c_notifications', JSON.stringify(updated));
}

// 🔹 ЗВУКОВОЕ ОПОВЕЩЕНИЕ
export function playStartSound(): void {
  try {
    const audio = new Audio('/sounds/notification-start.mp3');
    audio.volume = 0.8;
    audio.play().catch(() => {
      // Fallback to Web Audio API
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    });
  } catch (error) {
    console.warn('Audio playback failed:', error);
  }
}

// 🔹 ВИЗУАЛЬНОЕ ОПОВЕЩЕНИЕ
export function showVisualAlert(gameId: string, myColor: 'w' | 'b', opponentName: string): void {
  const colorText = myColor === 'w' ? '⚪ Белые' : '⚫ Чёрные';
  const message = `Игра ${gameId.slice(0, 8)}... началась!\nВы играете ${colorText} против ${opponentName}\n\nПерейти к доске?`;

  if (confirm(message)) {
    // Переход к игре (можно добавить логику навигации)
    window.location.hash = `#game-${gameId}`;
  }
}

// 🔹 ПРОВЕРКА И СТАРТ ИГРЫ
export async function checkAndStartGame(gameId: string): Promise<boolean> {
  // Логика проверки и старта игры
  // Здесь должна быть интеграция с контрактом и состоянием игры
  console.log(`Checking game start for ${gameId}`);
  return true; // Заглушка
}

// 🔹 HEARTBEAT И ОНЛАЙН-ПРОВЕРКА
export function updatePlayerPresence(addr: string): void {
  const presence = JSON.parse(localStorage.getItem('c4c_presence') || '{}');
  presence[addr.toLowerCase()] = Date.now();
  localStorage.setItem('c4c_presence', JSON.stringify(presence));
}

// 🔹 ЭКСПОРТ ПАТЧА
export const PATCH_026 = {
  FIXED_CSS,
  injectGlobalStyles,
  UI_THEMES,
  UI_LANGS,
  UI_BOARDS,
  UI_TRANSLATE,
  SECTIONS,
  YOUTUBE_URL,
  YOUTUBE_BUTTON_TEXT,
  C4C_EXCHANGE_URL,
  SOCIAL_SECTION_TITLE,
  SOCIAL_LINKS,
  YOUTUBE_SECTION_DESCRIPTION,
  EXTENDED_BOARD_THEMES,
  PIECE_STYLES,
  TIME_CONTROLS,
  STAKE_LEVELS,
  MIN_STAKE,
  C4C_TOKEN_ADDRESS,
  GAME_CONTRACT_ADDRESS,
  CHAIN_ID,
  DECIMALS,
  C4C_ABI,
  GAME_ABI,
  toWei,
  fromWei,
  validateStake,
  formatPrizePool,
  formatClock,
  useApproveC4C,
  useCreateTokenGame,
  useJoinTokenGame,
  createNotification,
  getNotifications,
  markNotificationRead,
  playStartSound,
  showVisualAlert,
  checkAndStartGame,
  updatePlayerPresence,
  areBothPlayersOnline,
  getFriends,
  addFriend,
  processPayout,
  getLobbyGames
};export type { GameNotification };

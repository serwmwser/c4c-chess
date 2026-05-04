// 🔹 ПАТЧ 3: Друзья, Лобби, Приглашения, Выигрыши
export interface GameRoom { id: string; creator: string; timeControl: number; stake: number; status: string; createdAt: number; }
export interface GameInvite { id: string; from: string; to: string; gameId: string; status: string; createdAt: number; }
export interface FriendEntry { address: string; name: string; status: string; addedAt: number; }

export function getOnlineGames(): GameRoom[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('c4c-games') || '[]');
}

export function createGameLobby(creator: string, time: number, stake: number): GameRoom {
  const game: GameRoom = { id: `g_${Date.now()}`, creator, timeControl: time, stake, status: 'waiting', createdAt: Date.now() };
  const games = getOnlineGames(); games.push(game);
  localStorage.setItem('c4c-games', JSON.stringify(games)); return game;
}

export function getFriends(): FriendEntry[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('c4c-friends') || '[]');
}

export function addFriend(friend: FriendEntry): void {
  const friends = getFriends();
  if (!friends.find(f => f.address === friend.address)) {
    friends.push(friend); localStorage.setItem('c4c-friends', JSON.stringify(friends));
  }
}

export function sendGameInvite(invite: GameInvite): void {
  const invites = JSON.parse(localStorage.getItem('c4c-invites') || '[]');
  invites.push(invite); localStorage.setItem('c4c-invites', JSON.stringify(invites));
}

// 🔥 Симуляция выплаты на кошелек (в Фазе 7 заменится на контракт)
export function processPayout(winner: string, amount: number) {
  console.log(`[PAYOUT] ${amount} C4C -> ${winner}`);
  return { success: true, hash: `0x${Date.now().toString(16)}` };
}

export const PATCH_003 = { getOnlineGames, createGameLobby, getFriends, addFriend, sendGameInvite, processPayout };

export type MatchType = "free" | "stake";

export interface RoomSummary {
  id: string;
  matchType: MatchType;
  stakeAmount: number;
  timeControl: number;
  white?: PlayerSummary;
  black?: PlayerSummary;
  fen: string;
  moves: string[];
}

export interface PlayerSummary {
  socketId: string;
  wallet: `0x${string}`;
  nickname: string;
  color: "white" | "black";
}

export interface MoveUpdate {
  room: RoomSummary;
  status: "active" | "checkmate" | "finished";
  winner?: `0x${string}`;
}

export interface OnChainGameState {
  creator: `0x${string}`;
  challenger: `0x${string}`;
  stake: bigint;
  creatorPaid: boolean;
  challengerPaid: boolean;
  winner: `0x${string}`;
  isDraw: boolean;
  finished: boolean;
  createdAt: bigint;
  timeLimit: bigint;
}


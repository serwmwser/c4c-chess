import { create } from "zustand";
import { RoomSummary } from "@/lib/types";

interface GameState {
  nickname: string;
  matchType: "free" | "stake";
  stakeAmount: number;
  timeControl: 15 | 30 | 60 | 120;
  rooms: RoomSummary[];
  activeRoom?: RoomSummary;
  setNickname: (nickname: string) => void;
  setMatchType: (matchType: "free" | "stake") => void;
  setStakeAmount: (stakeAmount: number) => void;
  setTimeControl: (timeControl: 15 | 30 | 60 | 120) => void;
  setRooms: (rooms: RoomSummary[]) => void;
  setActiveRoom: (room?: RoomSummary) => void;
}

export const useGameStore = create<GameState>((set) => ({
  nickname: "",
  matchType: "free",
  stakeAmount: 50000,
  timeControl: 15,
  rooms: [],
  activeRoom: undefined,
  setNickname: (nickname) => set({ nickname }),
  setMatchType: (matchType) => set({ matchType }),
  setStakeAmount: (stakeAmount) => set({ stakeAmount }),
  setTimeControl: (timeControl) => set({ timeControl }),
  setRooms: (rooms) => set({ rooms }),
  setActiveRoom: (activeRoom) => set({ activeRoom }),
}));


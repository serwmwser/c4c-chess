
import { isHex, pad, stringToHex } from "viem";

export function toGameId(roomId: string) {
  if (isHex(roomId) && roomId.length === 66) {
    return roomId as `0x${string}`;
  }

  return pad(stringToHex(roomId, { size: 32 }), { size: 32 });
}


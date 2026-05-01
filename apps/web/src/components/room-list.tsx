import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/lib/game-store";
import { RoomSummary } from "@/lib/types";

export function RoomList() {
  const { address } = useAccount();
  const { nickname, rooms, setRooms, setActiveRoom } = useGameStore();
  const [error, setError] = useState("");

  useEffect(() => {
    const socket = getSocket();

    function onRoomsList(nextRooms: RoomSummary[]) {
      setRooms(nextRooms);
    }

    socket.on("rooms:list", onRoomsList);
    return () => {
      socket.off("rooms:list", onRoomsList);
    };
  }, [setRooms]);

  async function joinRoom(roomId: string) {
    if (!address) {
      setError("Connect wallet first");
      return;
    }

    if (!nickname.trim()) {
      setError("Set nickname before joining");
      return;
    }

    try {
      const socket = getSocket();
      const room = await socket.emitWithAck("room:join", {
        roomId,
        wallet: address,
        nickname,
      });

      setError("");
      setActiveRoom(room as RoomSummary);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Join failed");
    }
  }
  return (
    <section className="panel room-list-panel">
      <div className="panel-head">
        <p className="eyebrow">OPEN ROOMS</p>
        <h2>Join a live opponent</h2>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="room-list">
        {rooms.length === 0 ? <p>No open rooms right now.</p> : null}
        {rooms.map((room) => (
          <article className="room-card" key={room.id}>
            <div>
              <strong>{room.white?.nickname || "Unknown"}</strong>
              <p>
                {room.matchType === "stake"
                  ? `${room.stakeAmount.toLocaleString()} C4C stake`
                  : "Free match"}
              </p>
              <p>{room.timeControl} min</p>
            </div>
            <button className="ghost-btn" onClick={() => joinRoom(room.id)} type="button">
              Join game
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

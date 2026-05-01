import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useAccount } from "wagmi";
import { StakeActions } from "@/components/stake-actions";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/lib/game-store";
import { MoveUpdate, RoomSummary } from "@/lib/types";

export function LiveGame() {
  const { address } = useAccount();
  const { activeRoom, setActiveRoom } = useGameStore();
  const [message, setMessage] = useState("Waiting for game to start");

  useEffect(() => {
    const socket = getSocket();

    function onRoomReady(room: RoomSummary) {
      setActiveRoom(room);
      setMessage("Game started. White moves first.");
    }

    function onMoveApplied(update: MoveUpdate) {
      setActiveRoom(update.room);
      if (update.status === "checkmate") {
        setMessage(`Checkmate. Winner wallet: ${update.winner}`);
      } else if (update.status === "finished") {
        setMessage("Game finished.");
      } else {
        setMessage(`Moves played: ${update.room.moves.join(", ") || "none yet"}`);
      }
    }

    function onStakeWarning(payload: { message: string }) {
      setMessage(payload.message);
    }

    socket.on("room:ready", onRoomReady);
    socket.on("move:applied", onMoveApplied);
    socket.on("stake:warning", onStakeWarning);

    return () => {
      socket.off("room:ready", onRoomReady);
      socket.off("move:applied", onMoveApplied);
      socket.off("stake:warning", onStakeWarning);
    };
  }, [setActiveRoom]);
  const chess = useMemo(() => new Chess(activeRoom?.fen), [activeRoom?.fen]);
  const isPlayerTurn =
    activeRoom && address
      ? (chess.turn() === "w" && activeRoom.white?.wallet === address) ||
        (chess.turn() === "b" && activeRoom.black?.wallet === address)
      : false;

  async function onDrop(sourceSquare: string, targetSquare: string) {
    if (!activeRoom || !isPlayerTurn) {
        return false;
      }
  
      const localBoard = new Chess(activeRoom.fen);
      const move = localBoard.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
  
      if (!move) {
        return false;
      }
  
      try {
        const socket = getSocket();
        await socket.emitWithAck("move:submit", {
          roomId: activeRoom.id,
          move: `${sourceSquare}${targetSquare}`,
        });
        return true;
      } catch {
        return false;
      }
    }
  
    if (!activeRoom) {
      return (
        <section className="panel live-panel empty-live">
          <p className="eyebrow">LIVE BOARD</p>
          <h2>Create or join a room to start playing.</h2>
        </section>
      );
    }
  
    return (
      <section className="panel live-panel">
        <div className="panel-head">
          <p className="eyebrow">LIVE MATCH</p>
          <h2>{activeRoom.matchType === "stake" ? "C4C stake game" : "Free online game"}</h2>
        </div>
  
        <div className="live-meta">
          <div>
            <span>White</span>
            <strong>{activeRoom.white?.nickname || "Waiting"}</strong>
          </div>
          <div>
            <span>Black</span>
            <strong>{activeRoom.black?.nickname || "Waiting"}</strong>
          </div>
          <div>
            <span>Pot</span>
            <strong>
              {activeRoom.matchType === "stake"
                ? `${(activeRoom.stakeAmount * 2).toLocaleString()} C4C`
                : "No stake"}
            </strong>
          </div>
        </div>
  
        <div className="game-layout">
          <div className="board-wrap">
            <Chessboard
              id="c4c-live-board"
              position={activeRoom.fen}
              onPieceDrop={onDrop}
              arePiecesDraggable={Boolean(isPlayerTurn && activeRoom.black)}
              boardWidth={520}
              customDarkSquareStyle={{ backgroundColor: "#6f4f37" }}
              customLightSquareStyle={{ backgroundColor: "#e3c99d" }}
            />
          </div>
  
          <aside className="moves-panel">
            <div className="status-card">
              <span>Status</span>
              <strong>{message}</strong>
            </div>
            <div className="status-card">
              <span>Turn</span>
              <strong>{chess.turn() === "w" ? "White" : "Black"}</strong>
            </div>
            <div className="status-card">
              <span>Moves</span>
              <strong>{activeRoom.moves.length ? activeRoom.moves.join(" ") : "No moves yet"}</strong>
            </div>
            <div className="status-card">
              <span>Room id</span>
              <strong>{activeRoom.id}</strong>
            </div>
            <StakeActions room={activeRoom} />
          </aside>
        </div>
      </section>
    );
  }

  
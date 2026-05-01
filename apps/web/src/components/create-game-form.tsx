import { FormEvent, useState } from "react";
import { useAccount } from "wagmi";
import { timeControls, wagerOptions } from "@/lib/game-config";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/lib/game-store";
import { RoomSummary } from "@/lib/types";

export function CreateGameForm() {
  const { address } = useAccount();
  const {
    nickname,
    matchType,
    stakeAmount,
    timeControl,
    setNickname,
    setMatchType,
    setStakeAmount,
    setTimeControl,
    setActiveRoom,
  } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!address) {
      setError("Connect wallet first");
      return;
    }

    if (!nickname.trim()) {
      setError("Enter a nickname");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const socket = getSocket();
      const room = await socket.emitWithAck("room:create", {
        wallet: address,
        nickname,
        matchType,
        stakeAmount: matchType === "ranked" ? stakeAmount : 0, 
        timeControl,
      });

      setActiveRoom(room as RoomSummary);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form className="panel form-panel" onSubmit={onSubmit}>
      <div className="panel-head">
        <p className="eyebrow">CREATE MATCH</p>
        <h2>Start a free or C4C stake game</h2>
      </div>

      <label>
        <span>Player nickname</span>
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="C4C Master"
        />
      </label>

      <label>
        <span>Game mode</span>
        <select
          value={matchType}
          onChange={(event) => setMatchType(event.target.value as "free" | "stake")}
        >
          <option value="free">Free game</option>
          <option value="stake">Stake game</option>
        </select>
      </label>

      <label>
        <span>Time control</span>
        <select
          value={timeControl}
          onChange={(event) =>
            setTimeControl(Number(event.target.value) as 15 | 30 | 60 | 120)
          }
        >
          {timeControls.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} minutes
            </option>
          ))}
        </select>
      </label>

      {matchType === "stake" ? (
        <label>
          <span>Stake amount in C4C</span>
          <select
            value={stakeAmount}
            onChange={(event) => setStakeAmount(Number(event.target.value))}
          >
            {wagerOptions.map((amount) => (
              <option key={amount} value={amount}>
                {amount.toLocaleString()} C4C
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      <button className="primary-btn" type="submit" disabled={loading}>
        {loading ? "Creating room..." : "Create game"}
      </button>
    </form>
  );
}


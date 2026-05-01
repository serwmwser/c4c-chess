import { erc20Abi, parseUnits } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { c4cGameAbi } from "../../../../packages/contracts/c4cGameAbi";
import { toGameId } from "@/lib/contract-utils";
import { OnChainGameState, RoomSummary } from "@/lib/types";

const tokenAddress = process.env.NEXT_PUBLIC_C4C_TOKEN as `0x${string}`;
const gameAddress = process.env.NEXT_PUBLIC_GAME_CONTRACT as `0x${string}`;

export function StakeActions({ room }: { room: RoomSummary }) {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const gameId = toGameId(room.id);
  const stakeAmount = parseUnits(String(room.stakeAmount), 18);

  const gameQuery = useReadContract({
    address: gameAddress,
    abi: c4cGameAbi,
    functionName: "getGame",
    args: [gameId],
    query: {
      enabled: room.matchType === "stake",
      refetchInterval: 5000,
    },
  });

  const allowanceQuery = useReadContract({
    address: gameAddress,
    abi: c4cGameAbi,
    functionName: "checkAllowance",
    args: address ? [address, stakeAmount] : undefined,
    query: {
      enabled: Boolean(address) && room.matchType === "stake",
      refetchInterval: 5000,
    },
  });

  if (room.matchType !== "stake") {
    return null;
  }

  const game = gameQuery.data as OnChainGameState | undefined;
  const allowanceOk = Boolean(allowanceQuery.data);
  const hasDeposited =
    address && game
      ? game.creator.toLowerCase() === address.toLowerCase()
        ? game.creatorPaid
        : game.challenger.toLowerCase() === address.toLowerCase()
          ? game.challengerPaid
          : false
      : false;

  async function approve() {
    await writeContractAsync({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [gameAddress, stakeAmount],
    });
    await allowanceQuery.refetch();
  }

  async function deposit() {
    await writeContractAsync({
      address: gameAddress,
      abi: c4cGameAbi,
      functionName: "depositStake",
      args: [gameId],
    });
    await gameQuery.refetch();
  }

  return (
    <div className="stake-actions">
      <div className="status-card">
        <span>Allowance</span>
        <strong>{allowanceOk ? "Approved" : "Approval required"}</strong>
      </div>
      <div className="status-card">
        <span>Deposit status</span>
        <strong>{hasDeposited ? "Stake deposited" : "Deposit pending"}</strong>
      </div>
      <div className="status-card">
        <span>On-chain game</span>
        <strong>
          {game
            ? `${game.creatorPaid ? "Creator funded" : "Creator waiting"} / ${game.challengerPaid ? "Challenger funded" : "Challenger waiting"}`
            : "Waiting for contract state"}
        </strong>
      </div>
      <div className="stake-button-row">
        <button
          className="ghost-btn"
          disabled={isPending || allowanceOk}
          onClick={approve}
          type="button"
        >
          {allowanceOk ? "Allowance ready" : isPending ? "Approving..." : "Approve C4C"}
        </button>
        <button
          className="primary-btn"
          disabled={isPending || !allowanceOk || hasDeposited}
          onClick={deposit}
          type="button"
        >
          {hasDeposited ? "Deposit complete" : isPending ? "Depositing..." : "Deposit stake"}
        </button>
      </div>
    </div>
  );
}


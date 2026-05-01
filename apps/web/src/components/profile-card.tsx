import { useAccount, useReadContract } from "wagmi";
import { erc20Abi, formatUnits } from "viem";

const tokenAddress = process.env.NEXT_PUBLIC_C4C_TOKEN as `0x${string}`;

export function ProfileCard() {
  const { address, isConnected } = useAccount();
  const balanceQuery = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  const balance = balanceQuery.data ? formatUnits(balanceQuery.data, 18) : "0";

  return (
    <section className="panel profile-panel">
      <div className="panel-head">
        <p className="eyebrow">PLAYER PROFILE</p>
        <h2>Wallet-based identity</h2>
      </div>

      <div className="profile-metric">
        <span>Status</span>
        <strong>{isConnected ? "Wallet connected" : "Connect wallet"}</strong>
      </div>
      <div className="profile-metric">
        <span>Address</span>
        <strong>{address || "Not connected"}</strong>
      </div>
      <div className="profile-metric">
        <span>C4C balance</span>
        <strong>{balance}</strong>
      </div>
      <div className="profile-metric">
        <span>Buy / swap</span>
        <a href={process.env.NEXT_PUBLIC_PINKSALE_URL} target="_blank" rel="noreferrer">
          Open Pink.Meme listing
        </a>
      </div>
    </section>
  );
}


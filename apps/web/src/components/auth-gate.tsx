

import { PropsWithChildren } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export function AuthGate({ children }: PropsWithChildren) {
  const { isConnected } = useAccount();

  if (isConnected) {
    return <>{children}</>;
  }

  return (
    <section className="auth-gate panel">
      <p className="eyebrow">WALLET LOGIN</p>
      <h2>Connect your crypto wallet to enter C4C Chess.</h2>
      <p>
        Your wallet acts as your player identity. It is used to read your C4C
        balance, create rooms, join matches, and prepare token staking.
      </p>
      <div className="wallet-row single">
        <ConnectButton />
      </div>
    </section>
  );
}


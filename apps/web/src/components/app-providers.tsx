

import { PropsWithChildren, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { bsc } from "wagmi/chains";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "replace-me";

export function AppProviders({ children }: PropsWithChildren) {
  const queryClient = useMemo(() => new QueryClient(), []);
  const config = useMemo(
    () =>
      getDefaultConfig({
        appName: "C4C Chess",
        projectId: walletConnectProjectId,
        chains: [bsc],
        transports: {
          [bsc.id]: http(),
        },
      }),
    [],
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


'use client';
import{WagmiProvider}from'wagmi';
import{QueryClient,QueryClientProvider}from'@tanstack/react-query';
import{createWagmiConfig}from'@/lib/config';

const queryClient=new QueryClient();
const wagmiConfig=createWagmiConfig();

export function Providers({children}:{children:React.ReactNode}){
  return(
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

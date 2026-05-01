// apps/api/src/config/stake.config.ts

export const STAKE_CONFIG = {
    TOKEN_ADDRESS: '0xaac20575371de01b4d10c4e7566d5453d72d56e7', // C4C Token
    GAME_CONTRACT_ADDRESS: '0xCf5E5d01ADd5e2Ba62B2f6747E5CFC43e36D5005', // Game Contract
    MIN_STAKE: 50000,
    MAX_STAKE: 1000000,
    STAKE_STEP: 50000,
    NETWORK: 'bsc',
    RPC_URL: process.env.RPC_URL_BSC || 'https://bsc-dataseed.binance.org/',
  };
  
  export function isValidStake(amount: number): boolean {
    if (amount < STAKE_CONFIG.MIN_STAKE || amount > STAKE_CONFIG.MAX_STAKE) {
      return false;
    }
    return (amount - STAKE_CONFIG.MIN_STAKE) % STAKE_CONFIG.STAKE_STEP === 0;
  }
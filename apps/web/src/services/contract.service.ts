// apps/api/src/services/contract.service.ts
import { ethers } from 'ethers';
import { STAKE_CONFIG } from '../config/stake.config';

// Минимальный ABI для проверки баланса токена
const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export class ContractService {
  private provider: ethers.JsonRpcProvider;
  private tokenContract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(STAKE_CONFIG.RPC_URL);
    this.tokenContract = new ethers.Contract(
      STAKE_CONFIG.TOKEN_ADDRESS,
      TOKEN_ABI,
      this.provider
    );
  }

  async checkBalance(address: string): Promise<number> {
    try {
      const balanceBigNumber = await this.tokenContract.balanceOf(address);
      const decimals = await this.tokenContract.decimals();
      // Приводим к человеческому виду (например, 50000.0)
      const balance = Number(ethers.formatUnits(balanceBigNumber, decimals));
      return balance;
    } catch (error) {
      console.error(`Error checking balance for ${address}:`, error);
      throw new Error('Failed to check token balance');
    }
  }

  async validateStake(address: string, amount: number): Promise<boolean> {
    const balance = await this.checkBalance(address);
    return balance >= amount;
  }
}
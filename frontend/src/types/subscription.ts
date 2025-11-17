import { Earning, Miner, MiningContract, Transaction } from "./api";

export enum DepositStatus {
  NO_DEPOSIT = "no deposit",
  PENDING = 'deposit pending approval',
  INCOMPLETE = 'incomplete deposit',
  COMPLETE_DEPOSIT = 'complete deposit'
}

export interface MiningSubscription {
  id: number;
  miningContractId: number;
  amountDeposited: number;
  shouldUpdateAutomatically: boolean;
  totalEarnings: number;
  minerId: number;
  currency: string;
  symbol: string;
  dateOfFirstPayment:Date
  depositStatus: DepositStatus;
  createdAt: Date;
  updatedAt: Date;

}
export interface MiningSubscriptionWithTransactions extends MiningSubscription{
  transactions:Transaction[]
}
export interface FullMiningSubscription extends MiningSubscription {
  miner: Miner
  miningContract?:MiningContract
  earnings: Earning[]; // Ensure earnings is explicitly defined
}

export interface MiningSubscriptionWithMiner extends MiningSubscription{
  miner:Miner
}

export interface MiningSubscriptionCreationDto extends Omit<MiningSubscription, 'id' | 'shouldUpdateAutomatically' | 'earnings' | 'isActive' | 'createdAt' | 'updatedAt'|'amountDeposited'> {}
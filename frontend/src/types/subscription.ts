export interface MiningSubscription {
  id: number;
  miningContractId: number;
  amountDeposited: number;
  shouldUpdateAutomatically: boolean;
  earnings: number;
  minerId: number;
  currency:string
  symbol:string
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MiningSubscriptionCreationDto extends Omit<MiningSubscription, 'id' | 'shouldUpdateAutomatically' | 'earnings' | 'isActive' | 'createdAt' | 'updatedAt'|'amountDeposited'> {}
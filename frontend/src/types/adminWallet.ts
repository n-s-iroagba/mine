export interface AdminWallet {
  id: number;
  currencyAbbreviation: string;
  logo: string;
  address: string;
  currency: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdminWalletCreationDto extends Omit<AdminWallet, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}
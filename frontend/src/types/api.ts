// Base API response type
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'admin' | 'miner';
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'admin' | 'miner';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

// User types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'admin' | 'miner';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// Admin Wallet types
export interface AdminWallet {
  id: number;
  currencyAbbreviation: string;
  logo: string;
  address: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminWalletData {
  currencyAbbreviation: string;
  logo: string;
  address: string;
  currency: string;
}

export interface UpdateAdminWalletData {
  currencyAbbreviation?: string;
  logo?: string;
  address?: string;
  currency?: string;
  isActive?: boolean;
}

// Mining Server types
export interface MiningServer {
  id: number;
  name: string;
  hashRate: string;
  powerConsumptionInKwH: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMiningServerData {
  name: string;
  hashRate: string;
  powerConsumptionInKwH: string;
}

export interface UpdateMiningServerData {
  name?: string;
  hashRate?: string;
  powerConsumptionInKwH?: string;
  isActive?: boolean;
}

// Mining Contract types
export interface MiningContract {
  id: number;
  miningServerId: number;
  periodReturn: number;
  period: 'daily' | 'weekly' | 'fortnightly' | 'monthly';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  miningServer?: MiningServer;
}

export interface CreateMiningContractData {
  miningServerId: number;
  periodReturn: number;
  period: 'daily' | 'weekly' | 'fortnightly' | 'monthly';
}

export interface UpdateMiningContractData {
  miningServerId?: number;
  periodReturn?: number;
  period?: 'daily' | 'weekly' | 'fortnightly' | 'monthly';
  isActive?: boolean;
}

// Bank types
export interface Bank {
  id: number;
  name: string;
  accountNumber: string;
  accountName: string;
  branch?: string;
  swiftCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankData {
  name: string;
  accountNumber: string;
  accountName: string;
  branch?: string;
  swiftCode?: string;
}

export interface UpdateBankData {
  name?: string;
  accountNumber?: string;
  accountName?: string;
  branch?: string;
  swiftCode?: string;
  isActive?: boolean;
}

// Mining Subscription types
export interface MiningSubscription {
  id: number;
  miningContractId: number;
  amountDeposited: number;
  shouldUpdateAutomatically: boolean;
  earnings: number;
  minerId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  miningContract?: MiningContract;
  miner?:{
    firstName:string
    lastName:string
    country:string
    email:string
    phone:string
  }

}
export interface MiningSubscriptionWithTransaction extends MiningSubscription{
  transactions:Transaction[]

}

export interface CreateMiningSubscriptionData {
  miningContractId: number;
  amountDeposited: number;
  minerId: number;
  shouldUpdateAutomatically?: boolean;
}

export interface UpdateEarningsData {
  earnings: number;
  actionType:'debit'|'credit'
}

export interface MinerDashboard {
  summary: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    inactiveSubscriptions: number;
    totalDeposits: number;
    totalEarnings: number;
    netProfit: number;
    overallROI: number;
  };
  subscriptions: Array<{
    id: number;
    amountDeposited: number;
    earnings: number;
    isActive: boolean;
    createdAt: string;
    miningContract: MiningContract;
  }>;
}

// Transaction types
export interface Transaction {
  id: number;
  amountInUSD: number;
  originatingId: string;
  entityId: number;
  entity: 'subscription' | 'kyc';
  status: 'initialized' | 'pending' | 'successful' | 'failed';
  minerId: number;
  createdAt: string;
  updatedAt: string;
  miner?: User;
}

export interface CreateTransactionData {
  amountInUSD: number;
  entityId: number;
  entity: 'subscription' | 'kyc';
  minerId: number;
}

export interface UpdateTransactionStatusData {
  status: 'initialized' | 'pending' | 'successful' | 'failed';
}

export interface TransactionStats {
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalVolume: number;
  subscriptionTransactions: number;
  kycTransactions: number;
  successRate: number;
}

// KYC types
export interface KYC {
  id: number;
  minerId: number;
  idCard: string;
  status: 'pending' | 'successful' | 'failed';
  reviewedBy?: number;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  miner?: User;
  reviewer?: User;
}

export interface CreateKYCData {
  minerId: number;
  idCard: string;
}

export interface UpdateKYCStatusData {
  status: 'pending' | 'successful' | 'failed';
  reviewedBy?: number;
  rejectionReason?: string;
}

export interface KYCStats {
  totalKYC: number;
  pendingKYC: number;
  successfulKYC: number;
  failedKYC: number;
  approvalRate: number;
}

// KYC Fee types
export interface KYCFee {
  id: number;
  minerId: number;
  amount: number;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  miner?: User;
}

export interface CreateKYCFeeData {
  minerId: number;
  amount: number;
}

export interface KYCFeeStats {
  totalFees: number;
  unpaidFees: number;
  paidFees: number;
  totalRevenue: number;
  pendingRevenue: number;
  collectionRate: number;
}

// Email types
export interface SendEmailData {
  to: string | number;
  subject: string;
  message: string;
  type?: 'general' | 'notification' | 'alert';
}

export interface SendBulkEmailData {
  userIds: number[];
  subject: string;
  message: string;
}

export interface SendGroupEmailData {
  subject: string;
  message: string;
}

export interface BulkEmailResult {
  sent: number;
  failed: number;
}
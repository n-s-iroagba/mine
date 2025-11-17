import { MiningSubscription } from "./subscription";

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
export interface ApiError{
response:{
data:{
  message:string
}
}
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phone?: string;
  role?: 'admin' | 'miner';
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    phone?: string;
    role: 'admin' | 'miner';

    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

// User types
export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  phone?: string;
  role: 'admin' | 'miner';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserData {
  firstname?: string;
  lastname?: string;
  phone?: string;
}

// Admin Wallet types
export interface AdminWallet {
  id: number;
  currencyAbbreviation: string;
  logo: string;
  address: string;
  currency: string;
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
  id:number;
  miningServerId: number;
  periodReturn: number;
  period: 'daily' | 'weekly' | 'fortnightly' | 'monthly'
  minimumDeposit:number
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMiningContractData {
  miningServerId: number;
  periodReturn: number;
  minimumDeposit:number
  period: 'daily' | 'weekly' | 'fortnightly' | 'monthly';
  
}

export interface UpdateMiningContractData {
  miningServerId?: number;
  periodReturn?: number;
  minimumDeposit:number
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

    createdAt: string;
    miningContract: MiningContract;
  }>;
}

// Transaction types
export interface Transaction {
  id: number;
  amountInUSD: number;
  paymentMethod: string;
  entityId: number;
  entity: 'subscription' | 'kyc';
  status: | 'pending' | 'successful' | 'failed';
  minerId: number;
  createdAt: string;
  updatedAt: string;
  miner?: User;
}

export interface CreateTransactionData {
  amountInUSD: number;
  paymentMethod: string;
  entityId: number;
  entity: 'subscription' | 'kyc';
  minerId: number;
reciept:string
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

export interface Miner {
  id: number;
  userId: number;
  firstname: string;
  lastname: string;
  country: string;
  age: number;
  phone: string;
  walletAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface Earning {
  id: number;
  miningSubscriptionId: number;
  amount: number;
  date: string; // ISO string format
  createdAt: string;
  updatedAt: string;
  
  // Optional nested relationships (if included in API responses)
  miningSubscription?: MiningSubscription;
}

export interface EarningCreationAttributes {
  miningSubscriptionId: number;
  amount: number;
  date: string; 
  shouldSendEmail:boolean
}

export interface EarningUpdateAttributes {
  amount?: number;
  date?: string;
}

// Earning Statistics/Summary Types
export interface EarningSummary {
  totalEarnings: number;
  totalEarningsThisMonth: number;
  earningsGrowth: number; // percentage
  recentEarnings: Earning[];
}

export interface SubscriptionEarnings {
  subscriptionId: number;
  subscriptionName?: string;
  totalEarnings: number;
  earnings: Earning[];
  currency: string;
}

export interface EarningsChartData {
  date: string;
  earnings: number;
  subscriptionCount: number;
}

export interface EarningsFilter {
  startDate?: string;
  endDate?: string;
  miningSubscriptionId?: number;
  minerId?: number;
}

// Earning API Response Types
export interface EarningsResponse {
  earnings: Earning[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EarningStatsResponse {
  totalEarnings: number;
  averageDailyEarnings: number;
  earningsThisMonth: number;
  earningsGrowth: number;
  chartData: EarningsChartData[];
}

// Request Payload Types
export interface CreateEarningRequest {
  miningSubscriptionId: number;
  amount: number;
  date: string;
}

export interface UpdateEarningRequest {
  amount?: number;
  date?: string;
}

export interface EarningsQueryParams {
  startDate?: string;
  endDate?: string;
  miningSubscriptionId?: number;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ContractAndServer extends MiningContract{
    miningServer:MiningServer
}
export interface FullSubscription extends MiningSubscription{
    earnings:Earning[]
    contract:ContractAndServer
    miner:Miner

}
import { TransactionRepository, MiningSubscriptionRepository, UserRepository } from '../repositories';
import { AppError, BaseService, CryptoHelper, EmailHelper, NotFoundError, ValidationError } from './utils';

import { TransactionAttributes } from '../models/Transaction';

export interface CreateTransactionData {
  amountInUSD: number;
  entityId: number;
  entity: 'subscription' | 'kyc';
  minerId: number;
}

export interface UpdateTransactionStatusData {
  status: 'initialized' | 'pending' | 'successful' | 'failed';
}

export class TransactionService extends BaseService {
  private transactionRepository: TransactionRepository;
  private miningSubscriptionRepository: MiningSubscriptionRepository;
  private userRepository: UserRepository;

  constructor() {
    super('TransactionService');
    this.transactionRepository = new TransactionRepository();
    this.miningSubscriptionRepository = new MiningSubscriptionRepository();
    this.userRepository = new UserRepository();
  }

  async createTransaction(transactionData: CreateTransactionData): Promise<TransactionAttributes> {
    try {
      this.logInfo('Creating transaction', { 
        minerId: transactionData.minerId,
        entity: transactionData.entity,
        amount: transactionData.amountInUSD
      });

      this.validateRequiredFields(transactionData, ['amountInUSD', 'entityId', 'entity', 'minerId']);

      // Validate miner exists
      const miner = await this.userRepository.findById(transactionData.minerId);
      if (!miner) {
        throw new NotFoundError('Miner');
      }

      // Validate entity based on type
      if (transactionData.entity === 'subscription') {
        const subscription = await this.miningSubscriptionRepository.findById(transactionData.entityId);
        if (!subscription) {
          throw new NotFoundError('Mining subscription');
        }
      }

      // Validate amount is positive
      if (transactionData.amountInUSD <= 0) {
        throw new ValidationError('Amount must be positive');
      }

      // Validate entity type
      if (!['subscription', 'kyc'].includes(transactionData.entity)) {
        throw new ValidationError('Invalid entity type');
      }

      const transaction = await this.transactionRepository.create({
        ...transactionData,
    
        status: 'initialized',
      });

      this.logInfo('Transaction created successfully', { transactionId: transaction.id });

      return transaction.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to create transaction');
    }
  }

  async getAllTransactions(): Promise<TransactionAttributes[]> {
    try {
      this.logInfo('Fetching all transactions');
      const transactions = await this.transactionRepository.findAllWithMiner();
      return transactions.map(transaction => transaction.get({ plain: true }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch transactions');
    }
  }

  async getTransactionById(id: number): Promise<TransactionAttributes> {
    try {
      this.logInfo('Fetching transaction by ID', { transactionId: id });
      const transaction = await this.transactionRepository.findById(id);

      if (!transaction) {
        throw new NotFoundError('Transaction');
      }

      return transaction.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to fetch transaction');
    }
  }

  async getTransactionsByMinerId(minerId: number): Promise<TransactionAttributes[]> {
    try {
      this.logInfo('Fetching transactions by miner ID', { minerId });

      // Validate miner exists
      const miner = await this.userRepository.findById(minerId);
      if (!miner) {
        throw new NotFoundError('Miner');
      }

      const transactions = await this.transactionRepository.findByMinerId(minerId);
      return transactions.map(transaction => transaction.get({ plain: true }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch transactions by miner ID');
    }
  }

  async updateTransactionStatus(id: number, statusData: UpdateTransactionStatusData): Promise<TransactionAttributes> {
    try {
      this.logInfo('Updating transaction status', { transactionId: id, status: statusData.status });

      const transaction = await this.transactionRepository.findById(id);
      if (!transaction) {
        throw new NotFoundError('Transaction');
      }

  

      const updatedTransaction = await this.transactionRepository.updateStatus(id, statusData.status);
      
      if (!updatedTransaction) {
        throw new AppError('Failed to update transaction status');
      }

      // If transaction is successful and is for subscription, handle subscription activation
      if (statusData.status === 'successful' && transaction.entity === 'subscription') {
        await this.handleSuccessfulSubscriptionPayment(transaction.entityId);
      }

      // Send email notification for successful transactions
      if (statusData.status === 'successful') {
        const miner = await this.userRepository.findById(transaction.minerId);
        if (miner) {
          await EmailHelper.sendEmail({
            to: miner.email,
            subject: 'Payment Confirmed',
            html: EmailHelper.generatePaymentConfirmationEmail(
              `${miner.firstName} ${miner.lastName}`,
              transaction.amountInUSD,
              transaction.entity
            ),
          });
        }
      }

  
      return updatedTransaction!.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to update transaction status');
    }
  }

  async getTransactionsByStatus(status: string): Promise<TransactionAttributes[]> {
    try {
      this.logInfo('Fetching transactions by status', { status });

    

      const transactions = await this.transactionRepository.findByStatus(status);
      return transactions.map(transaction => transaction.get({ plain: true }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch transactions by status');
    }
  }

  private async handleSuccessfulSubscriptionPayment(subscriptionId: number): Promise<void> {
    try {
      const subscription = await this.miningSubscriptionRepository.findById(subscriptionId);
      if (subscription && !subscription.isActive) {
        await this.miningSubscriptionRepository.update(subscriptionId, { isActive: true });
        this.logInfo('Subscription activated after successful payment', { subscriptionId });
      }
    } catch (error) {
      this.logError('Failed to activate subscription after payment', error);
    }
  }

  async getTransactionStats(): Promise<any> {
    try {
      this.logInfo('Fetching transaction statistics');

      const allTransactions = await this.transactionRepository.findAll();
      const successfulTransactions = allTransactions.filter(t => t.status === 'successful');
      const pendingTransactions = allTransactions.filter(t => t.status === 'pending');
      const failedTransactions = allTransactions.filter(t => t.status === 'failed');

      const totalVolume = successfulTransactions.reduce((sum, t) => sum + t.amountInUSD, 0);
      const subscriptionTransactions = allTransactions.filter(t => t.entity === 'subscription');
      const kycTransactions = allTransactions.filter(t => t.entity === 'kyc');

      return {
        totalTransactions: allTransactions.length,
        successfulTransactions: successfulTransactions.length,
        pendingTransactions: pendingTransactions.length,
        failedTransactions: failedTransactions.length,
        totalVolume,
        subscriptionTransactions: subscriptionTransactions.length,
        kycTransactions: kycTransactions.length,
        successRate: allTransactions.length > 0 ? (successfulTransactions.length / allTransactions.length) * 100 : 0,
      };
    } catch (error) {
      this.handleError(error, 'Failed to fetch transaction statistics');
    }
  }
}
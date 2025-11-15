import { TransactionRepository, MiningSubscriptionRepository, UserRepository, KYCFeeRepository, MiningContractRepository } from '../repositories';
import { BadRequestError, BaseService, EmailHelper, NotFoundError, ValidationError } from './utils';
import Transaction, { TransactionAttributes } from '../models/Transaction';
import Miner from '../models/Miner';
import { KYC, KYCFee, MiningContract } from '../models';
import { DepositStatus } from '../models/MiningSubscription';

export interface CreateTransactionData {
  amountInUSD: number;
  entityId: number;
  entity: 'subscription' | 'kyc';
  minerId: number;
  reciept: string;
}

export interface UpdateTransactionStatusData {
  status: 'pending' | 'successful' | 'failed';
  amountInUSD: number;
}

export class TransactionService extends BaseService {
  private transactionRepository: TransactionRepository;
  private miningSubscriptionRepository: MiningSubscriptionRepository;
  private userRepository: UserRepository;
  private kycFeeRepository: KYCFeeRepository;
  private miningContractRepository: MiningContractRepository;

  constructor() {
    super('TransactionService');
    this.transactionRepository = new TransactionRepository();
    this.miningSubscriptionRepository = new MiningSubscriptionRepository();
    this.userRepository = new UserRepository();
    this.kycFeeRepository = new KYCFeeRepository();
    this.miningContractRepository = new MiningContractRepository();
  }

  async createTransaction(transactionData: CreateTransactionData): Promise<TransactionAttributes> {
    try {
      this.logInfo('Creating transaction', {
        minerId: transactionData.minerId,
        entity: transactionData.entity,
        amount: transactionData.amountInUSD
      });

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
      } else if (transactionData.entity === 'kyc') {
        const kyc = await this.kycFeeRepository.findById(transactionData.entityId);
        if (!kyc) {
          throw new NotFoundError('Kyc fee not found');
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

      // Update deposit status to pending
      if (transactionData.entity === 'subscription') {
        await this.miningSubscriptionRepository.update(transactionData.entityId, {
          depositStatus: DepositStatus.PENDING
        });
      } else if (transactionData.entity === 'kyc') {
        await this.kycFeeRepository.update(transactionData.entityId, {
          depositStatus: DepositStatus.PENDING
        });
      }

      const transaction = await this.transactionRepository.create({
        ...transactionData,
        status: 'pending',
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
    console.log(statusData)
    try {
      this.logInfo('Updating transaction status', { transactionId: id, status: statusData.status });

      const transaction = await this.transactionRepository.findById(id);
      if (!transaction) {
        throw new NotFoundError('Transaction');
      }

      transaction.amountInUSD = statusData.amountInUSD;

      // If transaction is successful, handle the payment
      if (statusData.status === 'successful') {
        transaction.status = 'successful';
        await transaction.save();

        if (transaction.entity === 'subscription') {
       
          await this.handleSuccessfulSubscriptionPayment(transaction.entityId, statusData.amountInUSD,transaction);
        } else if (transaction.entity === 'kyc') {
          await this.handleSuccessfulKycPayment(transaction.entityId, statusData.amountInUSD, transaction.createdAt);
        }else{
          throw new BadRequestError('Transaction entity not found')
        }

        // Send email notification for successful transactions
        const miner = await Miner.findByPk(transaction.minerId);
        if (miner) {
          const user = await this.userRepository.findById(miner.userId);
          if (user) {
            await EmailHelper.sendEmail({
              to: user.email,
              subject: 'Payment Confirmed',
              html: EmailHelper.generatePaymentConfirmationEmail(
                `${miner.firstname} ${miner.lastname}`,
                transaction.amountInUSD,
                transaction.entity
              ),
            });
          }
        }
      } else if (statusData.status === 'failed') {
        transaction.status = 'failed';
        await transaction.save();

        // Reset deposit status if payment failed
        if (transaction.entity === 'subscription') {
          await this.miningSubscriptionRepository.update(transaction.entityId, {
            depositStatus: DepositStatus.NO_DEPOSIT
          });
        } else if (transaction.entity === 'kyc') {
          await this.kycFeeRepository.update(transaction.entityId, {
            depositStatus: DepositStatus.NO_DEPOSIT
          });
        }
      }

      return transaction.get({ plain: true });
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

  private async handleSuccessfulSubscriptionPayment(subscriptionId: number, amountDeposited: number,transaction:Transaction): Promise<void> {
    try {
      const subscription = await this.miningSubscriptionRepository.findById(subscriptionId);
      if (!subscription) {
        throw new NotFoundError('Mining subscription');
      }

      const miningContract = await this.miningContractRepository.findById(subscription.miningContractId);
      if (!miningContract) {
        throw new NotFoundError('Mining contract');
      }
      
      // Calculate total deposited amount
      const totalDeposited = subscription.amountDeposited + amountDeposited;

      // Determine deposit status based on amount comparison
      let depositStatus: DepositStatus;
      if (totalDeposited >= miningContract.minimumDeposit) {
        depositStatus = DepositStatus.COMPLETE_DEPOSIT;
      } else if (totalDeposited > 0) {
        depositStatus = DepositStatus.INCOMPLETE;
      } else {
        depositStatus = DepositStatus.NO_DEPOSIT;
      }
      if(!subscription.amountDeposited||subscription.amountDeposited===0){
        subscription.dateOfFirstPayment = transaction.createdAt
      }
      // Update subscription with new amount and status
       
        subscription.amountDeposited =totalDeposited,
        subscription.depositStatus = depositStatus
      
       await subscription.save()
      this.logInfo('Subscription payment processed successfully', {
        subscriptionId,
        amountDeposited,
        totalDeposited,
        depositStatus
      });
    } catch (error) {
      this.logError('Failed to process subscription payment', error);
      throw error;
    }
  }

  private async handleSuccessfulKycPayment(kycId: number, amountDeposited: number, time: Date): Promise<void> {
    try {
      const kycFee = await this.kycFeeRepository.findById(kycId);
      if (!kycFee) {
        throw new NotFoundError('KYC fee');
      }

      // Update KYC fee payment details
      await this.kycFeeRepository.update(kycId, {
        amount: amountDeposited,
        depositStatus: DepositStatus.COMPLETE_DEPOSIT,
        paidAt: time
      });

      this.logInfo('KYC payment processed successfully', { kycId, amountDeposited });
    } catch (error) {
      this.logError('Failed to process KYC payment', error);
      throw error;
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
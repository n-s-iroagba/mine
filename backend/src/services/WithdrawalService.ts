// services/WithdrawalService.ts

import MiningSubscription from '../models/MiningSubscription';
import Miner from '../models/Miner';
import User from '../models/User';
import { WithdrawalAttributes, WithdrawalCreationAttributes } from '../models/WithdrawalRequest';
import WithdrawalRepository from '../repositories/WithdrawalRequestRepository';

export interface CreateWithdrawalData {
  minerId: number;
  subscriptionId: number;
  type: 'deposit' | 'earnings';
  amount: number;
  currency: string;
}

export interface UpdateWithdrawalStatusData {
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  rejectionReason?: string;
  processedBy?: number;
  transactionHash?: string;
}

class WithdrawalService {
  private withdrawalRepository: WithdrawalRepository;

  constructor() {
    this.withdrawalRepository = new WithdrawalRepository();
  }

  async createWithdrawal(data: CreateWithdrawalData): Promise<WithdrawalAttributes> {
    // Validate subscription and miner
    const subscription = await MiningSubscription.findOne({
      where: { id: data.subscriptionId, minerId: data.minerId },
      include: [{
        model: Miner,
        as: 'miner',
      }],
    });

    if (!subscription) {
      throw new Error('Subscription not found or does not belong to miner');
    }

    // Validate withdrawal amount
    if (data.type === 'deposit' && data.amount > subscription.amountDeposited) {
      throw new Error('Withdrawal amount exceeds available deposit');
    }

    if (data.type === 'earnings' && data.amount > subscription.earnings) {
      throw new Error('Withdrawal amount exceeds available earnings');
    }

    if (data.amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }

    const withdrawalData: WithdrawalCreationAttributes = {
      ...data,
      status: 'pending',
    };

    return this.withdrawalRepository.create(withdrawalData);
  }

  async getWithdrawalById(id: number): Promise<WithdrawalAttributes | null> {
    return this.withdrawalRepository.findById(id, {
      include: [
        {
          model: Miner,
          as: 'miner',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email'],
          }],
        },
        {
          model: MiningSubscription,
          as: 'subscription',
          attributes: ['id', 'miningContractId', 'amountDeposited', 'earnings', 'isActive'],
        },
      ],
    });
  }

  async getMinerWithdrawals(minerId: number): Promise<WithdrawalAttributes[]> {
    return this.withdrawalRepository.findByMinerId(minerId, {
      include: [{
        model: MiningSubscription,
        as: 'subscription',
        attributes: ['id', 'miningContractId'],
      }],
      order: [['createdAt', 'DESC']],
    });
  }

  async getAllWithdrawals(filters?: any): Promise<WithdrawalAttributes[]> {
    return this.withdrawalRepository.findAllWithFilters(filters, {
      include: [
        {
          model: Miner,
          as: 'miner',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email'],
          }],
        },
        {
          model: MiningSubscription,
          as: 'subscription',
          attributes: ['id', 'miningContractId'],
        },
        {
          model: User,
          as: 'processor',
          attributes: ['id', 'username'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async updateWithdrawalStatus(
    id: number, 
    data: UpdateWithdrawalStatusData
  ): Promise<WithdrawalAttributes | null> {
    const withdrawal = await this.getWithdrawalById(id);
    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    // If approving, validate that subscription has sufficient funds
    if (data.status === 'approved' && withdrawal.status === 'pending') {
      const subscription = await MiningSubscription.findByPk(withdrawal.subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (withdrawal.type === 'deposit' && withdrawal.amount > subscription.amountDeposited) {
        throw new Error('Insufficient deposit balance for withdrawal');
      }

      if (withdrawal.type === 'earnings' && withdrawal.amount > subscription.earnings) {
        throw new Error('Insufficient earnings balance for withdrawal');
      }
    }

    return this.withdrawalRepository.update(id, data);
  }

  async getWithdrawalStats() {
    return this.withdrawalRepository.getWithdrawalStats();
  }

  async cancelWithdrawal(id: number, minerId: number): Promise<WithdrawalAttributes | null> {
    const withdrawal = await this.withdrawalRepository.findOne({
      id,
      minerId,
      status: 'pending',
    });

    if (!withdrawal) {
      throw new Error('Withdrawal not found or cannot be cancelled');
    }

    return this.withdrawalRepository.update(id, { status: 'rejected', rejectionReason: 'Cancelled by user' });
  }
}

export default WithdrawalService;
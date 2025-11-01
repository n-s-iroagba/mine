// repositories/WithdrawalRepository.ts
import Withdrawal from '../models/WithdrawalRequest';
import BaseRepository from './BaseRepository';

import { FindAllOptions } from './BaseRepository';

export interface WithdrawalFilters {
  status?: string;
  minerId?: number;
  type?: 'deposit' | 'earnings';
  startDate?: string;
  endDate?: string;
}

class WithdrawalRepository extends BaseRepository<Withdrawal> {
  constructor() {
    super(Withdrawal);
  }

  async findAllWithFilters(
    filters: WithdrawalFilters = {},
    options: FindAllOptions<Withdrawal> = {}
  ): Promise<Withdrawal[]> {
    const {
      status,
      minerId,
      type,
      startDate,
      endDate,
      ...otherFilters
    } = filters;

    const where: any = {};

    if (status) where.status = status;
    if (minerId) where.minerId = minerId;
    if (type) where.type = type;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.$gte = new Date(startDate);
      if (endDate) where.createdAt.$lte = new Date(endDate);
    }

    return this.findAll({
      where,
      ...options,
      ...otherFilters,
    });
  }

  async findByMinerId(minerId: number, options: FindAllOptions<Withdrawal> = {}): Promise<Withdrawal[]> {
    return this.findAllWithFilters({ minerId }, options);
  }

  async findByStatus(status: string, options: FindAllOptions<Withdrawal> = {}): Promise<Withdrawal[]> {
    return this.findAllWithFilters({ status }, options);
  }

  async getWithdrawalStats(): Promise<{
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    totalProcessing: number;
    totalCompleted: number;
    totalAmountPending: number;
    totalAmountCompleted: number;
  }> {
    const result = await this.model.sequelize!.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as "totalPending",
        COUNT(*) FILTER (WHERE status = 'approved') as "totalApproved",
        COUNT(*) FILTER (WHERE status = 'rejected') as "totalRejected",
        COUNT(*) FILTER (WHERE status = 'processing') as "totalProcessing",
        COUNT(*) FILTER (WHERE status = 'completed') as "totalCompleted",
        COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as "totalAmountPending",
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as "totalAmountCompleted"
      FROM withdrawals
    `);

    return result[0][0] as any;
  }
}

export default WithdrawalRepository;
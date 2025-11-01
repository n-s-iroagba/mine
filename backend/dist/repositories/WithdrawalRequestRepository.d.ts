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
declare class WithdrawalRepository extends BaseRepository<Withdrawal> {
    constructor();
    findAllWithFilters(filters?: WithdrawalFilters, options?: FindAllOptions<Withdrawal>): Promise<Withdrawal[]>;
    findByMinerId(minerId: number, options?: FindAllOptions<Withdrawal>): Promise<Withdrawal[]>;
    findByStatus(status: string, options?: FindAllOptions<Withdrawal>): Promise<Withdrawal[]>;
    getWithdrawalStats(): Promise<{
        totalPending: number;
        totalApproved: number;
        totalRejected: number;
        totalProcessing: number;
        totalCompleted: number;
        totalAmountPending: number;
        totalAmountCompleted: number;
    }>;
}
export default WithdrawalRepository;
//# sourceMappingURL=WithdrawalRequestRepository.d.ts.map
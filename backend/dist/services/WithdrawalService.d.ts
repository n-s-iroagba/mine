import { WithdrawalAttributes } from '../models/WithdrawalRequest';
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
declare class WithdrawalService {
    private withdrawalRepository;
    constructor();
    createWithdrawal(data: CreateWithdrawalData): Promise<WithdrawalAttributes>;
    getWithdrawalById(id: number): Promise<WithdrawalAttributes | null>;
    getMinerWithdrawals(minerId: number): Promise<WithdrawalAttributes[]>;
    getAllWithdrawals(filters?: any): Promise<WithdrawalAttributes[]>;
    updateWithdrawalStatus(id: number, data: UpdateWithdrawalStatusData): Promise<WithdrawalAttributes | null>;
    getWithdrawalStats(): Promise<{
        totalPending: number;
        totalApproved: number;
        totalRejected: number;
        totalProcessing: number;
        totalCompleted: number;
        totalAmountPending: number;
        totalAmountCompleted: number;
    }>;
    cancelWithdrawal(id: number, minerId: number): Promise<WithdrawalAttributes | null>;
}
export default WithdrawalService;
//# sourceMappingURL=WithdrawalService.d.ts.map
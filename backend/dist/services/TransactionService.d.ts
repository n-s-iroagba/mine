import { BaseService } from './utils';
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
export declare class TransactionService extends BaseService {
    private transactionRepository;
    private miningSubscriptionRepository;
    private userRepository;
    constructor();
    createTransaction(transactionData: CreateTransactionData): Promise<TransactionAttributes>;
    getAllTransactions(): Promise<TransactionAttributes[]>;
    getTransactionById(id: number): Promise<TransactionAttributes>;
    getTransactionsByMinerId(minerId: number): Promise<TransactionAttributes[]>;
    updateTransactionStatus(id: number, statusData: UpdateTransactionStatusData): Promise<TransactionAttributes>;
    getTransactionsByStatus(status: string): Promise<TransactionAttributes[]>;
    private handleSuccessfulSubscriptionPayment;
    getTransactionStats(): Promise<any>;
}
//# sourceMappingURL=TransactionService.d.ts.map
import { Transaction } from '../models';
import { BaseRepository } from './BaseRepository';
export interface ITransactionRepository {
    findByMinerId(minerId: number): Promise<Transaction[]>;
    findByStatus(status: string): Promise<Transaction[]>;
    updateStatus(id: number, status: string): Promise<Transaction | null>;
    findAllWithMiner(): Promise<Transaction[]>;
}
export declare class TransactionRepository extends BaseRepository<Transaction> implements ITransactionRepository {
    constructor();
    findByMinerId(minerId: number): Promise<Transaction[]>;
    findByStatus(status: string): Promise<Transaction[]>;
    updateStatus(id: number, status: "initialized" | "pending" | "successful" | 'failed'): Promise<Transaction | null>;
    findAllWithMiner(): Promise<Transaction[]>;
}
//# sourceMappingURL=TransactionRepository.d.ts.map
import { Bank } from '../models';
import { BaseRepository } from './BaseRepository';
export interface IBankRepository {
    findByAccountNumber(accountNumber: string): Promise<Bank | null>;
    findByName(name: string): Promise<Bank | null>;
    findAllActive(): Promise<Bank[]>;
}
export declare class BankRepository extends BaseRepository<Bank> implements IBankRepository {
    constructor();
    findByAccountNumber(accountNumber: string): Promise<Bank | null>;
    findByName(name: string): Promise<Bank | null>;
    findAllActive(): Promise<Bank[]>;
}
//# sourceMappingURL=BankRepository.d.ts.map
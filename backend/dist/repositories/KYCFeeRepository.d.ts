import { KYCFee } from '../models';
import { BaseRepository } from './BaseRepository';
export interface IKYCFeeRepository {
    findByMinerId(minerId: number): Promise<KYCFee | null>;
    findByPaidStatus(isPaid: boolean): Promise<KYCFee[]>;
    markAsPaid(id: number): Promise<KYCFee | null>;
    findAllWithMiner(): Promise<KYCFee[]>;
}
export declare class KYCFeeRepository extends BaseRepository<KYCFee> implements IKYCFeeRepository {
    constructor();
    findByMinerId(minerId: number): Promise<KYCFee | null>;
    findByPaidStatus(isPaid: boolean): Promise<KYCFee[]>;
    markAsPaid(id: number): Promise<KYCFee | null>;
    findAllWithMiner(): Promise<KYCFee[]>;
}
//# sourceMappingURL=KYCFeeRepository.d.ts.map
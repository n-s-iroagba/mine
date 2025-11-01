import { KYC } from '../models';
import { BaseRepository } from './BaseRepository';
export interface IKYCRepository {
    findByMinerId(minerId: number): Promise<KYC | null>;
    findByStatus(status: string): Promise<KYC[]>;
    updateStatus(id: number, status: string, reviewedBy?: number, rejectionReason?: string): Promise<KYC | null>;
    findAllWithMiner(): Promise<KYC[]>;
}
export declare class KYCRepository extends BaseRepository<KYC> implements IKYCRepository {
    constructor();
    findByMinerId(minerId: number): Promise<KYC | null>;
    findByStatus(status: string): Promise<KYC[]>;
    updateStatus(id: number, status: string, reviewedBy?: number, rejectionReason?: string): Promise<KYC | null>;
    findAllWithMiner(): Promise<KYC[]>;
}
//# sourceMappingURL=KYCRepository.d.ts.map
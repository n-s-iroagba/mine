import { BaseService } from './utils';
import { KYCAttributes } from '../models/KYC';
export interface CreateKYCData {
    minerId: number;
    idCard: string;
}
export interface UpdateKYCStatusData {
    status: 'pending' | 'successful' | 'failed';
    reviewedBy?: number;
    rejectionReason?: string;
}
export declare class KYCService extends BaseService {
    private kycRepository;
    private userRepository;
    private kycFeeRepository;
    constructor();
    createKYCRequest(kycData: CreateKYCData): Promise<KYCAttributes>;
    getAllKYCRequests(): Promise<KYCAttributes[]>;
    getKYCRequestById(id: number): Promise<KYCAttributes>;
    getKYCByMinerId(minerId: number): Promise<KYCAttributes | null>;
    updateKYCStatus(id: number, statusData: UpdateKYCStatusData): Promise<KYCAttributes>;
    getKYCByStatus(status: string): Promise<KYCAttributes[]>;
    getKYCStats(): Promise<any>;
}
//# sourceMappingURL=KYCService.d.ts.map
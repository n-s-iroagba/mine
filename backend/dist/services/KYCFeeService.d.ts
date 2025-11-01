import { BaseService } from './utils';
import { KYCFeeAttributes } from '../models/KYCFee';
export interface CreateKYCFeeData {
    minerId: number;
    amount: number;
}
export declare class KYCFeeService extends BaseService {
    private kycFeeRepository;
    private userRepository;
    constructor();
    createKYCFee(feeData: CreateKYCFeeData): Promise<KYCFeeAttributes>;
    getAllKYCFees(): Promise<KYCFeeAttributes[]>;
    getKYCFeeById(id: number): Promise<KYCFeeAttributes>;
    getKYCFeeByMinerId(minerId: number): Promise<KYCFeeAttributes | null>;
    markFeeAsPaid(id: number): Promise<KYCFeeAttributes>;
    getUnpaidFees(): Promise<KYCFeeAttributes[]>;
    getPaidFees(): Promise<KYCFeeAttributes[]>;
    getKYCFeeStats(): Promise<any>;
}
//# sourceMappingURL=KYCFeeService.d.ts.map
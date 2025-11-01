import { BaseService } from './utils';
import { BankAttributes } from '../models/Bank';
export interface CreateBankData {
    name: string;
    accountNumber: string;
    accountName: string;
    branch?: string;
    swiftCode?: string;
}
export interface UpdateBankData {
    name?: string;
    accountNumber?: string;
    accountName?: string;
    branch?: string;
    swiftCode?: string;
    isActive?: boolean;
}
export declare class BankService extends BaseService {
    private bankRepository;
    constructor();
    createBank(bankData: CreateBankData): Promise<BankAttributes>;
    getAllBanks(): Promise<BankAttributes[]>;
    getBankById(id: number): Promise<BankAttributes>;
    updateBank(id: number, updateData: UpdateBankData): Promise<BankAttributes>;
    deleteBank(id: number): Promise<void>;
    getActiveBanks(): Promise<BankAttributes[]>;
}
//# sourceMappingURL=BankService.d.ts.map
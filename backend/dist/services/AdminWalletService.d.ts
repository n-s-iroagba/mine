import { BaseService } from './utils';
import { AdminWalletAttributes } from '../models/AdminWallet';
export interface CreateAdminWalletData {
    currencyAbbreviation: string;
    logo: string;
    address: string;
    currency: string;
}
export interface UpdateAdminWalletData {
    currencyAbbreviation?: string;
    logo?: string;
    address?: string;
    currency?: string;
    isActive?: boolean;
}
export declare class AdminWalletService extends BaseService {
    private adminWalletRepository;
    constructor();
    createWallet(walletData: CreateAdminWalletData): Promise<AdminWalletAttributes>;
    getAllWallets(): Promise<AdminWalletAttributes[]>;
    getWalletById(id: number): Promise<AdminWalletAttributes>;
    updateWallet(id: number, updateData: UpdateAdminWalletData): Promise<AdminWalletAttributes>;
    deleteWallet(id: number): Promise<void>;
    getActiveWallets(): Promise<AdminWalletAttributes[]>;
    getWalletByCurrency(currency: string): Promise<AdminWalletAttributes | null>;
}
//# sourceMappingURL=AdminWalletService.d.ts.map
import { AdminWallet } from '../models';
import { BaseRepository } from './BaseRepository';
export interface IAdminWalletRepository {
    findByCurrency(currency: string): Promise<AdminWallet | null>;
    findByAddress(address: string): Promise<AdminWallet | null>;
    findAllActive(): Promise<AdminWallet[]>;
}
export declare class AdminWalletRepository extends BaseRepository<AdminWallet> implements IAdminWalletRepository {
    constructor();
    findByCurrency(currency: string): Promise<AdminWallet | null>;
    findByAddress(address: string): Promise<AdminWallet | null>;
    findAllActive(): Promise<AdminWallet[]>;
}
//# sourceMappingURL=AdminWalletRepository.d.ts.map
import { BaseService } from './utils';
import { MiningContractAttributes } from '../models/MiningContract';
export interface CreateMiningContractData {
    miningServerId: number;
    periodReturn: number;
    period: 'daily' | 'weekly' | 'fortnightly' | 'monthly';
}
export interface UpdateMiningContractData {
    miningServerId?: number;
    periodReturn?: number;
    period?: 'daily' | 'weekly' | 'fortnightly' | 'monthly';
    isActive?: boolean;
}
export declare class MiningContractService extends BaseService {
    private miningContractRepository;
    private miningServerRepository;
    constructor();
    createContract(contractData: CreateMiningContractData): Promise<MiningContractAttributes>;
    getAllContracts(): Promise<MiningContractAttributes[]>;
    getContractById(id: number): Promise<MiningContractAttributes>;
    updateContract(id: number, updateData: UpdateMiningContractData): Promise<MiningContractAttributes>;
    deleteContract(id: number): Promise<void>;
    getContractsByServerId(serverId: number): Promise<MiningContractAttributes[]>;
    getContractsByPeriod(period: string): Promise<MiningContractAttributes[]>;
}
//# sourceMappingURL=MiningContractService.d.ts.map
import { BaseService } from './utils';
import { MiningServerAttributes } from '../models/MiningServer';
export interface CreateMiningServerData {
    name: string;
    hashRate: string;
    powerConsumptionInKwH: string;
}
export interface UpdateMiningServerData {
    name?: string;
    hashRate?: string;
    powerConsumptionInKwH?: string;
    isActive?: boolean;
}
export declare class MiningServerService extends BaseService {
    private miningServerRepository;
    constructor();
    createServer(serverData: CreateMiningServerData): Promise<MiningServerAttributes>;
    getAllServers(): Promise<MiningServerAttributes[]>;
    getServerById(id: number): Promise<MiningServerAttributes>;
    updateServer(id: number, updateData: UpdateMiningServerData): Promise<MiningServerAttributes>;
    deleteServer(id: number): Promise<void>;
    getAllServersWithContracts(): Promise<MiningServerAttributes[]>;
}
//# sourceMappingURL=MiningServerService.d.ts.map
import { MiningContract } from "../models";
import BaseRepository from "./BaseRepository";
export interface IMiningContractRepository {
    findByServerId(serverId: number): Promise<MiningContract[]>;
    findByIdWithServer(id: number): Promise<MiningContract | null>;
    findAllWithServer(): Promise<MiningContract[]>;
    findByPeriod(period: string): Promise<MiningContract[]>;
}
export declare class MiningContractRepository extends BaseRepository<MiningContract> implements IMiningContractRepository {
    constructor();
    findByServerId(serverId: number): Promise<MiningContract[]>;
    findByIdWithServer(id: number): Promise<MiningContract | null>;
    findAllWithServer(): Promise<MiningContract[]>;
    findByPeriod(period: string): Promise<MiningContract[]>;
}
//# sourceMappingURL=MiningContractRepository.d.ts.map
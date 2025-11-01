import { MiningServer } from '../models';
import { BaseRepository } from './BaseRepository';
export interface IMiningServerRepository {
    findByName(name: string): Promise<MiningServer | null>;
    findAllWithContracts(): Promise<MiningServer[]>;
}
export declare class MiningServerRepository extends BaseRepository<MiningServer> implements IMiningServerRepository {
    constructor();
    findByName(name: string): Promise<MiningServer | null>;
    findAllWithContracts(): Promise<MiningServer[]>;
}
//# sourceMappingURL=MiningServerRepository.d.ts.map
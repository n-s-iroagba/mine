import { MiningContract, MiningSubscription } from '../models';
import { BaseRepository } from './BaseRepository';
export interface FullSubscriptionDetails extends MiningSubscription {
    miningContract: MiningContract;
}
export interface IMiningSubscriptionRepository {
    findByMinerId(minerId: number): Promise<MiningSubscription[]>;
    findByIdWithDetails(id: number): Promise<MiningSubscription | null>;
    findAllWithDetails(): Promise<MiningSubscription[]>;
    findByMinerIdWithDetails(minerId: number): Promise<MiningSubscription[]>;
    updateEarnings(id: number, earnings: number): Promise<MiningSubscription | null>;
}
export declare class MiningSubscriptionRepository extends BaseRepository<MiningSubscription> implements IMiningSubscriptionRepository {
    constructor();
    findByMinerId(minerId: number): Promise<MiningSubscription[]>;
    findByIdWithDetails(id: number): Promise<FullSubscriptionDetails | null>;
    findAllWithDetails(): Promise<MiningSubscription[]>;
    findByMinerIdWithDetails(minerId: number): Promise<FullSubscriptionDetails[]>;
    updateEarnings(id: number, earnings: number): Promise<MiningSubscription | null>;
}
//# sourceMappingURL=MiningSubscriptionRepository.d.ts.map
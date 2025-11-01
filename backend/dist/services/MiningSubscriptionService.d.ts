import { BaseService } from './utils';
import { MiningSubscriptionAttributes, MiningSubscriptionCreationAttributes } from '../models/MiningSubscription';
export interface CreateMiningSubscriptionData {
    miningContractId: number;
    amountDeposited: number;
    minerId: number;
    shouldUpdateAutomatically?: boolean;
}
export interface UpdateEarningsData {
    earnings: number;
}
export declare class MiningSubscriptionService extends BaseService {
    private miningSubscriptionRepository;
    private miningContractRepository;
    private userRepository;
    constructor();
    createSubscription(subscriptionData: MiningSubscriptionCreationAttributes): Promise<MiningSubscriptionAttributes>;
    getAllSubscriptions(): Promise<MiningSubscriptionAttributes[]>;
    getSubscriptionById(id: number): Promise<MiningSubscriptionAttributes>;
    getSubscriptionsByMinerId(minerId: number): Promise<MiningSubscriptionAttributes[]>;
    updateEarnings(id: number, earningsData: UpdateEarningsData): Promise<MiningSubscriptionAttributes>;
    calculateEarnings(id: number, days?: number): Promise<number>;
    processDailyEarnings(): Promise<void>;
    getMinerDashboard(minerId: number): Promise<any>;
    deactivateSubscription(id: number): Promise<void>;
}
//# sourceMappingURL=MiningSubscriptionService.d.ts.map
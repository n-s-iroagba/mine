import { Model, Optional } from 'sequelize';
export interface MiningSubscriptionAttributes {
    id: number;
    miningContractId: number;
    amountDeposited: number;
    shouldUpdateAutomatically: boolean;
    earnings: number;
    minerId: number;
    currency: string;
    symbol: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface MiningSubscriptionCreationAttributes extends Optional<MiningSubscriptionAttributes, 'id' | 'shouldUpdateAutomatically' | 'earnings' | 'isActive' | 'createdAt' | 'updatedAt' | 'amountDeposited'> {
}
declare class MiningSubscription extends Model<MiningSubscriptionAttributes, MiningSubscriptionCreationAttributes> implements MiningSubscriptionAttributes {
    id: number;
    miningContractId: number;
    amountDeposited: number;
    shouldUpdateAutomatically: boolean;
    earnings: number;
    minerId: number;
    currency: string;
    symbol: string;
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default MiningSubscription;
//# sourceMappingURL=MiningSubscription.d.ts.map
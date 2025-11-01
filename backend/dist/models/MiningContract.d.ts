import { Model, Optional } from 'sequelize';
export interface MiningContractAttributes {
    id: number;
    miningServerId: number;
    periodReturn: number;
    period: 'daily' | 'weekly' | 'fortnightly' | 'monthly';
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface MiningContractCreationAttributes extends Optional<MiningContractAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {
}
declare class MiningContract extends Model<MiningContractAttributes, MiningContractCreationAttributes> implements MiningContractAttributes {
    id: number;
    miningServerId: number;
    periodReturn: number;
    period: 'daily' | 'weekly' | 'fortnightly' | 'monthly';
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default MiningContract;
//# sourceMappingURL=MiningContract.d.ts.map
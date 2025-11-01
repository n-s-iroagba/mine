import { Model, Optional } from 'sequelize';
export interface MiningServerAttributes {
    id: number;
    name: string;
    hashRate: string;
    powerConsumptionInKwH: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface MiningServerCreationAttributes extends Optional<MiningServerAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {
}
declare class MiningServer extends Model<MiningServerAttributes, MiningServerCreationAttributes> implements MiningServerAttributes {
    id: number;
    name: string;
    hashRate: string;
    powerConsumptionInKwH: string;
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default MiningServer;
//# sourceMappingURL=MiningServer.d.ts.map
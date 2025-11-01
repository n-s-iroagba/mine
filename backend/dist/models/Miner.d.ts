import { Model, Optional } from 'sequelize';
export interface MinerAttributes {
    id: number;
    userId: number;
    firstname: string;
    lastname: string;
    country: string;
    age: number;
    phone: string;
    walletAddress?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface MinerCreationAttributes extends Optional<MinerAttributes, 'id' | 'isActive' | 'walletAddress' | 'createdAt' | 'updatedAt'> {
}
declare class Miner extends Model<MinerAttributes, MinerCreationAttributes> implements MinerAttributes {
    id: number;
    userId: number;
    firstname: string;
    lastname: string;
    country: string;
    age: number;
    phone: string;
    walletAddress?: string;
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Miner;
//# sourceMappingURL=Miner.d.ts.map
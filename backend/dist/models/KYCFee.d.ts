import { Model, Optional } from 'sequelize';
export interface KYCFeeAttributes {
    id: number;
    minerId: number;
    amount: number;
    isPaid: boolean;
    paidAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface KYCFeeCreationAttributes extends Optional<KYCFeeAttributes, 'id' | 'isPaid' | 'paidAt' | 'createdAt' | 'updatedAt'> {
}
declare class KYCFee extends Model<KYCFeeAttributes, KYCFeeCreationAttributes> implements KYCFeeAttributes {
    id: number;
    minerId: number;
    amount: number;
    isPaid: boolean;
    paidAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default KYCFee;
//# sourceMappingURL=KYCFee.d.ts.map
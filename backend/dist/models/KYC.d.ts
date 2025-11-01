import { Model, Optional } from 'sequelize';
export interface KYCAttributes {
    id: number;
    minerId: number;
    idCard: string;
    status: 'pending' | 'successful' | 'failed';
    reviewedBy?: number;
    reviewedAt?: Date;
    rejectionReason?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface KYCCreationAttributes extends Optional<KYCAttributes, 'id' | 'status' | 'reviewedBy' | 'reviewedAt' | 'rejectionReason' | 'createdAt' | 'updatedAt'> {
}
declare class KYC extends Model<KYCAttributes, KYCCreationAttributes> implements KYCAttributes {
    id: number;
    minerId: number;
    idCard: string;
    status: 'pending' | 'successful' | 'failed';
    reviewedBy?: number;
    reviewedAt?: Date;
    rejectionReason?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default KYC;
//# sourceMappingURL=KYC.d.ts.map
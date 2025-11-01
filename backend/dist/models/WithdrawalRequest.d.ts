import { Model, Optional } from 'sequelize';
export interface WithdrawalAttributes {
    id: number;
    minerId: number;
    subscriptionId: number;
    type: 'deposit' | 'earnings';
    amount: number;
    currency: string;
    status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
    rejectionReason?: string;
    transactionHash?: string;
    processedBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface WithdrawalCreationAttributes extends Optional<WithdrawalAttributes, 'id' | 'status' | 'rejectionReason' | 'transactionHash' | 'processedBy' | 'createdAt' | 'updatedAt'> {
}
declare class Withdrawal extends Model<WithdrawalAttributes, WithdrawalCreationAttributes> implements WithdrawalAttributes {
    id: number;
    minerId: number;
    subscriptionId: number;
    type: 'deposit' | 'earnings';
    amount: number;
    currency: string;
    status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
    rejectionReason?: string;
    transactionHash?: string;
    processedBy?: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Withdrawal;
//# sourceMappingURL=WithdrawalRequest.d.ts.map
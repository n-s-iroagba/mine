import { Model, Optional } from 'sequelize';
export interface TransactionAttributes {
    id: number;
    amountInUSD: number;
    entityId: number;
    entity: 'subscription' | 'kyc';
    status: 'initialized' | 'pending' | 'successful' | 'failed';
    minerId: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {
}
declare class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
    id: number;
    amountInUSD: number;
    entityId: number;
    entity: 'subscription' | 'kyc';
    status: 'initialized' | 'pending' | 'successful' | 'failed';
    minerId: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Transaction;
//# sourceMappingURL=Transaction.d.ts.map
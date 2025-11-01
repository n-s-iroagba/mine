import { Model, Optional } from 'sequelize';
export interface BankAttributes {
    id: number;
    name: string;
    accountNumber: string;
    accountName: string;
    branch?: string;
    swiftCode?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface BankCreationAttributes extends Optional<BankAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {
}
declare class Bank extends Model<BankAttributes, BankCreationAttributes> implements BankAttributes {
    id: number;
    name: string;
    accountNumber: string;
    accountName: string;
    branch?: string;
    swiftCode?: string;
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Bank;
//# sourceMappingURL=Bank.d.ts.map
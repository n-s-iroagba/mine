import { Model, Optional } from 'sequelize';
export interface AdminWalletAttributes {
    id: number;
    currencyAbbreviation: string;
    logo: string;
    address: string;
    currency: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface AdminWalletCreationAttributes extends Optional<AdminWalletAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {
}
declare class AdminWallet extends Model<AdminWalletAttributes, AdminWalletCreationAttributes> implements AdminWalletAttributes {
    id: number;
    currencyAbbreviation: string;
    logo: string;
    address: string;
    currency: string;
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default AdminWallet;
//# sourceMappingURL=AdminWallet.d.ts.map
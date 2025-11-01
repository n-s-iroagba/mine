import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

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

export interface AdminWalletCreationAttributes extends Optional<AdminWalletAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class AdminWallet extends Model<AdminWalletAttributes, AdminWalletCreationAttributes> implements AdminWalletAttributes {
  public id!: number;
  public currencyAbbreviation!: string;
  public logo!: string;
  public address!: string;
  public currency!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AdminWallet.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    currencyAbbreviation: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    logo: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    currency: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'admin_wallets',
    modelName: 'AdminWallet',

  }
);

export default AdminWallet;
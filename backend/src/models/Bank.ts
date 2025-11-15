import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface BankAttributes {
  id: number;
  name: string;
  accountNumber: string;
  accountName: string;
  branch?: string;
  swiftCode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BankCreationAttributes extends Optional<BankAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Bank extends Model<BankAttributes, BankCreationAttributes> implements BankAttributes {
  public id!: number;
  public name!: string;
  public accountNumber!: string;
  public accountName!: string;
  public branch?: string;
  public swiftCode?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Bank.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    accountNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    accountName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    branch: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    swiftCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
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
    tableName: 'banks',
    modelName: 'Bank',

  }
);

export default Bank;
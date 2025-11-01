import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

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

export interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: number;
  public amountInUSD!: number
  public entityId!: number;
  public entity!: 'subscription' | 'kyc';
  public status!: 'initialized' | 'pending' | 'successful' | 'failed';
  public minerId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amountInUSD: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },

    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    entity: {
      type: DataTypes.ENUM('subscription', 'kyc'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('initialized', 'pending', 'successful', 'failed'),
      allowNull: false,
      defaultValue: 'initialized',
    },
    minerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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
    tableName: 'transactions',
    modelName: 'Transaction',

  }
);

export default Transaction;
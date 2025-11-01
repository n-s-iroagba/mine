// models/Withdrawal.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

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

export interface WithdrawalCreationAttributes extends Optional<
  WithdrawalAttributes, 
  'id' | 'status' | 'rejectionReason' | 'transactionHash' | 'processedBy' | 'createdAt' | 'updatedAt'
> {}

class Withdrawal extends Model<WithdrawalAttributes, WithdrawalCreationAttributes> implements WithdrawalAttributes {
  public id!: number;
  public minerId!: number;
  public subscriptionId!: number;
  public type!: 'deposit' | 'earnings';
  public amount!: number;
  public currency!: string;
  public status!: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  public rejectionReason?: string;
  public transactionHash?: string;
  public processedBy?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Withdrawal.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    minerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'miners',
        key: 'id',
      },
    },
    subscriptionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'mining_subscriptions',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('deposit', 'earnings'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'USD',
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'processing', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    transactionHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    processedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: 'withdrawals',
    modelName: 'Withdrawal',
   
  }
);

export default Withdrawal;
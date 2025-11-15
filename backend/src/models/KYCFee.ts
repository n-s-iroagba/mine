import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { DepositStatus } from './MiningSubscription';

export interface KYCFeeAttributes {
  id: number;
  minerId: number;
  amount: number;
  depositStatus: DepositStatus;
  paidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface KYCFeeCreationAttributes extends Optional<KYCFeeAttributes, 'id' | 'depositStatus' | 'paidAt' | 'createdAt' | 'updatedAt'> {}

class KYCFee extends Model<KYCFeeAttributes, KYCFeeCreationAttributes> implements KYCFeeAttributes {
  public id!: number;
  public minerId!: number;
  public amount!: number;
  public depositStatus!: DepositStatus;
  public paidAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

KYCFee.init(
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
        model: 'users',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    depositStatus: {
      type: DataTypes.ENUM(
        DepositStatus.NO_DEPOSIT,
        DepositStatus.PENDING,
        DepositStatus.INCOMPLETE,
        DepositStatus.COMPLETE_DEPOSIT
      ),
      allowNull: false,
      defaultValue: DepositStatus.NO_DEPOSIT,
    },
    paidAt: {
      type: DataTypes.DATE,
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
    tableName: 'kyc_fees',
    modelName: 'KYCFee',
  
  }
);

export default KYCFee;
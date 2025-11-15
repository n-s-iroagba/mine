import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum DepositStatus {
  NO_DEPOSIT = "no deposit",
  PENDING = 'deposit pending approval',
  INCOMPLETE = 'incomplete deposit',
  COMPLETE_DEPOSIT = 'complete deposit'
}

export interface MiningSubscriptionAttributes {
  id: number;
  miningContractId: number;
  amountDeposited: number;
  shouldUpdateAutomatically: boolean;
  totalEarnings: number;
  minerId: number;
  currency: string;
  symbol: string;
  dateOfFirstPayment:Date
  depositStatus: DepositStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MiningSubscriptionCreationAttributes extends Optional<MiningSubscriptionAttributes, 'id' | 'shouldUpdateAutomatically' | 'totalEarnings' | 'depositStatus' | 'createdAt' | 'updatedAt' | 'amountDeposited'|'dateOfFirstPayment'> {}

class MiningSubscription extends Model<MiningSubscriptionAttributes, MiningSubscriptionCreationAttributes> implements MiningSubscriptionAttributes {
  public id!: number;
  public miningContractId!: number;
  public amountDeposited!: number;
  public shouldUpdateAutomatically!: boolean;
   public dateOfFirstPayment!:Date
  public totalEarnings!: number;
  public minerId!: number;
  public currency!: string;
  public symbol!: string;
  public depositStatus!: DepositStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MiningSubscription.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    miningContractId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'mining_contracts',
        key: 'id',
      },
    },
    amountDeposited: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    shouldUpdateAutomatically: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    totalEarnings: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    minerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
    },
      dateOfFirstPayment: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue:null
  
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
    tableName: 'mining_subscriptions',
    modelName: 'MiningSubscription',
  }
);

export default MiningSubscription;
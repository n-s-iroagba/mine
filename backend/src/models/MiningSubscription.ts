import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface MiningSubscriptionAttributes {
  id: number;
  miningContractId: number;
  amountDeposited: number;
  shouldUpdateAutomatically: boolean;
  earnings: number;
  minerId: number;
  currency:string
  symbol:string
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MiningSubscriptionCreationAttributes extends Optional<MiningSubscriptionAttributes, 'id' | 'shouldUpdateAutomatically' | 'earnings' | 'isActive' | 'createdAt' | 'updatedAt'|'amountDeposited'> {}

class MiningSubscription extends Model<MiningSubscriptionAttributes, MiningSubscriptionCreationAttributes> implements MiningSubscriptionAttributes {
  public id!: number;
  public miningContractId!: number;
  public amountDeposited!: number;
  public shouldUpdateAutomatically!: boolean;
  public earnings!: number;
  public minerId!: number;
  public currency!:string;
    public symbol!:string;
  public isActive!: boolean;
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
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    shouldUpdateAutomatically: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    earnings: {
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
    currency: {
      type:DataTypes.STRING,
    },
        symbol: {
      type:DataTypes.STRING,
    },

  },
  {
    sequelize,
    tableName: 'mining_subscriptions',
    modelName: 'MiningSubscription',
  }
);

export default MiningSubscription;
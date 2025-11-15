import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface EarningAttributes {
  id: number;
  miningSubscriptionId: number;
  amount: number;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EarningCreationAttributes extends Optional<EarningAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Earning extends Model<EarningAttributes, EarningCreationAttributes> implements EarningAttributes {
  public id!: number;
  public miningSubscriptionId!: number;
  public amount!: number;
  public date!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Earning.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    miningSubscriptionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'mining_subscriptions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
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
    tableName: 'earnings',
    modelName: 'Earning',
  }
);

export default Earning;
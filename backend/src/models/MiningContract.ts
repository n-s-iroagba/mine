import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface MiningContractAttributes {
  id: number;
  miningServerId: number;
  periodReturn: number;
  period: 'daily' | 'weekly' | 'fortnightly' | 'monthly';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MiningContractCreationAttributes extends Optional<MiningContractAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class MiningContract extends Model<MiningContractAttributes, MiningContractCreationAttributes> implements MiningContractAttributes {
  public id!: number;
  public miningServerId!: number;
  public periodReturn!: number;
  public period!: 'daily' | 'weekly' | 'fortnightly' | 'monthly';
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
 
MiningContract.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    miningServerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'mining_servers',
        key: 'id',
      },
    },
    periodReturn: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    period: {
      type: DataTypes.ENUM('daily', 'weekly', 'fortnightly', 'monthly'),
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
    tableName: 'mining_contracts',
    modelName: 'MiningContract',
  }
);

export default MiningContract;
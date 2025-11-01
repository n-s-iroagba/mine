import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface MiningServerAttributes {
  id: number;
  name: string;
  hashRate: string;
  powerConsumptionInKwH: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MiningServerCreationAttributes extends Optional<MiningServerAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class MiningServer extends Model<MiningServerAttributes, MiningServerCreationAttributes> implements MiningServerAttributes {
  public id!: number;
  public name!: string;
  public hashRate!: string;
  public powerConsumptionInKwH!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MiningServer.init(
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
    hashRate: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    powerConsumptionInKwH: {
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
    tableName: 'mining_servers',
    modelName: 'MiningServer',
  }
);

export default MiningServer;
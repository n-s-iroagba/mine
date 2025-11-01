import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface MinerAttributes {
  id: number;
  userId: number;
  firstname: string;
  lastname: string;
  country: string;
  age: number;
  phone: string;
  walletAddress?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MinerCreationAttributes extends Optional<MinerAttributes, 
  | 'id'
  | 'isActive'
  | 'walletAddress'
  | 'createdAt'
  | 'updatedAt'
> {}

class Miner extends Model<MinerAttributes, MinerCreationAttributes> implements MinerAttributes {
  public id!: number;
  public userId!: number;
  public firstname!: string;
  public lastname!: string;
  public country!: string;
  public age!: number;
  public phone!: string;
  public walletAddress?: string;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Miner.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      unique: true,
    },
    firstname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50],
      },
    },
    lastname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50],
      },
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 18,
        max: 100,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[+]?[1-9][\d]{0,15}$/,
      },
    },
    walletAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    tableName: 'miners',
    modelName: 'Miner',
 
  }
);

export default Miner;
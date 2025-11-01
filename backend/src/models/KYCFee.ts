import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface KYCFeeAttributes {
  id: number;
  minerId: number;
  amount: number;
  isPaid: boolean;
  paidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface KYCFeeCreationAttributes extends Optional<KYCFeeAttributes, 'id' | 'isPaid' | 'paidAt' | 'createdAt' | 'updatedAt'> {}

class KYCFee extends Model<KYCFeeAttributes, KYCFeeCreationAttributes> implements KYCFeeAttributes {
  public id!: number;
  public minerId!: number;
  public amount!: number;
  public isPaid!: boolean;
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
    isPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
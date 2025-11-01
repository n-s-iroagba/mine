import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface KYCAttributes {
  id: number;
  minerId: number;
  idCard: string;
  status: 'pending' | 'successful' | 'failed';
  reviewedBy?: number;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface KYCCreationAttributes extends Optional<KYCAttributes, 'id' | 'status' | 'reviewedBy' | 'reviewedAt' | 'rejectionReason' | 'createdAt' | 'updatedAt'> {}

class KYC extends Model<KYCAttributes, KYCCreationAttributes> implements KYCAttributes {
  public id!: number;
  public minerId!: number;
  public idCard!: string;
  public status!: 'pending' | 'successful' | 'failed';
  public reviewedBy?: number;
  public reviewedAt?: Date;
  public rejectionReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

KYC.init(
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
    idCard: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'successful', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
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
    tableName: 'kyc',
    modelName: 'KYC',

  }
);

export default KYC;
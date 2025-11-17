import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface EarningStatusAttributes {

  dateOfLastUpdate:Date
  updatedAt?: Date;
}

export interface EarningStatusCreationAttributes extends Optional<EarningStatusAttributes, 'updatedAt'> {}

class EarningStatus extends Model<EarningStatusAttributes, EarningStatusCreationAttributes> implements EarningStatusAttributes {
  public id!: number;
  public dateOfLastUpdate!:Date
  public readonly updatedAt!: Date;
}

EarningStatus.init(
  {
   
    dateOfLastUpdate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'earning_status',
    modelName: 'EarningStatus',
  }
);

export default EarningStatus;
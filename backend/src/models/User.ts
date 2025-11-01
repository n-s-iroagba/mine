import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface UserAttributes {
  id: number
  username: string
  email: string
  password: string
  role:'admin'|'miner'
  isEmailVerified: boolean
  verificationCode?: string | null
  verificationToken?: string | null
  passwordResetToken?: string | null
  refreshToken?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface UserCreationAttributes extends Optional<UserAttributes, 
    | 'id'
    | 'isEmailVerified'
    | 'verificationCode'
    | 'verificationToken'
    | 'passwordResetToken'
    | 'createdAt'
    | 'refreshToken'
    | 'updatedAt'
    | 'password'
> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number
  public username!: string
  public email!: string
  public password!: string
  public role!:'admin'|'miner'
  public isEmailVerified!: boolean
  public verificationToken!: string | null
  public refreshToken?: string | null
  public verificationCode!: string | null
  public passwordResetToken!: string | null


  // timestamps
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationToken: {
      type: DataTypes.STRING(400),
      allowNull: true,
    },
    verificationCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    passwordResetToken: {
      type: DataTypes.STRING(400),
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.STRING(400),
      allowNull: true,
    },

    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type:DataTypes.STRING,
      allowNull:true,
    }
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
 
  }
);

export default User;
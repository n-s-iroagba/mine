import { Model, Optional } from 'sequelize';
export interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'miner';
    isEmailVerified: boolean;
    verificationCode?: string | null;
    verificationToken?: string | null;
    passwordResetToken?: string | null;
    refreshToken?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'isEmailVerified' | 'verificationCode' | 'verificationToken' | 'passwordResetToken' | 'createdAt' | 'refreshToken' | 'updatedAt' | 'password'> {
}
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: number;
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'miner';
    isEmailVerified: boolean;
    verificationToken: string | null;
    refreshToken?: string | null;
    verificationCode: string | null;
    passwordResetToken: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default User;
//# sourceMappingURL=User.d.ts.map
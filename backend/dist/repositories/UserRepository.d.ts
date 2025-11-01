import { FindOptions } from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { User } from '../models';
export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    findMiners(options?: FindOptions): Promise<User[]>;
    findAdmins(options?: FindOptions): Promise<User[]>;
}
export declare class UserRepository extends BaseRepository<User> implements IUserRepository {
    constructor();
    findByEmail(email: string): Promise<User | null>;
    findMiners(options?: FindOptions): Promise<User[]>;
    findAdmins(options?: FindOptions): Promise<User[]>;
}
//# sourceMappingURL=UserRepository.d.ts.map
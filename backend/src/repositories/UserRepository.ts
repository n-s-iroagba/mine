import { FindOptions } from 'sequelize';

import { BaseRepository } from './BaseRepository';
import { User } from '../models';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findMiners(options?: FindOptions): Promise<User[]>;
  findAdmins(options?: FindOptions): Promise<User[]>;

}

export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.findOne(
    { email },
      );
    } catch (error) {
      throw new Error(`Error finding user by email ${email}: ${error}`);
    }
  }

  async findMiners(options?: FindOptions): Promise<User[]> {
    try {
      const minerOptions: FindOptions = {
        where: { role: 'miner' },
        ...options,
      };
      return await this.findAll(minerOptions);
    } catch (error) {
      throw new Error(`Error finding miners: ${error}`);
    }
  }

  async findAdmins(options?: FindOptions): Promise<User[]> {
    try {
      const adminOptions: FindOptions = {
        where: { role: 'admin' },
        ...options,
      };
      return await this.findAll(adminOptions);
    } catch (error) {
      throw new Error(`Error finding admins: ${error}`);
    }
  }


}
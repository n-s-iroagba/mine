
import { MiningServer } from '../models';
import { BaseRepository } from './BaseRepository';

export interface IMiningServerRepository {
  findByName(name: string): Promise<MiningServer | null>;
  findAllWithContracts(): Promise<MiningServer[]>;
}

export class MiningServerRepository extends BaseRepository<MiningServer> implements IMiningServerRepository {
  constructor() {
    super(MiningServer);
  }

  async findByName(name: string): Promise<MiningServer | null> {
    try {
      return await this.findOne( { name },
      );
    } catch (error) {
      throw new Error(`Error finding server by name ${name}: ${error}`);
    }
  }

  async findAllWithContracts(): Promise<MiningServer[]> {
    try {
      return await this.findAll({
        include: [
          {
            association: 'miningContracts',
            where: { isActive: true },
            required: false,
          },
        ],
        order: [['name', 'ASC']],
      });
    } catch (error) {
      throw new Error(`Error finding servers with contracts: ${error}`);
    }
  }
}
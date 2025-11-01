import { MiningContract } from "../models";
import BaseRepository from "./BaseRepository";


export interface IMiningContractRepository {
  findByServerId(serverId: number): Promise<MiningContract[]>;
  findByIdWithServer(id: number): Promise<MiningContract | null>;
  findAllWithServer(): Promise<MiningContract[]>;
  findByPeriod(period: string): Promise<MiningContract[]>;
}

export class MiningContractRepository extends BaseRepository<MiningContract> implements IMiningContractRepository {
  constructor() {
    super(MiningContract);
  }

  async findByServerId(serverId: number): Promise<MiningContract[]> {
    try {
      return await this.findAll({
        where: { miningServerId: serverId },
        include: ['miningServer'],
      });
    } catch (error) {
      throw new Error(`Error finding contracts by server ID ${serverId}: ${error}`);
    }
  }

  async findByIdWithServer(id: number): Promise<MiningContract | null> {
    try {
      return await this.findOne({ id },
        {include: ['miningServer'],
      });
    } catch (error) {
      throw new Error(`Error finding contract by ID ${id} with server: ${error}`);
    }
  }

  async findAllWithServer(): Promise<MiningContract[]> {
    try {
      return await this.findAll({
        include: ['miningServer'],
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      throw new Error(`Error finding all contracts with server: ${error}`);
    }
  }

  async findByPeriod(period: string): Promise<MiningContract[]> {
    try {
      return await this.findAll({
        where: { period },
        include: ['miningServer'],
      });
    } catch (error) {
      throw new Error(`Error finding contracts by period ${period}: ${error}`);
    }
  }
}

import Miner from "../models/Miner";
import BaseRepository from "./BaseRepository";


export interface IMinerRepository {
 
}

export class MinerRepository extends BaseRepository<Miner> implements IMinerRepository {
  constructor() {
    super(Miner);
  }
}
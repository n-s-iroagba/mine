
import Earning from "../models/Earning";
import BaseRepository from "./BaseRepository";



export class EarningRepository extends BaseRepository<Earning>{
  constructor() {
    super(Earning);
  }
}
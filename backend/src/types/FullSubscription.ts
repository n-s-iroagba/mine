import { MiningContract, MiningServer } from "../models";
import Earning from "../models/Earning";
import Miner from "../models/Miner";
import MiningSubscription from "../models/MiningSubscription";
export interface ContractAndServer extends MiningContract{
    miningServer:MiningServer
}
export interface FullSubscription extends MiningSubscription{
    earnings:Earning[]
    contract:ContractAndServer
    miner:Miner

}
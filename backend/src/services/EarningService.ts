
import { EarningAttributes, EarningCreationAttributes } from '../models/Earning';
import { EarningRepository } from '../repositories/EarningRepository';
import { AppError, BaseService, NotFoundError } from './utils';




export class EarningService extends BaseService {
  private earningRepository: EarningRepository;

  constructor() {
    super('EarningService');
    this.earningRepository = new EarningRepository();
  }
   async createEarning(data:EarningCreationAttributes){
    try{
      await this.earningRepository.create(data)
    }catch(error){
    this.handleError(error)
   }
  }

  async getAllBySubscripitionId(id:string): Promise<EarningAttributes[]> {
    try {
      this.logInfo('Fetching all earnings');
      const earnings = await this.earningRepository.findAll({
        where:{miningSubscriptionId:id},
        order: [['createdA', 'ASC']],
      });
      return earnings.map(earning => earning.get({ plain: true }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch earnings');
    }
  }



  async updateEarning(id: number, updateData: any): Promise<EarningAttributes> {
    try {
      this.logInfo('Updating earning', { earningId: id, updateData });

      const earning = await this.earningRepository.findById(id);
      if (!earning) {
        throw new NotFoundError('Earning');
      }

      const updatedEarning = await this.earningRepository.update(id, updateData);
      
      if (!updatedEarning) {
        throw new AppError('Failed to update earning');
      }

      return updatedEarning!.get({ plain: true });
    } catch (error) {
      this.handleError(error, 'Failed to update earning');
    }
  }

  async deleteEarning(id: number): Promise<void> {
    try {
      this.logInfo('Deleting earning', { earningId: id });

      const earning = await this.earningRepository.findById(id);
      if (!earning) {
        throw new NotFoundError('Earning');
      }

      await this.earningRepository.deleteById(id);

      this.logInfo('Earning deleted successfully', { earningId: id });
    } catch (error) {
      this.handleError(error, 'Failed to delete earning');
    }
  }


}
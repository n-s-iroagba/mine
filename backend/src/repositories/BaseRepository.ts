import {
  Model,
  ModelStatic,
  CreateOptions,
  FindOptions,
  UpdateOptions,
  DestroyOptions,
  CountOptions,
  BulkCreateOptions,
  UpsertOptions,
  FindOrCreateOptions,
  Transaction,
  WhereOptions,
  Attributes,
  CreationAttributes,
  FindAndCountOptions,
  Order,
  Includeable,
} from 'sequelize'

// Interfaces for repository options and responses
interface PaginationOptions {
  limit?: number
  offset?: number
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number | null
  offset: number
  totalPages: number
}

interface FindAllOptions<T extends Model>
  extends Omit<FindAndCountOptions<Attributes<T>>, 'limit' | 'offset'> {
  limit?: number
  offset?: number
}

interface RepositoryFindOptions<T extends Model> extends Omit<FindOptions<Attributes<T>>, 'where'> {
  where?: WhereOptions<Attributes<T>>
}

// Base Repository Class with generic typing
abstract class BaseRepository<T extends Model> {
  protected model: ModelStatic<T>

  constructor(model: ModelStatic<T>) {
    if (!model) {
      throw new Error('Model is required for repository initialization')
    }
    this.model = model
  }

  /**
   * Create a new record
   * @param data - The data to create
   * @param options - Sequelize creation options
   * @returns Promise of created record
   */
  async create(
    data: CreationAttributes<T>,
    options: CreateOptions<Attributes<T>> = {}
  ): Promise<T> {
    try {
      const record = await this.model.create(data, options)
      return record
    } catch (error) {
      throw  error
    }
  }

  /**
   * Find all records with optional filtering, pagination, and sorting
   * @param options - Query options
   * @returns Promise of paginated records with metadata
   */
  async findAll(options: FindAllOptions<T> = {}): Promise<T[]> {
    try {
      const {
        where = {},
        include = [],
        attributes,
        order = [['createdAt', 'DESC']] as Order,
        limit,
        offset,
        distinct = false,
        ...otherOptions
      } = options

      const queryOptions: FindAndCountOptions<Attributes<T>> = {
        where,
        include: include as Includeable[],
        order,
        distinct,
        ...otherOptions,
      }

      if (attributes) queryOptions.attributes = attributes
      if (limit) queryOptions.limit = parseInt(limit.toString())
      if (offset) queryOptions.offset = parseInt(offset.toString())

      const result = await this.model.findAndCountAll(queryOptions)

    //   const parsedLimit = limit ? parseInt(limit.toString()) : null
    //   const parsedOffset = offset ? parseInt(offset.toString()) : 0

      return  result.rows
    //   {
    //     data: result.rows,
    //     total: result.count as number,
    //     limit: parsedLimit,
    //     offset: parsedOffset,
    //     totalPages: parsedLimit ? Math.ceil((result.count as number) / parsedLimit) : 1,
    //   }
    } catch (error) {
      throw new Error(`Error finding ${this.model.name} records: ${(error as Error).message}`)
    }
  }

  /**
   * Find a single record by ID
   * @param id - Record ID
   * @param options - Query options
   * @returns Promise of found record or null
   */
  async findById(id: string | number, options: RepositoryFindOptions<T> = {}): Promise<T | null> {
    try {
      const { include = [], attributes, ...otherOptions } = options

      const queryOptions: FindOptions<Attributes<T>> = {
        where: { id } as unknown as WhereOptions<Attributes<T>>,
        include: include as Includeable[],
        ...otherOptions,
      }

      if (attributes) queryOptions.attributes = attributes

      const record = await this.model.findOne(queryOptions)
      return record
    } catch (error) {
      throw new Error(`Error finding ${this.model.name} by ID: ${(error as Error).message}`)
    }
  }

  /**
   * Find a single record by conditions
   * @param where - Where conditions
   * @param options - Query options
   * @returns Promise of found record or null
   */
  async findOne(
    where: WhereOptions<Attributes<T>> = {},
    options: RepositoryFindOptions<T> = {}
  ): Promise<T | null> {
    try {
      const { include = [], attributes, ...otherOptions } = options

      const queryOptions: FindOptions<Attributes<T>> = {
        where,
        include: include as Includeable[],
        ...otherOptions,
      }

      if (attributes) queryOptions.attributes = attributes

      const record = await this.model.findOne(queryOptions)
      return record
    } catch (error) {
      throw new Error(`Error finding ${this.model.name} record: ${(error as Error).message}`)
    }
  }

  /**
   * Update a record by ID
   * @param id - Record ID
   * @param data - Data to update
   * @param options - Update options
   * @returns Promise of updated record or null
   */
  async update(
    id: string | number,
    data: Partial<Attributes<T>>,
    options: Omit<UpdateOptions<Attributes<T>>, 'where'> = {}
  ): Promise<T | null> {
    try {
      const { returning = true, ...otherOptions } = options

      const updateResult = await this.model.update(data, {
        where: { id } as unknown as WhereOptions<Attributes<T>>,
        returning,
        ...otherOptions,
      } as unknown as UpdateOptions<Attributes<T>>)

      // Handle the result based on whether it's a tuple or just the count
      const updatedRowsCount = Array.isArray(updateResult) ? updateResult[0] : updateResult

      if (updatedRowsCount === 0) {
        return null
      }

      return await this.findById(id)
    } catch (error) {
      throw new Error(`Error updating ${this.model.name}: ${(error as Error).message}`)
    }
  }

  /**
   * Update records by conditions
   * @param where - Where conditions
   * @param data - Data to update
   * @param options - Update options
   * @returns Promise of number of updated records
   */
  async updateWhere(
    where: WhereOptions<Attributes<T>>,
    data: Partial<Attributes<T>>,
    options: Omit<UpdateOptions<Attributes<T>>, 'where'> = {}
  ): Promise<T | null> {
    try {
      const [updatedRowsCount] = await this.model.update(data, {
        where,
        ...options,
      } as unknown as UpdateOptions<Attributes<T>>)

      if (updatedRowsCount === 0) {
        return null
      }

      return await this.findOne(where)
    } catch (error) {
      throw new Error(`Error updating ${this.model.name} records: ${(error as Error).message}`)
    }
  }

  /**
   * Delete a record by ID
   * @param id - Record ID
   * @param options - Delete options
   * @returns Promise of boolean indicating if record was deleted
   */
  async deleteById(
    id: string | number,
    options: Omit<DestroyOptions<Attributes<T>>, 'where'> = {}
  ): Promise<boolean> {
    try {
      const deletedRowsCount = await this.model.destroy({
        where: { id } as unknown as WhereOptions<Attributes<T>>,
        ...options,
      } as unknown as DestroyOptions<Attributes<T>>)

      return deletedRowsCount > 0
    } catch (error) {
      throw new Error(`Error deleting ${this.model.name}: ${(error as Error).message}`)
    }
  }

  /**
   * Delete records by conditions
   * @param where - Where conditions
   * @param options - Delete options
   * @returns Promise of number of deleted records
   */
  async deleteWhere(
    where: WhereOptions<Attributes<T>>,
    options: Omit<DestroyOptions<Attributes<T>>, 'where'> = {}
  ): Promise<number> {
    try {
      const deletedRowsCount = await this.model.destroy({
        where,
        ...options,
      } as unknown as DestroyOptions<Attributes<T>>)

      return deletedRowsCount
    } catch (error) {
      throw new Error(`Error deleting ${this.model.name} records: ${(error as Error).message}`)
    }
  }

  /**
   * Check if record exists by ID
   * @param id - Record ID
   * @returns Promise of boolean indicating if record exists
   */
  async existsById(id: string | number): Promise<boolean> {
    try {
      const count = await this.model.count({
        where: { id } as unknown as WhereOptions<Attributes<T>>,
      } as unknown as CountOptions<Attributes<T>>)
      return count > 0
    } catch (error) {
      throw new Error(`Error checking ${this.model.name} existence: ${(error as Error).message}`)
    }
  }

  /**
   * Count records with optional conditions
   * @param where - Where conditions
   * @param options - Count options
   * @returns Promise of number of records
   */
  async count(
    where: WhereOptions<Attributes<T>> = {},
    options: Omit<CountOptions<Attributes<T>>, 'where'> = {}
  ): Promise<number> {
    try {
      const count = await this.model.count({
        where,
        ...options,
      } as unknown as CountOptions<Attributes<T>>)
      return count
    } catch (error) {
      throw new Error(`Error counting ${this.model.name} records: ${(error as Error).message}`)
    }
  }

  /**
   * Bulk create records
   * @param dataArray - Array of data objects
   * @param options - Bulk create options
   * @returns Promise of array of created records
   */
  async bulkCreate(
    dataArray: CreationAttributes<T>[],
    options: BulkCreateOptions<Attributes<T>> = {}
  ): Promise<T[]> {
    try {
      if (!dataArray || dataArray.length === 0) {
        throw new Error('Data array cannot be empty')
      }

      const records = await this.model.bulkCreate(dataArray, {
        returning: true,
        validate: true,
        ...options,
      })
      return records
    } catch (error) {
      throw new Error(`Error bulk creating ${this.model.name} records: ${(error as Error).message}`)
    }
  }

  /**
   * Bulk update records
   * @param dataArray - Array of data objects with identifiers
   * @param options - Bulk update options
   * @returns Promise of number of updated records
   */
  async bulkUpdate(
    dataArray: Array<Partial<Attributes<T>> & { id: string | number }>,
    options: Omit<UpdateOptions<Attributes<T>>, 'where'> = {}
  ): Promise<number> {
    try {
      if (!dataArray || dataArray.length === 0) {
        throw new Error('Data array cannot be empty')
      }

      let totalUpdated = 0

      // Use transaction for bulk update to ensure atomicity
      await this.model.sequelize!.transaction(async transaction => {
        for (const item of dataArray) {
          const { id, ...updateData } = item
          const [updatedCount] = await this.model.update(
            updateData as Partial<Attributes<T>>,
            {
              where: { id } as unknown as WhereOptions<Attributes<T>>,
              transaction,
              ...options,
            } as unknown as UpdateOptions<Attributes<T>>
          )
          totalUpdated += updatedCount
        }
      })

      return totalUpdated
    } catch (error) {
      throw new Error(`Error bulk updating ${this.model.name} records: ${(error as Error).message}`)
    }
  }

  /**
   * Bulk delete records by IDs
   * @param ids - Array of record IDs
   * @param options - Delete options
   * @returns Promise of number of deleted records
   */
  async bulkDeleteByIds(
    ids: Array<string | number>,
    options: Omit<DestroyOptions<Attributes<T>>, 'where'> = {}
  ): Promise<number> {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('IDs array cannot be empty')
      }

      const deletedCount = await this.model.destroy({
        where: {
          id: ids,
        } as unknown as WhereOptions<Attributes<T>>,
        ...options,
      } as unknown as DestroyOptions<Attributes<T>>)

      return deletedCount
    } catch (error) {
      throw new Error(`Error bulk deleting ${this.model.name} records: ${(error as Error).message}`)
    }
  }

  /**
   * Bulk upsert records (create or update)
   * @param dataArray - Array of data objects
   * @param options - Upsert options with conflict fields
   * @returns Promise of array of [instance, created] tuples
   */
  async bulkUpsert(
    dataArray: CreationAttributes<T>[],
    conflictFields: string[] = ['id'],
    options: Omit<BulkCreateOptions<Attributes<T>>, 'where'> = {}
  ): Promise<Array<[T, boolean]>> {
    try {
      if (!dataArray || dataArray.length === 0) {
        throw new Error('Data array cannot be empty')
      }

      const results: Array<[T, boolean]> = []

      // Use transaction for bulk upsert to ensure atomicity
      await this.model.sequelize!.transaction(async transaction => {
        for (const data of dataArray) {
          // Build where condition based on conflict fields
          const whereCondition: any = {}
          conflictFields.forEach(field => {
            if (data[field as keyof CreationAttributes<T>] !== undefined) {
              whereCondition[field] = data[field as keyof CreationAttributes<T>]
            }
          })

          const [instance, created] = await this.model.findOrCreate({
            where: whereCondition as unknown as WhereOptions<Attributes<T>>,
            defaults: data,
            transaction,
            ...options,
          } as unknown as FindOrCreateOptions<Attributes<T>, CreationAttributes<T>>)

          if (!created) {
            // Update the existing record
            await instance.update(data, { transaction })
          }

          results.push([instance, created])
        }
      })

      return results
    } catch (error) {
      throw new Error(
        `Error bulk upserting ${this.model.name} records: ${(error as Error).message}`
      )
    }
  }

  /**
   * Execute a raw query (use with caution)
   * @param query - SQL query
   * @param options - Query options
   * @returns Promise of query results
   */
  async rawQuery(query: string, options: any = {}): Promise<T[]> {
    try {
      const [results] = await this.model.sequelize!.query(query, {
        model: this.model,
        mapToModel: true,
        ...options,
      })
      return results as unknown as T[]
    } catch (error) {
      throw new Error(`Error executing raw query: ${(error as Error).message}`)
    }
  }

  /**
   * Create or update a record (upsert)
   * @param data - Data to upsert
   * @param options - Upsert options
   * @returns Promise of [instance, created] tuple
   */
  async upsert(
    data: CreationAttributes<T>,
    options: UpsertOptions<Attributes<T>> = {}
  ): Promise<[T, boolean | null]> {
    try {
      const result = await this.model.upsert(data, {
        returning: true,
        ...options,
      })
      return result
    } catch (error) {
      throw new Error(`Error upserting ${this.model.name}: ${(error as Error).message}`)
    }
  }

  /**
   * Find or create a record
   * @param where - Where conditions to find
   * @param defaults - Default values if creating
   * @param options - Additional options
   * @returns Promise of [instance, created] tuple
   */
  async findOrCreate(
    where: WhereOptions<Attributes<T>>,
    defaults: CreationAttributes<T> = {} as CreationAttributes<T>,
    options: Omit<
      FindOrCreateOptions<Attributes<T>, CreationAttributes<T>>,
      'where' | 'defaults'
    > = {}
  ): Promise<[T, boolean]> {
    try {
      const result = await this.model.findOrCreate({
        where,
        defaults,
        ...options,
      } as unknown as FindOrCreateOptions<Attributes<T>, CreationAttributes<T>>)
      return result
    } catch (error) {
      throw new Error(`Error finding or creating ${this.model.name}: ${(error as Error).message}`)
    }
  }

  /**
   * Execute operations within a transaction
   * @param callback - Function to execute within transaction
   * @returns Promise of callback result
   */
  async transaction<R>(callback: (transaction: Transaction) => Promise<R>): Promise<R> {
    try {
      return await this.model.sequelize!.transaction(callback)
    } catch (error) {
      throw new Error(`Error in transaction: ${(error as Error).message}`)
    }
  }

  /**
   * Get the model name
   * @returns Model name
   */
  getModelName(): string {
    return this.model.name
  }

  /**
   * Get the model instance
   * @returns Sequelize model
   */
  getModel(): ModelStatic<T> {
    return this.model
  }
}

export default BaseRepository
export {
  BaseRepository,
  PaginatedResponse,
  FindAllOptions,
  RepositoryFindOptions,
  PaginationOptions,
}
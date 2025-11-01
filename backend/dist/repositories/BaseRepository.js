"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
// Base Repository Class with generic typing
class BaseRepository {
    constructor(model) {
        if (!model) {
            throw new Error('Model is required for repository initialization');
        }
        this.model = model;
    }
    /**
     * Create a new record
     * @param data - The data to create
     * @param options - Sequelize creation options
     * @returns Promise of created record
     */
    async create(data, options = {}) {
        try {
            const record = await this.model.create(data, options);
            return record;
        }
        catch (error) {
            throw new Error(`Error creating ${this.model.name}: ${error.message}`);
        }
    }
    /**
     * Find all records with optional filtering, pagination, and sorting
     * @param options - Query options
     * @returns Promise of paginated records with metadata
     */
    async findAll(options = {}) {
        try {
            const { where = {}, include = [], attributes, order = [['createdAt', 'DESC']], limit, offset, distinct = false, ...otherOptions } = options;
            const queryOptions = {
                where,
                include: include,
                order,
                distinct,
                ...otherOptions,
            };
            if (attributes)
                queryOptions.attributes = attributes;
            if (limit)
                queryOptions.limit = parseInt(limit.toString());
            if (offset)
                queryOptions.offset = parseInt(offset.toString());
            const result = await this.model.findAndCountAll(queryOptions);
            //   const parsedLimit = limit ? parseInt(limit.toString()) : null
            //   const parsedOffset = offset ? parseInt(offset.toString()) : 0
            return result.rows;
            //   {
            //     data: result.rows,
            //     total: result.count as number,
            //     limit: parsedLimit,
            //     offset: parsedOffset,
            //     totalPages: parsedLimit ? Math.ceil((result.count as number) / parsedLimit) : 1,
            //   }
        }
        catch (error) {
            throw new Error(`Error finding ${this.model.name} records: ${error.message}`);
        }
    }
    /**
     * Find a single record by ID
     * @param id - Record ID
     * @param options - Query options
     * @returns Promise of found record or null
     */
    async findById(id, options = {}) {
        try {
            const { include = [], attributes, ...otherOptions } = options;
            const queryOptions = {
                where: { id },
                include: include,
                ...otherOptions,
            };
            if (attributes)
                queryOptions.attributes = attributes;
            const record = await this.model.findOne(queryOptions);
            return record;
        }
        catch (error) {
            throw new Error(`Error finding ${this.model.name} by ID: ${error.message}`);
        }
    }
    /**
     * Find a single record by conditions
     * @param where - Where conditions
     * @param options - Query options
     * @returns Promise of found record or null
     */
    async findOne(where = {}, options = {}) {
        try {
            const { include = [], attributes, ...otherOptions } = options;
            const queryOptions = {
                where,
                include: include,
                ...otherOptions,
            };
            if (attributes)
                queryOptions.attributes = attributes;
            const record = await this.model.findOne(queryOptions);
            return record;
        }
        catch (error) {
            throw new Error(`Error finding ${this.model.name} record: ${error.message}`);
        }
    }
    /**
     * Update a record by ID
     * @param id - Record ID
     * @param data - Data to update
     * @param options - Update options
     * @returns Promise of updated record or null
     */
    async update(id, data, options = {}) {
        try {
            const { returning = true, ...otherOptions } = options;
            const updateResult = await this.model.update(data, {
                where: { id },
                returning,
                ...otherOptions,
            });
            // Handle the result based on whether it's a tuple or just the count
            const updatedRowsCount = Array.isArray(updateResult) ? updateResult[0] : updateResult;
            if (updatedRowsCount === 0) {
                return null;
            }
            return await this.findById(id);
        }
        catch (error) {
            throw new Error(`Error updating ${this.model.name}: ${error.message}`);
        }
    }
    /**
     * Update records by conditions
     * @param where - Where conditions
     * @param data - Data to update
     * @param options - Update options
     * @returns Promise of number of updated records
     */
    async updateWhere(where, data, options = {}) {
        try {
            const [updatedRowsCount] = await this.model.update(data, {
                where,
                ...options,
            });
            if (updatedRowsCount === 0) {
                return null;
            }
            return await this.findOne(where);
        }
        catch (error) {
            throw new Error(`Error updating ${this.model.name} records: ${error.message}`);
        }
    }
    /**
     * Delete a record by ID
     * @param id - Record ID
     * @param options - Delete options
     * @returns Promise of boolean indicating if record was deleted
     */
    async deleteById(id, options = {}) {
        try {
            const deletedRowsCount = await this.model.destroy({
                where: { id },
                ...options,
            });
            return deletedRowsCount > 0;
        }
        catch (error) {
            throw new Error(`Error deleting ${this.model.name}: ${error.message}`);
        }
    }
    /**
     * Delete records by conditions
     * @param where - Where conditions
     * @param options - Delete options
     * @returns Promise of number of deleted records
     */
    async deleteWhere(where, options = {}) {
        try {
            const deletedRowsCount = await this.model.destroy({
                where,
                ...options,
            });
            return deletedRowsCount;
        }
        catch (error) {
            throw new Error(`Error deleting ${this.model.name} records: ${error.message}`);
        }
    }
    /**
     * Check if record exists by ID
     * @param id - Record ID
     * @returns Promise of boolean indicating if record exists
     */
    async existsById(id) {
        try {
            const count = await this.model.count({
                where: { id },
            });
            return count > 0;
        }
        catch (error) {
            throw new Error(`Error checking ${this.model.name} existence: ${error.message}`);
        }
    }
    /**
     * Count records with optional conditions
     * @param where - Where conditions
     * @param options - Count options
     * @returns Promise of number of records
     */
    async count(where = {}, options = {}) {
        try {
            const count = await this.model.count({
                where,
                ...options,
            });
            return count;
        }
        catch (error) {
            throw new Error(`Error counting ${this.model.name} records: ${error.message}`);
        }
    }
    /**
     * Bulk create records
     * @param dataArray - Array of data objects
     * @param options - Bulk create options
     * @returns Promise of array of created records
     */
    async bulkCreate(dataArray, options = {}) {
        try {
            if (!dataArray || dataArray.length === 0) {
                throw new Error('Data array cannot be empty');
            }
            const records = await this.model.bulkCreate(dataArray, {
                returning: true,
                validate: true,
                ...options,
            });
            return records;
        }
        catch (error) {
            throw new Error(`Error bulk creating ${this.model.name} records: ${error.message}`);
        }
    }
    /**
     * Bulk update records
     * @param dataArray - Array of data objects with identifiers
     * @param options - Bulk update options
     * @returns Promise of number of updated records
     */
    async bulkUpdate(dataArray, options = {}) {
        try {
            if (!dataArray || dataArray.length === 0) {
                throw new Error('Data array cannot be empty');
            }
            let totalUpdated = 0;
            // Use transaction for bulk update to ensure atomicity
            await this.model.sequelize.transaction(async (transaction) => {
                for (const item of dataArray) {
                    const { id, ...updateData } = item;
                    const [updatedCount] = await this.model.update(updateData, {
                        where: { id },
                        transaction,
                        ...options,
                    });
                    totalUpdated += updatedCount;
                }
            });
            return totalUpdated;
        }
        catch (error) {
            throw new Error(`Error bulk updating ${this.model.name} records: ${error.message}`);
        }
    }
    /**
     * Bulk delete records by IDs
     * @param ids - Array of record IDs
     * @param options - Delete options
     * @returns Promise of number of deleted records
     */
    async bulkDeleteByIds(ids, options = {}) {
        try {
            if (!ids || ids.length === 0) {
                throw new Error('IDs array cannot be empty');
            }
            const deletedCount = await this.model.destroy({
                where: {
                    id: ids,
                },
                ...options,
            });
            return deletedCount;
        }
        catch (error) {
            throw new Error(`Error bulk deleting ${this.model.name} records: ${error.message}`);
        }
    }
    /**
     * Bulk upsert records (create or update)
     * @param dataArray - Array of data objects
     * @param options - Upsert options with conflict fields
     * @returns Promise of array of [instance, created] tuples
     */
    async bulkUpsert(dataArray, conflictFields = ['id'], options = {}) {
        try {
            if (!dataArray || dataArray.length === 0) {
                throw new Error('Data array cannot be empty');
            }
            const results = [];
            // Use transaction for bulk upsert to ensure atomicity
            await this.model.sequelize.transaction(async (transaction) => {
                for (const data of dataArray) {
                    // Build where condition based on conflict fields
                    const whereCondition = {};
                    conflictFields.forEach(field => {
                        if (data[field] !== undefined) {
                            whereCondition[field] = data[field];
                        }
                    });
                    const [instance, created] = await this.model.findOrCreate({
                        where: whereCondition,
                        defaults: data,
                        transaction,
                        ...options,
                    });
                    if (!created) {
                        // Update the existing record
                        await instance.update(data, { transaction });
                    }
                    results.push([instance, created]);
                }
            });
            return results;
        }
        catch (error) {
            throw new Error(`Error bulk upserting ${this.model.name} records: ${error.message}`);
        }
    }
    /**
     * Execute a raw query (use with caution)
     * @param query - SQL query
     * @param options - Query options
     * @returns Promise of query results
     */
    async rawQuery(query, options = {}) {
        try {
            const [results] = await this.model.sequelize.query(query, {
                model: this.model,
                mapToModel: true,
                ...options,
            });
            return results;
        }
        catch (error) {
            throw new Error(`Error executing raw query: ${error.message}`);
        }
    }
    /**
     * Create or update a record (upsert)
     * @param data - Data to upsert
     * @param options - Upsert options
     * @returns Promise of [instance, created] tuple
     */
    async upsert(data, options = {}) {
        try {
            const result = await this.model.upsert(data, {
                returning: true,
                ...options,
            });
            return result;
        }
        catch (error) {
            throw new Error(`Error upserting ${this.model.name}: ${error.message}`);
        }
    }
    /**
     * Find or create a record
     * @param where - Where conditions to find
     * @param defaults - Default values if creating
     * @param options - Additional options
     * @returns Promise of [instance, created] tuple
     */
    async findOrCreate(where, defaults = {}, options = {}) {
        try {
            const result = await this.model.findOrCreate({
                where,
                defaults,
                ...options,
            });
            return result;
        }
        catch (error) {
            throw new Error(`Error finding or creating ${this.model.name}: ${error.message}`);
        }
    }
    /**
     * Execute operations within a transaction
     * @param callback - Function to execute within transaction
     * @returns Promise of callback result
     */
    async transaction(callback) {
        try {
            return await this.model.sequelize.transaction(callback);
        }
        catch (error) {
            throw new Error(`Error in transaction: ${error.message}`);
        }
    }
    /**
     * Get the model name
     * @returns Model name
     */
    getModelName() {
        return this.model.name;
    }
    /**
     * Get the model instance
     * @returns Sequelize model
     */
    getModel() {
        return this.model;
    }
}
exports.BaseRepository = BaseRepository;
exports.default = BaseRepository;

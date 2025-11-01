import { Model, ModelStatic, CreateOptions, FindOptions, UpdateOptions, DestroyOptions, CountOptions, BulkCreateOptions, UpsertOptions, FindOrCreateOptions, Transaction, WhereOptions, Attributes, CreationAttributes, FindAndCountOptions } from 'sequelize';
interface PaginationOptions {
    limit?: number;
    offset?: number;
}
interface PaginatedResponse<T> {
    data: T[];
    total: number;
    limit: number | null;
    offset: number;
    totalPages: number;
}
interface FindAllOptions<T extends Model> extends Omit<FindAndCountOptions<Attributes<T>>, 'limit' | 'offset'> {
    limit?: number;
    offset?: number;
}
interface RepositoryFindOptions<T extends Model> extends Omit<FindOptions<Attributes<T>>, 'where'> {
    where?: WhereOptions<Attributes<T>>;
}
declare abstract class BaseRepository<T extends Model> {
    protected model: ModelStatic<T>;
    constructor(model: ModelStatic<T>);
    create(data: CreationAttributes<T>, options?: CreateOptions<Attributes<T>>): Promise<T>;
    findAll(options?: FindAllOptions<T>): Promise<T[]>;
    findById(id: string | number, options?: RepositoryFindOptions<T>): Promise<T | null>;
    findOne(where?: WhereOptions<Attributes<T>>, options?: RepositoryFindOptions<T>): Promise<T | null>;
    update(id: string | number, data: Partial<Attributes<T>>, options?: Omit<UpdateOptions<Attributes<T>>, 'where'>): Promise<T | null>;
    updateWhere(where: WhereOptions<Attributes<T>>, data: Partial<Attributes<T>>, options?: Omit<UpdateOptions<Attributes<T>>, 'where'>): Promise<T | null>;
    deleteById(id: string | number, options?: Omit<DestroyOptions<Attributes<T>>, 'where'>): Promise<boolean>;
    deleteWhere(where: WhereOptions<Attributes<T>>, options?: Omit<DestroyOptions<Attributes<T>>, 'where'>): Promise<number>;
    existsById(id: string | number): Promise<boolean>;
    count(where?: WhereOptions<Attributes<T>>, options?: Omit<CountOptions<Attributes<T>>, 'where'>): Promise<number>;
    bulkCreate(dataArray: CreationAttributes<T>[], options?: BulkCreateOptions<Attributes<T>>): Promise<T[]>;
    bulkUpdate(dataArray: Array<Partial<Attributes<T>> & {
        id: string | number;
    }>, options?: Omit<UpdateOptions<Attributes<T>>, 'where'>): Promise<number>;
    bulkDeleteByIds(ids: Array<string | number>, options?: Omit<DestroyOptions<Attributes<T>>, 'where'>): Promise<number>;
    bulkUpsert(dataArray: CreationAttributes<T>[], conflictFields?: string[], options?: Omit<BulkCreateOptions<Attributes<T>>, 'where'>): Promise<Array<[T, boolean]>>;
    rawQuery(query: string, options?: any): Promise<T[]>;
    upsert(data: CreationAttributes<T>, options?: UpsertOptions<Attributes<T>>): Promise<[T, boolean | null]>;
    findOrCreate(where: WhereOptions<Attributes<T>>, defaults?: CreationAttributes<T>, options?: Omit<FindOrCreateOptions<Attributes<T>, CreationAttributes<T>>, 'where' | 'defaults'>): Promise<[T, boolean]>;
    transaction<R>(callback: (transaction: Transaction) => Promise<R>): Promise<R>;
    getModelName(): string;
    getModel(): ModelStatic<T>;
}
export default BaseRepository;
export { BaseRepository, PaginatedResponse, FindAllOptions, RepositoryFindOptions, PaginationOptions, };
//# sourceMappingURL=BaseRepository.d.ts.map
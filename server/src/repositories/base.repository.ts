/**
 * Base Repository Interface
 * Defines common repository operations
 */

export interface IBaseRepository<T, ID> {
  // CRUD Operations
  create(data: Partial<T>): Promise<T>;
  findById(id: ID): Promise<T | null>;
  findAll(options?: any): Promise<T[]>;
  update(id: ID, data: Partial<T>): Promise<T>;
  delete(id: ID): Promise<boolean>;
  
  // Query Operations
  findOne(options: any): Promise<T | null>;
  findMany(options: any): Promise<T[]>;
  count(options?: any): Promise<number>;
  
  // Pagination
  findWithPagination(options: {
    page?: number;
    limit?: number;
    orderBy?: any;
    where?: any;
  }): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

/**
 * Base Repository Implementation
 * Provides common database operations
 */

import { PrismaClient } from '@prisma/client';

export abstract class BaseRepository<T, ID> implements IBaseRepository<T, ID> {
  protected prisma: PrismaClient;
  protected model: any;

  constructor(prisma: PrismaClient, model: any) {
    this.prisma = prisma;
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create({ data });
  }

  async findById(id: ID): Promise<T | null> {
    return await this.model.findUnique({ where: { id } });
  }

  async findAll(options: any = {}): Promise<T[]> {
    return await this.model.findMany(options);
  }

  async update(id: ID, data: Partial<T>): Promise<T> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: ID): Promise<boolean> {
    await this.model.delete({ where: { id } });
    return true;
  }

  async findOne(options: any): Promise<T | null> {
    return await this.model.findFirst(options);
  }

  async findMany(options: any): Promise<T[]> {
    return await this.model.findMany(options);
  }

  async count(options?: any): Promise<number> {
    return await this.model.count(options);
  }

  async findWithPagination(options: {
    page?: number;
    limit?: number;
    orderBy?: any;
    where?: any;
  }): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, orderBy, where } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.model.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

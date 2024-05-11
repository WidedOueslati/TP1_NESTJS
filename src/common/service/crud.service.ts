import { Injectable, NotFoundException } from '@nestjs/common';
import { DeepPartial, Repository, UpdateResult } from 'typeorm';
import { HasId } from '../interfaces/hasId.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CrudService<Entity extends HasId> {
  constructor(private repository: Repository<Entity>,private eventEmitter: EventEmitter2) {}

  
  async create(entity: DeepPartial<Entity>): Promise<Entity> {
    try {
      const savedEntity = await this.repository.save(entity);
      this.eventEmitter.emit('entity.created', {
        entity: savedEntity,
      });
      return savedEntity;
    } catch (error) {
      // Handle errors appropriately
      throw new Error('Failed to create entity');
    }
  }
  async update(id: number, updateDto: DeepPartial<Entity>): Promise<Entity> {
    const entity = await this.repository.preload({
      id,
      ...updateDto,
    });

    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    try {
      const updatedEntity = await this.repository.save(entity);
      this.eventEmitter.emit('entity.updated', {
        entity: updatedEntity,
      });
      return updatedEntity;
    } catch (error) {
      // Handle errors appropriately
      throw new Error('Failed to update entity');
    }
  }

  async remove(id: number): Promise<UpdateResult> {
    const result = await this.repository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException('Entity not found');
    }
    this.eventEmitter.emit('entity.deleted', { id });
    return result;
  }

  async restore(id: number): Promise<UpdateResult> {
    const result = await this.repository.restore(id);
    if (!result.affected) {
      throw new NotFoundException('Entity not found');
    }
    this.eventEmitter.emit('entity.restored', { id });
    return result;
  }

  findAll(): Promise<Entity[]> {
    return this.repository.find();
  }

  async findOne(id): Promise<Entity> {
    const entity =  await this.repository.findOneBy({ id });
    if(!entity){throw new NotFoundException('entity Not Found');}
    return entity ;
  }
}
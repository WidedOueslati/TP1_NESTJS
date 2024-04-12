import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    const newSkill = this.skillRepository.create(createSkillDto);
    return await this.skillRepository.save(newSkill);
  }

  async findAll(): Promise<Skill[]> {
    return await this.skillRepository.find();
  }

  async findOne(id: number): Promise<Skill> {
    const skill = await this.skillRepository.findOneById(id);
    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }
    return skill;
  }

  async update(id: number, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    const skill = await this.findOne(id); // Reuse findOne method to check if skill exists
    this.skillRepository.merge(skill, updateSkillDto);
    return await this.skillRepository.save(skill);
  }

  async remove(id: number): Promise<void> {
    const skill = await this.findOne(id); // Reuse findOne method to check if skill exists
    await this.skillRepository.remove(skill);
  }
}

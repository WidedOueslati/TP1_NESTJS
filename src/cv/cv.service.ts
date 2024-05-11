import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Skill } from '../skill/entities/skill.entity';
import { RechercheCvDto } from './dto/recherche-cv.dto';
import { UserService } from '../user/user.service';
import { CrudService } from '../common/service/crud.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
/*import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';*/

@Injectable()
export class CvService extends CrudService<Cv> {
  constructor(
    @InjectRepository(Cv)
    private cvRepository: Repository<Cv>,
    private readonly userService: UserService,
    private eventEmitter: EventEmitter2,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
  ) { 
    super(cvRepository) }

  async RechercheCv(rechercheCvDto: RechercheCvDto): Promise<Cv[]> {
    const { criteria, age } = rechercheCvDto;
    let cvs = await this.findAll();
    if (age) {
      cvs = cvs.filter(cv => cv.age == age);
    }
    if (criteria) {
      cvs = cvs.filter(cv => cv.name.includes(criteria) || cv.firstname.includes(criteria) || cv.Job.includes(criteria));
    }
    return cvs;
  }

  async findCvsByUserId(userId: number): Promise<Cv[]> {
    

      const userr = await this.userService.findOne(userId);
      if (!userr) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const cvs = await this.cvRepository.find({
        where: { user: userr },
      });

      if (!cvs || cvs.length === 0) {
        throw new NotFoundException(`CVs not found for user with ID: ${userId}`);

      }

      return cvs;
    
  }

  async addSkillToCv(cv: Cv, skillId: number): Promise<void> {
    const skill = await this.skillRepository.findOneById(skillId);
    console.log("skill: ", skill);
    console.log("cv: ", cv);
    if (!cv || !skill) {
      throw new NotFoundException(`CV or Skill not found`);
    }
    if (!cv.user) {
      throw new NotFoundException(`User associated with CV not found`);
    }
    // Ensure cv.skills is an array before adding the skill
    if (!cv.skills) {
      cv.skills = [];
    }
    // Check if the skill is already added to the CV
    const skillExists = cv.skills.some((s) => s.id === skill.id);
    if (!skillExists) {
      cv.skills.push(skill);
      console.log("user from cvservice ", cv)
      await this.cvRepository.save(cv);
    }
  }
  async uploadImage(file: Express.Multer.File, cvId: number): Promise<Cv> {
    const cv = await this.findOne(cvId);
    if (!cv) {
      throw new NotFoundException(`CV with ID ${cvId} not found`);
    }
    console.log(file);
    cv.path = String(file);
    return await this.cvRepository.save(cv);
  }

  async findAllPag(page: number = 1, pageSize: number = 10): Promise<[Cv[], number]> {
    const [cvs, total] = await this.cvRepository.findAndCount({
      relations: ['skills'],
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    return [cvs, total];
  }
}

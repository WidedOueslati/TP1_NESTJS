import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Skill } from '../skill/entities/skill.entity'; 
import { RechercheCvDto } from './dto/recherche-cv.dto';
import { UserService } from '../user/user.service';
import { CrudService } from '@/common/service/crud.service';

@Injectable()
//Extending CRUD Servive from common services
export class CvService extends CrudService<Cv> {
  constructor(
    @InjectRepository(Cv)
    private cvRepository: Repository<Cv>,
    private readonly userService: UserService,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
  ) {super(cvRepository)}
  
  // Filtering CVs by criterias
  async RechercheCv(rechercheCvDto: RechercheCvDto): Promise<Cv[]> {
    const {criteria,age}=rechercheCvDto;
        let cvs = await this.findAll();
        // Filtering CVs based on age if provided
        if (age){
            cvs=cvs.filter(cv=>cv.age==age);
        }
        // Filtering CVs based on criteria if provided
        if (criteria){
            cvs=cvs.filter(cv=> cv.name.includes(criteria)||cv.firstname.includes(criteria)||cv.Job.includes(criteria));
        }
        return cvs;
  }

  // Find CVs associated with a user by user ID
  async findCvsByUserId(userId: number): Promise<Cv[]> {
    try {
      
      const user = await this.userService.findOne(userId);
      // If user not found, throw NotFoundException
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Finding CVs associated with the user
      const cvs = await this.cvRepository.find({
        where: { user: user },
      });

      // If no CVs found for the user, throw NotFoundException
      if (!cvs || cvs.length === 0) {
    
        throw new NotFoundException(`CVs not found for user with ID: ${userId}`);

      }

      return cvs;
    } catch (error) {
      
      throw new Error(`Failed to fetch CVs for user with ID: ${userId}. ${error.message}`);
    }
  }
  
  // Add a skill to a CV
  async addSkillToCv(cv: Cv, skillId: number): Promise<void> {
    const skill = await this.skillRepository.findOneById(skillId);
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
      await this.cvRepository.save(cv);
    }
  }
  // Upload image to a CV
  async uploadImage(file: Express.Multer.File, cvId:number): Promise<Cv> {     
     const cv = await this.findOne(cvId);
     if (!cv) {
       throw new NotFoundException(`CV with ID ${cvId} not found`);
     }
     //console.log(file);
     cv.path = String(file); 
     return await this.cvRepository.save(cv);
  }
  //Pagination
  async findAllPag(page: number = 1, pageSize: number = 10): Promise<[Cv[], number]> {
    const [cvs, total] = await this.cvRepository.findAndCount({
      relations: ['skills'],
      // Loading related skills
      take: pageSize,
      // Number of items per page
      skip: (page - 1) * pageSize,
      // Offset for pagination
    });
    return [cvs, total];
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Cv } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Skill } from '../skill/entities/skill.entity'; 
import { User } from '@/user/entities/user.entity';


import { RechercheCvDto } from './dto/recherche-cv.dto';
import { UserService } from '@/user/user.service';
/*import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';*/

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(Cv)
    private cvRepository: Repository<Cv>,
    private readonly userService: UserService,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
  ) {}

  async create(createCvDto: CreateCvDto,user: User): Promise<Cv> {
    const newCv = this.cvRepository.create({
      ...createCvDto,
      user: user // Ensure this is the connected user entity
    });
    return await this.cvRepository.save(newCv);
  }

  async findAll(connectedUser: User): Promise<Cv[]> {
    if (connectedUser.role === 'admin') {
      // admin return all 
      return this.cvRepository.find();
    } else {
      // normal user return only his cvs
      return this.cvRepository.find({ where: { user: connectedUser }});
    }
  }
  
  async RechercheCv(rechercheCvDto: RechercheCvDto ,connectedUser: User): Promise<Cv[]> {
    const {criteria,age}=rechercheCvDto;
        let cvs = await this.findAll(connectedUser); 
        if (age){
            cvs=cvs.filter(cv=>cv.age==age);
        }
        if (criteria){
            cvs=cvs.filter(cv=> cv.name.includes(criteria)||cv.firstname.includes(criteria)||cv.Job.includes(criteria));
        }
        return cvs;
  }

  async findCvsByUserId(userId: number): Promise<Cv[]> {
    try {
      // Use TypeORM repository to find all CVs associated with the given user ID
      const findOptions: FindManyOptions<Cv> = {
        where: {
          user: await this.userService.findOne(userId) // Specify the userId property in your Cv entity
        }
      };
      
      // Use the find method with the constructed find options
      const cvs = await this.cvRepository.find(findOptions);

      if (!cvs || cvs.length === 0) {
        throw new NotFoundException(`CVs not found for user with ID: ${userId}`);
      }

      return cvs;
    } catch (error) {
      throw new Error(`Failed to fetch CVs for user with ID: ${userId}. ${error.message}`);
    }
  }
  async findOne(id: number): Promise<Cv> {
    const cv = await this.cvRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!cv) {
      throw new NotFoundException(`CV with ID ${id} not found`);
    }
    return cv;
  }
  

  async update(id: number, updateCvDto: UpdateCvDto): Promise<Cv> {
    const cv = await this.findOne(id); 
    cv.name = updateCvDto.name || cv.name;
    cv.firstname = updateCvDto.firstname || cv.firstname;
    cv.age = updateCvDto.age || cv.age;
    cv.Cin = String(updateCvDto.Cin) || cv.Cin;
    cv.Job = updateCvDto.Job || cv.Job;
    cv.path = updateCvDto.path || cv.path;
    return this.cvRepository.save(cv);
  }

  async remove(id: number): Promise<void> {
    const cv = await this.findOne(id); 
    await this.cvRepository.remove(cv);
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
  async uploadImage(file: Express.Multer.File, cvId:number): Promise<Cv> {     
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

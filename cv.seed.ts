import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { CvService } from './src/cv/cv.service';
import { UserService } from './src/user/user.service';
import { SkillService } from './src/skill/skill.service'; 
import { randLastName, randFirstName, randNumber, randJobTitle } from '@ngneat/falso';
import { Skill } from './src/skill/entities/skill.entity';
import { CreateCvDto } from './src/cv/dto/create-cv.dto';

async function seedCVs() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userService = app.get(UserService);
    const cvService = app.get(CvService);
    const skillService = app.get(SkillService);

    // Fetching all users
    const allUsers = await userService.findAll();
    
    // Generating CVs for each user, each user has at least on CV
    for (const user of allUsers) {
      const cvCount = randNumber({ min: 1, max: 3 });

      for (let i = 0; i < cvCount; i++) {
        const cvDto = new CreateCvDto();
        cvDto.name = randLastName();
        cvDto.firstname = randFirstName();
        cvDto.age = randNumber({ min: 18, max: 60 });
        cvDto.Cin = String(randNumber({ min: 10000000, max: 29999999 }));
        cvDto.Job = randJobTitle();
        cvDto.user = user;
        cvDto.path = '/path/to/cv.pdf';

        const createdCv = await cvService.create(cvDto);
        // assign random skills to a CV
        const skills = await skillService.findAll();
        const skillCount = randNumber({ min: 1, max: 5 });

        const selectedSkills = new Set<Skill>();
        while (selectedSkills.size < skillCount) {
          const randomIndex = Math.floor(Math.random() * skills.length);
          const selectedSkill = skills[randomIndex];
          selectedSkills.add(selectedSkill);
        }

        for (const selectedSkill of selectedSkills) {
          await cvService.addSkillToCv(createdCv, selectedSkill.id);
        }
      }
    }

    console.log('CVs seeded successfully!');
  } catch (error) {
    console.error('Error seeding CVs:', error);
  } finally {
    await app.close();
  }
}

seedCVs();


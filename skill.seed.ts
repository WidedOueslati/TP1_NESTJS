import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { SkillService } from './src/skill/skill.service';
import { randWord } from '@ngneat/falso';
import { Skill } from '@/skill/entities/skill.entity';

async function seedSkills() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const skillService = app.get(SkillService);
    const skillCount = 10;
    const skills: Skill[] = [];

    for (let i = 0; i < skillCount; i++) {
      const designation = randWord();
      const foundSkill = skills.find(skill => skill.Designation === designation);

      if (!foundSkill){
        skills
      }
      const skill = await skillService.create({ Designation: designation });
      skills.push(skill);
    }

    console.log('Skills seeded successfully!');
  } catch (error) {
    console.error('Error seeding skills:', error);
  } finally {
    await app.close();
  }
}

seedSkills();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UserService } from './src/user/user.service';
import { randEmail, randUserName, randWord } from '@ngneat/falso';

async function seedUsers() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userService = app.get(UserService);
    const numUsers = 5;

    for (let i = 0; i < numUsers; i++) {
      const user = {
        username: randUserName(),
        email: randEmail(),
        password: 'password',
      };
      await userService.create(user);
    }

    console.log('Users seeded successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await app.close();
  }
}

seedUsers();

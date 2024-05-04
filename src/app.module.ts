import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CvModule } from './cv/cv.module';
import { SkillModule } from './skill/skill.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Cv } from './cv/entities/cv.entity';
import { User } from './user/entities/user.entity';
import { Skill } from './skill/entities/skill.entity';
import { RequestService } from './request.service';
import { AuthMiddleware } from './middlewares/authentification.middleware';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    AuthModule,
    CvModule,
    SkillModule,
    UserModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
   
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Debugging
        /*console.log('Loaded HOST:', configService.get('HOST'));
        console.log('Loaded PORT:', configService.get('PORT'));
        console.log('Loaded Username:', configService.get('DB_USERNAME'));
        console.log('Loaded PPassword:', configService.get('PASSWORD'));*/
        return {
          type: 'mysql',
          host: configService.get('HOST'),
          port: configService.get<number>('PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('PASSWORD'),
          database: configService.get('DATABASE'),
          entities: [User, Skill, Cv],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, RequestService, JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware) // Apply the AuthMiddleware to specific routes
      .forRoutes(
        { path: 'v2/cv', method: RequestMethod.POST }, // Apply to POST /cv
        { path: 'v2/cv/:id', method: RequestMethod.PATCH }, // Apply to PATCH /cv/:id
        { path: 'v2/cv/:id', method: RequestMethod.DELETE }, // Apply to DELETE /cv/:id
      );
  }
}

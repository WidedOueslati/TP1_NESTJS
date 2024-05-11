import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { CvHistory } from './entities/cv_history.entity';
import { Skill} from '../skill/entities/skill.entity';
import { CvTwoController } from './cv_two.controller';
import { RequestModule } from '../request.module';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { MulterModule } from '@nestjs/platform-express';
import { FileUploadService } from '../common/file-upload.service';
import { JwtService } from '@nestjs/jwt';
import { JWTAuthGuard } from '../auth/guards/authenticated.guard';
import { CvListener } from './cv.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Cv,Skill,User,CvHistory]),
  RequestModule,
  UserModule,
  MulterModule.register({dest: './public/uploads'})],
  controllers: [CvController,CvTwoController],
  providers: [CvService,UserService,FileUploadService,JwtService, JWTAuthGuard,CvListener],
})
export class CvModule {}

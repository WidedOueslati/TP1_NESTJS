import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException, NotFoundException, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, UseGuards, Query, Res, Sse } from '@nestjs/common';
import { CvService } from './cv.service';
import { UserService } from '../user/user.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { RequestService } from '../request.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/multer.config';
import { FileUploadService } from '../common/file-upload.service';
import { JWTAuthGuard } from '../auth/guards/authenticated.guard';
import { RechercheCvDto } from './dto/recherche-cv.dto';
import { AdminGuard } from '../auth/guards/admin.guards';
import { Cv } from './entities/cv.entity';
import { UserDecorator } from '../auth/decorator';
import { AuthGuard } from '@nestjs/passport';
import * as fs from 'fs';
import { Observable, filter, fromEvent, map } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { APP_EVENTS } from '@/config/events.config';
import { User, UserRole } from '@/user/entities/user.entity';


@Controller({
  path: 'cv',
  version: '2',
})
export class CvTwoController {
  constructor(
    private readonly requestService: RequestService,
    private readonly cvService: CvService,
    private readonly userService: UserService,
    private readonly fileUploadService: FileUploadService,
    private eventEmitter: EventEmitter2
  ) {}

  @Get('all')
  @UseGuards(AdminGuard)
  findAll(@Query() dto: RechercheCvDto) {
    if (dto.criteria || dto.age) {
      return this.cvService.RechercheCv(dto);
    } else {
      return this.cvService.findAll();
    }
  }
  @Get('pag')
  @UseGuards(AdminGuard)
  async findAllPag(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ): Promise<[Cv[], number]> {
    return this.cvService.findAllPag(page, pageSize);
  }
  @Get()
  @UseGuards(JWTAuthGuard)
  async findOne() {
    const userId = RequestService.getUserId(); 
    const user = await this.userService.findOne(+(RequestService.getUserId()));
    return this.cvService.findCvsByUserId(user.id);
  }

  @Post()
  @UseGuards(JWTAuthGuard)
  async create(@Body() createCvDto: CreateCvDto) {
    const user = await this.userService.findOne(+(RequestService.getUserId())); // Retrieve userId from RequestService
    if (!user) {
      throw new UnauthorizedException('Unauthorized to create cv');
    }
    createCvDto.user= user; // Add userId to the DTO
    console.log(createCvDto);
    const cv = await this.cvService.create(createCvDto);
    this.eventEmitter.emit(APP_EVENTS.Cv.add, {
      type:"add",
      cv,
      user
    });
    return cv;
  }

  @Patch(':id')
  @UseGuards(JWTAuthGuard)
  async update(@Param('id') id: string, @Body() updateCvDto: UpdateCvDto) {
    const userId = RequestService.getUserId(); // Retrieve userId from RequestService
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    const cv = await this.cvService.findOne(+id);
    if (!cv) {
      throw new NotFoundException('CV not found');
    }
    const user = cv.user;
    if (cv.user.id !== +userId) {
      throw new UnauthorizedException('You are not authorized to update this CV');
    }
    const cvUpdated= await this.cvService.update(+id, updateCvDto);
    this.eventEmitter.emit(APP_EVENTS.Cv.update, {
      type:"update",
      cv,
      user,
    });
    return cvUpdated;
  }

  @Delete(':id')
  @UseGuards(JWTAuthGuard)
  async remove(@Param('id') id: number) {
    console.log('removing');
    const userId = RequestService.getUserId(); 
    const cv = await this.cvService.findOne(id);
    const user= cv.user;
    if ((!userId) || (cv.user.id !== +userId)){
      throw new UnauthorizedException('You are not authorized to delete this CV');
    }
    const cvId=id;
    const del= await this.cvService.remove(+id);
    this.eventEmitter.emit(APP_EVENTS.Cv.delete, {
      del,
      type:"delete",
      user,
      cvId,
      

    });
    return del;

  }

  @Get('upload/:name')
  getFile(@Param('name') name: string,  @Res() res )
  {
   const file = fs.readFileSync(`public/uploads/${name}`);
   
   res.set({'Content-Type': 'image/jpeg'});
    res.send(file);
   return file;

  }

  
  @Post('upload')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
         .addFileTypeValidator({ fileType: /image\/(jpeg|jpg|png)/ })
        .addMaxSizeValidator({ maxSize: 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    console.log("file: ", file);
    const user = await this.userService.findOne(+(RequestService.getUserId()));
    console.log(user);
    const cvs= await this.cvService.findCvsByUserId(+(RequestService.getUserId()));
    cvs.forEach(cv => {
      //cv.path = file.filename; // Assign the file path to each CV
      console.log(cv);
      this.cvService.update(cv.id, {path: file.filename})
    })
    return await this.fileUploadService.uploadFile(file);
    
  }

  @Get('profile')
  @UseGuards(JWTAuthGuard)
  getProfile(@UserDecorator() user: any) {

    const userr = this.userService.findOneByUsername(user.username);
    return userr;
  }

  @UseGuards(JWTAuthGuard)
  @Sse('sse/add')
  sseAdd(@UserDecorator() user :User): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, APP_EVENTS.Cv.add).pipe(
      filter((payload:any) => {
        return (
         user.role === UserRole.ADMIN 
         || user.username === payload.user.username
        );
      }),
      map((payload) => {
        console.log({ payload });
        return new MessageEvent('new cv', { data: payload });
      }),
    );
  }
  @UseGuards(JWTAuthGuard)
    @Sse('sse/update')
    sseUpdate(@UserDecorator() user :User): Observable<MessageEvent> {
      return fromEvent(this.eventEmitter, APP_EVENTS.Cv.update).pipe(
        filter((payload:any) => {
          return (
           user.role === UserRole.ADMIN 
           || user.username === payload.user.username
          );
        }),
        map((payload) => {
          console.log({ payload });
          return new MessageEvent('cv updated', { data: payload });
        }),
      );

}
@UseGuards(JWTAuthGuard)
@Sse('sse/delete')
sseDlete(@UserDecorator() user :User): Observable<MessageEvent> {
  return fromEvent(this.eventEmitter, APP_EVENTS.Cv.delete).pipe(
    filter((payload:any) => {
      console.log(payload.user)
      console.log(user)
      return (
       user.role === UserRole.ADMIN 
       || user.username === payload.user.username
      );
    }),
    map((payload) => {
      console.log({ payload });
      return new MessageEvent('deleted cv', { data: payload });
    }),
  );
}
}

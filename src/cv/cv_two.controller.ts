import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException, NotFoundException, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { CvService } from './cv.service';
import { UserService } from '../user/user.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { RequestService } from '../request.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { multerConfig } from '../common/multer.config';
import { FileUploadService } from '../common/file-upload.service';
import { JWTAuthGuard } from '../auth/guards/authenticated.guard';
import { RechercheCvDto } from './dto/recherche-cv.dto';
import { AdminGuard } from '../auth/guards/admin.guards';
import { Cv } from './entities/cv.entity';
import { UserDecorator } from '../auth/decorator';
import { AuthGuard } from '@nestjs/passport';


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
    console.log(RequestService.getUserId());
    const userId = RequestService.getUserId(); 
    console.log(userId);
    const user = await this.userService.findOne(+(RequestService.getUserId()));
    console.log(user);
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
    return this.cvService.create(createCvDto);
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

    if (cv.user.id !== +userId) {
      throw new UnauthorizedException('You are not authorized to update this CV');
    }
    return this.cvService.update(+id, updateCvDto);
  }

  @Delete(':id')
  @UseGuards(JWTAuthGuard)
  async remove(@Param('id') id: number) {
    console.log('removing');
    const userId = RequestService.getUserId(); 
    const cv = await this.cvService.findOne(id);
    if ((!userId) || (cv.user.id !== +userId)){
      throw new UnauthorizedException('You are not authorized to delete this CV');
    }
    console.log("heeeerrreeee 3");
    return this.cvService.remove(+id);
  }


  
  @Post('upload')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerConfig)) // Assurez-vous que multerConfig est correctement défini
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
         .addFileTypeValidator({ fileType: /image\/(jpeg|jpg|png)/ })
        .addMaxSizeValidator({ maxSize: 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    console.log("test1 ", file);
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
}

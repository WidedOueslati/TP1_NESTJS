import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, NotFoundException, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { RechercheCvDto } from './dto/recherche-cv.dto';
import { RequestService } from '@/request.service';
import { Cv } from './entities/cv.entity';
import { Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../common/file-upload.service';
import { multerConfig } from '../common/multer.config';

@Controller({path: 'cv',
version: '1',}
)
export class CvController {
  constructor(private readonly cvService: CvService,
    private readonly fileUploadService: FileUploadService
    ) {}

  @Post()
  create(@Body() createCvDto: CreateCvDto) {
    return this.cvService.create(createCvDto);
  }

  @Get()
  findAll(@Query() dto: RechercheCvDto) {
    if (dto.criteria || dto.age) {
      return this.cvService.RechercheCv(dto);
    } else {
      return this.cvService.findAll();
    }
  }
  @Get('pag')
  async findAllPag(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ): Promise<[Cv[], number]> {
    return this.cvService.findAllPag(page, pageSize);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cvService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCvDto: UpdateCvDto) {
    const cv = await this.cvService.findOne(+id);
    if (!cv) {
      throw new NotFoundException('CV not found');
    }
    return this.cvService.update(+id, updateCvDto);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cvService.remove(+id);
  }
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /image\/(jpeg|jpg|png)/ })
        .addMaxSizeValidator({ maxSize: 1000000 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    return await this.fileUploadService.uploadFile(file);
    //return file;
  }
}

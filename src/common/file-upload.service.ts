
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileUploadService {
  async uploadFile(file) {
    if (!file) {
        console.log(file,"hello");
      throw new BadRequestException('No file uploaded');
      
    }
    return file.filename;
  }
}
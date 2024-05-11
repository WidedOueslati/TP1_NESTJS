import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { CvHistory } from './entities/cv_history.entity';
import { Repository } from 'typeorm';
import { CvHistoryDto } from './dto/cv-history.dto';
import { APP_EVENTS } from '@/config/events.config';

@Injectable()
export class CvListener {
  constructor(
    @InjectRepository(CvHistory)
    private cvHistoryRepository: Repository<CvHistory>,
  ) {}
  // @OnEvent("cv.*")
  // async handleEverything(payload: any) {
  //   return await this.createCvHistory(payload);
  // }
  @OnEvent(APP_EVENTS.Cv.add)
  async handleCvCreated(payload: any) {
    return await this.createCvHistory( payload);
  }

  @OnEvent(APP_EVENTS.Cv.update)
  async handleCvUpdate(payload: any) {
    return await this.createCvHistory( payload);
  }

  @OnEvent(APP_EVENTS.Cv.delete)
  async handleCvDelete(payload: any) {
    return await this.createCvHistory( payload);
  }

  async createCvHistory(payload: any) {
    console.log('Creating CV History');
    console.log(payload);
    
    return this.cvHistoryRepository.save(
     payload
    );
  }
}

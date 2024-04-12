import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestService {
  private static userId: string;

  static setUserId(userId: string) {
    this.userId = userId;
  }

  static getUserId() {
    return this.userId;
  }
}
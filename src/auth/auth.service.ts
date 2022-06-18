import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  signin() {
    return { msg: 'signin' };
  }

  signup() {
    return { msg: 'signup' };
  }
}

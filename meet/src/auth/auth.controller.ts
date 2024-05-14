// auth.controller.ts

import { Controller, Get, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('hello') 
  test(@Res() res: Response, @Req() req: Request): string {
    return 'vijay';
  }

  @Get('login')
  async login(@Res() res: Response, @Req() req: Request): Promise<void> {
    try {
      const loginUrl = await this.authService.getLoginUrl();
      res.redirect(loginUrl);
    } catch (error) {
      console.error('Error redirecting to login URL:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      await this.authService.handleCallback(req);
      res.redirect('/');
    } catch (error) {
      console.error('Error handling callback:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      await this.authService.logout(req);
      res.redirect('/');
    } catch (error) {
      console.error('Error handling logout:', error);
      res.status(500).send('Internal Server Error');
    }
  }
}

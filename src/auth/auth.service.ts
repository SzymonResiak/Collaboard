import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventCoordinatorService } from 'src/events/event-coordinator.service';
import { UserClass } from 'src/users/user.class';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private eventCoordinatorService: EventCoordinatorService,
  ) {}

  async signIn(user: UserClass) {
    const payload = {
      login: user.getLogin(),
      sub: user.id,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async getValidUser(login: string, password: string): Promise<UserClass> {
    try {
      const user = await this.eventCoordinatorService.getUserByLogin(
        login,
        '+password +hashedPasswd',
      );
      if (!user) return null;

      const result = await user.isValidPassword(password);
      if (!result) return null;

      return user;
    } catch (error) {
      console.error('Error getting user', error);
      return null;
    }
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';

const QUEUE_OUT = 'user.registered';

@Injectable()
export class AuthService {

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly rabbitmqService: RabbitmqService
  ) {}

  async login( loginUserDto: LoginUserDto ) {

    const { password, email } = loginUserDto;
    const user = await this.userService.findByEmail(email);
      
    if ( !bcrypt.compareSync( password, user.password ) )
      throw new UnauthorizedException('Credentials are not valid (password)');

    delete user.password;

    return {
      user: user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);

    await this.publishUserRegistered(user);

    return {
      user,
      token: this.getJwtToken({ id: user.id })
    }
  }

  async checkAuthStatus( user: User ) {
    return {
      user: user,
      token: this.getJwtToken({ id: user.id })
    };
  }
  
  private getJwtToken( payload: JwtPayload ) {
    return this.jwtService.sign( payload );
  }

  private async publishUserRegistered(user: User): Promise<void> {
    const channel = this.rabbitmqService.getChannel();

    await channel.assertQueue(QUEUE_OUT, { durable: true });

    channel.sendToQueue(
      QUEUE_OUT,
      Buffer.from(JSON.stringify({
        email: user.email,
        name: user.name
      })),
      { persistent: true }
    );
  }
}

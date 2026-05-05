import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { AdminUser } from './entities/admin-user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminRepo: Repository<AdminUser>,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.adminRepo.findOne({
      where: { username: dto.username.trim() },
    });
    const ok =
      user &&
      (await bcrypt.compare(dto.password, user.passwordHash));
    if (!ok) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }
    const access_token = await this.jwt.signAsync({
      sub: user.id,
      username: user.username,
    });
    return {
      access_token,
      user: { username: user.username },
    };
  }
}

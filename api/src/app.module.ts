import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUser } from './auth/entities/admin-user.entity';
import { AdmModule } from './adm/adm.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CursosModule } from './cursos/cursos.module';
import { Curso } from './cursos/entities/curso.entity';
import { Turma } from './cursos/entities/turma.entity';
import { SeedService } from './database/seed.service';
import { Aluno } from './enrollments/entities/aluno.entity';
import { EnrollmentsModule } from './enrollments/enrollments.module';

function isTruthy(v: unknown): boolean {
  return v === true || v === 'true' || v === '1' || v === 1;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([AdminUser, Curso, Turma]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 3306),
        username: config.get<string>('DATABASE_USER', 'azorde'),
        password: config.get<string>('DATABASE_PASSWORD', 'azorde'),
        database: config.get<string>('DATABASE_NAME', 'azorde'),
        entities: [Aluno, Curso, Turma, AdminUser],
        synchronize: isTruthy(config.get('TYPEORM_SYNC')),
        logging: isTruthy(config.get('TYPEORM_LOGGING')),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CursosModule,
    AdmModule,
    EnrollmentsModule,
  ],
  controllers: [AppController],
  providers: [SeedService],
})
export class AppModule {}

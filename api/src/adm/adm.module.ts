import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { Aluno } from '../enrollments/entities/aluno.entity';
import { AdmAlunosController } from './adm-alunos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Aluno]), EnrollmentsModule],
  controllers: [AdmAlunosController],
})
export class AdmModule {}

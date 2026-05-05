import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aluno } from '../enrollments/entities/aluno.entity';
import { AdmCursosController } from './adm-cursos.controller';
import { AdmTurmasController } from './adm-turmas.controller';
import { CursosPublicController } from './cursos-public.controller';
import { CursosService } from './cursos.service';
import { Curso } from './entities/curso.entity';
import { Turma } from './entities/turma.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Curso, Turma, Aluno])],
  controllers: [
    CursosPublicController,
    AdmCursosController,
    AdmTurmasController,
  ],
  providers: [CursosService],
  exports: [CursosService, TypeOrmModule],
})
export class CursosModule {}

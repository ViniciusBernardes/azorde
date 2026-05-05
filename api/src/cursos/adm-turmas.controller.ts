import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { CursosService } from './cursos.service';

@Controller('adm')
@UseGuards(AuthGuard('jwt'))
export class AdmTurmasController {
  constructor(private readonly cursosService: CursosService) {}

  @Post('cursos/:cursoId/turmas')
  addTurma(
    @Param('cursoId', ParseUUIDPipe) cursoId: string,
    @Body() dto: CreateTurmaDto,
  ) {
    return this.cursosService.addTurma(cursoId, dto);
  }

  @Patch('turmas/:id')
  updateTurma(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTurmaDto,
  ) {
    return this.cursosService.updateTurma(id, dto);
  }

  @Delete('turmas/:id')
  async removeTurma(@Param('id', ParseUUIDPipe) id: string) {
    await this.cursosService.removeTurma(id);
    return { ok: true };
  }
}

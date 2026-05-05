import { Controller, Get } from '@nestjs/common';
import { CursosService } from './cursos.service';

@Controller('cursos')
export class CursosPublicController {
  constructor(private readonly cursosService: CursosService) {}

  @Get()
  listar() {
    return this.cursosService.findPublic();
  }
}

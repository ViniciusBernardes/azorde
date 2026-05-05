import { createReadStream, existsSync } from 'fs';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { basename, join, resolve } from 'path';
import { Repository } from 'typeorm';
import { CreateAlunoAdmDto } from '../enrollments/dto/create-aluno-adm.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { Aluno } from '../enrollments/entities/aluno.entity';

function uploadRoot(): string {
  return resolve(process.env.UPLOAD_DEST ?? join(process.cwd(), 'uploads'));
}

function contentTypeFromFilename(name: string): string {
  const n = name.toLowerCase();
  if (n.endsWith('.pdf')) return 'application/pdf';
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
  if (n.endsWith('.webp')) return 'image/webp';
  if (n.endsWith('.gif')) return 'image/gif';
  return 'application/octet-stream';
}

@Controller('adm/alunos')
@UseGuards(AuthGuard('jwt'))
export class AdmAlunosController {
  constructor(
    @InjectRepository(Aluno)
    private readonly alunoRepo: Repository<Aluno>,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @Get()
  listar() {
    return this.alunoRepo.find({
      relations: ['curso', 'turmaRef'],
      order: { createdAt: 'DESC' },
    });
  }

  @Post()
  criar(@Body() dto: CreateAlunoAdmDto) {
    return this.enrollmentsService.createAdmin(dto);
  }

  @Get(':id/comprovante')
  async comprovante(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const aluno = await this.alunoRepo.findOne({ where: { id } });
    if (!aluno) {
      throw new NotFoundException('Inscrição não encontrada.');
    }
    const storedRaw = (aluno.receiptStoredName || '').trim();
    if (!storedRaw || storedRaw === 'adm-manual') {
      throw new NotFoundException(
        'Não há comprovante anexado para esta inscrição.',
      );
    }
    const safe = basename(String(storedRaw).replace(/\\/g, '/'));
    if (!safe || safe === '.' || safe === '..') {
      throw new NotFoundException('Comprovante inválido.');
    }
    const root = uploadRoot();
    const fullPath = resolve(join(root, safe));
    if (!fullPath.startsWith(root)) {
      throw new NotFoundException('Comprovante inválido.');
    }
    if (!existsSync(fullPath)) {
      throw new NotFoundException('Arquivo não encontrado no servidor.');
    }
    const original = basename(
      String(aluno.receiptOriginalName || safe).replace(/\\/g, '/'),
    );
    res.setHeader('Content-Type', contentTypeFromFilename(original));
    const ascii = original.replace(/[^\x20-\x7E]/g, '_');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(original)}`,
    );
    return new StreamableFile(createReadStream(fullPath));
  }

  @Delete(':id')
  async remover(@Param('id', ParseUUIDPipe) id: string) {
    const res = await this.alunoRepo.delete(id);
    if (!res.affected) {
      throw new NotFoundException('Inscrição não encontrada.');
    }
    return { ok: true };
  }

  @Patch(':id/confirmar')
  async confirmar(@Param('id', ParseUUIDPipe) id: string) {
    const aluno = await this.alunoRepo.findOne({
      where: { id },
      relations: ['turmaRef', 'turmaRef.curso'],
    });
    if (!aluno) {
      throw new NotFoundException('Inscrição não encontrada.');
    }
    if (aluno.confirmado) {
      return aluno;
    }
    if (!aluno.turmaId || !aluno.turmaRef?.curso) {
      throw new BadRequestException(
        'Só é possível confirmar inscrições vinculadas a uma turma do sistema.',
      );
    }
    const confirmados = await this.alunoRepo
      .createQueryBuilder('a')
      .where('a.turmaId = :tid', { tid: aluno.turmaId })
      .andWhere('a.confirmado = 1')
      .getCount();
    if (confirmados >= aluno.turmaRef.curso.maxAlunos) {
      throw new BadRequestException(
        'Esta turma já atingiu o máximo de vagas confirmadas.',
      );
    }
    aluno.confirmado = true;
    return this.alunoRepo.save(aluno);
  }
}

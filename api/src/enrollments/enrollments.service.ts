import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CursosService } from '../cursos/cursos.service';
import { CreateAlunoAdmDto } from './dto/create-aluno-adm.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { Aluno } from './entities/aluno.entity';

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Aluno)
    private readonly repo: Repository<Aluno>,
    private readonly cursosService: CursosService,
  ) {}

  async create(
    dto: CreateEnrollmentDto,
    file: Express.Multer.File | undefined,
  ): Promise<{ id: string }> {
    if (!file) {
      throw new BadRequestException('Comprovante de pagamento é obrigatório.');
    }
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de arquivo não permitido. Use imagem (JPG, PNG, WebP, GIF) ou PDF.',
      );
    }

    let courseName = dto.courseName?.trim() ?? '';
    let turmaLabel = dto.turma?.trim() ?? '';
    let cursoId: string | null = dto.cursoId ?? null;
    let turmaId: string | null = dto.turmaId ?? null;

    if (dto.turmaId) {
      const turma = await this.cursosService.findTurmaWithCurso(dto.turmaId);
      if (!turma?.curso) {
        throw new BadRequestException('Turma inválida.');
      }
      if (!turma.curso.ativo) {
        throw new BadRequestException('Este curso não está aceitando inscrições no momento.');
      }
      if (dto.cursoId && dto.cursoId !== turma.cursoId) {
        throw new BadRequestException('Curso e turma não correspondem.');
      }
      const total = await this.cursosService.countInscritosTurma(turma.id);
      const confirmados =
        await this.cursosService.countConfirmadosTurma(turma.id);
      const max = turma.curso.maxAlunos;
      if (total >= max || confirmados >= max) {
        throw new BadRequestException(
          'Esta turma atingiu o limite de vagas. Escolha outra turma ou fale com o estúdio.',
        );
      }
      courseName = turma.curso.nome;
      turmaLabel = turma.resumo?.trim() || turma.titulo;
      cursoId = turma.curso.id;
      turmaId = turma.id;
    } else {
      if (!courseName || !turmaLabel) {
        throw new BadRequestException('Selecione uma turma válida para concluir a inscrição.');
      }
    }

    const row = this.repo.create({
      cursoId,
      turmaId,
      courseName,
      turma: turmaLabel,
      nome: dto.nome.trim(),
      telefone: dto.telefone.trim(),
      email: dto.email.trim().toLowerCase(),
      pixKey: dto.pixKey.trim(),
      receiptStoredName: file.filename,
      receiptOriginalName: file.originalname.slice(0, 500),
      confirmado: false,
    });

    const saved = await this.repo.save(row);
    return { id: saved.id };
  }

  /** Inscrição criada pelo painel (sem comprovante). Não exige curso ativo. */
  async createAdmin(dto: CreateAlunoAdmDto): Promise<Aluno> {
    const turma = await this.cursosService.findTurmaWithCurso(dto.turmaId);
    if (!turma?.curso) {
      throw new BadRequestException('Turma inválida.');
    }
    if (dto.cursoId && dto.cursoId !== turma.cursoId) {
      throw new BadRequestException('Curso e turma não correspondem.');
    }
    const total = await this.cursosService.countInscritosTurma(turma.id);
    const confirmados =
      await this.cursosService.countConfirmadosTurma(turma.id);
    const max = turma.curso.maxAlunos;
    if (total >= max || confirmados >= max) {
      throw new BadRequestException(
        'Esta turma atingiu o limite de vagas para novas inscrições.',
      );
    }
    const confirmado = dto.confirmado === true;
    const courseName = turma.curso.nome;
    const turmaLabel = turma.resumo?.trim() || turma.titulo;
    const pix =
      dto.pixKey != null && String(dto.pixKey).trim().length > 0
        ? dto.pixKey.trim()
        : '-';
    const row = this.repo.create({
      cursoId: turma.curso.id,
      turmaId: turma.id,
      courseName,
      turma: turmaLabel,
      nome: dto.nome.trim(),
      telefone: dto.telefone.trim(),
      email: dto.email.trim().toLowerCase(),
      pixKey: pix,
      receiptStoredName: 'adm-manual',
      receiptOriginalName: 'cadastro-manual-pelo-painel',
      confirmado,
    });
    return this.repo.save(row);
  }
}

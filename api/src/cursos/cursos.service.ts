import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from '../enrollments/entities/aluno.entity';
import { CreateCursoDto } from './dto/create-curso.dto';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { Curso } from './entities/curso.entity';
import { Turma } from './entities/turma.entity';

function normTurmaId(id: string | null | undefined): string {
  return id == null || id === '' ? '' : String(id).trim().toLowerCase();
}

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepo: Repository<Curso>,
    @InjectRepository(Turma)
    private readonly turmaRepo: Repository<Turma>,
    @InjectRepository(Aluno)
    private readonly alunoRepo: Repository<Aluno>,
  ) {}

  async findPublic(): Promise<unknown[]> {
    const list = await this.cursoRepo.find({
      where: { ativo: true },
      relations: ['turmas'],
      order: { sortOrder: 'ASC', nome: 'ASC' },
    });
    for (const c of list) {
      c.turmas?.sort(
        (a, b) => a.sortOrder - b.sortOrder || a.titulo.localeCompare(b.titulo),
      );
    }
    const turmaIds = list.flatMap((c) => c.turmas?.map((t) => t.id) ?? []);
    const confirmadosMap = await this.countConfirmadosPorTurmas(turmaIds);
    const totalMap = await this.countTotalInscritosPorTurmas(turmaIds);

    return list.map((c) => ({
      id: c.id,
      nome: c.nome,
      slug: c.slug,
      descricao: c.descricao,
      endereco: c.endereco,
      maxAlunos: c.maxAlunos,
      imagemPath: c.imagemPath,
      midiaTipo: c.midiaTipo,
      chaveRadioTurmas: c.chaveRadioTurmas,
      ativo: c.ativo,
      sortOrder: c.sortOrder,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      turmas: (c.turmas ?? []).map((t) => {
        const tid = normTurmaId(t.id);
        const conf = confirmadosMap[tid] ?? 0;
        const tot = totalMap[tid] ?? 0;
        const vagasRestantes = Math.max(0, c.maxAlunos - conf);
        const podeInscrever = tot < c.maxAlunos && conf < c.maxAlunos;
        return {
          id: t.id,
          cursoId: t.cursoId,
          titulo: t.titulo,
          resumo: t.resumo,
          dataEncontro1: t.dataEncontro1,
          dataEncontro2: t.dataEncontro2,
          horarioInicio: t.horarioInicio,
          horarioFim: t.horarioFim,
          sortOrder: t.sortOrder,
          confirmados: conf,
          totalInscritos: tot,
          vagasRestantes,
          podeInscrever,
        };
      }),
    }));
  }

  async findAllAdmin(): Promise<Curso[]> {
    const list = await this.cursoRepo.find({
      relations: ['turmas'],
      order: { sortOrder: 'ASC', nome: 'ASC' },
    });
    for (const c of list) {
      c.turmas?.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return list;
  }

  async findOneAdmin(id: string): Promise<Curso> {
    const curso = await this.cursoRepo.findOne({
      where: { id },
      relations: ['turmas'],
    });
    if (!curso) throw new NotFoundException('Curso não encontrado.');
    curso.turmas?.sort((a, b) => a.sortOrder - b.sortOrder);
    return curso;
  }

  async countInscritosTurma(turmaId: string): Promise<number> {
    return this.alunoRepo.count({ where: { turmaId } });
  }

  async countConfirmadosTurma(turmaId: string): Promise<number> {
    return this.alunoRepo
      .createQueryBuilder('a')
      .where('a.turmaId = :tid', { tid: turmaId })
      .andWhere('a.confirmado = 1')
      .getCount();
  }

  private async countConfirmadosPorTurmas(
    turmaIds: string[],
  ): Promise<Record<string, number>> {
    if (turmaIds.length === 0) return {};
    const rows = await this.alunoRepo
      .createQueryBuilder('a')
      .select('a.turmaId', 'tid')
      .addSelect('COUNT(*)', 'cnt')
      .where('a.turmaId IN (:...ids)', { ids: turmaIds })
      .andWhere('a.confirmado = 1')
      .groupBy('a.turmaId')
      .getRawMany();
    const map: Record<string, number> = {};
    for (const r of rows) {
      const k = normTurmaId(r.tid as string);
      if (k) map[k] = Number(r.cnt);
    }
    return map;
  }

  private async countTotalInscritosPorTurmas(
    turmaIds: string[],
  ): Promise<Record<string, number>> {
    if (turmaIds.length === 0) return {};
    const rows = await this.alunoRepo
      .createQueryBuilder('a')
      .select('a.turmaId', 'tid')
      .addSelect('COUNT(*)', 'cnt')
      .where('a.turmaId IN (:...ids)', { ids: turmaIds })
      .groupBy('a.turmaId')
      .getRawMany();
    const map: Record<string, number> = {};
    for (const r of rows) {
      const k = normTurmaId(r.tid as string);
      if (k) map[k] = Number(r.cnt);
    }
    return map;
  }

  async findTurmaWithCurso(turmaId: string): Promise<Turma | null> {
    return this.turmaRepo.findOne({
      where: { id: turmaId },
      relations: ['curso'],
    });
  }

  async create(dto: CreateCursoDto): Promise<Curso> {
    const exists = await this.cursoRepo.findOne({ where: { slug: dto.slug } });
    if (exists) throw new BadRequestException('Slug já em uso.');
    const row = this.cursoRepo.create({
      nome: dto.nome.trim(),
      slug: dto.slug.trim().toLowerCase(),
      descricao: dto.descricao.trim(),
      endereco: dto.endereco?.trim() ?? null,
      maxAlunos: dto.maxAlunos,
      imagemPath: dto.imagemPath.trim(),
      midiaTipo: dto.midiaTipo ?? 'img',
      chaveRadioTurmas: dto.chaveRadioTurmas?.trim() || null,
      ativo: dto.ativo ?? true,
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.cursoRepo.save(row);
  }

  async update(id: string, dto: UpdateCursoDto): Promise<Curso> {
    const curso = await this.cursoRepo.findOne({ where: { id } });
    if (!curso) throw new NotFoundException('Curso não encontrado.');
    if (dto.slug != null && dto.slug !== curso.slug) {
      const clash = await this.cursoRepo.findOne({ where: { slug: dto.slug } });
      if (clash) throw new BadRequestException('Slug já em uso.');
      curso.slug = dto.slug.trim().toLowerCase();
    }
    if (dto.nome != null) curso.nome = dto.nome.trim();
    if (dto.descricao != null) curso.descricao = dto.descricao.trim();
    if (dto.endereco !== undefined) curso.endereco = dto.endereco?.trim() ?? null;
    if (dto.maxAlunos != null) curso.maxAlunos = dto.maxAlunos;
    if (dto.imagemPath != null) curso.imagemPath = dto.imagemPath.trim();
    if (dto.midiaTipo != null) curso.midiaTipo = dto.midiaTipo;
    if (dto.chaveRadioTurmas !== undefined) {
      curso.chaveRadioTurmas = dto.chaveRadioTurmas?.trim() || null;
    }
    if (dto.ativo != null) curso.ativo = dto.ativo;
    if (dto.sortOrder != null) curso.sortOrder = dto.sortOrder;
    return this.cursoRepo.save(curso);
  }

  async remove(id: string): Promise<void> {
    const curso = await this.cursoRepo.findOne({ where: { id } });
    if (!curso) throw new NotFoundException('Curso não encontrado.');
    await this.cursoRepo.remove(curso);
  }

  private parseDate(s: string | null | undefined): Date | null {
    if (s == null || s === '') return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  async addTurma(cursoId: string, dto: CreateTurmaDto): Promise<Turma> {
    const curso = await this.cursoRepo.findOne({ where: { id: cursoId } });
    if (!curso) throw new NotFoundException('Curso não encontrado.');
    const row = this.turmaRepo.create({
      cursoId,
      titulo: dto.titulo.trim(),
      resumo: dto.resumo?.trim() ?? null,
      dataEncontro1: this.parseDate(dto.dataEncontro1),
      dataEncontro2: this.parseDate(dto.dataEncontro2),
      horarioInicio: dto.horarioInicio?.trim() || null,
      horarioFim: dto.horarioFim?.trim() || null,
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.turmaRepo.save(row);
  }

  async updateTurma(id: string, dto: UpdateTurmaDto): Promise<Turma> {
    const turma = await this.turmaRepo.findOne({ where: { id } });
    if (!turma) throw new NotFoundException('Turma não encontrada.');
    if (dto.titulo != null) turma.titulo = dto.titulo.trim();
    if (dto.resumo !== undefined) turma.resumo = dto.resumo?.trim() ?? null;
    if (dto.dataEncontro1 !== undefined) {
      turma.dataEncontro1 = this.parseDate(dto.dataEncontro1);
    }
    if (dto.dataEncontro2 !== undefined) {
      turma.dataEncontro2 = this.parseDate(dto.dataEncontro2);
    }
    if (dto.horarioInicio !== undefined) {
      turma.horarioInicio = dto.horarioInicio?.trim() || null;
    }
    if (dto.horarioFim !== undefined) {
      turma.horarioFim = dto.horarioFim?.trim() || null;
    }
    if (dto.sortOrder != null) turma.sortOrder = dto.sortOrder;
    return this.turmaRepo.save(turma);
  }

  async removeTurma(id: string): Promise<void> {
    const turma = await this.turmaRepo.findOne({ where: { id } });
    if (!turma) throw new NotFoundException('Turma não encontrada.');
    await this.turmaRepo.remove(turma);
  }
}

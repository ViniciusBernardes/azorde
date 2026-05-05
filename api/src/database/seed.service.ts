import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AdminUser } from '../auth/entities/admin-user.entity';
import { Curso } from '../cursos/entities/curso.entity';
import { Turma } from '../cursos/entities/turma.entity';

const DESC_KIT_CAFE = `Oficina pensada para transformar pequenos rituais do dia a dia em algo especial. Aqui você cria um conjunto original de xícara e pires ou bandeja para os seus momentos de pausa — aquele café com calma, sabe?

O que está incluso:
• Argila
• Uso das ferramentas do estúdio
• Esmaltação (escolha de cor)
• 2 queimas das peças
• Acompanhamento completo em todo o processo

Não precisa levar nada — venha com roupas confortáveis que possam sujar.

Onde e quando:
Dois encontros: no primeiro dia você modela a peça; no segundo, pinta e define o acabamento. Calendário: maio de 2026.

Informações importantes:
• Remarcações: com no mínimo 7 dias de antecedência
• Reembolsos: apenas dentro de 7 dias após a compra
• Após esse prazo, o workshop será considerado realizado

Valores: R$ 370,00 · R$ 350,00 no Pix · ou 2x de R$ 185,00 sem juros. Inscrição confirmada após o pagamento.`;

const DESC_SUSHI = `Instrutora: Isabela Malheiros.

Seu sushi pode ser ainda mais especial com um kit feito por você! Aqui, você cria um prato, um apoio de hashi e um porta shoyu.

O que está incluso:
• Argila
• Uso de ferramentas do ateliê
• Esmaltação (cor à escolha)
• 2 queimas das peças
• Orientação completa durante todo o processo

Não é necessário levar nada — apenas venha com uma roupa confortável que possa sujar.

Serão dois encontros: o primeiro dia para modelar a peça e o segundo para pintar. Calendário: junho de 2026.

Informações importantes:
• Remarcações: com no mínimo 7 dias de antecedência
• Reembolsos: apenas dentro de 7 dias após a compra
• Após esse prazo, o workshop será considerado realizado

Valores: R$ 370,00 · R$ 350,00 no Pix · ou 2x de R$ 185,00 sem juros. Inscrição confirmada após o pagamento.`;

const DESC_PETISQUEIRA = `Imagina montar uma mesa para receber os amigos com itens feitos por você! Nesta oficina faremos uma petisqueira e um porta vinho.

O que está incluso:
• Argila
• Uso de ferramentas do ateliê
• Esmaltação (cor à escolha)
• 2 queimas das peças
• Orientação completa durante todo o processo

Não é necessário levar nada — apenas venha com uma roupa confortável que possa sujar.

Serão dois encontros: o primeiro dia para modelar a peça e o segundo para pintar. Calendário: junho de 2026.

Informações importantes:
• Remarcações: com no mínimo 7 dias de antecedência
• Reembolsos: apenas dentro de 7 dias após a compra
• Após esse prazo, o workshop será considerado realizado

Valores: R$ 370,00 · R$ 350,00 no Pix · ou 2x de R$ 185,00 sem juros. Inscrição confirmada após o pagamento.`;

function seedFlag(v: unknown): boolean {
  return v === true || v === 'true' || v === '1' || v === 1;
}

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly log = new Logger(SeedService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(AdminUser)
    private readonly adminRepo: Repository<AdminUser>,
    @InjectRepository(Curso)
    private readonly cursoRepo: Repository<Curso>,
    @InjectRepository(Turma)
    private readonly turmaRepo: Repository<Turma>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!seedFlag(this.config.get('SEED_ON_START'))) return;
    await this.run();
  }

  async run(): Promise<void> {
    await this.seedAdmin();
    await this.seedCursos();
    this.log.log('Seed concluído.');
  }

  private async seedAdmin(): Promise<void> {
    const n = await this.adminRepo.count();
    if (n > 0) return;
    const username = this.config.get<string>('ADMIN_USERNAME', 'admin');
    const password = this.config.get<string>('ADMIN_PASSWORD', 'admin123');
    const hash = await bcrypt.hash(password, 10);
    await this.adminRepo.save(
      this.adminRepo.create({ username, passwordHash: hash }),
    );
    this.log.log(`Usuário admin criado: ${username}`);
  }

  private async seedCursos(): Promise<void> {
    const n = await this.cursoRepo.count();
    if (n > 0) return;

    const endereco = 'R. Santa Maria, 662 — Todos os Santos, Montes Claros / MG';

    const kit = this.cursoRepo.create({
      nome: 'Oficina de cerâmica — Kit café da manhã',
      slug: 'kit-cafe-manha',
      descricao: DESC_KIT_CAFE,
      endereco,
      maxAlunos: 6,
      imagemPath: 'assets/curso-kit-cafe-manha.png',
      midiaTipo: 'img',
      chaveRadioTurmas: 'turma-kit-cafe',
      ativo: true,
      sortOrder: 0,
    });
    await this.cursoRepo.save(kit);

    await this.turmaRepo.save([
      this.turmaRepo.create({
        cursoId: kit.id,
        titulo: 'Turma 1',
        resumo: 'Turma 1 — 12/05 e 19/05 (terças-feiras)',
        dataEncontro1: new Date('2026-05-12'),
        dataEncontro2: new Date('2026-05-19'),
        horarioInicio: '09:00:00',
        horarioFim: '12:00:00',
        sortOrder: 0,
      }),
      this.turmaRepo.create({
        cursoId: kit.id,
        titulo: 'Turma 2',
        resumo: 'Turma 2 — 14/05 e 21/05 (quintas-feiras)',
        dataEncontro1: new Date('2026-05-14'),
        dataEncontro2: new Date('2026-05-21'),
        horarioInicio: '09:00:00',
        horarioFim: '12:00:00',
        sortOrder: 1,
      }),
    ]);

    const sushi = this.cursoRepo.create({
      nome: 'Meu kit de sushi',
      slug: 'kit-sushi',
      descricao: DESC_SUSHI,
      endereco,
      maxAlunos: 6,
      imagemPath: 'assets/oficina-sushi-kit-hero.png',
      midiaTipo: 'logo-bg',
      chaveRadioTurmas: null,
      ativo: true,
      sortOrder: 1,
    });
    await this.cursoRepo.save(sushi);

    await this.turmaRepo.save(
      this.turmaRepo.create({
        cursoId: sushi.id,
        titulo: 'Turma 1',
        resumo: 'Turma 1 — 02/06 e 09/06 (terça)',
        dataEncontro1: new Date('2026-06-02'),
        dataEncontro2: new Date('2026-06-09'),
        horarioInicio: '09:00:00',
        horarioFim: '12:00:00',
        sortOrder: 0,
      }),
    );

    const pet = this.cursoRepo.create({
      nome: 'Petisqueira e porta vinho',
      slug: 'petisqueira-porta-vinho',
      descricao: DESC_PETISQUEIRA,
      endereco,
      maxAlunos: 6,
      imagemPath: 'assets/oficina-petisqueira-cover.png',
      midiaTipo: 'img',
      chaveRadioTurmas: null,
      ativo: true,
      sortOrder: 2,
    });
    await this.cursoRepo.save(pet);

    await this.turmaRepo.save(
      this.turmaRepo.create({
        cursoId: pet.id,
        titulo: 'Turma 1',
        resumo: 'Turma 1 — 04/06 e 11/06 (quintas-feiras)',
        dataEncontro1: new Date('2026-06-04'),
        dataEncontro2: new Date('2026-06-11'),
        horarioInicio: '09:00:00',
        horarioFim: '12:00:00',
        sortOrder: 0,
      }),
    );

    this.log.log('Cursos e turmas iniciais criados (3 cursos).');
  }
}

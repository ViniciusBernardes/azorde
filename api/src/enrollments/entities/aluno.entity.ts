import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Curso } from '../../cursos/entities/curso.entity';
import { Turma } from '../../cursos/entities/turma.entity';

@Entity('alunos')
export class Aluno {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  cursoId: string | null;

  @ManyToOne(() => Curso, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cursoId' })
  curso: Curso | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  turmaId: string | null;

  @ManyToOne(() => Turma, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'turmaId' })
  turmaRef: Turma | null;

  @Column({ type: 'varchar', length: 200 })
  courseName: string;

  @Column({ type: 'varchar', length: 500 })
  turma: string;

  @Column({ type: 'varchar', length: 200 })
  nome: string;

  @Column({ type: 'varchar', length: 32 })
  telefone: string;

  @Column({ type: 'varchar', length: 200 })
  email: string;

  @Column({ type: 'varchar', length: 64 })
  pixKey: string;

  @Column({ type: 'varchar', length: 500 })
  receiptStoredName: string;

  @Column({ type: 'varchar', length: 500 })
  receiptOriginalName: string;

  /** Inscrição homologada pelo estúdio; conta para limite de vagas exibido no site. */
  @Column({ type: 'boolean', default: false })
  confirmado: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}

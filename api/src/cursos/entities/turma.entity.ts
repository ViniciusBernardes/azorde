import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Curso } from './curso.entity';

@Entity('turmas')
export class Turma {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  cursoId: string;

  @ManyToOne(() => Curso, (c) => c.turmas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cursoId' })
  curso: Curso;

  @Column({ type: 'varchar', length: 120 })
  titulo: string;

  /** Texto exibido (ex.: Turma 1 — 12/05 e 19/05 (terças-feiras)). */
  @Column({ type: 'varchar', length: 500, nullable: true })
  resumo: string | null;

  @Column({ type: 'date', nullable: true })
  dataEncontro1: Date | null;

  @Column({ type: 'date', nullable: true })
  dataEncontro2: Date | null;

  @Column({ type: 'time', nullable: true })
  horarioInicio: string | null;

  @Column({ type: 'time', nullable: true })
  horarioFim: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;
}

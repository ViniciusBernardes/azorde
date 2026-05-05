import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Turma } from './turma.entity';

@Entity('cursos')
export class Curso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  nome: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  slug: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  endereco: string | null;

  @Column({ type: 'int' })
  maxAlunos: number;

  /** Caminho relativo ao site (ex.: assets/curso-kit-cafe-manha.png). */
  @Column({ type: 'varchar', length: 500 })
  imagemPath: string;

  /** img = imagem principal; logo-bg = bloco com logo (oficina sushi). */
  @Column({ type: 'varchar', length: 20, default: 'img' })
  midiaTipo: 'img' | 'logo-bg';

  /** Quando há várias turmas com rádio no front (ex.: turma-kit-cafe). */
  @Column({ type: 'varchar', length: 80, nullable: true })
  chaveRadioTurmas: string | null;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(() => Turma, (t) => t.curso, { cascade: true })
  turmas: Turma[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}

import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateEnrollmentDto {
  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  @IsUUID('4')
  cursoId?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  @IsUUID('4')
  turmaId?: string;

  @ValidateIf((o: CreateEnrollmentDto) => !o.turmaId)
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  courseName?: string;

  @ValidateIf((o: CreateEnrollmentDto) => !o.turmaId)
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  turma?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nome: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  telefone: string;

  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  pixKey: string;
}

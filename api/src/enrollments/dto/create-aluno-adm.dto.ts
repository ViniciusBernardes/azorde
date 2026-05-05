import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAlunoAdmDto {
  @IsUUID('4')
  turmaId: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  @IsUUID('4')
  cursoId?: string;

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

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  @IsString()
  @MaxLength(64)
  pixKey?: string;

  @IsOptional()
  @IsBoolean()
  confirmado?: boolean;
}

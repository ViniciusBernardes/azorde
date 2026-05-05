import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateTurmaDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  titulo: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  resumo?: string | null;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  @IsDateString()
  dataEncontro1?: string | null;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  @IsDateString()
  dataEncontro2?: string | null;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  @IsString()
  @MaxLength(12)
  horarioInicio?: string | null;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  @IsString()
  @MaxLength(12)
  horarioFim?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

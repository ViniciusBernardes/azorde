import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCursoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nome: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  slug: string;

  @IsString()
  @MinLength(10)
  descricao: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  endereco?: string | null;

  @IsInt()
  @Min(1)
  @Max(500)
  maxAlunos: number;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  imagemPath: string;

  @IsOptional()
  @IsIn(['img', 'logo-bg'])
  midiaTipo?: 'img' | 'logo-bg';

  @IsOptional()
  @IsString()
  @MaxLength(80)
  chaveRadioTurmas?: string | null;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

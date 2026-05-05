import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { EnrollmentsService } from './enrollments.service';

const MAX_BYTES = 5 * 1024 * 1024;

function uploadDestination(): string {
  return process.env.UPLOAD_DEST ?? join(process.cwd(), 'uploads');
}

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('comprovante', {
      limits: { fileSize: MAX_BYTES },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dest = uploadDestination();
          mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname) || '';
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
    }),
  )
  async create(
    @Body() body: CreateEnrollmentDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    const { id } = await this.enrollmentsService.create(body, file);
    return {
      id,
      message:
        'Cadastro salvo com sucesso. Entraremos em contato em breve para confirmar sua vaga.',
    };
  }
}

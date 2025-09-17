import { Controller, Post, Param, UploadedFile, UseInterceptors, ParseUUIDPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from './documentos.servicio';
import { diskStorage } from 'multer';

@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post('subir/:proyectoId')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
    }),
  )
  subirDocumento(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    return this.documentosService.guardarRegistro(proyectoId, archivo);
  }
}
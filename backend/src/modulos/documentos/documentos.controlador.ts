import { Controller, Post, Param, UploadedFile, UseInterceptors, ParseIntPipe, Get, Res, Query, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from './documentos.servicio';
import { TipoDocumento } from './entidades/documento.entidad';
import { diskStorage } from 'multer';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';

@ApiTags('documentos')
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly servicio_documentos: DocumentosService) {}

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
  @ApiOperation({ summary: 'Subir un documento a un proyecto' })
  @ApiParam({ name: 'proyectoId', description: 'ID numérico del proyecto al que pertenece el documento' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo a subir',
    schema: {
      type: 'object',
      properties: {
        archivo: {
          type: 'string',
          format: 'binary',
        },
        tipo_documento: {
          type: 'string',
          enum: ['perfil', 'proyecto'],
          default: 'perfil',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Documento subido y registrado exitosamente.' })
  @ApiResponse({ status: 404, description: 'El proyecto especificado no fue encontrado.' })
  subirDocumento(
    @Param('proyectoId', ParseIntPipe) proyectoId: number,
    @UploadedFile() archivo: Express.Multer.File,
    @Body('tipo_documento') tipo_documento?: string,
  ) {
    const tipo = tipo_documento === 'proyecto' ? TipoDocumento.PROYECTO : TipoDocumento.PERFIL;
    return this.servicio_documentos.guardarRegistro(proyectoId, archivo, tipo);
  }

  @Get(':id/archivo')
  @ApiOperation({ summary: 'Obtener el archivo de un documento por ID' })
  async obtenerArchivo(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const documento = await this.servicio_documentos.obtenerUno(id);
    const file = createReadStream(join(process.cwd(), documento.ruta_archivo));
    res.setHeader('Content-Type', 'application/pdf');
    file.pipe(res);
  }

  @Get('archivo-por-ruta')
  @ApiOperation({ summary: 'Obtener el archivo de un documento por RUTA' })
  @ApiQuery({ name: 'ruta', description: 'Ruta del archivo (ej: uploads/archivo.pdf)', required: true })
  async obtenerArchivoPorRuta(@Query('ruta') ruta: string, @Res() res: Response) {
    const documento = await this.servicio_documentos.obtenerPorRuta(ruta);
    const file = createReadStream(join(process.cwd(), documento.ruta_archivo));
    res.setHeader('Content-Type', 'application/pdf');
    file.pipe(res);
  }
}
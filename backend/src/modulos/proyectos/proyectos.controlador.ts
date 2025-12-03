import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards, Request, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ProyectosService } from './proyectos.servicio';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';
import { AprobarEtapaDto } from './dto/aprobar-etapa.dto';
import { AccionTemaDto } from './dto/accion-tema.dto';
import { BuscarProyectosDto } from './dto/buscar-proyectos.dto';
import { EtapaProyecto } from './enums/etapa-proyecto.enum';
import { SolicitarDefensaDto } from './dto/solicitar-defensa.dto';
import { ResponderSolicitudDefensaDto } from './dto/responder-solicitud-defensa.dto';
import { Rol } from '../usuarios/enums/rol.enum';
import { Roles } from '../autenticacion/decorators/roles.decorator';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { ActualizarPropuestaDto } from './dto/actualizar-propuesta.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('proyectos')
@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly servicio_proyectos: ProyectosService) {}

  // ============== ENDPOINTS PÚBLICOS (Sin autenticación) ==============
  
  @Get('repositorio/publico')
  @ApiOperation({ summary: 'Buscar proyectos terminados en el repositorio público (Sin autenticación)' })
  @ApiQuery({ name: 'termino', required: false, type: String })
  @ApiQuery({ name: 'anio', required: false, type: String })
  @ApiQuery({ name: 'asesorId', required: false, type: String })
  @ApiQuery({ name: 'soloTerminados', required: false, type: Boolean })
  @ApiQuery({ name: 'soloPerfilesAprobados', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Resultados de la búsqueda pública' })
  async buscarProyectosPublico(@Query() buscar_dto: BuscarProyectosDto) {
    // Forzar que solo devuelva proyectos terminados o perfiles aprobados
    if (!buscar_dto.soloPerfilesAprobados) {
      buscar_dto.soloTerminados = true;
    }
    return this.servicio_proyectos.buscarProyectosPublico(buscar_dto);
  }

  @Get('repositorio/publico/asesores')
  @ApiOperation({ summary: 'Obtener lista de asesores para filtro público (Sin autenticación)' })
  @ApiResponse({ status: 200, description: 'Lista de asesores' })
  async obtenerAsesoresPublico() {
    return this.servicio_proyectos.obtenerAsesoresPublico();
  }

  @Get('repositorio/publico/:id')
  @ApiOperation({ summary: 'Obtener detalle de un proyecto terminado (Sin autenticación)' })
  @ApiParam({ name: 'id', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto encontrado.' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado o no está terminado.' })
  async obtenerProyectoPublico(@Param('id', ParseIntPipe) id: number) {
    return this.servicio_proyectos.obtenerProyectoPublico(id);
  }

  // ============== ENDPOINTS PROTEGIDOS (Requieren autenticación) ==============

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Rol.Estudiante)
  @ApiOperation({ summary: 'Crear un nuevo proyecto (Taller I)' })
  @ApiResponse({ status: 201, description: 'Proyecto creado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Estudiante o Asesor no encontrado.' })
  crear(@Body() crear_proyecto_dto: CrearProyectoDto, @Request() req) {
    return this.servicio_proyectos.crear(crear_proyecto_dto, req.user.id_usuario);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Obtener todos los proyectos del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de proyectos del usuario.' })
  obtenerTodos(@Request() req) {
    return this.servicio_proyectos.obtenerTodos(req.user.id_usuario, req.user.rol);
  }

  @Get('buscar')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Buscar en el repositorio de proyectos de grado' })
  @ApiQuery({ name: 'termino', required: false, type: String })
  @ApiQuery({ name: 'periodoId', required: false, type: String })
  @ApiQuery({ name: 'etapa', required: false, enum: EtapaProyecto })
  @ApiQuery({ name: 'soloAprobados', required: false, type: Boolean, description: 'Filtra por proyectos con etapa TERMINADO' })
  @ApiQuery({ name: 'anio', required: false, type: String })
  @ApiQuery({ name: 'carrera', required: false, type: String })
  @ApiQuery({ name: 'asesorId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Resultados de la búsqueda' })
  async buscarProyectos(
    @Query() buscar_dto: BuscarProyectosDto,
    @Request() req
  ) {
    buscar_dto.soloAprobados = true;
    return this.servicio_proyectos.buscarProyectos(buscar_dto, req.user.id_usuario, req.user.rol);
  }

  @Get('solicitudes/defensa')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Rol.Administrador)
  @ApiOperation({ summary: 'Obtener todas las solicitudes de defensa (Admin)' })
  @ApiQuery({ name: 'estado', required: false, enum: ['pendientes', 'aprobadas', 'rechazadas'] })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes de defensa.' })
  obtenerSolicitudesDefensa(@Query('estado') estado?: string) {
    return this.servicio_proyectos.obtenerSolicitudesDefensa(estado);
  }

  @Get('historial-progreso')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Rol.Estudiante)
  @ApiOperation({ summary: 'Obtener historial de avances y revisiones (Estudiante)' })
  @ApiResponse({ status: 200, description: 'Historial de progreso del estudiante' })
  @ApiResponse({ status: 404, description: 'Estudiante sin proyecto asignado' })
  async obtenerHistorialProgreso(@Request() req) {
    return this.servicio_proyectos.obtenerHistorialProgreso(req.user.id_usuario);
  }

  @Get('cronograma')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Rol.Estudiante)
  @ApiOperation({ summary: 'Obtener cronograma de fechas límite (Estudiante)' })
  @ApiResponse({ status: 200, description: 'Cronograma del proyecto del estudiante' })
  @ApiResponse({ status: 404, description: 'Estudiante sin proyecto o período asignado' })
  async obtenerCronogramaProyecto(@Request() req) {
    return this.servicio_proyectos.obtenerCronogramaProyecto(req.user.id_usuario);
  }

  @Get('timeline')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Rol.Estudiante)
  @ApiOperation({ summary: 'Obtener línea de tiempo completa del proyecto (Estudiante)' })
  @ApiResponse({ status: 200, description: 'Línea de tiempo completa.' })
  async obtenerTimelineCompleto(@Request() req) {
    return this.servicio_proyectos.obtenerTimelineCompleto(req.user.id_usuario);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Obtener un proyecto por su ID' })
  @ApiParam({ name: 'id', description: 'ID numérico del proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto encontrado.' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado.' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para acceder a este proyecto.' })
  obtenerUno(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.servicio_proyectos.obtenerUno(id, req.user.id_usuario, req.user.rol);
  }

  @Patch(':id/aprobar-etapa')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Rol.Asesor)
  @ApiOperation({ summary: 'Aprobar una etapa del proyecto (Asesor)' })
  @ApiParam({ name: 'id', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Etapa aprobada exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo el asesor puede aprobar etapas' })
  @ApiResponse({ status: 400, description: 'Transición de etapa inválida' })
  async aprobarEtapa(
    @Param('id', ParseIntPipe) id: number,
    @Body() aprobar_etapa_dto: AprobarEtapaDto,
    @Request() req
  ) {
    return this.servicio_proyectos.aprobarEtapa(id, aprobar_etapa_dto, req.user.id_usuario);
  }

  @Patch(':id/tema')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Rol.Asesor)
  @ApiOperation({ summary: 'Aprobar o rechazar el tema propuesto (Asesor)' })
  @ApiParam({ name: 'id', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Tema gestionado exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo el asesor puede gestionar el tema' })
  @ApiResponse({ status: 400, description: 'El tema ya fue aprobado' })
  async gestionarTemaPropuesto(
    @Param('id', ParseIntPipe) id: number,
    @Body() accion_tema_dto: AccionTemaDto,
    @Request() req
  ) {
    return this.servicio_proyectos.gestionarTemaPropuesto(id, accion_tema_dto, req.user.id_usuario);
  }

  @Patch(':id/propuesta')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Rol.Estudiante)
  @ApiOperation({ summary: 'Actualizar una propuesta rechazada (Estudiante)' })
  @ApiParam({ name: 'id', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Propuesta actualizada.' })
  async actualizarPropuesta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarPropuestaDto,
    @Request() req,
  ) {
    return this.servicio_proyectos.actualizarPropuesta(id, dto, req.user.id_usuario);
  }

  @Patch(':id/solicitar-defensa')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Rol.Estudiante)
  @ApiOperation({ summary: 'Solicitar defensa de proyecto (Estudiante)' })
  @ApiParam({ name: 'id', description: 'ID del proyecto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo memorial PDF',
    schema: {
      type: 'object',
      properties: {
        memorial: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Solicitud de defensa enviada.' })
  @UseInterceptors(
    FileInterceptor('memorial', {
      storage: diskStorage({
        destination: './uploads/memoriales',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = file.originalname.split('.').pop();
          cb(null, `memorial-${(req.user as any).id_usuario}-${uniqueSuffix}.${extension}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(pdf)$/)) {
          return cb(new BadRequestException('Solo se permiten archivos PDF'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      }
    }),
  )
  async solicitarDefensa(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() memorial: Express.Multer.File,
    @Request() req,
  ) {
    if (!memorial) {
      throw new BadRequestException('No se proporcionó ningún archivo de memorial.');
    }
    const dto: SolicitarDefensaDto = {
      ruta_memorial: `uploads/memoriales/${memorial.filename}`,
    };
    return this.servicio_proyectos.solicitarDefensa(id, dto, req.user.id_usuario);
  }
  
  @Patch(':id/responder-defensa')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Rol.Administrador)
  @ApiOperation({ summary: 'Responder solicitud de defensa (Admin)' })
  @ApiParam({ name: 'id', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Respuesta a solicitud registrada.' })
  async responderSolicitudDefensa(
    @Param('id', ParseIntPipe) id: number,
    @Body() responder_dto: ResponderSolicitudDefensaDto,
    @Request() req,
  ) {
    return this.servicio_proyectos.responderSolicitudDefensa(id, responder_dto, req.user.id_usuario);
  }
}
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PeriodosService } from './periodos.servicio';
import { CrearPeriodoDto } from './dto/crear-periodo.dto';
import { ActualizarPeriodoDto } from './dto/actualizar-periodo.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../autenticacion/guards/jwt.guard';

@ApiTags('periodos')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('periodos')
export class PeriodosController {
  constructor(private readonly servicio_periodos: PeriodosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo período' })
  @ApiResponse({ status: 201, description: 'Período creado exitosamente.' })
  crear(@Body() crear_periodo_dto: CrearPeriodoDto) {
    return this.servicio_periodos.crear(crear_periodo_dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los períodos' })
  @ApiResponse({ status: 200, description: 'Lista de todos los períodos.' })
  obtenerTodos() {
    return this.servicio_periodos.obtenerTodos();
  }

  @Get('activo')
  @ApiOperation({ summary: 'Obtener el período activo' })
  @ApiResponse({ status: 200, description: 'Período activo.' })
  obtenerActivo() {
    return this.servicio_periodos.obtenerActivo();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un período por su ID' })
  @ApiParam({ name: 'id', description: 'ID del período' })
  @ApiResponse({ status: 200, description: 'Período encontrado.' })
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.servicio_periodos.obtenerUno(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un período' })
  @ApiParam({ name: 'id', description: 'ID del período' })
  @ApiResponse({ status: 200, description: 'Período actualizado.' })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() actualizar_periodo_dto: ActualizarPeriodoDto) {
    return this.servicio_periodos.actualizar(id, actualizar_periodo_dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un período' })
  @ApiParam({ name: 'id', description: 'ID del período' })
  @ApiResponse({ status: 200, description: 'Período eliminado.' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.servicio_periodos.eliminar(id);
  }
}
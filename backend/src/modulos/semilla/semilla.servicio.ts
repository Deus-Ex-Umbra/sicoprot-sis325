import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entidades/usuario.entidad';
import { Rol } from '../usuarios/enums/rol.enum';
import { EstadoUsuario } from '../usuarios/enums/estado-usuario.enum';
import * as bcrypt from 'bcrypt';

import { Asesor } from '../asesores/entidades/asesor.entidad';
import { Estudiante } from '../estudiantes/entidades/estudiante.entidad';
import { Proyecto } from '../proyectos/entidades/proyecto.endidad';
import { Documento } from '../documentos/entidades/documento.entidad';
import { Observacion } from '../observaciones/entidades/observacion.entidad';
import { EstadoObservacion } from '../observaciones/enums/estado-observacion.enum';

@Injectable()
export class SemillaService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario)
    private readonly repositorio_usuario: Repository<Usuario>,
  
    @InjectRepository(Asesor)
    private readonly repoAsesor: Repository<Asesor>,
    @InjectRepository(Estudiante)
    private readonly repoEstudiante: Repository<Estudiante>,
    @InjectRepository(Proyecto)
    private readonly repoProyecto: Repository<Proyecto>,
    @InjectRepository(Documento)
    private readonly repoDocumento: Repository<Documento>,
    @InjectRepository(Observacion)
    private readonly repoObservacion: Repository<Observacion>,
  ) {}

  async onModuleInit() {
    await this.crearAdministradorPorDefecto();
  }

  private async crearAdministradorPorDefecto() {
    const admin_existe = await this.repositorio_usuario.findOne({
      where: { rol: Rol.Administrador },
    });

    if (!admin_existe) {
      const admin = this.repositorio_usuario.create({
        correo: 'admin@test.com',
        contrasena: await bcrypt.hash('Admin1234', 10),
        rol: Rol.Administrador,
        estado: EstadoUsuario.Activo,
        fecha_aprobacion: new Date(),
      });

      await this.repositorio_usuario.save(admin);
      console.log('✓ Administrador por defecto creado: admin@test.com / Admin1234');
    }
  }

  async sembrarDatos() {
    // Solo en desarrollo
    if (process.env.NODE_ENV === 'production') return;

    const totalUsuarios = await this.repositorio_usuario.count();
    if (totalUsuarios > 1) { // ← Cambié de > 0 a > 1 porque admin ya existe
      console.log('✅ La base de datos ya tiene datos. No se sembrará.');
      return;
    }

    console.log('🌱 Sembrando datos de ejemplo...');

    // 1. Crear usuarios (2 asesores + 3 estudiantes)
    const usuarios: Usuario[] = [];
    const nombresAsesores = ['Carlos Méndez', 'Ana Torres'];
    const nombresEstudiantes = ['Juan Pérez', 'María López', 'Pedro Gómez'];

    for (let i = 1; i <= 5; i++) {
      const usuario = this.repositorio_usuario.create({
        correo: i <= 2 ? `asesor${i}@example.com` : `estudiante${i - 2}@example.com`,
        contrasena: await bcrypt.hash('12345678', 10),
        rol: i <= 2 ? Rol.Asesor : Rol.Estudiante,
        estado: EstadoUsuario.Activo,
        fecha_aprobacion: new Date(),
      });
      usuarios.push(await this.repositorio_usuario.save(usuario));
    }

    // 2. Crear asesores con nombres reales
    const asesores: Asesor[] = [];
    for (let i = 0; i < 2; i++) {
      const [nombre, apellido] = nombresAsesores[i].split(' ');
      const asesor = this.repoAsesor.create({
        usuario: usuarios[i],
        nombre,
        apellido,
      });
      asesores.push(await this.repoAsesor.save(asesor));
    }

    // 3. Crear estudiantes con nombres reales
    const estudiantes: Estudiante[] = [];
    for (let i = 2; i < 5; i++) {
      const [nombre, apellido] = nombresEstudiantes[i - 2].split(' ');
      const estudiante = this.repoEstudiante.create({
        usuario: usuarios[i],
        nombre,
        apellido,
      });
      estudiantes.push(await this.repoEstudiante.save(estudiante));
    }

    // 4. Crear proyectos realistas
    const titulosProyectos = [
      'Sistema de Gestión de Inventario para Pymes',
      'Aplicación Móvil de Telemedicina',
      'Plataforma de E-Learning con IA'
    ];

    const proyectos: Proyecto[] = [];
    for (let i = 0; i < estudiantes.length; i++) {
      const proyecto = this.repoProyecto.create({
        titulo: titulosProyectos[i],
        asesor: asesores[i % asesores.length], // Distribuye entre asesores
      });
      const proyectoGuardado = await this.repoProyecto.save(proyecto);
      proyectos.push(proyectoGuardado);

      // Vincular estudiante al proyecto
      estudiantes[i].proyecto = proyectoGuardado;
      await this.repoEstudiante.save(estudiantes[i]);
    }

    // 5. Crear documentos (varios por proyecto para simular versiones)
    const documentos: Documento[] = [];
    for (let i = 0; i < proyectos.length; i++) {
      // Versión 1 (antigua, rechazada)
      const docV1 = this.repoDocumento.create({
        nombre_archivo: `perfil_${proyectos[i].titulo.toLowerCase().replace(/ /g, '_')}_v1.pdf`,
        ruta_archivo: '/uploads/fake-document-v1.pdf', // ← CORREGIDO
        version: 1,
        proyecto: proyectos[i],
      });
      await this.repoDocumento.save(docV1);

      // Versión 2 (actual, en revisión)
      const docV2 = this.repoDocumento.create({
        nombre_archivo: `perfil_${proyectos[i].titulo.toLowerCase().replace(/ /g, '_')}_v2.pdf`,
        ruta_archivo: '/uploads/fake-document-v2.pdf', // ← CORREGIDO
        version: 2,
        proyecto: proyectos[i],
      });
      const docGuardado = await this.repoDocumento.save(docV2);
      documentos.push(docGuardado); // Solo guardamos la última versión para observaciones
    }

    // 6. Crear observaciones realistas (3 por documento)
    const observacionesPorDoc = [
      [
        { titulo: 'Falta justificación del problema', detalle: 'En el Capítulo 2 no queda claro por qué es necesario el sistema. Debe agregarse estadísticas o casos de estudio que respalden la problemática.', estado: EstadoObservacion.PENDIENTE, pagina: 8 },
        { titulo: 'Objetivos muy amplios', detalle: 'Los objetivos específicos del Capítulo 3 son demasiado generales. Deben ser medibles y acotados en tiempo.', estado: EstadoObservacion.PENDIENTE, pagina: 12 },
        { titulo: 'Agregar más antecedentes', detalle: 'El Capítulo 1 necesita al menos 3 sistemas similares analizados como antecedentes.', estado: EstadoObservacion.CORREGIDO, pagina: 5 },
      ],
      [
        { titulo: 'Diagrama de arquitectura incompleto', detalle: 'Falta detallar la comunicación entre microservicios en el diagrama de la página 15.', estado: EstadoObservacion.PENDIENTE, pagina: 15 },
        { titulo: 'Metodología poco clara', detalle: 'La metodología de desarrollo no especifica sprints ni entregables concretos.', estado: EstadoObservacion.RECHAZADO, pagina: 20 },
        { titulo: 'Bibliografía incompleta', detalle: 'Varias citas no tienen su referencia completa en la bibliografía.', estado: EstadoObservacion.CORREGIDO, pagina: 45 },
      ],
      [
        { titulo: 'Alcance demasiado extenso', detalle: 'El alcance del proyecto es muy amplio para el tiempo disponible. Debe acotarse.', estado: EstadoObservacion.PENDIENTE, pagina: 10 },
        { titulo: 'Cronograma irreal', detalle: 'El cronograma del Capítulo 5 no considera imprevistos ni pruebas de usuario.', estado: EstadoObservacion.PENDIENTE, pagina: 25 },
        { titulo: 'Marco teórico bien fundamentado', detalle: 'El marco teórico del Capítulo 2 está muy bien estructurado. Sin cambios necesarios.', estado: EstadoObservacion.CORREGIDO, pagina: 7 },
      ]
    ];

    for (let i = 0; i < documentos.length; i++) {
      const observacionesDelDoc = observacionesPorDoc[i];
      
      for (const obsData of observacionesDelDoc) {
        const observacion = this.repoObservacion.create({
          titulo: obsData.titulo,
          contenido_detallado: obsData.detalle,
          descripcion_corta: obsData.titulo, // ← Obligatorio
          estado: obsData.estado,
          x_inicio: 10.5,
          y_inicio: 20.3,
          x_fin: 30.7,
          y_fin: 40.1,
          pagina_inicio: obsData.pagina,
          pagina_fin: obsData.pagina,
          documento: documentos[i],
          autor: asesores[i % asesores.length],
          version_observada: 2, // ← Observación hecha sobre versión 2
          archivada: false,
        });
        await this.repoObservacion.save(observacion);
      }
    }

    console.log('✅ Datos de ejemplo sembrados exitosamente:');
    console.log('   → 2 Asesores: asesor1@example.com / asesor2@example.com');
    console.log('   → 3 Estudiantes: estudiante1@example.com / estudiante2@example.com / estudiante3@example.com');
    console.log('   → 3 Proyectos con documentos versión 1 y 2');
    console.log('   → 9 Observaciones (3 por proyecto) con estados variados');
    console.log('   📝 Contraseña para todos: 12345678');
  }
}
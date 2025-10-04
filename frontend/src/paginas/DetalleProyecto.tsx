import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, ListGroup, Badge, Alert, Form } from 'react-bootstrap';
import { FaArrowLeft, FaFileUpload, FaPlus } from 'react-icons/fa';
import VisualizadorDocumento from '../componentes/VisualizadorDocumento';
import { obtenerProyectoPorId } from '../servicios/proyectos.servicio';
import { subirDocumento } from '../servicios/documentos.servicio';
import { obtenerObservacionesPorProyecto } from '../servicios/observaciones.servicio';
import { obtenerCorreccionesPorProyecto } from '../servicios/correcciones.servicio';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { type Proyecto, type Documento, type Observacion, type Correccion, Rol } from '../tipos/usuario';
import api from '../servicios/api';

const DetalleProyecto = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAutenticacion();
  
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<Documento | null>(null);
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [correcciones, setCorrecciones] = useState<Correccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  const [observacionSeleccionada, setObservacionSeleccionada] = useState<number | null>(null);
  const [correccionSeleccionada, setCorreccionSeleccionada] = useState<number | null>(null);
  
  const esEstudiante = usuario?.rol === Rol.Estudiante;
  const esAsesor = usuario?.rol === Rol.Asesor;

  const observacionesPendientes = observaciones.filter(obs => 
    obs.estado === 'pendiente' && !obs.correccion
  );

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const proyectoData = await obtenerProyectoPorId(parseInt(id!));
      setProyecto(proyectoData);
      
      const documentosData = proyectoData.documentos?.sort((a, b) => b.version - a.version) || [];
      setDocumentos(documentosData);
      
      if (documentosData.length > 0) {
        setDocumentoSeleccionado(documentosData[0]);
      }

      const [obsData, corrData] = await Promise.all([
        obtenerObservacionesPorProyecto(parseInt(id!)),
        obtenerCorreccionesPorProyecto(parseInt(id!)),
      ]);
      setObservaciones(obsData);
      setCorrecciones(corrData);
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar el proyecto');
    } finally {
      setCargando(false);
    }
  };

  const manejarSubidaArchivo = async () => {
    if (!archivo || !proyecto) return;

    setSubiendoArchivo(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      
      await subirDocumento(proyecto.id, formData);
      
      await cargarDatos();
      setArchivo(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al subir el documento');
    } finally {
      setSubiendoArchivo(false);
    }
  };

  const observacionesDelDocumento = documentoSeleccionado
    ? observaciones.filter(obs => (obs as any).documento.id === documentoSeleccionado.id)
    : [];

  const correccionesDelDocumento = documentoSeleccionado
    ? correcciones.filter(corr => (corr as any).documento.id === documentoSeleccionado.id)
    : [];

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <Alert variant="danger">
        Proyecto no encontrado
        <Button variant="link" onClick={() => navigate('/panel/proyectos')}>
          Volver a proyectos
        </Button>
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button 
            variant="outline-secondary" 
            className="me-3"
            onClick={() => navigate('/panel/proyectos')}
          >
            <FaArrowLeft className="me-2" />
            Volver
          </Button>
          <h2 className="text-light mb-0">{proyecto.titulo}</h2>
        </div>
        <div className="d-flex gap-2">
          {esAsesor && documentos.length > 0 && (
            <Button
              variant="warning"
              onClick={() => navigate(`/panel/proyecto/${id}/crear-observacion`)}
            >
              <FaPlus className="me-2" />
              Nueva Observación
            </Button>
          )}
          {esEstudiante && observacionesPendientes.length > 0 && (
            <Button
              variant="success"
              onClick={() => navigate(`/panel/proyecto/${id}/crear-correccion`)}
            >
              <FaPlus className="me-2" />
              Nueva Corrección
            </Button>
          )}
        </div>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Row>
        <Col md={3}>
          <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }} className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Documentos</h5>
            </Card.Header>
            <Card.Body>
              {esEstudiante && (
                <div className="mb-3">
                  <Form.Group className="mb-2">
                    <Form.Label htmlFor="file-upload" className="btn btn-outline-primary w-100">
                      Seleccionar Archivo
                    </Form.Label>
                    <Form.Control
                      id="file-upload"
                      type="file"
                      accept=".pdf"
                      onChange={(e: any) => setArchivo(e.target.files[0])}
                      disabled={subiendoArchivo}
                      style={{ display: 'none' }}
                    />
                    {archivo && <p className="text-light mt-2 small">{archivo.name}</p>}
                  </Form.Group>
                  <Button 
                    variant="success" 
                    className="w-100"
                    onClick={manejarSubidaArchivo}
                    disabled={!archivo || subiendoArchivo}
                  >
                    <FaFileUpload className="me-2" />
                    {subiendoArchivo ? 'Subiendo...' : 'Subir Documento'}
                  </Button>
                </div>
              )}

              <ListGroup variant="flush">
                {documentos.map((doc) => (
                  <ListGroup.Item
                    key={doc.id}
                    active={documentoSeleccionado?.id === doc.id}
                    action
                    onClick={() => {
                      setDocumentoSeleccionado(doc);
                      setObservacionSeleccionada(null);
                      setCorreccionSeleccionada(null);
                    }}
                    style={{ 
                      backgroundColor: documentoSeleccionado?.id === doc.id 
                        ? 'var(--color-acento)' 
                        : 'var(--color-fondo-secundario)',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Versión {doc.version}</strong>
                        <br />
                        <small>{new Date(doc.fecha_subida).toLocaleDateString()}</small>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              {documentos.length === 0 && (
                <p className="text-muted text-center mt-3">
                  No hay documentos cargados
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          {documentoSeleccionado ? (
            <VisualizadorDocumento
              key={documentoSeleccionado.id}
              urlDocumento={`${api.defaults.baseURL}/documentos/${documentoSeleccionado.id}/archivo`}
              observaciones={observacionesDelDocumento}
              correcciones={correccionesDelDocumento}
              observacionSeleccionada={observacionSeleccionada}
              correccionSeleccionada={correccionSeleccionada}
            />
          ) : (
            <Card style={{ backgroundColor: 'var(--color-fondo-tarjeta)', height: '80vh' }}>
              <Card.Body className="d-flex justify-content-center align-items-center">
                <p className="text-muted">
                  {documentos.length === 0 
                    ? 'No hay documentos cargados en este proyecto.'
                    : 'Seleccione un documento para visualizar.'}
                </p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default DetalleProyecto;
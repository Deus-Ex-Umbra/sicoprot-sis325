import { useState, useEffect } from 'react';
import { Card, Accordion, ListGroup, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { obtenerProyectos } from '../servicios/proyectos.servicio';
import { type Proyecto, Rol } from '../../tipos/usuario';
import Cabecera from '../../componentes/Cabecera';
import BarraLateral from '../../componentes/BarraLateral';
import BarraLateralAdmin from '../../componentes/BarraLateralAdmin';
import { cn } from '../../lib/utilidades';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';

const MisDocumentos = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { usuario } = useAutenticacion();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const es_admin = usuario?.rol === Rol.Administrador;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const data = await obtenerProyectos();
        setProyectos(data);
      } catch (err) {
        setError('No se pudo cargar la lista de documentos.');
      } finally {
        setCargando(false);
      }
    };
    cargarProyectos();
  }, []);

  let contenidoPagina;

  if (cargando) {
    contenidoPagina = <p>Cargando documentos...</p>;
  } else if (error) {
    contenidoPagina = <Alert variant="danger">{error}</Alert>;
  } else {
    contenidoPagina = (
      <>
        <h2 className="text-light mb-4">Mis Documentos</h2>
        <Accordion defaultActiveKey="0">
          {proyectos.map((proyecto, index) => (
            <Accordion.Item eventKey={String(index)} key={proyecto.id}>
              <Accordion.Header>{proyecto.titulo}</Accordion.Header>
              <Accordion.Body>
                <ListGroup>
                  {proyecto.documentos?.length ? (
                    proyecto.documentos.map(doc => (
                      <ListGroup.Item
                        key={doc.id}
                        action
                        onClick={() => navigate(`/panel/proyecto/${proyecto.id}`)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          {doc.nombre_archivo}
                          <div>
                            <Badge bg="info" className="me-2">Versión {doc.version}</Badge>
                            <Badge bg="secondary">{new Date(doc.fecha_subida).toLocaleDateString()}</Badge>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))
                  ) : (
                    <p className="text-muted">No hay documentos en este proyecto.</p>
                  )}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Cabecera toggleSidebar={toggleSidebar} />
      {es_admin ? (
        <BarraLateralAdmin isOpen={sidebarOpen} />
      ) : (
        <BarraLateral isOpen={sidebarOpen} />
      )}

      <main
        className={cn(
          'transition-all duration-300 pt-14',
          sidebarOpen ? 'ml-64' : 'ml-0'
        )}
      >
        <div className="container mx-auto p-6 max-w-7xl">
          {contenidoPagina}
        </div>
      </main>
    </div>
  );
};

export default MisDocumentos;
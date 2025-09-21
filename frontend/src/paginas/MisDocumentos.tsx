import { useState, useEffect } from 'react';
import { Card, Accordion, ListGroup, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { obtenerProyectos } from '../servicios/proyectos.servicio';
import { type Proyecto } from '../tipos/usuario';

const MisDocumentos = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  if (cargando) return <p>Cargando documentos...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
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
};

export default MisDocumentos;
import React from 'react';
import { Button } from '../../componentes/ui/button';
import { Link } from 'react-router-dom';
import { EtapaProyecto } from '../../tipos/etapa-proyecto.enum';
import { Proyecto } from '../../tipos/proyecto.tipo';

interface GestionProyectoProps {
    proyecto: Proyecto;
}

const GestionProyecto = ({ proyecto }: GestionProyectoProps) => {
    return (
        <div>
        <h1>{proyecto.titulo}</h1>

        {/* ✅ Ahora sí: condición dentro del componente */}
        {proyecto.etapa_actual === EtapaProyecto.LISTO_DEFENSA && (
            <Button asChild>
            <Link to={`/panel/admin/proyectos/${proyecto.id}/asignar-tribunal`}>
                Asignar Tribunal
            </Link>
            </Button>
        )}

        {/* ...otros elementos */}
        </div>
    );
};

export default GestionProyecto;
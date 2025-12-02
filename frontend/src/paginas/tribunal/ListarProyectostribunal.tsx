// src/paginas/tribunal/ListaProyectosTribunal.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../componentes/ui/card';
import { Button } from '../../componentes/ui/button';
import { tribunalApi } from '../../api/tribunalApi';
import { toast } from 'sonner';

// Tipado mínimo del proyecto (ajusta según tu backend)
interface ProyectoTribunal {
    id: number;
    titulo: string;
    etapa_actual: string;
}

const ListaProyectosTribunal = () => {
    const [proyectos, setProyectos] = useState<ProyectoTribunal[]>([]);

    useEffect(() => {
        const cargar = async () => {
        try {
            const res = await tribunalApi.listarProyectos();
            setProyectos(res.data); // Ajusta si tu API devuelve { data: [...] }
        } catch (err) {
            toast.error('Error al cargar tus proyectos');
        }
        };
        cargar();
    }, []);

    return (
        <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Mis Proyectos Asignados</h1>
        
        {proyectos.length === 0 ? (
            <p>No tienes proyectos asignados para evaluar.</p>
        ) : (
            <div className="grid gap-4">
            {proyectos.map((p) => (
                <Card key={p.id}>
                <CardHeader>
                    <CardTitle>{p.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                    Estado: {p.etapa_actual}
                    </span>
                    <Button asChild>
                    <Link to={`/panel/tribunal/proyectos/${p.id}/evaluar`}>
                        Evaluar
                    </Link>
                    </Button>
                </CardContent>
                </Card>
            ))}
            </div>
        )}
        </div>
    );
};

export default ListaProyectosTribunal;
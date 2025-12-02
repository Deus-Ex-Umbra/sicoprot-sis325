// src/paginas/tribunal/EvaluarProyecto.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../componentes/ui/button';
import { Textarea } from '../../componentes/ui/textarea';
import { Input } from '../../componentes/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../componentes/ui/card';
import { tribunalApi } from '../../api/tribunalApi';
import { toast } from 'sonner';

const EvaluarProyecto = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [observaciones, setObservaciones] = useState('');
    const [calificacion, setCalificacion] = useState<string>(''); // sigue siendo string en el input

    // ✅ Validamos que el ID sea un número
    const proyectoId = Number(id);
    if (isNaN(proyectoId)) {
        toast.error('ID de proyecto inválido');
        navigate('/panel/tribunal/proyectos');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ Convertimos solo si hay valor válido
        const califNumber = calificacion ? parseInt(calificacion, 10) : undefined;

        // ✅ Validación adicional (opcional pero recomendada)
        if (califNumber !== undefined && (califNumber < 0 || califNumber > 100)) {
        toast.error('La calificación debe estar entre 0 y 100');
        return;
        }

        try {
        // ✅ Enviamos un objeto con los campos esperados por el DTO
        await tribunalApi.crearEvaluacion(proyectoId, {
            observaciones,
            calificacion: califNumber, // number | undefined
        });

        toast.success('Evaluación registrada con éxito');
        navigate('/panel/tribunal/proyectos');
        } catch (err) {
        console.error(err);
        toast.error('Error al registrar la evaluación');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
        <Card>
            <CardHeader>
            <CardTitle>Evaluar Proyecto de Grado</CardTitle>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                <label className="block text-sm font-medium mb-1">Observaciones</label>
                <Textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Describe tus observaciones sobre la versión final del proyecto..."
                    required
                    rows={5}
                />
                </div>

                <div>
                <label className="block text-sm font-medium mb-1">
                    Calificación (opcional, escala 0-100)
                </label>
                <Input
                    type="number"
                    min="0"
                    max="100"
                    value={calificacion}
                    onChange={(e) => setCalificacion(e.target.value)}
                    placeholder="Ej: 85"
                />
                </div>

                <div className="flex gap-3">
                <Button type="submit">Registrar Evaluación</Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancelar
                </Button>
                </div>
            </form>
            </CardContent>
        </Card>
        </div>
    );
};

export default EvaluarProyecto;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../componentes/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../componentes/ui/card';
import { Label } from '../../componentes/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { adminApi } from '../../api/adminApi'; 
interface Tribunal {
    id: number;
    correo: string;
}

const AsignarTribunal = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tribunalesDisponibles, setTribunalesDisponibles] = useState<Tribunal[]>([]);
    const [tribunalesSeleccionados, setTribunalesSeleccionados] = useState<number[]>([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    // Cargar tribunales disponibles
    useEffect(() => {
        const cargarTribunales = async () => {
        try {
            const res = await adminApi.listarTribunales(); // ✅
            setTribunalesDisponibles(res.data);
        } catch (err) {
            toast.error('Error al cargar la lista de tribunales');
            console.error(err);
        } finally {
            setCargando(false);
        }
        };
        cargarTribunales();
    }, []);
    
    const proyectoId = Number(id);
        if (isNaN(proyectoId)) {
            toast.error('ID de proyecto inválido');
            navigate('/panel/admin/proyectos');
            return null;
        }
    const handleGuardar = async () => {
        if (tribunalesSeleccionados.length < 3 || tribunalesSeleccionados.length > 5) {
        toast.error('Debes seleccionar entre 3 y 5 miembros del tribunal.');
        return;
        }

        try {
        setGuardando(true);
        await adminApi.asignarTribunal(proyectoId, tribunalesSeleccionados); 
        toast.success('Tribunal asignado correctamente');
        navigate('/panel/admin/proyectos');
        } catch (err) {
        console.error(err);
        toast.error('Error al asignar el tribunal');
        } finally {
        setGuardando(false);
        }
    };

    const toggleTribunal = (id: number) => {
        setTribunalesSeleccionados(prev =>
        prev.includes(id)
            ? prev.filter(tId => tId !== id)
            : prev.length < 5
            ? [...prev, id]
            : prev
        );
    };

    const todosSeleccionados = (ids: number[]) =>
        ids.every(id => tribunalesSeleccionados.includes(id));

    const algunoSeleccionado = (ids: number[]) =>
        ids.some(id => tribunalesSeleccionados.includes(id));
    {tribunalesDisponibles.map((t) => (
        <div key={t.id} className="flex items-center gap-2 py-1">
        <input
            type="checkbox"
            id={`tribunal-${t.id}`}
            checked={tribunalesSeleccionados.includes(t.id)}
            onChange={() => toggleTribunal(t.id)}
            disabled={
            !tribunalesSeleccionados.includes(t.id) &&
            tribunalesSeleccionados.length >= 5
            }
        />
        <label htmlFor={`tribunal-${t.id}`}>
            {t.correo} <span className="text-muted-foreground"></span>
        </label>
        </div>
    ))}
    return (
        <div className="max-w-4xl mx-auto p-4">
        <Card>
            <CardHeader>
            <CardTitle>Asignar Tribunal al Proyecto #{id}</CardTitle>
            </CardHeader>
            <CardContent>
            {cargando ? (
                <p>Cargando tribunales disponibles...</p>
            ) : (
                <div className="space-y-4">
                <div>
                    <Label>Selecciona entre 3 y 5 miembros del tribunal</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                    Solo usuarios con rol <code>TRIBUNAL</code> están disponibles.
                    </p>
                    <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                    {tribunalesDisponibles.length === 0 ? (
                        <p>No hay usuarios con rol TRIBUNAL registrados.</p>
                    ) : (
                        tribunalesDisponibles.map((t) => (
                        <div key={t.id} className="flex items-center gap-2 py-1">
                            <input
                            type="checkbox"
                            id={`tribunal-${t.id}`}
                            checked={tribunalesSeleccionados.includes(t.id)}
                            onChange={() => toggleTribunal(t.id)}
                            disabled={
                                !tribunalesSeleccionados.includes(t.id) &&
                                tribunalesSeleccionados.length >= 5
                            }
                            />
                            <label htmlFor={`tribunal-${t.id}`}>{t.correo}</label>
                        </div>
                        ))
                    )}
                    </div>
                    <p className="text-sm mt-2">
                    Seleccionados: <strong>{tribunalesSeleccionados.length}</strong>/5
                    </p>
                </div>
                </div>
            )}
            </CardContent>
            <CardFooter className="flex gap-3">
            <Button onClick={handleGuardar} disabled={guardando || cargando}>
                {guardando ? 'Guardando...' : 'Asignar Tribunal'}
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
                Cancelar
            </Button>
            </CardFooter>
        </Card>
        </div>
    );
};

export default AsignarTribunal;
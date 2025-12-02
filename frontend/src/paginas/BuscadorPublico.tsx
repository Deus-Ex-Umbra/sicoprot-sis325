import React, { useState, useEffect } from 'react';
import { publicApi } from '../api/publicApi';

interface Proyecto {
    id: number;
    titulo: string;
    resumen: string;
    palabras_clave: string;
    autor: {
        nombre: string;
        apellido: string;
    };
    fecha_aprobacion: string;
}

const BuscadorPublico: React.FC = () => {
    const [query, setQuery] = useState('');
    const [resultados, setResultados] = useState<Proyecto[]>([]);
    const [ultimos, setUltimos] = useState<Proyecto[]>([]);
    const [loading, setLoading] = useState(false);

    // Buscar al escribir
    useEffect(() => {
        const timer = setTimeout(() => {
        if (query.trim().length > 0) {
            setLoading(true);
            publicApi.buscarProyectos(query)
            .then(data => {
                setResultados(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error buscando:', err);
                setLoading(false);
            });
        } else {
            setResultados([]);
        }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    // Cargar últimos proyectos al montar
    useEffect(() => {
        publicApi.obtenerUltimosProyectos()
        .then(data => setUltimos(data))
        .catch(err => console.error('Error cargando últimos:', err));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
        {/* Campo de búsqueda */}
        <div className="max-w-4xl mx-auto mb-8">
            <div className="relative">
            <input
                type="text"
                placeholder="Buscar por título, resumen o palabras clave..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            </div>
        </div>

        {/* Resultados de búsqueda */}
        {loading && <p className="text-center text-gray-500">Buscando...</p>}
        {resultados.length > 0 && (
            <div className="max-w-4xl mx-auto mb-10">
            <h2 className="text-xl font-bold mb-4">Resultados ({resultados.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resultados.map((proj) => (
                <div key={proj.id} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-2">{proj.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                    Por {proj.autor.nombre} {proj.autor.apellido}
                    </p>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-3">{proj.resumen}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                    {proj.palabras_clave.split(',').map((tag, i) => (
                        <span
                        key={i}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                        {tag.trim()}
                        </span>
                    ))}
                    </div>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* Últimos proyectos aprobados */}
        <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Últimos Proyectos Aprobados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ultimos.map((proj) => (
                <div key={proj.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">{proj.titulo}</h3>
                <p className="text-sm text-gray-600 mb-2">
                    Por {proj.autor.nombre} {proj.autor.apellido}
                </p>
                <p className="text-sm text-gray-700 mb-2 line-clamp-3">{proj.resumen}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                    {proj.palabras_clave.split(',').map((tag, i) => (
                    <span
                        key={i}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                        {tag.trim()}
                    </span>
                    ))}
                </div>
                </div>
            ))}
            </div>
        </div>
        </div>
    );
};

export default BuscadorPublico;
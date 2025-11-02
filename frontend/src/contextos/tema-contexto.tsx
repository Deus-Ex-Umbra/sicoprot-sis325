import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Tema = 'light' | 'dark' | 'light-blue' | 'dark-blue' | 'light-green' | 'dark-green' | 'light-purple' | 'dark-purple' | 'light-red' | 'dark-red';

interface ContextoTemaProps {
  tema: Tema;
  cambiarTema: (tema: Tema) => void;
}

const ContextoTema = createContext<ContextoTemaProps | undefined>(undefined);

export function ProveedorTema({ children }: { children: ReactNode }) {
  const [tema, set_tema] = useState<Tema>(() => {
    const tema_guardado = localStorage.getItem('tema_aplicacion');
    return (tema_guardado as Tema) || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const temas_disponibles: Tema[] = [
      'light', 'dark', 'light-blue', 'dark-blue', 'light-green', 'dark-green',
      'light-purple', 'dark-purple', 'light-red', 'dark-red'
    ];
    
    temas_disponibles.forEach(t => root.classList.remove(t));
    
    if (tema !== 'light') {
      root.classList.add(tema);
    }
    
    localStorage.setItem('tema_aplicacion', tema);
  }, [tema]);

  const cambiarTema = (nuevo_tema: Tema) => {
    set_tema(nuevo_tema);
  };

  return (
    <ContextoTema.Provider value={{ tema, cambiarTema }}>
      {children}
    </ContextoTema.Provider>
  );
}

export function useTema() {
  const contexto = useContext(ContextoTema);
  if (contexto === undefined) {
    throw new Error('useTema debe usarse dentro de un ProveedorTema');
  }
  return contexto;
}
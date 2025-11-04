import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Palette } from 'lucide-react';
import { cn } from '../../lib/utilidades';
import { Button } from './button';
import { Input } from './input';

interface EditorHtmlSimpleProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const EditorHtmlSimple: React.FC<EditorHtmlSimpleProps> = ({
  value,
  onChange,
  placeholder,
  className,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [es_placeholder_visible, set_es_placeholder_visible] = useState(value === '');
  const [color, set_color] = useState('#000000');

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
      set_es_placeholder_visible(value === '' || value === '<p><br></p>');
    }
  }, [value]);

  const manejarInput = (e: React.FormEvent<HTMLDivElement>) => {
    const nuevo_valor = e.currentTarget.innerHTML;
    onChange(nuevo_valor);
    set_es_placeholder_visible(e.currentTarget.textContent === '');
  };

  const ejecutarComando = (comando: string, valor: string | undefined = undefined) => {
    document.execCommand(comando, false, valor);
    if (editorRef.current) {
      editorRef.current.focus();
      set_es_placeholder_visible(editorRef.current.textContent === '');
    }
  };

  const manejarCambioColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    set_color(newColor);
    ejecutarComando('foreColor', newColor);
  };

  const BotonToolbar = ({
    comando,
    icono,
    etiqueta,
  }: {
    comando: string;
    icono: React.ReactNode;
    etiqueta: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={etiqueta}
      title={etiqueta}
      onMouseDown={(e) => {
        e.preventDefault();
        ejecutarComando(comando);
      }}
    >
      {icono}
    </Button>
  );

  return (
    <div
      className={cn(
        'w-full rounded-md border border-input bg-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className
      )}
    >
      <div className="flex items-center gap-1 border-b p-1">
        <BotonToolbar comando="bold" icono={<Bold className="h-4 w-4" />} etiqueta="Negrita" />
        <BotonToolbar comando="italic" icono={<Italic className="h-4 w-4" />} etiqueta="Cursiva" />
        <BotonToolbar comando="underline" icono={<Underline className="h-4 w-4" />} etiqueta="Subrayado" />
        
        <div className="relative w-8 h-8 ml-2">
          <Input
            type="color"
            value={color}
            onChange={manejarCambioColor}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer p-0 border-none"
            title="Cambiar color de texto"
          />
          <div
            className="w-full h-full rounded-md flex items-center justify-center pointer-events-none border border-input"
            style={{ backgroundColor: color }}
          >
            <Palette className="h-4 w-4 text-white mix-blend-difference" />
          </div>
        </div>
      </div>
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={manejarInput}
          onBlur={manejarInput}
          className="min-h-[150px] w-full p-3 text-sm ring-offset-background [&_p]:m-0"
        />
        {es_placeholder_visible && placeholder && (
          <div className="absolute top-3 left-3 text-muted-foreground pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};


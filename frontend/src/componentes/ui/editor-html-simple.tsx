import React, { useState, useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered } from 'lucide-react';
import { cn } from '../../lib/utilidades';
import { Button } from './button';
import { Separator } from './separator';

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

  const manejarInput = (e: React.FormEvent<HTMLDivElement>) => {
    const nuevo_valor = e.currentTarget.innerHTML;
    onChange(nuevo_valor);
    set_es_placeholder_visible(e.currentTarget.textContent === '');
  };

  const ejecutarComando = (comando: string, valor: string | null = null) => {
    document.execCommand(comando, false, valor);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
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
        <BotonToolbar comando="strikeThrough" icono={<Strikethrough className="h-4 w-4" />} etiqueta="Tachado" />
        <Separator orientation="vertical" className="h-6" />
        <BotonToolbar comando="insertUnorderedList" icono={<List className="h-4 w-4" />} etiqueta="Lista" />
        <BotonToolbar comando="insertOrderedList" icono={<ListOrdered className="h-4 w-4" />} etiqueta="Lista Numerada" />
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={manejarInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className="relative min-h-[150px] w-full p-3 text-sm ring-offset-background placeholder:text-muted-foreground [&_p]:m-0"
      />
      {es_placeholder_visible && placeholder && (
        <div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};
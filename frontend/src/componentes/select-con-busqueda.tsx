import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../lib/utilidades';
import { Button } from './ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface Opcion {
  value: string;
  label: string;
}

interface SelectConBusquedaProps {
  opciones: Opcion[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function SelectConBusqueda({
  opciones,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No se encontraron resultados.',
  className,
}: SelectConBusquedaProps) {
  const [open, setOpen] = React.useState(false);
  const etiqueta_seleccionada =
    opciones.find((opcion) => opcion.value === value)?.label || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between border border-border text-foreground shadow-sm',
            className
          )}
          style={{
            backgroundColor: 'hsl(var(--background) / 1)',
          }}
        >
          <span className="truncate">{etiqueta_seleccionada}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn(
          "w-[--radix-popover-trigger-width] p-0 border border-border shadow-md",
          className
        )}
        style={{
          backgroundColor: 'hsl(var(--background) / 1)',
        }}
      >
        <Command style={{ backgroundColor: 'hsl(var(--background) / 1)' }}>
          <CommandInput
            placeholder={searchPlaceholder}
            className="border-b border-border text-foreground"
            style={{ backgroundColor: 'hsl(var(--background) / 1)' }}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="limpiar-seleccion"
                value=""
                onSelect={() => {
                  onChange('');
                  setOpen(false);
                }}
                style={{
                  backgroundColor: 'hsl(var(--background) / 1)',
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4 opacity-70',
                    value === '' ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {placeholder}
              </CommandItem>
              {opciones.map((opcion) => (
                <CommandItem
                  key={opcion.value}
                  value={opcion.label}
                  onSelect={() => {
                    onChange(opcion.value === value ? '' : opcion.value);
                    setOpen(false);
                  }}
                  className="hover:bg-muted focus:bg-muted"
                  style={{
                    backgroundColor: 'hsl(var(--background) / 1)',
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4 opacity-70',
                      value === opcion.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {opcion.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
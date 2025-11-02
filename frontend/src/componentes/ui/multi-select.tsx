import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "../../lib/utilidades"
import { Badge } from "./badge"
import { Button } from "./button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

export interface OpcionMultiSelect {
  label: string
  value: string
}

interface MultiSelectProps {
  opciones: OpcionMultiSelect[]
  seleccionados: string[]
  onChange: (valores: string[]) => void
  placeholder?: string
  max_seleccion?: number
  className?: string
}

export function MultiSelect({
  opciones,
  seleccionados,
  onChange,
  placeholder = "Seleccionar opciones...",
  max_seleccion,
  className,
}: MultiSelectProps) {
  const [abierto, setAbierto] = React.useState(false)

  const opcionesSeleccionadas = opciones.filter((opcion) =>
    seleccionados.includes(opcion.value)
  )

  const toggleOpcion = (valor: string) => {
    const yaSeleccionado = seleccionados.includes(valor)
    
    if (yaSeleccionado) {
      onChange(seleccionados.filter((v) => v !== valor))
    } else {
      if (max_seleccion && seleccionados.length >= max_seleccion) {
        return
      }
      onChange([...seleccionados, valor])
    }
  }

  const removerOpcion = (valor: string) => {
    onChange(seleccionados.filter((v) => v !== valor))
  }

  const limpiarTodo = () => {
    onChange([])
  }

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={abierto}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex gap-1 flex-wrap">
            {opcionesSeleccionadas.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              opcionesSeleccionadas.map((opcion) => (
                <Badge
                  key={opcion.value}
                  variant="secondary"
                  className="mr-1 mb-1"
                >
                  {opcion.label}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        removerOpcion(opcion.value)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={() => removerOpcion(opcion.value)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandList>
            <CommandEmpty>No se encontraron opciones.</CommandEmpty>
            <CommandGroup>
              {opciones.map((opcion) => {
                const estaSeleccionado = seleccionados.includes(opcion.value)
                const puedeSeleccionar =
                  !max_seleccion ||
                  seleccionados.length < max_seleccion ||
                  estaSeleccionado

                return (
                  <CommandItem
                    key={opcion.value}
                    value={opcion.value}
                    onSelect={() => {
                      if (puedeSeleccionar) {
                        toggleOpcion(opcion.value)
                      }
                    }}
                    disabled={!puedeSeleccionar}
                    className={cn(
                      "cursor-pointer",
                      !puedeSeleccionar && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        estaSeleccionado ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opcion.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        {seleccionados.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={limpiarTodo}
            >
              Limpiar todo
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
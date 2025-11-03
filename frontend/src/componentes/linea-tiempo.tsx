import {
  FileText,
  CheckCircle,
  FileUp,
  Search,
  Wrench,
  Users,
  Send,
  Award,
  GitBranch,
} from 'lucide-react';
import { cn } from '../lib/utilidades';
import { type EventoLineaTiempo } from '../tipos/usuario';

interface LineaTiempoProps {
  eventos: EventoLineaTiempo[];
}

const IconoEvento = ({ tipo }: { tipo: string }) => {
  const props = { className: 'h-5 w-5' };
  switch (tipo) {
    case 'propuesta':
      return <FileText {...props} />;
    case 'perfil_inicio':
    case 'perfil_aprobado':
    case 'proyecto_listo':
      return <CheckCircle {...props} />;
    case 'version_documento':
      return <FileUp {...props} />;
    case 'observacion':
      return <Search {...props} />;
    case 'correccion':
      return <Wrench {...props} />;
    case 'reunion':
      return <Users {...props} />;
    case 'defensa_solicitada':
      return <Send {...props} />;
    case 'defensa_aprobada':
    case 'proyecto_terminado':
      return <Award {...props} />;
    default:
      return <GitBranch {...props} />;
  }
};

const LineaTiempo = ({ eventos }: LineaTiempoProps) => {
  return (
    <div className="relative pl-8">
      <div className="absolute left-[15px] top-0 h-full w-0.5 bg-border" />
      <ol className="space-y-8">
        {eventos.map((evento, index) => (
          <li key={index} className="relative flex items-start">
            <div className="absolute left-[-22px] top-[1px] flex h-11 w-11 items-center justify-center rounded-full bg-background border-2 border-border">
              <span className="h-6 w-6 flex items-center justify-center text-primary">
                <IconoEvento tipo={evento.tipo} />
              </span>
            </div>
            <div className="ml-4 flex-1 pt-2">
              <p className="text-xs text-muted-foreground">
                {new Date(evento.fecha).toLocaleString()}
              </p>
              <h4 className="font-semibold text-foreground">{evento.titulo}</h4>
              {evento.descripcion && (
                <p
                  className="mt-1 text-sm text-muted-foreground prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: evento.descripcion }}
                />
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default LineaTiempo;
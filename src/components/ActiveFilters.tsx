import { rotulosAtivos, type Filtros } from "../lib/filters";

export function ActiveFilters({ filtros, onRemover, onLimpar }: { filtros: Filtros; onRemover: (chave: keyof Filtros, valor?: string | number) => void; onLimpar: () => void }) {
  const ativos = rotulosAtivos(filtros);
  if (!ativos.length) return null;
  return (
    <div className="active">
      {ativos.map((a) => (
        <button key={`${a.chave}-${a.valor ?? ""}`} className="achip" aria-label={`Remover filtro ${a.rotulo}`} onClick={() => onRemover(a.chave, a.valor)}>
          {a.rotulo}<span aria-hidden="true">✕</span>
        </button>
      ))}
      {ativos.length > 1 && <button className="aclear" onClick={onLimpar}>Limpar filtros</button>}
    </div>
  );
}

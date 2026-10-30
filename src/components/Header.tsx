import { forwardRef } from "react";
import { IconFilter, IconSearch } from "./icons";

export function Header({ onInicio }: { onInicio: () => void }) {
  return (
    <>
      <div className="brandrow">
        <div className="brand">
          <span className="mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M3 12a9 9 0 0 1 18 0" /><path d="M7 12a5 5 0 0 1 10 0" /><path d="M2 16h20" /></svg>
          </span>
          Em pauta
        </div>
        <nav className="menu" aria-label="Seções">
          <a href="/senado" aria-current="page" onClick={(e) => { e.preventDefault(); onInicio(); }}>Senado</a>
          <span className="soon" aria-disabled="true" title="Indisponível no momento">Notícias</span>
          <span className="soon" aria-disabled="true" title="Indisponível no momento">Checagem de fatos</span>
        </nav>
      </div>
      <p className="lede">Projetos de lei em tramitação no Senado Federal. Conheça, compartilhe e vote na consulta pública.</p>
    </>
  );
}

interface ToolbarProps {
  busca: string;
  onBusca: (v: string) => void;
  filtrosAtivos: number;
  onFiltros: () => void;
}

export const Toolbar = forwardRef<HTMLInputElement, ToolbarProps>(function Toolbar({ busca, onBusca, filtrosAtivos, onFiltros }, ref) {
  return (
    <div className="tools">
      <label className="search" htmlFor="q">
        <span className="ico" aria-hidden="true"><IconSearch /></span>
        <input id="q" ref={ref} type="search" placeholder="Busque por tema, autor ou número" autoComplete="off" value={busca} onChange={(e) => onBusca(e.target.value)} />
      </label>
      <button type="button" className="fbtn" aria-haspopup="dialog" onClick={onFiltros}>
        <IconFilter /><span className="lbl">Filtros</span>
        {filtrosAtivos > 0 && <span className="cnt">{filtrosAtivos}</span>}
      </button>
    </div>
  );
});

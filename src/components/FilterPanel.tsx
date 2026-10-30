import { useEffect, useMemo, useRef, useState } from "react";
import type { ProjetoResumo } from "../../shared/types";
import { ETAPAS } from "../lib/status";
import { FILTROS_VAZIOS, ORIGENS, TIPOS_AUTOR, aplicar, type Filtros } from "../lib/filters";
import { IconClose } from "./icons";

interface Props {
  aberto: boolean;
  itens: ProjetoResumo[];
  filtros: Filtros;
  busca: string;
  onFechar: () => void;
  onAplicar: (f: Filtros) => void;
}

export function FilterPanel({ aberto, itens, filtros, busca, onFechar, onAplicar }: Props) {
  const [rascunho, setRascunho] = useState(filtros);
  const fechar = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (aberto) {
      setRascunho(filtros);
      fechar.current?.focus({ preventScroll: true });
    }
  }, [aberto, filtros]);

  const partidos = useMemo(() => [...new Set(itens.map((p) => p.autorPrincipal.partido).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "pt")), [itens]);
  const ufs = useMemo(() => [...new Set(itens.map((p) => p.autorPrincipal.uf).filter(Boolean) as string[])].sort(), [itens]);
  const anos = useMemo(() => [...new Set(itens.map((p) => String(p.ano)))].sort().reverse(), [itens]);
  const total = useMemo(() => aplicar(itens, rascunho, busca, "recentes").length, [itens, rascunho, busca]);

  const alterna = <K extends "etapas" | "autores">(k: K, v: Filtros[K][number]) =>
    setRascunho((r) => {
      const arr = r[k] as unknown[];
      return { ...r, [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] };
    });
  const unico = <K extends "origem" | "ano">(k: K, v: string) => setRascunho((r) => ({ ...r, [k]: r[k] === v ? "" : v }));

  const Opt = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" className="opt" aria-pressed={on} onClick={onClick}>{children}</button>
  );

  return (
    <aside className={`fpanel${aberto ? " open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="fpTitle" aria-hidden={!aberto}>
      <div className="fp-head">
        <h2 id="fpTitle">Filtros</h2>
        <button ref={fechar} type="button" className="fp-x" aria-label="Fechar filtros" onClick={onFechar}><IconClose /></button>
      </div>
      <div className="fp-body">
        <div className="fgroup" role="group">
          <h3 className="lg">Etapa da tramitação</h3>
          <p className="hint">Escolha uma ou mais.</p>
          <div className="opts">
            {ETAPAS.map((s, i) => <Opt key={s} on={rascunho.etapas.includes(i)} onClick={() => alterna("etapas", i)}>{i + 1}. {s}</Opt>)}
          </div>
        </div>
        <div className="fgroup" role="group">
          <h3 className="lg">Quem propôs</h3>
          <div className="opts">
            {(Object.keys(TIPOS_AUTOR) as (keyof typeof TIPOS_AUTOR)[]).map((k) => (
              <Opt key={k} on={rascunho.autores.includes(k)} onClick={() => alterna("autores", k)}>{TIPOS_AUTOR[k]}</Opt>
            ))}
          </div>
          <div className="selrow">
            <label htmlFor="fParty">Partido
              <select id="fParty" value={rascunho.partido} onChange={(e) => setRascunho((r) => ({ ...r, partido: e.target.value }))}>
                <option value="">Todos</option>
                {partidos.map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label htmlFor="fUf">Estado
              <select id="fUf" value={rascunho.uf} onChange={(e) => setRascunho((r) => ({ ...r, uf: e.target.value }))}>
                <option value="">Todos</option>
                {ufs.map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
          </div>
        </div>
        <div className="fgroup" role="group">
          <h3 className="lg">Origem</h3>
          <div className="opts">
            {(Object.keys(ORIGENS) as (keyof typeof ORIGENS)[]).map((k) => <Opt key={k} on={rascunho.origem === k} onClick={() => unico("origem", k)}>{ORIGENS[k]}</Opt>)}
          </div>
        </div>
        <div className="fgroup" role="group">
          <h3 className="lg">Ano do projeto</h3>
          <div className="opts">
            {anos.map((y) => <Opt key={y} on={rascunho.ano === y} onClick={() => unico("ano", y)}>{y}</Opt>)}
          </div>
        </div>
      </div>
      <div className="fp-foot">
        <button type="button" className="reset" onClick={() => setRascunho(FILTROS_VAZIOS)}>Limpar</button>
        <button type="button" className="apply" disabled={!total} onClick={() => onAplicar(rascunho)}>
          {total ? `Mostrar ${total.toLocaleString("pt-BR")} projeto${total === 1 ? "" : "s"}` : "Nenhum projeto com esses filtros"}
        </button>
      </div>
    </aside>
  );
}

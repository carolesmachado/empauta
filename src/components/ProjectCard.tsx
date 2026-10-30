import { useEffect, useRef, useState } from "react";
import type { ProjetoResumo, Votos } from "../../shared/types";
import { ecidadaniaUrl } from "../lib/api";
import { ha, iniciais } from "../lib/format";
import { IconBookmark, IconShare, IconVote } from "./icons";
import { VoteBar } from "./VoteBar";

interface Props {
  p: ProjetoResumo;
  indice: number;
  votos: Votos | null | undefined;
  carregandoVotos: boolean;
  salvo: boolean;
  onAbrir: () => void;
  onSalvar: () => void;
  onCompartilhar: () => void;
}

export function ProjectCard({ p, indice, votos, carregandoVotos, salvo, onAbrir, onSalvar, onCompartilhar }: Props) {
  const h3 = useRef<HTMLHeadingElement>(null);
  const [cortado, setCortado] = useState(false);
  useEffect(() => {
    const el = h3.current;
    if (!el) return;
    const medir = () => setCortado(el.scrollHeight > el.clientHeight + 2);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [p.ementa]);

  const a = p.autorPrincipal;
  const parar = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <article
      className="card"
      style={{ animationDelay: `${Math.min(indice % 24, 9) * 45}ms` }}
      tabIndex={0}
      aria-label={p.identificacao}
      onClick={onAbrir}
      onKeyDown={(e) => e.key === "Enter" && e.target === e.currentTarget && onAbrir()}
    >
      <div className="head">
        <div className="c-top">
          <span className="idt">{p.identificacao}</span>{" "}
          <span className="dot" aria-hidden="true">•</span>
          <span className="stat">Atualizado {ha(p.atualizadoEm ?? p.dataSituacao)}</span>
        </div>
        <div className={`ttl${cortado ? " clamped" : ""}`}>
          <h3 ref={h3}>{p.ementa}</h3>
          <div className="tip" aria-hidden="true">{p.ementa}</div>
        </div>
      </div>
      <div className="author">
        <span className="av" aria-hidden="true">{iniciais(a.nome)}</span>
        <div className="who">
          <b>{a.nome}{a.partido && <span className="pt"> ({a.partido}{a.uf ? `/${a.uf}` : ""})</span>}</b>
          {p.coautores > 0 && <small>e mais {p.coautores} coautor{p.coautores > 1 ? "es" : ""}</small>}
        </div>
      </div>
      <VoteBar votos={votos} carregando={carregandoVotos} />
      <div className="c-foot">
        <a className="vote" href={ecidadaniaUrl(p.codigoMateria)} target="_blank" rel="noopener noreferrer" onClick={parar}>
          <IconVote /><span>Votar na consulta</span>
        </a>
        <div className="acts">
          <button className="ib" aria-pressed={salvo} aria-label="Salvar projeto" title="Salvar projeto" onClick={(e) => { parar(e); onSalvar(); }}><IconBookmark /></button>
          <button className="ib" aria-label="Compartilhar projeto" title="Compartilhar projeto" onClick={(e) => { parar(e); onCompartilhar(); }}><IconShare /></button>
        </div>
      </div>
    </article>
  );
}

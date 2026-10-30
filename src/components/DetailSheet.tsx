import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ProjetoResumo, Votos } from "../../shared/types";
import { api, ecidadaniaUrl, senadoUrl } from "../lib/api";
import { fmtData, fmtHora, fmtN, iniciais } from "../lib/format";
import { ETAPAS, etapa, fraseSituacao } from "../lib/status";
import { IconBack, IconBookmark, IconShare } from "./icons";

interface Props {
  id: number | null;
  resumo?: ProjetoResumo;
  salvo: boolean;
  onFechar: () => void;
  onSalvar: () => void;
  onCompartilhar: (votos: Votos | null | undefined) => void;
}

export function DetailSheet({ id, resumo, salvo, onFechar, onSalvar, onCompartilhar }: Props) {
  const aberto = id != null;
  const voltar = useRef<HTMLButtonElement>(null);
  const corpo = useRef<HTMLElement>(null);

  // Ao abrir, sempre busca de novo nas fontes: o detalhe é a visão "ao vivo" para comparar com o portal.
  const detalhe = useQuery({ queryKey: ["projeto", id], queryFn: () => api.projeto(id!), enabled: aberto, staleTime: 0, refetchOnMount: "always" });
  const codigo = detalhe.data?.codigoMateria ?? resumo?.codigoMateria;
  const votosQ = useQuery({
    queryKey: ["votos-detalhe", codigo],
    queryFn: () => api.votos([codigo!]),
    enabled: aberto && !!codigo,
    staleTime: 0,
    refetchOnMount: "always",
  });
  const votos = codigo ? votosQ.data?.votos[String(codigo)] : undefined;

  useEffect(() => {
    if (!aberto) return;
    document.body.style.overflow = "hidden";
    corpo.current?.scrollTo(0, 0);
    voltar.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = ""; };
  }, [aberto, id]);

  const d = detalhe.data;
  const ementa = d?.ementa ?? resumo?.ementa ?? "";
  const identificacao = d?.identificacao ?? resumo?.identificacao ?? "";
  const situacao = d?.situacao ?? resumo?.situacao ?? null;
  const fase = etapa(situacao);
  const autor = d?.autores[0];
  const total = votos ? votos.sim + votos.nao : 0;

  return (
    <>
      <div className={`scrim${aberto ? " open" : ""}`} onClick={onFechar} />
      <aside ref={corpo} className={`sheet${aberto ? " open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="shTitle" aria-hidden={!aberto}>
        {aberto && (
          <>
            <div className="sh-top">
              <button ref={voltar} className="back" id="shBack" aria-label="Voltar" onClick={onFechar}><IconBack /></button>
              <div className="sh-tools">
                <button className="back" aria-pressed={salvo} aria-label="Salvar projeto" title="Salvar projeto" onClick={onSalvar}><IconBookmark /></button>
                <button className="back" aria-label="Compartilhar projeto" title="Compartilhar projeto" onClick={() => onCompartilhar(votos)}><IconShare /></button>
              </div>
            </div>
            <div className="sh-num"><span className="idt">{identificacao}</span></div>
            <h1 id="shTitle">{ementa}</h1>

            {detalhe.isError ? (
              <div className="err">
                {(detalhe.error as Error).message}
                <br /><button onClick={() => detalhe.refetch()}>Tentar de novo</button>
              </div>
            ) : !d ? (
              <div className="sh-loading" aria-label="Carregando detalhes"><span className="skel" style={{ width: "40%" }} /><span className="skel" style={{ width: "70%" }} /><span className="skel" style={{ height: 120 }} /></div>
            ) : (
              <>
                <div className="updated">
                  Apresentado em {fmtData(d.dataApresentacao)}
                  {d.numeroNaCamara && ` · Veio da Câmara dos Deputados (${d.numeroNaCamara})`}
                </div>
                {autor && (
                  <div className="author" style={{ marginBottom: 18 }}>
                    <span className="av" aria-hidden="true">{iniciais(autor.nome)}</span>
                    <div className="who">
                      <small>{autor.cargo ?? "Autoria"}{d.autores.length > 1 && ` + ${d.autores.length - 1} coautor${d.autores.length > 2 ? "es" : ""}`}</small>
                      <b>{autor.nome}{autor.partido && <span className="pt"> ({autor.partido}{autor.uf ? `/${autor.uf}` : ""})</span>}</b>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="sec">
              <h4>Consulta pública no e-Cidadania</h4>
              {votosQ.isLoading ? (
                <div className="sh-loading"><span className="skel" style={{ height: 96 }} /></div>
              ) : !votos ? (
                <p className="pmeta">Não foi possível ler os votos no e-Cidadania agora. Confira direto no portal.</p>
              ) : total ? (
                <>
                  <div className="bigpoll">
                    <div className="y"><span>Sim</span><b>{fmtN(votos.sim)}</b><small>voto{votos.sim === 1 ? "" : "s"}</small></div>
                    <div className="n"><span>Não</span><b>{fmtN(votos.nao)}</b><small>voto{votos.nao === 1 ? "" : "s"}</small></div>
                  </div>
                  <div className="pbar" style={{ height: 12 }} aria-hidden="true"><i style={{ width: `${((votos.sim / total) * 100).toFixed(2)}%` }} /></div>
                  <p className="pmeta">{fmtN(total)} votos no total{votos.apuradoEm && `, apurados até ${votos.apuradoEm}`}. Sua opinião também conta.</p>
                </>
              ) : (
                <>
                  <div className="poll empty"><div className="pbar" /></div>
                  <p className="pmeta">Este projeto ainda não recebeu votos. Que tal ser a primeira pessoa a dizer o que pensa?</p>
                </>
              )}
              {codigo && (
                <div className="cta">
                  <a className="primary" href={ecidadaniaUrl(codigo)} target="_blank" rel="noopener noreferrer">
                    <span>Votar na consulta pública<small>Diga no e-Cidadania se você é a favor ou contra</small></span>→
                  </a>
                </div>
              )}
              {(d || votosQ.data) && (
                <p className="live">
                  <span><span className="dot" aria-hidden="true" />Dados consultados ao vivo</span>
                  {d && <span>Senado às {fmtHora(d.consultadoEm)}</span>}
                  {votosQ.data && <span>e-Cidadania às {fmtHora(votosQ.data.consultadoEm)}</span>}
                  {codigo && <a href={ecidadaniaUrl(codigo)} target="_blank" rel="noopener noreferrer">Conferir no portal ↗</a>}
                </p>
              )}
            </div>

            {d && (
              <>
                <div className="sec">
                  <h4>Onde está agora</h4>
                  <ol className="steps" aria-label={`Etapa ${fase + 1} de ${ETAPAS.length} da tramitação`}>
                    {ETAPAS.map((s, k) => <li key={s} className={k <= fase ? "on" : ""} />)}
                  </ol>
                  <p className="statnow"><b>{fraseSituacao(situacao)}</b>{d.colegiado?.nome && <span>{d.colegiado.nome}</span>}</p>
                </div>
                {d.ultimoAndamento && (
                  <div className="sec">
                    <h4>Último andamento</h4>
                    <div className="lastmove"><time>{fmtData(d.ultimoAndamento.data)}</time>{d.ultimoAndamento.texto}</div>
                  </div>
                )}
                <div className="sec">
                  <h4>Saiba mais</h4>
                  <div className="cta">
                    {d.urlDocumento && <a href={d.urlDocumento} target="_blank" rel="noopener noreferrer"><span>Ler o texto completo<small>Inteiro teor, PDF</small></span>↗</a>}
                    <a href={senadoUrl(d.codigoMateria)} target="_blank" rel="noopener noreferrer"><span>Ver tramitação no site do Senado<small>Histórico, relatores e votações</small></span>↗</a>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </aside>
    </>
  );
}

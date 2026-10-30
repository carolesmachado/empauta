import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import type { ProjetoResumo, Votos } from "../../shared/types";
import { api } from "../lib/api";
import { fmtHora } from "../lib/format";
import { FILTROS_VAZIOS, aplicar, type Filtros, type Ordem } from "../lib/filters";
import { useSalvos } from "../lib/saved";
import { Header, Toolbar } from "../components/Header";
import { FilterPanel } from "../components/FilterPanel";
import { ActiveFilters } from "../components/ActiveFilters";
import { ProjectCard } from "../components/ProjectCard";
import { DetailSheet } from "../components/DetailSheet";
import { SharePanel, type ShareAlvo } from "../components/SharePanel";
import { useToast } from "../components/Toast";
import { IconBookmark, IconHome, IconSearch } from "../components/icons";

const PAGINA = 24;
const reduzirMovimento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function SenadoPage() {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const buscaRef = useRef<HTMLInputElement>(null);

  const lista = useQuery({ queryKey: ["projetos"], queryFn: api.projetos, staleTime: 5 * 60_000 });
  const { salvos, alternar } = useSalvos();

  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS);
  const [ordem, setOrdem] = useState<Ordem>("recentes");
  const [vendoSalvos, setVendoSalvos] = useState(false);
  const [limite, setLimite] = useState(PAGINA);
  const [painel, setPainel] = useState(false);
  const [share, setShare] = useState<ShareAlvo | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setBuscaAplicada(busca); setLimite(PAGINA); }, 160);
    return () => clearTimeout(t);
  }, [busca]);

  const itens = lista.data?.itens ?? [];
  const resultado = useMemo(() => {
    const base = vendoSalvos ? itens.filter((p) => salvos.has(p.id)) : itens;
    return aplicar(base, filtros, buscaAplicada, ordem);
  }, [itens, filtros, buscaAplicada, ordem, vendoSalvos, salvos]);

  // Troca de lista: esmaece os cards atuais e entra com os novos em sequência.
  const chave = JSON.stringify([filtros, buscaAplicada, ordem, vendoSalvos]);
  const [exibida, setExibida] = useState({ chave, lista: resultado });
  const [saindo, setSaindo] = useState(false);
  useEffect(() => {
    if (chave === exibida.chave || reduzirMovimento() || !exibida.lista.length) {
      setExibida({ chave, lista: resultado });
      return;
    }
    setSaindo(true);
    const t = setTimeout(() => { setExibida({ chave, lista: resultado }); setSaindo(false); }, 170);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, resultado]);

  const visiveis = exibida.lista.slice(0, limite);

  // Votos ao vivo, em lotes de 24 (um pedido por página carregada).
  const lotes = useMemo(() => {
    const out: number[][] = [];
    for (let i = 0; i < visiveis.length; i += PAGINA) out.push(visiveis.slice(i, i + PAGINA).map((p) => p.codigoMateria));
    return out;
  }, [visiveis]);
  const votosQs = useQueries({
    queries: lotes.map((ids) => ({ queryKey: ["votos", ids], queryFn: () => api.votos(ids), staleTime: 60_000 })),
  });
  const votosDe = (p: ProjetoResumo): { v: Votos | null | undefined; carregando: boolean } => {
    const lote = Math.floor(visiveis.indexOf(p) / PAGINA);
    const q = votosQs[lote];
    return { v: q?.data?.votos[String(p.codigoMateria)], carregando: !q || q.isLoading };
  };

  const idAberto = params.id ? Number(params.id) : null;
  const resumoAberto = idAberto ? itens.find((p) => p.id === idAberto) : undefined;
  const abrir = (p: ProjetoResumo) => navigate(`/senado/${p.id}`);
  const fecharDetalhe = () => navigate("/senado");

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (share) setShare(null);
      else if (painel) setPainel(false);
      else if (idAberto) fecharDetalhe();
    };
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  });

  const salvar = (id: number) => { toast(salvos.has(id) ? "Removido dos salvos" : "Projeto salvo"); alternar(id); };
  const filtrosAtivos = filtros.etapas.length + filtros.autores.length + [filtros.partido, filtros.uf, filtros.origem, filtros.ano].filter(Boolean).length;
  const inicio = () => {
    setVendoSalvos(false); setFiltros(FILTROS_VAZIOS); setBusca(""); setLimite(PAGINA);
    fecharDetalhe(); scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header className="top"><div className="wrap">
        <Header onInicio={inicio} />
        <Toolbar ref={buscaRef} busca={busca} onBusca={setBusca} filtrosAtivos={filtrosAtivos} onFiltros={() => setPainel(true)} />
      </div></header>

      <main className="wrap">
        <div className="feedhead">
          <h2>
            <b>{resultado.length.toLocaleString("pt-BR")}</b> projeto{resultado.length === 1 ? "" : "s"}{vendoSalvos ? " salvos" : ""}
          </h2>
          <select className="sort" aria-label="Ordenar" value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)}>
            <option value="recentes">Movimentados recentemente</option>
            <option value="votacao">Mais perto da votação</option>
            <option value="novos">Apresentados por último</option>
          </select>
        </div>
        <ActiveFilters
          filtros={filtros}
          onRemover={(k, v) => setFiltros((f) => ({ ...f, [k]: Array.isArray(f[k]) ? (f[k] as unknown[]).filter((x) => x !== v) : "" }))}
          onLimpar={() => setFiltros(FILTROS_VAZIOS)}
        />

        {lista.isError ? (
          <div className="err">{(lista.error as Error).message}<br /><button onClick={() => lista.refetch()}>Tentar de novo</button></div>
        ) : lista.isLoading ? (
          <div className="grid">{Array.from({ length: 6 }, (_, i) => <div key={i} className="card"><span className="skel" style={{ height: 220 }} /></div>)}</div>
        ) : (
          <div id="grid" className={`grid${saindo ? " out" : ""}`}>
            {visiveis.length ? visiveis.map((p, i) => {
              const { v, carregando } = votosDe(p);
              return (
                <ProjectCard
                  key={p.id} p={p} indice={i} votos={v} carregandoVotos={carregando} salvo={salvos.has(p.id)}
                  onAbrir={() => abrir(p)} onSalvar={() => salvar(p.id)}
                  onCompartilhar={() => setShare({ identificacao: p.identificacao, ementa: p.ementa, codigoMateria: p.codigoMateria, votos: v })}
                />
              );
            }) : (
              <div className="empty" style={{ gridColumn: "1/-1" }}>
                {vendoSalvos && !salvos.size
                  ? <><b>Nenhum projeto salvo ainda</b>Toque no marcador de um card para guardar projetos e acompanhar aqui.</>
                  : <><b>Nada encontrado</b>Tente outro termo ou limpe os filtros.</>}
              </div>
            )}
          </div>
        )}
        {exibida.lista.length > limite && (
          <div className="more"><button type="button" onClick={() => setLimite((l) => l + PAGINA)}>Mostrar mais projetos</button></div>
        )}
        {lista.data && (
          <p className="sumario">
            <span>Lista consultada na API de Dados Abertos do Senado às {fmtHora(lista.data.consultadoEm)}.</span>
            <span>Votos lidos do e-Cidadania no momento em que cada card aparece.</span>
          </p>
        )}
      </main>

      <nav className="dock" aria-label="Navegação">
        <button type="button" aria-current={!vendoSalvos} aria-label="Início" onClick={inicio}><IconHome /></button>
        <button type="button" aria-label="Buscar" onClick={() => { scrollTo({ top: 0, behavior: "smooth" }); buscaRef.current?.focus(); }}><IconSearch /></button>
        <button type="button" aria-current={vendoSalvos} aria-label="Salvos" onClick={() => { setVendoSalvos(true); setLimite(PAGINA); scrollTo({ top: 0, behavior: "smooth" }); }}>
          <IconBookmark />{salvos.size > 0 && <span className="cnt">{salvos.size}</span>}
        </button>
      </nav>

      <FilterPanel aberto={painel} itens={itens} filtros={filtros} busca={buscaAplicada} onFechar={() => setPainel(false)} onAplicar={(f) => { setFiltros(f); setLimite(PAGINA); setPainel(false); }} />
      {painel && <div className="scrim open" onClick={() => setPainel(false)} />}

      <DetailSheet
        id={idAberto} resumo={resumoAberto} salvo={idAberto ? salvos.has(idAberto) : false}
        onFechar={fecharDetalhe} onSalvar={() => idAberto && salvar(idAberto)}
        onCompartilhar={(v) => {
          const base = resumoAberto;
          if (base) setShare({ identificacao: base.identificacao, ementa: base.ementa, codigoMateria: base.codigoMateria, votos: v });
        }}
      />
      <SharePanel alvo={share} onFechar={() => setShare(null)} />
    </>
  );
}

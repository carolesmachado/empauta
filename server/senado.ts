import type { Autor, ListaResposta, ProjetoDetalhe, ProjetoResumo } from "../shared/types.js";
import { TtlCache } from "./cache.js";
import { parseAutoria } from "./autoria.js";

const BASE = "https://legis.senado.leg.br/dadosabertos";
const LISTA_TTL = Number(process.env.LISTA_TTL_MS ?? 10 * 60_000);
const DETALHE_TTL = Number(process.env.DETALHE_TTL_MS ?? 5 * 60_000);

const listaCache = new TtlCache<ListaResposta>(LISTA_TTL);
const detalheCache = new TtlCache<ProjetoDetalhe | null>(DETALHE_TTL);

async function getJson(path: string): Promise<any> {
  const res = await fetch(BASE + path, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(30_000) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Senado respondeu ${res.status} em ${path}`);
  return res.json();
}

export function listarProjetos(): Promise<ListaResposta> {
  return listaCache.get("pl", async () => {
    const path = "/processo?sigla=PL&tramitando=S";
    const dados: any[] = await getJson(path);
    const itens: ProjetoResumo[] = dados
      .filter((x) => x.tipoDocumento !== "Emenda")
      .map((x) => {
        const { principal, coautores } = parseAutoria(x.autoria);
        const [num, ano] = String(x.identificacao).replace(/^PL\s+/, "").split(/[/\s]/);
        return {
          id: x.id,
          codigoMateria: x.codigoMateria,
          identificacao: x.identificacao,
          numero: Number(num) || 0,
          ano: Number(ano) || 0,
          ementa: (x.ementa ?? "").trim(),
          autoria: x.autoria ?? "",
          autorPrincipal: principal,
          coautores,
          origem: x.objetivo === "Revisora" ? "CD" : "SF",
          dataApresentacao: x.dataApresentacao ?? null,
          situacao: x.situacaoAtual ?? null,
          dataSituacao: x.dataSituacaoAtual ?? null,
          atualizadoEm: x.dataUltimaAtualizacao ?? null,
        };
      });
    return { consultadoEm: new Date().toISOString(), fonte: BASE + path, itens };
  });
}

const CARGOS: Record<string, string> = {
  COMISSAO_SENADO: "Comissão do Senado",
  COMISSAO_CAMARA: "Comissão da Câmara",
  COMISSAO_CONGRESSO: "Comissão do Congresso",
  PRESIDENTE_REPUBLICA: "Presidência da República",
};

export function detalharProjeto(id: number): Promise<ProjetoDetalhe | null> {
  return detalheCache.get(String(id), async () => {
    const path = `/processo/${id}`;
    const d = await getJson(path);
    if (!d) return null;
    const autores: Autor[] = (d.autoriaIniciativa ?? []).map((a: any) => ({
      nome: a.autor,
      tipo: a.siglaTipo === "SENADOR" ? "S" : a.siglaTipo === "DEPUTADO" ? "D" : "O",
      cargo: a.cargo ?? CARGOS[a.siglaTipo] ?? null,
      partido: a.siglaPartido ?? null,
      uf: a.uf ?? null,
    }));
    const autuacoes: any[] = d.autuacoes ?? [];
    const informes = autuacoes.flatMap((a) => a.informesLegislativos ?? []).sort((a, b) => String(a.data).localeCompare(String(b.data)));
    const situacoes = autuacoes.flatMap((a) => a.situacoes ?? []).sort((a, b) => String(a.inicio).localeCompare(String(b.inicio)));
    const ultimo = informes[informes.length - 1];
    const col = situacoes[situacoes.length - 1]?.colegiado;
    return {
      consultadoEm: new Date().toISOString(),
      fonte: BASE + path,
      id: d.id,
      codigoMateria: d.codigoMateria,
      identificacao: d.identificacao,
      ementa: (d.conteudo?.ementa ?? "").trim(),
      autores,
      origem: d.siglaCasaIniciadora === "CD" ? "CD" : "SF",
      numeroNaCamara: d.siglaCasaIniciadora === "CD" ? d.identificacaoProcessoInicial ?? null : null,
      dataApresentacao: d.documento?.dataApresentacao ?? null,
      situacao: d.situacaoAtual ?? null,
      dataSituacao: d.dataSituacaoAtual ?? null,
      colegiado: col ? { sigla: col.sigla ?? null, nome: col.nome ?? null } : null,
      ultimoAndamento: ultimo ? { data: String(ultimo.data).slice(0, 10), texto: String(ultimo.descricao ?? "").replace(/\s+/g, " ").trim() } : null,
      classificacoes: (d.classificacoes ?? []).map((c: any) => c.descricaoHierarquia),
      urlDocumento: d.documento?.url ?? null,
    };
  });
}

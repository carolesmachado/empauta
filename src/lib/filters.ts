import type { ProjetoResumo } from "../../shared/types";
import { ETAPAS, etapa } from "./status";
import { norm } from "./format";

export interface Filtros {
  etapas: number[];
  autores: ("S" | "D" | "O")[];
  partido: string;
  uf: string;
  origem: "" | "SF" | "CD";
  ano: string;
}

export const FILTROS_VAZIOS: Filtros = { etapas: [], autores: [], partido: "", uf: "", origem: "", ano: "" };

export const TIPOS_AUTOR = { S: "Senadores", D: "Câmara dos Deputados", O: "Comissões e outros órgãos" } as const;
export const ORIGENS = { SF: "Começou no Senado", CD: "Veio da Câmara" } as const;

export type Ordem = "recentes" | "votacao" | "novos";

export function aplicar(itens: ProjetoResumo[], f: Filtros, busca: string, ordem: Ordem): ProjetoResumo[] {
  const termos = norm(busca).split(/\s+/).filter(Boolean);
  const lista = itens.filter((p) => {
    const a = p.autorPrincipal;
    if (f.etapas.length && !f.etapas.includes(etapa(p.situacao))) return false;
    if (f.autores.length && !f.autores.includes(a.tipo)) return false;
    if (f.partido && a.partido !== f.partido) return false;
    if (f.uf && a.uf !== f.uf) return false;
    if (f.origem && p.origem !== f.origem) return false;
    if (f.ano && String(p.ano) !== f.ano) return false;
    if (termos.length) {
      const txt = norm(`${p.identificacao} ${p.ementa} ${p.autoria}`);
      if (!termos.every((t) => txt.includes(t))) return false;
    }
    return true;
  });
  const rec = (p: ProjetoResumo) => p.atualizadoEm ?? p.dataSituacao ?? "";
  const cmp: Record<Ordem, (a: ProjetoResumo, b: ProjetoResumo) => number> = {
    recentes: (a, b) => rec(b).localeCompare(rec(a)),
    votacao: (a, b) => etapa(b.situacao) - etapa(a.situacao) || rec(b).localeCompare(rec(a)),
    novos: (a, b) => (b.dataApresentacao ?? "").localeCompare(a.dataApresentacao ?? "") || b.numero - a.numero,
  };
  return lista.sort(cmp[ordem]);
}

const ETAPA_ROTULO = ETAPAS as readonly string[];

export function rotulosAtivos(f: Filtros): { chave: keyof Filtros; valor?: string | number; rotulo: string }[] {
  const r: { chave: keyof Filtros; valor?: string | number; rotulo: string }[] = [];
  f.etapas.forEach((e) => r.push({ chave: "etapas", valor: e, rotulo: ETAPA_ROTULO[e] }));
  f.autores.forEach((a) => r.push({ chave: "autores", valor: a, rotulo: TIPOS_AUTOR[a] }));
  if (f.partido) r.push({ chave: "partido", rotulo: `Partido: ${f.partido}` });
  if (f.uf) r.push({ chave: "uf", rotulo: `Estado: ${f.uf}` });
  if (f.origem) r.push({ chave: "origem", rotulo: ORIGENS[f.origem] });
  if (f.ano) r.push({ chave: "ano", rotulo: `Projetos de ${f.ano}` });
  return r;
}

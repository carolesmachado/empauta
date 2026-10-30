import type { ListaResposta, ProjetoDetalhe, VotosResposta } from "../../shared/types";

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.erro ?? `Erro ${res.status}`);
  }
  return res.json();
}

export const api = {
  projetos: () => get<ListaResposta>("/api/projetos"),
  projeto: (id: number) => get<ProjetoDetalhe>(`/api/projetos/${id}`),
  votos: (materias: number[]) => get<VotosResposta>(`/api/votos?materias=${materias.join(",")}`),
};

export const ecidadaniaUrl = (codigoMateria: number) =>
  `https://www12.senado.leg.br/ecidadania/visualizacaomateria?id=${codigoMateria}`;
export const senadoUrl = (codigoMateria: number) =>
  `https://www25.senado.leg.br/web/atividade/materias/-/materia/${codigoMateria}`;

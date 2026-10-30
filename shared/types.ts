/** Item da listagem de PLs em tramitação (derivado de GET /dadosabertos/processo). */
export interface ProjetoResumo {
  id: number;
  codigoMateria: number;
  identificacao: string;
  numero: number;
  ano: number;
  ementa: string;
  autoria: string;
  autorPrincipal: Autor;
  coautores: number;
  origem: "SF" | "CD";
  dataApresentacao: string | null;
  situacao: string | null;
  dataSituacao: string | null;
  atualizadoEm: string | null;
}

export interface Autor {
  nome: string;
  tipo: "S" | "D" | "O";
  cargo: string | null;
  partido: string | null;
  uf: string | null;
}

export interface ListaResposta {
  consultadoEm: string;
  fonte: string;
  itens: ProjetoResumo[];
}

/** Detalhe de um PL (derivado de GET /dadosabertos/processo/{id}). */
export interface ProjetoDetalhe {
  consultadoEm: string;
  fonte: string;
  id: number;
  codigoMateria: number;
  identificacao: string;
  ementa: string;
  autores: Autor[];
  origem: "SF" | "CD";
  numeroNaCamara: string | null;
  dataApresentacao: string | null;
  situacao: string | null;
  dataSituacao: string | null;
  colegiado: { sigla: string | null; nome: string | null } | null;
  ultimoAndamento: { data: string; texto: string } | null;
  classificacoes: string[];
  urlDocumento: string | null;
}

/** Votos da consulta pública do e-Cidadania (lidos da página do projeto). */
export interface Votos {
  sim: number;
  nao: number;
  apuradoEm: string | null;
}

export interface VotosResposta {
  consultadoEm: string;
  fonte: string;
  /** null quando o portal não respondeu ou a página mudou de formato. */
  votos: Record<string, Votos | null>;
}

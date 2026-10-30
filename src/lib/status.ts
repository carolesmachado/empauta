/** Etapas simplificadas a partir da situação oficial do Senado. */
export const ETAPAS = [
  "Chegou ao Senado",
  "Aguardando relator",
  "Em análise pelo relator",
  "Pronto para votação na comissão",
  "Pronto para votação no Plenário",
] as const;

const FRASES = [
  "Aguardando envio para as comissões",
  "Na comissão, aguardando a escolha do relator",
  "Em análise pelo relator da comissão",
  "Pronto para ser votado na comissão",
  "Pronto para ser votado no Plenário",
];

export function etapa(situacao: string | null): number {
  const s = situacao ?? "";
  if (/PLEN[ÁA]RIO|ORDEM DO DIA|PERANTE A MESA/.test(s)) return 4;
  if (/PRONTA PARA A PAUTA|INCLU[ÍI]DA NA PAUTA|TURNO SUPLEMENTAR/.test(s)) return 3;
  if (/RELATORIA|AUDI[ÊE]NCIA|VISTA|EMENDAS/.test(s)) return 2;
  if (/DESIGNA[ÇC][ÃA]O DO RELATOR/.test(s)) return 1;
  return 0;
}

export function fraseSituacao(situacao: string | null): string {
  if (/INCLU[ÍI]DA NA PAUTA/.test(situacao ?? "")) return "Na pauta de votação da comissão";
  return FRASES[etapa(situacao)];
}

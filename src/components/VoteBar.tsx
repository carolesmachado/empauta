import type { Votos } from "../../shared/types";
import { fmtN } from "../lib/format";

/** Barra da consulta pública no formato do e-Cidadania: rótulos, barra e contagens. */
export function VoteBar({ votos, carregando }: { votos: Votos | null | undefined; carregando?: boolean }) {
  if (carregando) {
    return (
      <div className="poll loading" aria-label="Carregando votos da consulta pública">
        <div className="prow lbl"><span className="y">Sim</span><span className="n">Não</span></div>
        <div className="pbar" />
        <div className="skel-row"><span className="skel" /><span className="skel" /></div>
      </div>
    );
  }
  if (!votos) return <div className="poll empty"><div className="pbar" /><span>Não foi possível ler os votos no e-Cidadania agora.</span></div>;
  const total = votos.sim + votos.nao;
  if (!total) {
    return (
      <div className="poll empty"><div className="pbar" /><span>Ainda ninguém votou na consulta pública. <b>Seja a primeira pessoa.</b></span></div>
    );
  }
  const w = (votos.sim / total) * 100;
  return (
    <div className="poll" role="img" aria-label={`Consulta pública: ${fmtN(votos.sim)} votos sim e ${fmtN(votos.nao)} votos não`}>
      <div className="prow lbl"><span className="y">Sim</span><span className="n">Não</span></div>
      <div className="pbar"><i style={{ width: `${w.toFixed(2)}%` }} /></div>
      <div className="prow cnt"><b className="y">{fmtN(votos.sim)}</b><b className="n">{fmtN(votos.nao)}</b></div>
    </div>
  );
}

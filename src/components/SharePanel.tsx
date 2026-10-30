import { useEffect, useRef, useState } from "react";
import type { Votos } from "../../shared/types";
import { ecidadaniaUrl } from "../lib/api";
import { fmtN } from "../lib/format";
import { IconCheck, IconClose, IconCopy, IconTelegram, IconWhats } from "./icons";
import { useToast } from "./Toast";

export interface ShareAlvo {
  identificacao: string;
  ementa: string;
  codigoMateria: number;
  votos?: Votos | null;
}

export function SharePanel({ alvo, onFechar }: { alvo: ShareAlvo | null; onFechar: () => void }) {
  const toast = useToast();
  const [copiado, setCopiado] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);
  const timer = useRef<number>();

  useEffect(() => {
    setCopiado(false);
    if (alvo) fechar.current?.focus({ preventScroll: true });
  }, [alvo]);
  if (!alvo) return null;

  const url = ecidadaniaUrl(alvo.codigoMateria);
  const em = alvo.ementa.length > 170 ? alvo.ementa.slice(0, 167).replace(/\s+\S*$/, "") + "…" : alvo.ementa;
  const v = alvo.votos;
  const placar = v ? (v.sim + v.nao ? `Até agora são ${fmtN(v.sim)} votos sim e ${fmtN(v.nao)} votos não.` : "Ninguém votou ainda.") : "";
  const intro = `O ${alvo.identificacao} está em análise no Senado: "${em}" ${placar} Vote você também na consulta pública do e-Cidadania:`.replace(/\s+/g, " ");
  const texto = `${intro} ${url}`;
  const e = encodeURIComponent;
  const redes: [string, string, React.ReactNode][] = [
    ["WhatsApp", `https://wa.me/?text=${e(texto)}`, <IconWhats />],
    ["Telegram", `https://t.me/share/url?url=${e(url)}&text=${e(intro)}`, <IconTelegram />],
    ["X", `https://twitter.com/intent/tweet?text=${e(intro)}&url=${e(url)}`, "𝕏"],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`, "f"],
    ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`, "in"],
  ];

  const selecionar = () => {
    const p = caixa.current?.querySelector("p");
    if (!p) return;
    const r = document.createRange();
    r.selectNodeContents(p);
    const s = getSelection();
    s?.removeAllRanges();
    s?.addRange(r);
    toast("Mensagem selecionada. Copie e cole onde quiser.");
  };
  const copiar = () => {
    try {
      navigator.clipboard.writeText(texto).then(() => {
        setCopiado(true);
        toast("Mensagem copiada");
        clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopiado(false), 2600);
      }, selecionar);
    } catch {
      selecionar();
    }
  };

  return (
    <div className="share" onKeyDown={(ev) => ev.key === "Escape" && onFechar()}>
      <div className="share-bg" onClick={onFechar} />
      <div className="share-card" role="dialog" aria-modal="true" aria-labelledby="shareTitle">
        <div className="share-head">
          <div><h2 id="shareTitle">Compartilhe este projeto</h2><p>Convide mais gente a conhecer e votar na consulta pública.</p></div>
          <button ref={fechar} type="button" className="fp-x" aria-label="Fechar" onClick={onFechar}><IconClose /></button>
        </div>
        <div
          ref={caixa}
          className={`share-msg${copiado ? " copied" : ""}`}
          role="button"
          tabIndex={0}
          aria-label="Copiar mensagem"
          onClick={copiar}
          onKeyDown={(ev) => (ev.key === "Enter" || ev.key === " ") && (ev.preventDefault(), copiar())}
        >
          <p>{texto}</p>
          <span className="share-hint">
            {copiado ? <IconCheck /> : <IconCopy />}
            <span>{copiado ? "Mensagem copiada! É só colar onde quiser." : "Clique no texto para copiar"}</span>
          </span>
        </div>
        <div className="share-grid">
          {redes.map(([n, h, i]) => (
            <a key={n} href={h} target="_blank" rel="noopener noreferrer"><span className="ic" aria-hidden="true">{i}</span>{n}</a>
          ))}
          <button type="button" onClick={copiar}><span className="ic" aria-hidden="true"><IconCopy /></span>Copiar mensagem</button>
        </div>
      </div>
    </div>
  );
}

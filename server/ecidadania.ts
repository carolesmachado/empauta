import type { Votos } from "../shared/types.js";
import { TtlCache, limiter } from "./cache.js";

export const ECIDADANIA = "https://www12.senado.leg.br/ecidadania";
const VOTOS_TTL = Number(process.env.VOTOS_TTL_MS ?? 5 * 60_000);
const votosCache = new TtlCache<Votos | null>(VOTOS_TTL);
const fila = limiter(Number(process.env.ECIDADANIA_CONCORRENCIA ?? 4));

const num = (s: string) => Number(s.replace(/\./g, ""));

/** Extrai os contadores do gráfico da consulta pública na página do projeto. */
export function parseVotos(html: string): Votos | null {
  const fig = html.match(/<figure class="grafico-consulta-publica">([\s\S]*?)<\/figure>/);
  if (!fig) return null;
  const sim = fig[1].match(/class="contabilizacao-favor">\s*([\d.]+)\s*</);
  const nao = fig[1].match(/class="contabilizacao-contra">\s*([\d.]+)\s*</);
  if (!sim || !nao) return null;
  const quando = html.match(/Votos apurados até\s*([\d/]+\s+[\d:]+)/);
  return { sim: num(sim[1]), nao: num(nao[1]), apuradoEm: quando ? quando[1] : null };
}

export function votosDaMateria(codigoMateria: number): Promise<Votos | null> {
  return votosCache.get(String(codigoMateria), () =>
    fila(async () => {
      try {
        const res = await fetch(`${ECIDADANIA}/visualizacaomateria?id=${codigoMateria}`, {
          headers: { "User-Agent": "EmPauta/0.1 (+https://github.com/carolesmachado/empauta)" },
          signal: AbortSignal.timeout(30_000),
        });
        if (!res.ok) return null;
        return parseVotos(await res.text());
      } catch {
        return null;
      }
    }),
  );
}

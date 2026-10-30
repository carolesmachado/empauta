import type { Autor } from "../shared/types.js";

const PESSOA = /^(Senadora?|Deputad[oa])\s+(.+?)\s+\(([^)]+)\)$/;

/** Separa o texto de autoria da listagem ("Senador Fulano (PT/AP), Senadora Beltrana (PP/MS)"). */
export function parseAutoria(texto: string): { principal: Autor; coautores: number } {
  const t = (texto || "").trim();
  const partes = t.split(/,\s+(?=(?:Senadora?|Deputad[oa])\s)/);
  return { principal: parseAutor(partes[0] ?? t), coautores: Math.max(0, partes.length - 1) };
}

export function parseAutor(texto: string): Autor {
  const m = texto.trim().match(PESSOA);
  if (m) {
    const [, cargo, nome, dentro] = m;
    const pedacos = dentro.split("/");
    const uf = pedacos.length > 1 ? pedacos[pedacos.length - 1] : null;
    const partido = pedacos.length > 1 ? pedacos.slice(0, -1).join("/") : dentro;
    return { nome, tipo: cargo.startsWith("Senador") ? "S" : "D", cargo, partido, uf };
  }
  if (/^Câmara dos Deputados$/i.test(texto.trim())) return { nome: "Câmara dos Deputados", tipo: "D", cargo: null, partido: null, uf: null };
  return { nome: texto.trim(), tipo: "O", cargo: null, partido: null, uf: null };
}

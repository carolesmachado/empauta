import express from "express";
import compression from "compression";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { detalharProjeto, listarProjetos } from "./senado.js";
import { ECIDADANIA, votosDaMateria } from "./ecidadania.js";
import type { VotosResposta } from "../shared/types.js";

const app = express();
app.use(compression());
const PORT = Number(process.env.PORT ?? 8787);
const MAX_VOTOS_POR_PEDIDO = 48;

app.get("/api/projetos", async (_req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=60");
    res.json(await listarProjetos());
  } catch (e) {
    res.status(502).json({ erro: "Não foi possível consultar a API do Senado agora.", detalhe: String(e) });
  }
});

app.get("/api/projetos/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "Identificador inválido." });
  try {
    const d = await detalharProjeto(id);
    if (!d) return res.status(404).json({ erro: "Projeto não encontrado no Senado." });
    res.set("Cache-Control", "public, max-age=30");
    res.json(d);
  } catch (e) {
    res.status(502).json({ erro: "Não foi possível consultar a API do Senado agora.", detalhe: String(e) });
  }
});

app.get("/api/votos", async (req, res) => {
  const ids = String(req.query.materias ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, MAX_VOTOS_POR_PEDIDO);
  if (!ids.length) return res.status(400).json({ erro: "Informe ?materias=codigo1,codigo2" });
  const lista = await Promise.all(ids.map(async (id) => [String(id), await votosDaMateria(id)] as const));
  const body: VotosResposta = {
    consultadoEm: new Date().toISOString(),
    fonte: `${ECIDADANIA}/visualizacaomateria?id={codigoMateria}`,
    votos: Object.fromEntries(lista),
  };
  res.set("Cache-Control", "public, max-age=30");
  res.json(body);
});

if (process.env.NODE_ENV === "production") {
  const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.listen(PORT, () => console.log(`API do Em pauta em http://localhost:${PORT}`));

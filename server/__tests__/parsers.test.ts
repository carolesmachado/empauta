import { describe, expect, it } from "vitest";
import { parseVotos } from "../ecidadania";
import { parseAutoria } from "../autoria";

const pagina = (sim: string, nao: string) => `
<figure class="grafico-consulta-publica"> <header> <span>Sim</span> <span>Não</span> </header>
<section> <div style="width:37.29%"></div> </section>
<footer> <span class="contabilizacao-favor">${sim}</span> <span class="contabilizacao-contra">${nao}</span> </footer> </figure>
<div id="msg-contabilizacao-voto">Votos apurados até 30/10/2026 00:11:35</div>`;

describe("parseVotos", () => {
  it("lê os contadores com separador de milhar", () => {
    expect(parseVotos(pagina("179.351", "301.545"))).toEqual({ sim: 179351, nao: 301545, apuradoEm: "30/10/2026 00:11:35" });
  });
  it("ignora o modelo comentado com '10+' e devolve null sem gráfico", () => {
    const comentario = `<!-- <span class="contabilizacao-favor" tal:content="structure votosFavor">10+</span> -->`;
    expect(parseVotos(comentario)).toBeNull();
  });
  it("aceita zero votos", () => {
    expect(parseVotos(pagina("0", "0"))?.sim).toBe(0);
  });
});

describe("parseAutoria", () => {
  it("extrai partido e UF do primeiro autor e conta coautores", () => {
    const r = parseAutoria("Senador Humberto Costa (PT/PE), Senadora Zenaide Maia (PROS/RN), Senador Paulo Paim (PT/RS)");
    expect(r.principal).toMatchObject({ nome: "Humberto Costa", tipo: "S", partido: "PT", uf: "PE" });
    expect(r.coautores).toBe(2);
  });
  it("lida com partido composto (S/PARTIDO/UF)", () => {
    expect(parseAutoria("Senador Fulano de Tal (S/PARTIDO/AM)").principal).toMatchObject({ partido: "S/PARTIDO", uf: "AM" });
  });
  it("reconhece projetos vindos da Câmara e comissões", () => {
    expect(parseAutoria("Câmara dos Deputados").principal.tipo).toBe("D");
    expect(parseAutoria("Comissão de Direitos Humanos e Legislação Participativa").principal.tipo).toBe("O");
  });
});

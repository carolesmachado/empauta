# Em pauta

Projetos de lei em tramitação no Senado Federal, com os votos da consulta pública do e-Cidadania.
Feito em React + TypeScript (Vite) com um servidor Node (Express) que consulta as fontes oficiais ao vivo.

## Como rodar

Requer Node 20 ou mais recente.

```bash
npm install
npm run dev        # API em http://localhost:8787 e app em http://localhost:5173
```

Produção (o mesmo servidor entrega a API e o app compilado):

```bash
npm run build
npm start          # http://localhost:8787
```

Outros comandos: `npm test` (testes dos leitores de dados) e `npm run typecheck`.

## Como os dados chegam

```
Navegador (React)
  ├─ GET /api/projetos        lista de PLs em tramitação  ← Dados Abertos do Senado
  ├─ GET /api/projetos/:id    detalhe do PL               ← Dados Abertos do Senado
  └─ GET /api/votos?materias= votos Sim/Não               ← página da consulta no e-Cidadania
```

- **Lista:** `GET /dadosabertos/processo?sigla=PL&tramitando=S` (cerca de 5.150 PLs). Fica 10 minutos em cache no servidor.
- **Detalhe:** `GET /dadosabertos/processo/{id}`. Ao abrir um projeto, o app sempre busca de novo; o servidor guarda por até 5 minutos.
- **Votos:** o e-Cidadania não tem API para votos por projeto. O servidor lê a página
  `visualizacaomateria?id={codigoMateria}`, extrai os contadores do gráfico e devolve JSON.
  Cada card pede os votos quando aparece (em lotes de 24), com cache de 5 minutos e no máximo
  4 consultas simultâneas ao portal. Se a leitura falhar, o app mostra o aviso em vez de números.

O detalhe mostra a hora em que o Senado e o e-Cidadania foram consultados e um link para conferir no portal,
para comparar o que o app exibe com o que está no site naquele momento.

O mapeamento completo das rotas do portal (o que é liberado e o que cada uma retorna) está em [`docs/API.md`](docs/API.md).

## Configuração

| Variável | Padrão | Para quê |
|---|---|---|
| `PORT` | `8787` | Porta do servidor |
| `LISTA_TTL_MS` | `600000` | Validade do cache da lista (ms) |
| `DETALHE_TTL_MS` | `300000` | Validade do cache do detalhe (ms) |
| `VOTOS_TTL_MS` | `300000` | Validade do cache dos votos (ms) |
| `ECIDADANIA_CONCORRENCIA` | `4` | Consultas simultâneas ao e-Cidadania |

## Estrutura

```
server/     API: senado.ts (Dados Abertos), ecidadania.ts (votos), cache.ts, autoria.ts
shared/     tipos usados pelo servidor e pelo app
src/        app React: pages/SenadoPage, components/ (cards, filtros, detalhe, compartilhar), lib/
docs/       levantamento das fontes de dados
```

## Limitações conhecidas

- A leitura dos votos depende do HTML do e-Cidadania. Se o portal mudar a página, os testes em
  `server/__tests__` ajudam a identificar e corrigir a extração.
- A ordenação por "mais votados" não está disponível: exigiria consultar os votos de todos os projetos.
- Os filtros por classificação oficial ficaram de fora desta versão. A API aceita `codigoClasse` em
  `/processo` caso voltem.

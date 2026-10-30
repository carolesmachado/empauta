# Fontes de dados do Em pauta

Levantamento feito em 30/10/2026, testando cada endpoint com a origem `https://example.com`
para saber se o navegador pode chamá-lo direto (CORS).

## 1. Dados Abertos do Senado — `https://legis.senado.leg.br/dadosabertos`

- Documentação OpenAPI: `GET /dadosabertos/v3/api-docs` (157 rotas, todas `GET`, sem autenticação).
- CORS liberado em todas as rotas testadas (`access-control-allow-origin: *`).
- Respostas em JSON com o cabeçalho `Accept: application/json` (sem ele, algumas vêm em XML).

### Rotas usadas pelo projeto

| Rota | Para quê | Campos principais retornados |
|---|---|---|
| `GET /processo?sigla=PL&tramitando=S` | Listagem de PLs em tramitação (~5.150 itens, ~4 MB, ~3 s) | `id`, `codigoMateria`, `identificacao`, `ementa`, `autoria` (texto, ex. "Senador Fulano (PT/AP)"), `dataApresentacao`, `situacaoAtual`, `dataSituacaoAtual`, `dataUltimaAtualizacao`, `objetivo` (Iniciadora/Revisora), `urlDocumento` |
| `GET /processo/{id}` | Detalhe de um PL | `conteudo.ementa`, `documento.indexacao`, `autoriaIniciativa[]` (nome, cargo, partido, UF, código do parlamentar), `situacaoAtual`, `classificacoes[]` (hierarquia oficial), `autuacoes[].situacoes[]` (colegiado atual), `autuacoes[].informesLegislativos[]` (andamentos), `identificacaoProcessoInicial` (número na Câmara) |

Filtros aceitos por `/processo` (todos opcionais): `sigla`, `numero`, `ano`, `idProcesso`,
`codigoMateria`, `tramitando`, `tramitouLegislaturaAtual`, `codigoColegiadoTramitando`,
`siglaSituacao`, `situacao`, `autor`, `codigoParlamentarAutor`, `siglaTipoDocumento`,
`siglaTipoConteudo`, `codigoClasse`, `codAssuntoGeral`, `codAssuntoEspecifico`, `termo`, `casa`,
`dataInicioApresentacao`, `dataFimApresentacao`, `dataInicioDeliberacao`, `dataFimDeliberacao`,
`siglaTipoDeliberacao`, `tipoNorma`, `numeroNorma`, `anoNorma`, `numdias`, `alteracao`.

> `codigoClasse` permite filtrar a listagem pela classificação oficial direto na API
> (a lista de classes vem de `GET /processo/classes`). Útil se o filtro por assunto voltar.

### Outras rotas úteis para próximas versões

| Rota | O que traz |
|---|---|
| `GET /processo/relatoria?idProcesso=` | Relatores do processo: nome, partido, colegiado, datas de designação/destituição |
| `GET /processo/emenda?idProcesso=` | Emendas apresentadas |
| `GET /processo/documento?idProcesso=` | Documentos do processo (pareceres, requerimentos…) |
| `GET /processo/classes` e `/processo/assuntos` | Árvore de classificações e assuntos |
| `GET /senador/lista/atual` | Senadores em exercício com foto (`UrlFotoParlamentar`), partido, UF, bloco, e-mail |
| `GET /votacao?idProcesso=` | Votos nominais dos senadores em Plenário (não é a consulta pública) |
| `GET /plenario/agenda/dia/{data}` e `/comissao/agenda/{data}` | Agenda de votações |

**O que a API não tem:** os votos Sim/Não da consulta pública do e-Cidadania.

## 2. Portal e-Cidadania — `https://www12.senado.leg.br/ecidadania`

Não há API pública documentada. Nenhum endpoint testado envia cabeçalho CORS, então o navegador
não consegue ler as respostas a partir de outro site: tudo passa pelo servidor do projeto.

| Rota | Tipo | O que retorna |
|---|---|---|
| `GET /visualizacaomateria?id={codigoMateria}` | HTML | Página da consulta pública. O gráfico traz `<span class="contabilizacao-favor">` (votos Sim), `<span class="contabilizacao-contra">` (votos Não) e "Votos apurados até dd/mm/aaaa hh:mm:ss" |
| `GET /restcolecaomaismateria` | JSON | Só as 5 matérias mais votadas nas últimas 24 h: `id`, `identificacaoBasica`, `ementa`, `votosFavor`, `votosContra`, `totalVotos`, `totalVotosRecentes`, `porcentagemFavor` |
| `GET /restcolecaomaisideia` | JSON | 5 ideias legislativas em destaque: `id`, `titulo`, `apoiamentos`, `count` (últimas 24 h), `dataLimite` |
| `GET /restcolecaomaisaudiencia` | JSON | 5 audiências interativas: `id`, `titulo`, `tipoAudiencia`, `sigla`, `dataPublicacao`, `qtdComentario`, links de calendário |
| `POST /ajaxapoiamentomateria` | — | Registra um voto. Exige login no portal e token de proteção. **Não usamos**: o voto é sempre feito no próprio e-Cidadania |

Como os números de votos por projeto só existem no HTML, o servidor do projeto lê a página
`visualizacaomateria`, extrai os dois contadores e devolve JSON (`/api/votos`). Se o portal mudar
o HTML, a extração falha e a API do projeto responde `null` para aquele projeto (sem inventar números).

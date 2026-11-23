# API de Treinos Esportivos — Controle de Carga e Risco de Lesão

API REST para um clube de futebol registrar sessões de treino, calcular automaticamente a carga de cada sessão e sinalizar atletas em **RISCO DE SOBRECARGA** semanal.

**Stack:** Node.js · Express · Sequelize ORM (MySQL / `mysql2`) · Sequelize CLI (migrations e seeders) · dotenv · swagger-ui-express

---

## 1. Árvore de diretórios

```
AV4/
├── .env.example             # Modelo de variáveis de ambiente
├── .gitignore
├── .sequelizerc             # Aponta o Sequelize CLI para a pasta src/
├── package.json
├── README.md
└── src/
    ├── app.js               # Express: middlewares, Swagger, rotas, erros
    ├── server.js            # Autentica no banco e sobe o servidor
    ├── config/
    │   ├── config.js        # Ambientes do Sequelize (lidos do .env)
    │   └── database.js      # Instância única do Sequelize
    ├── docs/
    │   └── swagger.json     # Especificação OpenAPI 3 (servida em /api-docs)
    ├── migrations/
    │   ├── 20261105000001-criar-jogadores.js
    │   ├── 20261105000002-criar-treinos.js
    │   └── 20261105000003-criar-configuracoes.js
    ├── seeders/
    │   ├── 20261105000001-jogadores.js
    │   ├── 20261105000002-configuracao.js
    │   └── 20261105000003-treinos.js
    ├── models/
    │   ├── index.js         # Carrega os models e define as associações
    │   ├── Jogador.js
    │   ├── Treino.js
    │   └── Configuracao.js
    ├── services/
    │   ├── cargaService.js        # Regras puras: calcularCarga e calcularSemana
    │   ├── jogadorService.js
    │   ├── configuracaoService.js
    │   ├── treinoService.js
    │   └── relatorioService.js    # gerarRelatorioSemanal (agregações)
    ├── controllers/
    │   ├── jogadorController.js
    │   ├── configuracaoController.js
    │   ├── treinoController.js
    │   └── relatorioController.js
    ├── routes/
    │   └── index.js
    └── utils/
        ├── ErroApi.js       # Erro de negócio com status HTTP
        ├── respostas.js     # Respostas JSON padronizadas e tratamento de erros
        └── validacoes.js    # Validação de datas, IDs, booleanos
```

---

## 2. Instalação e execução

### Pré-requisitos
- Node.js 18 ou superior
- MySQL 8 em execução

### Passo a passo

```bash
npm install
```

Copie o modelo de variáveis de ambiente e preencha com as credenciais do seu MySQL:

```bash
cp .env.example .env
```

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta da API | `3000` |
| `DB_HOST` / `DB_PORT` | Endereço do MySQL | `localhost` / `3306` |
| `DB_NAME` | Nome do banco | `treinos_db` |
| `DB_USER` / `DB_PASSWORD` | Credenciais | — |
| `DB_LOGGING` | `true` exibe o SQL gerado pelo Sequelize | `false` |

Crie o banco, rode as migrations e os seeders:

```bash
npm run db:create
```

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

Inicie a API:

```bash
npm start
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`

Para recriar o banco do zero com a massa de teste: `npm run db:reset`.

---

## 3. Regras de negócio

**Fórmula da carga:** `Carga = (duracaoMin / 10) × intensidade × multiplicador`

| Tipo | Descrição | Multiplicador |
|---|---|---|
| `F` | Físico | 1.5 |
| `T` | Técnico | 1.2 |
| `E` | Estratégico | 1.0 |

Exemplo: treino `F` de 60 min com intensidade 8 → `(60/10) × 8 × 1.5 = 72`.

**Semana de referência:** de segunda-feira 00:00:00 a domingo 23:59:59 da data informada.

**Risco:** `"RISCO DE SOBRECARGA"` somente quando `cargaSemanal > cargaMaximaSemanal` (estritamente maior — empate com o limite **não** é risco).

**Validações:**

| Situação | HTTP |
|---|---|
| `intensidade` fora de 1–10 | 400 |
| `duracaoMin` ≤ 0 | 400 |
| `tipo` / `posicao` fora do ENUM | 400 |
| Jogador inativo | 400 |
| Jogador inexistente | 404 |
| `codigo` de treino duplicado | 409 |
| Falha inesperada | 500 (mensagem genérica, sem stack trace) |

**Integridade:** desativar um jogador apenas define `ativo = false`. A FK `treinos.jogadorId` usa `ON DELETE RESTRICT`, então o histórico de treinos nunca é apagado.

---

## 4. Onde o Sequelize e o async/await foram aplicados

- **Migrations (Sequelize CLI):** a estrutura do banco é criada apenas por `queryInterface.createTable` / `addIndex` em `src/migrations`. Não existe `sync({ force: true })` no projeto.
- **Models (`src/models`):** `sequelize.define` com validações declarativas (`notNull`, `isIn`, `min`, `max`, `isDate`) e getters que convertem `DECIMAL` em número. Associações em `models/index.js`:
  - `Jogador.hasMany(Treino, { foreignKey: 'jogadorId' })`
  - `Treino.belongsTo(Jogador, { foreignKey: 'jogadorId' })`
- **Services (`src/services`)** — 100% métodos do Sequelize, sem SQL puro:

| Função | Métodos do Sequelize |
|---|---|
| `cadastrarJogador()` | `Jogador.create()` |
| `listarJogadores()` | `Jogador.findAll()` |
| `buscarJogadorPorId()` | `Jogador.findByPk()` |
| `atualizarJogador()` | `instancia.update()` |
| `desativarJogador()` | `instancia.update({ ativo: false })` |
| `calcularCarga()` | função pura (sem banco), reutilizada também pelo seeder |
| `registrarTreino()` | `findByPk()`, `findOne()`, `create()`, `reload({ include })` |
| `listarTreinos()` | `findAll({ include, where })` com `Op.between`, `Op.gte`, `Op.lte` |
| `excluirTreino()` | `findOne()` + `destroy()` |
| `obterConfiguracaoVigente()` / `salvarConfiguracao()` | `findOne()`, `create()`, `update()` |
| `gerarRelatorioSemanal()` | `count()`, `sum()`, `findAll` com `fn('SUM'/'COUNT'/'AVG')`, `col()`, `group`, `include` e `Op.between` |

- **async/await:** todas as funções de service e controller são `async`. Cada controller envolve a chamada em `try/catch` e delega para `tratarErro()` (`src/utils/respostas.js`), que converte `ErroApi`, `ValidationError`, `UniqueConstraintError` etc. no status HTTP correto. No relatório, consultas independentes rodam em paralelo com `Promise.all`.

---

## 5. Massa de dados de teste (seeders)

**Limite semanal:** `250` pontos.

**Jogadores:**

| id | Nome | Posição | Ativo |
|---|---|---|---|
| 1 | Carlos Muralha | G | sim |
| 2 | Bruno Xerife | Z | sim |
| 3 | Lucas Firme | Z | sim |
| 4 | Diego Maestro | M | sim |
| 5 | Mateus Armador | M | sim |
| 6 | Rafael Artilheiro | A | sim |
| 7 | Pedro Afastado | A | **não** (teste de falha) |

**Treinos:** 24 sessões (12 por semana), cobrindo os tipos `F`, `T` e `E`.

| Jogador | Semana 1 (26/10 a 01/11) | Semana 2 (02/11 a 08/11) |
|---|---|---|
| Carlos Muralha (G) | 20,00 (1 treino) | 60,00 (2) |
| Bruno Xerife (Z) | 92,40 (2) | **250,00 (2) — no limite, sem risco** |
| Lucas Firme (Z) | 115,20 (2) | 60,00 (1) |
| Diego Maestro (M) | **277,50 (3) — RISCO** | 135,45 (3) |
| Mateus Armador (M) | 122,40 (2) | não treinou (fora dos rankings) |
| Rafael Artilheiro (A) | 73,20 (2) | **258,90 (4) — RISCO** |
| **Total** | 700,70 | 764,35 |

---

## 6. Roteiro de testes (cURL)

Os exemplos usam `curl` no Git Bash / Linux / macOS. No PowerShell, use `curl.exe` e escape as aspas do JSON, ou rode os mesmos cenários pelo Swagger em `/api-docs` (os exemplos do `POST /treinos` já estão prontos na lista suspensa “Examples”).

### 6.1 Jogadores

Cadastrar:

```bash
curl -X POST http://localhost:3000/jogadores -H "Content-Type: application/json" -d '{"nome":"Thiago Veloz","posicao":"A"}'
```

→ **201**. Com `"posicao":"Q"` → **400**.

Listar (todos ou só ativos):

```bash
curl http://localhost:3000/jogadores
```

```bash
curl "http://localhost:3000/jogadores?ativo=true"
```

Consultar por ID (`/jogadores/999` → **404**):

```bash
curl http://localhost:3000/jogadores/1
```

Atualizar:

```bash
curl -X PUT http://localhost:3000/jogadores/1 -H "Content-Type: application/json" -d '{"nome":"Carlos Muralha Jr."}'
```

### 6.2 Configuração

```bash
curl http://localhost:3000/configuracao
```

```bash
curl -X PUT http://localhost:3000/configuracao -H "Content-Type: application/json" -d '{"cargaMaximaSemanal":250,"dataVigencia":"2026-10-01"}'
```

→ **200** se já existir (atualiza) ou **201** se for a primeira vez.

### 6.3 Cálculo manual × API

Cálculo manual: treino `F`, 60 min, intensidade 8 → `(60/10) × 8 × 1.5 = 72`.

```bash
curl -X POST http://localhost:3000/treinos -H "Content-Type: application/json" -d '{"codigo":"TR-1001","jogadorId":5,"dataTreino":"2026-11-06","tipo":"F","duracaoMin":60,"intensidade":8}'
```

→ **201** com `"carga": 72` e `"calculo": "(60 / 10) x 8 x 1.5 = 72"`.

Outros conferíveis: `T`, 50 min, intensidade 8 → `5 × 8 × 1.2 = 48`; `E`, 90 min, intensidade 5 → `9 × 5 × 1.0 = 45`.

### 6.4 Código duplicado → 409

```bash
curl -X POST http://localhost:3000/treinos -H "Content-Type: application/json" -d '{"codigo":"TR-0001","jogadorId":4,"dataTreino":"2026-11-06","tipo":"F","duracaoMin":60,"intensidade":8}'
```

### 6.5 Intensidade inválida → 400

```bash
curl -X POST http://localhost:3000/treinos -H "Content-Type: application/json" -d '{"codigo":"TR-1002","jogadorId":4,"dataTreino":"2026-11-06","tipo":"T","duracaoMin":60,"intensidade":11}'
```

(`"intensidade":0` também retorna 400.)

### 6.6 Duração ≤ 0 → 400

```bash
curl -X POST http://localhost:3000/treinos -H "Content-Type: application/json" -d '{"codigo":"TR-1003","jogadorId":4,"dataTreino":"2026-11-06","tipo":"E","duracaoMin":0,"intensidade":5}'
```

(`"duracaoMin":-10` também retorna 400.)

### 6.7 Tipo inválido → 400

```bash
curl -X POST http://localhost:3000/treinos -H "Content-Type: application/json" -d '{"codigo":"TR-1006","jogadorId":4,"dataTreino":"2026-11-06","tipo":"X","duracaoMin":60,"intensidade":5}'
```

### 6.8 Atleta inativo → 400 e inexistente → 404

```bash
curl -X POST http://localhost:3000/treinos -H "Content-Type: application/json" -d '{"codigo":"TR-1004","jogadorId":7,"dataTreino":"2026-11-06","tipo":"T","duracaoMin":60,"intensidade":5}'
```

```bash
curl -X POST http://localhost:3000/treinos -H "Content-Type: application/json" -d '{"codigo":"TR-1005","jogadorId":999,"dataTreino":"2026-11-06","tipo":"T","duracaoMin":60,"intensidade":5}'
```

### 6.9 Desativação preserva o histórico

```bash
curl -X PATCH http://localhost:3000/jogadores/3/desativar
```

```bash
curl http://localhost:3000/treinos/jogador/3
```

→ O jogador fica com `"ativo": false`, mas os 3 treinos dele continuam listados. Um novo `POST /treinos` com `jogadorId: 3` passa a retornar **400**.

### 6.10 Listagem com filtros

```bash
curl "http://localhost:3000/treinos?jogadorId=6&tipo=F&dataInicio=2026-11-02&dataFim=2026-11-08"
```

→ 2 treinos (TR-0013 e TR-0014). Filtros inválidos (`tipo=X`, `dataInicio=2026-13-01`, `dataInicio` > `dataFim`) → **400**.

### 6.11 Excluir treino

```bash
curl -X DELETE http://localhost:3000/treinos/TR-1001
```

→ **200**. Repetir o mesmo comando → **404**.

### 6.12 Comparação entre duas semanas

> Execute com o banco recém-semeado (`npm run db:reset`), para os números baterem com as tabelas abaixo.

```bash
curl "http://localhost:3000/relatorios/semanal?data=2026-10-28"
```

```bash
curl "http://localhost:3000/relatorios/semanal?data=2026-11-05"
```

| Indicador | Semana 1 (`data=2026-10-28`) | Semana 2 (`data=2026-11-05`) |
|---|---|---|
| Período | 2026-10-26T00:00:00 → 2026-11-01T23:59:59 | 2026-11-02T00:00:00 → 2026-11-08T23:59:59 |
| Total de treinos | 12 | 12 |
| Carga total | 700,70 | 764,35 |
| Maior carga | Diego Maestro — 277,50 (3 treinos) | Rafael Artilheiro — 258,90 (4 treinos) |
| Menor carga | Carlos Muralha — 20,00 | **Empate:** Carlos Muralha e Lucas Firme — 60,00 |
| Jogadores em risco | 1 (Diego, +27,50) | 1 (Rafael, +8,90) |
| Caso de borda | — | Bruno = 250,00 = limite → `NORMAL` |
| Fora dos rankings | Pedro (inativo, sem treinos) | Mateus (não treinou) e Pedro |
| Média `F` / `T` / `E` | 93,38 / 47,04 / 30,67 | 97,69 / 43,20 / 48,80 |
| Por posição G / Z / M / A (treinos · média) | 1 · 20,00 / 4 · 51,90 / 5 · 79,98 / 2 · 36,60 | 2 · 30,00 / 3 · 103,33 / 3 · 45,15 / 4 · 64,73 |

**Semana vazia:**

```bash
curl "http://localhost:3000/relatorios/semanal?data=2026-12-01"
```

→ **200** com `"semanaVazia": true`, totais zerados, listas vazias e médias por tipo/posição em 0.

Sem o parâmetro `data` ou com data inválida → **400**.

---

## 7. Formato das respostas

Sucesso:

```json
{ "sucesso": true, "mensagem": "Treino registrado com sucesso.", "dados": { } }
```

Erro:

```json
{
  "sucesso": false,
  "erro": "Dados do treino inválidos.",
  "detalhes": [{ "campo": "intensidade", "mensagem": "A intensidade deve ser um número inteiro entre 1 e 10." }]
}
```

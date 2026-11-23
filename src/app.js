/**
 * Configuração da aplicação Express: middlewares, documentação Swagger, rotas e tratamento de erros.
 */
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocumento = require('./docs/swagger.json');
const rotas = require('./routes');

const app = express();

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocumento, {
  customSiteTitle: 'API de Treinos e Carga'
}));

app.get('/', (req, res) => {
  res.json({
    sucesso: true,
    mensagem: 'API de Treinos Esportivos com Controle de Carga e Risco de Lesão',
    documentacao: '/api-docs'
  });
});

app.use(rotas);

// Rota inexistente
app.use((req, res) => {
  res.status(404).json({ sucesso: false, erro: `Rota ${req.method} ${req.originalUrl} não encontrada.` });
});

// Erros não tratados (inclui JSON malformado no corpo da requisição)
// eslint-disable-next-line no-unused-vars
app.use((erro, req, res, next) => {
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ sucesso: false, erro: 'JSON inválido no corpo da requisição.' });
  }
  console.error('[ERRO NÃO TRATADO]', erro);
  return res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor.' });
});

module.exports = app;

/**
 * Ponto de entrada: valida a conexão com o banco e inicia o servidor HTTP.
 * A estrutura do banco é criada exclusivamente pelas migrations (sem sync).
 */
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORTA = Number(process.env.PORT) || 3000;

/**
 * Autentica no banco de dados e sobe a API.
 */
async function iniciar() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o MySQL estabelecida com sucesso.');

    app.listen(PORTA, () => {
      console.log(`API rodando em http://localhost:${PORTA}`);
      console.log(`Documentação Swagger em http://localhost:${PORTA}/api-docs`);
    });
  } catch (erro) {
    console.error('Não foi possível conectar ao banco de dados. Verifique o arquivo .env.');
    console.error(`Motivo: ${erro.message}`);
    process.exit(1);
  }
}

iniciar();

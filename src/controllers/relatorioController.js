/**
 * Controller de Relatórios.
 */
const relatorioService = require('../services/relatorioService');
const { enviarSucesso, tratarErro } = require('../utils/respostas');

/**
 * GET /relatorios/semanal?data=YYYY-MM-DD — relatório consolidado da semana.
 */
async function semanal(req, res) {
  try {
    const relatorio = await relatorioService.gerarRelatorioSemanal(req.query.data);
    return enviarSucesso(res, 200, relatorio);
  } catch (erro) {
    return tratarErro(res, erro);
  }
}

module.exports = { semanal };

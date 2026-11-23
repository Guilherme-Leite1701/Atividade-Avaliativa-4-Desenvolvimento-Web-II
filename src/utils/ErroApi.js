/**
 * Erro de negócio com status HTTP associado.
 * Lançado pelos services e convertido em resposta JSON pelos controllers.
 */
class ErroApi extends Error {
  constructor(status, mensagem, detalhes = null) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
    this.detalhes = detalhes;
  }
}

module.exports = ErroApi;

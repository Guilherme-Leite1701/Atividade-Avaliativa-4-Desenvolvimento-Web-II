/**
 * Padronização das respostas JSON de sucesso e de erro.
 * Erros inesperados retornam 500 com mensagem genérica (sem stack trace ou dados do banco).
 */
const {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  DatabaseError,
  ConnectionError
} = require('sequelize');
const ErroApi = require('./ErroApi');

/**
 * Envia uma resposta de sucesso padronizada.
 */
function enviarSucesso(res, status, dados, mensagem = undefined) {
  const corpo = { sucesso: true };
  if (mensagem) corpo.mensagem = mensagem;
  corpo.dados = dados;
  return res.status(status).json(corpo);
}

/**
 * Converte qualquer erro em uma resposta JSON com o status HTTP adequado.
 */
function tratarErro(res, erro) {
  if (erro instanceof ErroApi) {
    return res.status(erro.status).json({
      sucesso: false,
      erro: erro.message,
      ...(erro.detalhes ? { detalhes: erro.detalhes } : {})
    });
  }

  if (erro instanceof UniqueConstraintError) {
    return res.status(409).json({
      sucesso: false,
      erro: 'Registro duplicado: já existe um registro com este valor único.',
      detalhes: erro.errors.map((e) => ({ campo: e.path, mensagem: e.message }))
    });
  }

  if (erro instanceof ValidationError) {
    return res.status(400).json({
      sucesso: false,
      erro: 'Dados inválidos.',
      detalhes: erro.errors.map((e) => ({ campo: e.path, mensagem: e.message }))
    });
  }

  if (erro instanceof ForeignKeyConstraintError) {
    return res.status(400).json({ sucesso: false, erro: 'Referência inválida a outro registro.' });
  }

  console.error('[ERRO INTERNO]', erro);

  if (erro instanceof ConnectionError) {
    return res.status(500).json({ sucesso: false, erro: 'Serviço de banco de dados indisponível no momento.' });
  }

  if (erro instanceof DatabaseError) {
    return res.status(500).json({ sucesso: false, erro: 'Erro ao processar a operação no banco de dados.' });
  }

  return res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor.' });
}

module.exports = { enviarSucesso, tratarErro };

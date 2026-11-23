/**
 * Funções auxiliares de validação e conversão de dados de entrada.
 */
const ErroApi = require('./ErroApi');

const POSICOES = ['G', 'Z', 'M', 'A'];
const TIPOS = ['F', 'T', 'E'];

/**
 * Converte o valor para inteiro; retorna NaN se não for um inteiro válido.
 */
function paraInteiro(valor) {
  if (typeof valor === 'number') return Number.isInteger(valor) ? valor : NaN;
  if (typeof valor === 'string' && /^-?\d+$/.test(valor.trim())) return Number(valor.trim());
  return NaN;
}

/**
 * Verifica se o texto é uma data real no formato YYYY-MM-DD.
 */
function ehDataValida(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [ano, mes, dia] = valor.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;
}

/**
 * Valida a data (YYYY-MM-DD) e lança ErroApi 400 caso seja inválida.
 */
function validarData(valor, campo) {
  if (!ehDataValida(valor)) {
    throw new ErroApi(400, `O campo "${campo}" deve ser uma data válida no formato YYYY-MM-DD.`);
  }
  return valor;
}

/**
 * Valida um identificador numérico positivo e lança ErroApi 400 caso seja inválido.
 */
function validarId(valor, campo = 'id') {
  const id = paraInteiro(valor);
  if (Number.isNaN(id) || id <= 0) {
    throw new ErroApi(400, `O parâmetro "${campo}" deve ser um número inteiro positivo.`);
  }
  return id;
}

/**
 * Converte "true"/"false" (ou booleano) em booleano; retorna undefined se inválido.
 */
function paraBooleano(valor) {
  if (typeof valor === 'boolean') return valor;
  if (valor === 'true') return true;
  if (valor === 'false') return false;
  return undefined;
}

module.exports = {
  POSICOES,
  TIPOS,
  paraInteiro,
  ehDataValida,
  validarData,
  validarId,
  paraBooleano
};

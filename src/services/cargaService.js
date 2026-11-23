/**
 * Regras de negócio puras (sem acesso a banco):
 * cálculo de carga do treino e delimitação da semana de referência.
 */
const ErroApi = require('../utils/ErroApi');

const MULTIPLICADORES = Object.freeze({ F: 1.5, T: 1.2, E: 1.0 });
const DESCRICAO_TIPOS = Object.freeze({ F: 'Físico', T: 'Técnico', E: 'Estratégico' });
const DESCRICAO_POSICOES = Object.freeze({ G: 'Goleiro', Z: 'Zagueiro', M: 'Meio-campo', A: 'Atacante' });

/**
 * Arredonda um número para 2 casas decimais.
 */
function arredondar(valor) {
  return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula a carga do treino: (duracaoMin / 10) x intensidade x multiplicador do tipo.
 * Lança ErroApi (400) se algum parâmetro for inválido.
 */
function calcularCarga(duracaoMin, intensidade, tipo) {
  const multiplicador = MULTIPLICADORES[tipo];

  if (multiplicador === undefined) {
    throw new ErroApi(400, 'Tipo de treino inválido. Use F (Físico), T (Técnico) ou E (Estratégico).');
  }
  if (!Number.isInteger(duracaoMin) || duracaoMin <= 0) {
    throw new ErroApi(400, 'A duração (duracaoMin) deve ser um número inteiro maior que zero.');
  }
  if (!Number.isInteger(intensidade) || intensidade < 1 || intensidade > 10) {
    throw new ErroApi(400, 'A intensidade deve ser um número inteiro entre 1 e 10.');
  }

  return arredondar((duracaoMin / 10) * intensidade * multiplicador);
}

/**
 * Retorna o texto explicativo do cálculo, útil para conferência manual.
 */
function descreverCalculo(duracaoMin, intensidade, tipo) {
  const carga = calcularCarga(duracaoMin, intensidade, tipo);
  return `(${duracaoMin} / 10) x ${intensidade} x ${MULTIPLICADORES[tipo]} = ${carga}`;
}

/**
 * Formata um objeto Date (em UTC) como YYYY-MM-DD.
 */
function formatarData(data) {
  return data.toISOString().slice(0, 10);
}

/**
 * Calcula a semana (segunda 00:00:00 a domingo 23:59:59) que contém a data informada (YYYY-MM-DD).
 */
function calcularSemana(dataReferencia) {
  const [ano, mes, dia] = dataReferencia.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));

  const diasDesdeSegunda = (data.getUTCDay() + 6) % 7;
  const segunda = new Date(data);
  segunda.setUTCDate(data.getUTCDate() - diasDesdeSegunda);

  const domingo = new Date(segunda);
  domingo.setUTCDate(segunda.getUTCDate() + 6);

  const inicio = formatarData(segunda);
  const fim = formatarData(domingo);

  return {
    inicio,
    fim,
    inicioCompleto: `${inicio}T00:00:00`,
    fimCompleto: `${fim}T23:59:59`
  };
}

module.exports = {
  MULTIPLICADORES,
  DESCRICAO_TIPOS,
  DESCRICAO_POSICOES,
  arredondar,
  calcularCarga,
  descreverCalculo,
  calcularSemana
};

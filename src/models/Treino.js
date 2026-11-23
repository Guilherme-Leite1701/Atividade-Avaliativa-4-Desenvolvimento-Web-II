/**
 * Model Treino: sessão de treino de um jogador.
 * Tipos: F = Físico, T = Técnico, E = Estratégico.
 * A "carga" é calculada pelo sistema (ver services/cargaService.js).
 */
module.exports = (sequelize, DataTypes) => {
  const Treino = sequelize.define('Treino', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: { msg: 'Já existe um treino com este código.' },
      validate: {
        notNull: { msg: 'O campo "codigo" é obrigatório.' },
        notEmpty: { msg: 'O campo "codigo" não pode ser vazio.' }
      }
    },
    jogadorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'O campo "jogadorId" é obrigatório.' }
      }
    },
    dataTreino: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: { msg: 'O campo "dataTreino" é obrigatório.' },
        isDate: { msg: 'O campo "dataTreino" deve ser uma data válida (YYYY-MM-DD).' }
      }
    },
    tipo: {
      type: DataTypes.ENUM('F', 'T', 'E'),
      allowNull: false,
      validate: {
        notNull: { msg: 'O campo "tipo" é obrigatório.' },
        isIn: { args: [['F', 'T', 'E']], msg: 'Tipo inválido. Use F, T ou E.' }
      }
    },
    duracaoMin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'O campo "duracaoMin" é obrigatório.' },
        isInt: { msg: 'O campo "duracaoMin" deve ser um número inteiro.' },
        min: { args: [1], msg: 'O campo "duracaoMin" deve ser maior que zero.' }
      }
    },
    intensidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'O campo "intensidade" é obrigatório.' },
        isInt: { msg: 'O campo "intensidade" deve ser um número inteiro.' },
        min: { args: [1], msg: 'A intensidade deve estar entre 1 e 10.' },
        max: { args: [10], msg: 'A intensidade deve estar entre 1 e 10.' }
      }
    },
    carga: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const valor = this.getDataValue('carga');
        return valor === null || valor === undefined ? valor : Number(valor);
      }
    }
  }, {
    tableName: 'treinos'
  });

  return Treino;
};

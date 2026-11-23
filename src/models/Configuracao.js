/**
 * Model Configuracao: limite máximo de carga semanal por atleta.
 */
module.exports = (sequelize, DataTypes) => {
  const Configuracao = sequelize.define('Configuracao', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cargaMaximaSemanal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: { msg: 'O campo "cargaMaximaSemanal" é obrigatório.' },
        isDecimal: { msg: 'O campo "cargaMaximaSemanal" deve ser numérico.' },
        min: { args: [0.01], msg: 'O campo "cargaMaximaSemanal" deve ser maior que zero.' }
      },
      get() {
        const valor = this.getDataValue('cargaMaximaSemanal');
        return valor === null || valor === undefined ? valor : Number(valor);
      }
    },
    dataVigencia: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: { msg: 'O campo "dataVigencia" deve ser uma data válida (YYYY-MM-DD).' }
      }
    }
  }, {
    tableName: 'configuracoes'
  });

  return Configuracao;
};

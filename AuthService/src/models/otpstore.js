'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class otpStore extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  otpStore.init({
    userId: {
      type:DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    otp:{
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    
  }, {
    sequelize,
    modelName: 'otpStore',
  });
  return otpStore;
};
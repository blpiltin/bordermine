const { BaseModel } = require('./base_model')


class Unit extends BaseModel {

  static get tableName() { return 'units' }

}


module.exports = { Unit }
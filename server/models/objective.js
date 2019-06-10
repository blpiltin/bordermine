const debug = require('../../utils/debug').create('objective.js');

const _ = require('lodash')
const { nullifyEmpty } = require('./model_utils')

const { Model } = require('objection')


class Objective extends Model {

  static get tableName() { return 'objectives' }

  update(json) {
    return new Promise((resolve, reject) => {

      let data = _.pick(json, ['code', 'text'])
      nullifyEmpty(data)

      Objective.query().patchAndFetchById(this.id, data)
      .then(objective => resolve(objective))
      .catch(err => reject(err))
    })
  }

}


module.exports = { Objective }
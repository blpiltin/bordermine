const debug = require('../../utils/debug').create('vocabulary.js');

const _ = require('lodash')
const { nullifyEmpty } = require('./model_utils')

const { BaseModel } = require('./base_model')

const { ModelValidator }  = require('../utils/model_validator')
const forms = require('../utils/forms/course_forms.json')


class Vocabulary extends BaseModel {

  static get tableName() { return 'vocabularys' }

  static get parentCol() { return 'courseId' }
  static get searchCols() { return ['word', 'definition'] }

  static createValidator() { 
    return new ModelValidator(forms['edit_course_vocabulary']) 
  }

  update(json) {
    return new Promise((resolve, reject) => {

      let data = _.pick(json, ['word', 'definition', 'image'])
      nullifyEmpty(data)

      Vocabulary.query().patchAndFetchById(this.id, data)
      .then(vocabulary => resolve(vocabulary))
      .catch(err => reject(err))
    })
  }

}


module.exports = { Vocabulary }
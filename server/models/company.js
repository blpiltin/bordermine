//======================================================
// company.js 
// 
// Description: Defines the company model.
// 
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.1
// History:
//  - 0.0.1: Initial version.
//======================================================

const debug = require('../../utils/debug').create('company.js')

const _ = require('lodash')

const fs = require('fs-extra')
const path = require('path')

const { BaseModel } = require('./base_model')
const { User } = require('./user')

const { nullifyEmpty } = require('./model_utils')

const { ModelValidator }  = require('../utils/model_validator')
const forms = require('../utils/forms/company_forms.json')

const COMPANY_TYPES = ['broker', 'carrier']

const UPLOADS_DIR = path.join(__dirname, '../../client/uploads')


class Company extends BaseModel {

  static get tableName() { return 'companies' }

  static get relationMappings() {
    return {
      users: {
        relation: Model.HasManyRelation,
        modelClass: User,
        join: {
          from: 'companies.id',
          to: 'users.companyId'
        }
      },
      owner: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'companies.ownerId',
          to: 'users.id'
        }
      },
      contact: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'companies.contactId',
          to: 'users.id'
        }
      }
    }
  }

  static createValidator() { return new ModelValidator(forms['edit_company_info']) }

  //------------------------------------------------------
  // TODO: include file saving/deleting here at the model level
  //  instead of at the controller level.
  //------------------------------------------------------
  update(json) {
    return new Promise((resolve, reject) => {
      let data = _.pick(json, ['name', 'slug', 'code', 'description', 'icon'])

      data.modified = Date.now()

      Company.query().patchAndFetchById(this.id, data)
      .then(company => resolve(company))
      .catch(err => reject(err))
    })
  }

  //------------------------------------------------------
  // Find a company given a json query
  //------------------------------------------------------
  static findOne(json) {
    return new Promise((resolve, reject) => {
      Company.query()
      .eager('[objectives, vocabularys]')
      .where(json)
      .then(companies => {
        if (companies[0]) { resolve(companies[0]) }
        else { reject(Error('Could not find requested company.')) }
      })
      .catch(err => reject(err))
    })
  }

  createObjective(json) {
    return new Promise((resolve, reject) => {

      let data = _.pick(json, ['code', 'text'])
      nullifyEmpty(data)

      this.$relatedQuery('objectives').insert(data)
      .then(objective => resolve(objective))
      .catch(err => reject(err))
    })
  }

  deleteObjective(id) {
    return new Promise((resolve, reject) => {
      Objective.query().delete().where({ id })
      .then(num => resolve(num))
      .catch(err => reject(err))
    }) 
  }

  allObjectives() {
    return new Promise((resolve, reject) => {
      this.$relatedQuery('objectives')
      .where({ companyId: this.id })
      .then(objectives => resolve(objectives))
      .catch(err => reject(err))
    })
  }

  objectiveById(id) {
    return new Promise((resolve, reject) => {
      this.$relatedQuery('objectives')
      .where({ id })
      .then(objectives => {
        if (objectives[0]) { resolve(objectives[0]) }
        else { reject(Error(`Could not find objective with id ${id}`)) }
      })
      .catch(err => reject(err))
    })
  }

  createVocabulary(json) {
    return new Promise((resolve, reject) => {

      let data = _.pick(json, ['word', 'definition', 'image'])

      this.$relatedQuery('vocabularys').insert(data)
      .then(vocabulary => resolve(vocabulary))
      .catch(err => reject(err))
    })
  }

  allVocabularys() {
    return new Promise((resolve, reject) => {
      this.$relatedQuery('vocabularys')
      .where({ companyId: this.id })
      .then(vocabularys => resolve(vocabularys))
      .catch(err => reject(err))
    })
  }

  vocabularyById(id) {
    return new Promise((resolve, reject) => {
      this.$relatedQuery('vocabularys')
      .where({ id })
      .then(vocabulary => {
        if (vocabulary[0]) { resolve(vocabulary[0]) }
        else { reject(Error(`Could not find vocabulary with id ${id}`)) }
      })
      .catch(err => reject(err))
    })
  }

  deleteVocabulary(id) {
    return new Promise((resolve, reject) => {
      Vocabulary.query().delete().where({ id })
      .then(num => resolve(num))
      .catch(err => reject(err))
    }) 
  }
}


module.exports = { Company, COMPANY_TYPES }
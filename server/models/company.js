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


class Company extends BaseModel {

  static get tableName() { return 'companies' }

  static get jsonAttributes() { return ['address'] }

  static get types() { return ['broker', 'carrier'] }

  static get uploadsDir() { return path.join(__dirname, '../../client/uploads') }

  static get relationMappings() {
    return {
      users: {
        relation: BaseModel.HasManyRelation,
        modelClass: User,
        join: {
          from: 'companies.id',
          to: 'users.companyId'
        }
      },
      owner: {
        relation: BaseModel.HasOneRelation,
        modelClass: User,
        join: {
          from: 'companies.ownerId',
          to: 'users.id'
        }
      },
      contact: {
        relation: BaseModel.HasOneRelation,
        modelClass: User,
        join: {
          from: 'companies.contactId',
          to: 'users.id'
        }
      }
    }
  }

  static createValidator() { return new ModelValidator(forms['edit_company_info']) }


  static create(ownerId, contactId, json) {

    return new Promise(async (resolve, reject) => {
      let address = 
            _.pick(json.address, [
              'line1', 'line2', 'city', 'state', 'postalCode', 'country'
            ]),
          data = _.pick(json, ['type', 'name', 'logo'])

      data.ownerId = ownerId
      data.contactId = contactId
      data.address = address
      data.created = Date.now()
      data.modified = Date.now()
      
      try {
        let company = await Company.query().insert(data)
        resolve(company)
      } catch(error) { reject(error) }

    })
  }

  static read(id) {
    return new Promise(async (resolve, reject) => {
      try {
        let companys = await Company.query().where({ id })
        if (companys[0]) { resolve(companys[0]) }
        else { reject(Error(`Unable to find company with id ${id}`)) }
      } catch(error) { reject(error) }
    })
  }
}


module.exports = { Company }
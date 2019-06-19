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

const path = require('path')

const { BaseModel } = require('./base_model')

const { nullifyEmpty } = require('./model_utils')

const { ModelValidator }  = require('../utils/model_validator')
const forms = require('../utils/forms/company_forms.json')


class Company extends BaseModel {

  static get tableName() { return 'companies' }

  static get jsonAttributes() { return ['address'] }

  static get types() { return ['broker', 'carrier'] }

  static get uploadsDir() { return path.join(__dirname, '../../client/uploads') }

  static get relationMappings() {
    const { User } = require('./user')

    return {
      users: {
        relation: this.HasManyRelation,
        modelClass: User,
        join: {
          from: 'companies.id',
          to: 'users.companyId'
        }
      },
      owner: {
        relation: this.HasOneRelation,
        modelClass: User,
        join: {
          from: 'companies.ownerId',
          to: 'users.id'
        }
      },
      contact: {
        relation: this.HasOneRelation,
        modelClass: User,
        join: {
          from: 'companies.contactId',
          to: 'users.id'
        }
      }
    }
  }

  static createValidator() { return new ModelValidator(forms['edit_company_info']) }


  static create(json) {

    return new Promise(async (resolve, reject) => {
      let address = 
            _.pick(json.address, [
              'line1', 'line2', 'city', 'state', 'postalCode', 'country'
            ]),
          data = _.pick(json, ['type', 'name', 'logo'])

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

  update(json) {
    return new Promise(async (resolve, reject) => {
      let address = 
            _.pick(json.address, [
                'line1', 'line2', 'city', 'state', 'postalCode', 'country'
              ]),
          data = _.pick(json, ['name', 'logo'])
      
      data.address = address
      data.modified = Date.now()

      try {
        let company = await Company.query().patchAndFetchById(this.id, data)
        resolve(company)
      } catch(error) { reject(error) }
    })
  }

  updateOwner(ownerId) {
    return new Promise(async (resolve, reject) => {
      let data = { ownerId, contactId: ownerId, modified: Date.now() }
      
      try {
        let company = await Company.query().patchAndFetchById(this.id, data)
        resolve(company)
      } catch(error) { reject(error) }
    })
  }

  updateContact(contactId) {
    return new Promise(async (resolve, reject) => {
      let data = { contactId, modified: Date.now() }
      
      try {
        let company = await Company.query().patchAndFetchById(this.id, data)
        resolve(company)
      } catch(error) { reject(error) }
    })
  }

  //------------------------------------------------------
  // Delete a company and all related users.
  //  Should only be used for administration/testing purposes!
  //------------------------------------------------------
  delete() {
    return new Promise(async (resolve, reject) => {
      const { User } = require('./user')

      try {
        let num = await User.query().delete().where({ companyId: this.id })
        num = await Company.query().delete().where({ id: this.id })
        resolve(num)
      } catch(error) { reject(error) }
    }) 
  }

}


module.exports = { Company }
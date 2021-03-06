//======================================================
// company.js 
// 
// Description: Defines the company model. According to
//  the following schema:
// table.increments('id')
// table.integer('companyId').notNullable().references('companies.id')
// table.integer('executiveId').notNullable().references('users.id')
// table.enu('type', Client.types).notNullable()
// table.string('name').notNullable()
// table.jsonb('address')
// table.jsonb('contact')
// table.jsonb('extra')
// table.text('notes')
// table.boolean('archive')
// table.timestamp('created').defaultTo(knex.fn.now())
// table.timestamp('modified').defaultTo(knex.fn.now())
// table.unique(['companyId', 'name'])
// 
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.1
// History:
//  - 0.0.1: Initial version.
//======================================================

const debug = require('../../utils/debug').create('client.js');

const _ = require('lodash')

const { BaseModel } = require('./base_model')

const { ModelValidator }  = require('../utils/model_validator')
const forms = require('../utils/forms/client_forms.json')


class Client extends BaseModel {

  static get tableName() { return 'clients' }
  
  static getPluralName(type) { return type + 's' }

  static get jsonAttributes() { return ['address', 'contact', 'extra'] }

  static get virtualAttributes() { return [
    'contactName', 'contactPhone', 'contactEmail', 'country'
  ] }

  static get relationMappings() {
    const { User } = require('./user')
    
    return {
      executive: {
        relation: this.HasOneRelation,
        modelClass: User,
        join: {
          from: 'clients.executiveId',
          to: 'users.id'
        }
      }
    }
  }

  static get types() { return ['exporter', 'consignee'] }

  static createValidator() { 
    return new ModelValidator(forms['edit_client']) 
  }

  static get sortCols() { return ['executiveId', 'name', 'contact.name'] }

  static get searchCols() { return ['executive.profile', 'name', 'address', 'contact', 'notes'] }

  static get uploadsDir() { return path.join(__dirname, '../../client/uploads') }

  get contactName() { 
    return this.contact && `${this.contact.firstName} ${this.contact.lastName}`
  }

  get contactPhone() { return this.contact && `${this.contact.phone}` }

  get contactEmail() { return this.contact && `${this.contact.email}` }

  get country() { return this.address && `${this.address.country}` }

  static create(companyId, executiveId, type, json) {

    return new Promise(async (resolve, reject) => {
      let address = 
            _.pick(json.address, [
              'line1', 'line2', 'city', 'state', 'postalCode', 'country'
            ]),
          contact = 
            _.pick(json.contact, [
              'firstName', 'lastName', 'email', 'phone', 'fax', 'title'
            ]),
          data = _.pick(json, ['name', 'notes'])

      if (!_.isEmpty(address)) { data.address = address }
      if (!_.isEmpty(contact)) { data.contact = contact }

      data.created = Date.now()
      data.modified = Date.now()
      
      data.companyId = companyId
      data.executiveId = executiveId
      data.type = type

      try {
        let client = await Client.query().eager('executive').insert(data)
        resolve(client)
      } catch(error) { reject(error) }

    })
  }

  static read(id) {
    return new Promise(async (resolve, reject) => {
      try {
        let clients = await Client.query().eager('executive').where({ id })
        if (clients[0]) { resolve(clients[0]) }
        else { reject(Error(`Unable to find client with id ${id}`)) }
      } catch(error) { reject(error) }
    })
  }

  static readByCompany(companyId, id) {
    return new Promise(async (resolve, reject) => {
      try {
        let clients = 
          await Client
            .query().eager('executive').where({ companyId, id })
        if (clients[0]) { resolve(clients[0]) }
        else { reject(Error(`Unable to find client with id ${id}`)) }
      } catch(error) { reject(error) }
    })
  }

  update(json) {
    return new Promise(async (resolve, reject) => {
      let address = 
            _.pick(json.address, [
              'line1', 'line2', 'city', 'state', 'postalCode', 'country'
            ]),
          contact = 
            _.pick(json.contact, [
              'firstName', 'lastName', 'email', 'phone', 'fax', 'title'
            ]),
          data = _.pick(json, ['name', 'notes'])
      
      if (!_.isEmpty(address)) { data.address = address }
      if (!_.isEmpty(contact)) { data.contact = contact }

      data.modified = Date.now()

      try {
        let client = 
          await Client.query()
            .eager('executive')
            .patchAndFetchById(this.id, data)
        resolve(client)
      } catch(error) { reject(error) }
    })
  }

  updateExecutive(executiveId) {
    return new Promise(async (resolve, reject) => {
      let data = { executiveId, modified: Date.now() }
      
      try {
        let client = 
          await Client.query()
            .eager('executive')
            .patchAndFetchById(this.id, data)
        resolve(client)
      } catch(error) { reject(error) }
    })
  }

  //------------------------------------------------------
  // Delete a client and all related manifests.
  //  Should only be used for administration/testing purposes!
  //------------------------------------------------------
  delete() {
    return new Promise(async (resolve, reject) => {
      try {
        let num = await Manifest.query().delete().where({ clientId: this.id })
        num = await Client.query().delete().where({ id: this.id })
        resolve(num)
      } catch(error) { reject(error) }
    }) 
  }

  //------------------------------------------------------
  // Archive a client and all related manifests.
  //------------------------------------------------------
  archive() {
    return new Promise(async (resolve, reject) => {
      try {
        await Manifest.query()
          .patch({ 'archive': true }).where({ clientId: this.id })
        let client = 
          await Client.query()
            .eager('executive')
            .patchAndFetchById(this.id, { archive: true })
        resolve(client)
      } catch(error) { reject(error) }
    }) 
  }

  //------------------------------------------------------
  // UnArchive a client and all related manifests.
  //------------------------------------------------------
  unArchive() {
    return new Promise(async (resolve, reject) => {
      try {
        await Manifest.query()
          .patch({ 'archive': false }).where({ clientId: this.id })
        let client = 
          await Client.query()
            .eager('executive')
            .patchAndFetchById(this.id, { archive: false })
        resolve(client)
      } catch(error) { reject(error) }
    }) 
  }
}


module.exports = { Client }
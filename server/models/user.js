//======================================================
// user.js 
// 
// Description: Defines basic user account databse model.
//  Includes CRUD, search, and authentication routines.
// 
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.1
// History:
//  - 0.0.1: Initial version.
//======================================================

const debug = require('../../utils/debug').create('user.js')
const error = require('../../utils/error')

require('../db/db')

const bcrypt = require('bcryptjs')
const _ = require('lodash')
const uuid = require('uuid/v1')
const moment = require('moment')

const fs = require('fs-extra')
const path = require('path')

const { BaseModel } = require('./base_model')

const { ModelValidator }  = require('../utils/model_validator')
const forms = require('../utils/forms/user_forms.json')


class User extends BaseModel {

  static get tableName() { return 'users' }

  static get jsonAttributes() { return ['profile'] }

  static get roles() { return ['root', 'admin', 'owner', 'super', 'user'] }

  static get uploadsDir() { return path.join(__dirname, '../../client/uploads') }
  
  static get relationMappings() {
    const { Company } = require('./company')

    return {
      company: {
        relation: this.HasOneRelation,
        modelClass: Company,
        join: {
          from: 'users.companyId',
          to: 'companies.id'
        }
      }
    }
  }

  get fullName() { 
    return this.profile 
      ? `${this.profile.firstName} ${this.profile.lastName}` 
      : this.email
  }

  static createValidator() { return new ModelValidator(forms['edit_user']) }

  static create(json) {

    return new Promise((resolve, reject) => {

      let profile = 
            _.pick(json.profile, ['firstName', 'lastName', 'phone', 'title', 'photo']),
          data = _.pick(json, ['email', 'password', 'role'])

      data.profile = profile
      data.activationCode = uuid()
      data.activated = false
      data.created = Date.now()
      data.modified = Date.now()
      
      // Do password validation here because validator prevented against 
      //  checking hashed password
      let passwordPattern = forms['edit_user'].fields.password.pattern
      if (!data.password || !data.password.match(passwordPattern)) {
        reject(Error('Incorrect username or password provided.'))
      }

      bcrypt.hash(data.password, 10, async (err, hash) => {
        if (err) reject(err)
        data.password = hash
        try {
          let user = await User.query().insert(data)
          resolve(user)
        } catch(error) { reject(error) }
      })
    })
  }

  static read(id) {
    return new Promise(async (resolve, reject) => {
      try {
        let users = await User.query().eager('company').where({ id })
        if (users[0]) { resolve(users[0]) }
        else { reject(Error(`Unable to find user with id ${id}`)) }
      } catch(error) { reject(error) }
    })
  }

  static findByCredentials(email, password) {
    return new Promise(async (resolve, reject) => {
      try {
        let users = await User.query().where({ email })
        if (users[0]) {
          let user = users[0]
          bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
              resolve(user)
            } else {
              reject(Error('Incorrect username or password provided.'))
            }
          })
        } else {
          reject(Error('Incorrect username or password provided.'))
        }
      } catch(error) { reject(error) }
    })
  }

  static findByEmail(email) {
    return new Promise(async (resolve, reject) => {
      try {
        let users = await User.query().where({ email })
        if (users[0]) { resolve(users[0]) }
        else { 
          reject(error.gen(
            `Could not find user with email ${email}.`, 'USER_NOT_FOUND'
          ))
        }
      } catch(error) { reject(error) }
    })
  }

  //------------------------------------------------------
  // Standard update + check for password change and rehash
  //  if necessary. Filter unwanted data from json.
  //------------------------------------------------------
  update(json) {
    return new Promise(async (resolve, reject) => {
      let profile = 
            _.pick(json.profile, ['firstName', 'lastName', 'phone', 'title', 'photo']),
          data = _.pick(json, ['password', 'passwordResetCode'])

      if (!data.passwordResetCode) { data.passwordResetCode = null }

      data.profile = profile
      data.modified = Date.now()

      if (data.password) {
        bcrypt.hash(data.password, 10, async (err, hash) => {
          if (err) reject(err)
          data.password = hash
          try {
            let user = await User.query().patchAndFetchById(this.id, data)
            resolve(user)
          } catch(error) { reject(error) }
        })
      } else {
        try {
          let user = await User.query().patchAndFetchById(this.id, data)
          resolve(user)
        } catch(error) { reject(error) }
      }
    })
  }

  delete() {
    return new Promise(async (resolve, reject) => {
      try {
        let num = await User.query().delete().where({ id: this.id })
        resolve(num)
      } catch(error) { reject(error) }
    }) 
  }

  matchPassword(password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, this.password, (err, result) => {
        if (result) {
          resolve(this)
        } else {
          reject(Error('The supplied current password is incorrect.'))
        }
      })
    })
  }

  static activate(activationCode) {
    return new Promise(async (resolve, reject) => {

      try {
        let numUpdated = 
          await User.query()
            .patch({ activated: true })
            .where({ activationCode })
            .where({ activated: 0 })

        if (numUpdated === 1) { resolve(true) }
        else { 
          reject(Error('Cannot activate user. Incorrect activation code.')) 
        }
      } catch(error) { reject(err) }
    })
  }

  generatePasswordResetCode() {
    return this.update({ passwordResetCode: uuid() })
  }

  confirmPasswordResetCode(code) {
    return new Promise((resolve, reject) => {
      if (moment(this.modified) < moment().subtract(10, 'minutes') 
        || this.passwordResetCode !== code) {
        reject(error.gen('Invalid or expired password reset code. ' +
          'Please re-enter your email and submit to try again.', 'CODE_INVALID'))
      }
      resolve(this)
    })
  }

}


module.exports = { User }
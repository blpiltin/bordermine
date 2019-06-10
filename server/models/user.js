//======================================================
// user.js 
// 
// Description: Defines basic user account used for authentication.
// 
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.4
// History:
//  - 0.0.1: Initial version.
//  - 0.0.2: Modified for use with cookies instead of web tokens.
//  - 0.0.3: Add user profile information to Schema.
//  - 0.0.4: Converted to Objection/Knex from Mongoose
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

const { Model } = require('objection')
const { Course } = require('./course')

const { ModelValidator }  = require('../utils/model_validator')
const forms = require('../utils/forms/user_forms.json')


const UPLOADS_DIR = path.join(__dirname, '../../client/uploads')

const USER_ROLES = [
  'root',
  'webmaster',
  'schoolmaster',
  'administrator',
  'teacher',
  'student',
  'parent'
]


class User extends Model {

  static get tableName() { return 'users' }

  static get relationMappings() {
    return {
      courses: {
        relation: Model.HasManyRelation,
        modelClass: Course,
        join: {
          from: 'users.id',
          to: 'courses.userId'
        }
      }
    }
  }

  static get jsonAttributes() { return ['profile'] }

  get fullName() { 
    return this.profile 
      ? `${this.profile.firstName} ${this.profile.lastName}` 
      : this.email
  }

  static createValidator() { return new ModelValidator(forms['edit_user']) }

  static create(json) {

    return new Promise((resolve, reject) => {

      let data = _.pick(json, ['email', 'password', 'role', 'profile'])

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

      bcrypt.hash(data.password, 10, (err, hash) => {
        if (err) reject(err)
        data.password = hash
        User.query().insert(data)
        .then(user => resolve(user))
        .catch(err => reject(err))
      })
    })
  }

  static read(id) {
    return new Promise((resolve, reject) => {
      User.query().eager('courses').where({ id })
      .then(users => {
        if (users[0]) { resolve(users[0]) }
        else { reject(Error(`Unable to find user with id ${id}`)) }
      })
      .catch(err => reject(err))
    })
  }

  static findByCredentials(email, password) {
    return new Promise((resolve, reject) => {
      User.query().where({ email })
      .then(users => {
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
      })
      .catch(err => reject(err))
    })
  }

  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      User.query()
      .where({ email })
      .then(users => {
        if (users[0]) { resolve(users[0]) }
        else { 
          reject(error.gen(
            `Could not find user with email ${email}.`, 'USER_NOT_FOUND'
          ))
        }
      })
      .catch(err => reject(err))
    })
  }

  //------------------------------------------------------
  // Standard update + check for password change and rehash
  //  if necessary. Filter unwanted data from json.
  //------------------------------------------------------
  update(json) {
    return new Promise((resolve, reject) => {
      let data = _.pick(json, ['password', 'profile', 'passwordResetCode'])

      if (!data.passwordResetCode) { data.passwordResetCode = null }

      data.modified = Date.now()

      if (data.password) {
        bcrypt.hash(data.password, 10, (err, hash) => {
          if (err) reject(err)
          data.password = hash
          User.query().patchAndFetchById(this.id, data)
          .then(user => resolve(user))
          .catch(err => reject(err))
        })
      } else {
        User.query().patchAndFetchById(this.id, data)
        .then(user => resolve(user))
        .catch(err => reject(err))
      }
    })
  }

  delete() {
    return new Promise((resolve, reject) => {
      User.query().delete().where({ id: this.id })
      .then(num => {
        Course.query().delete().where({ userId: this.id })
        .then(() => resolve(num))
      })
      .catch(err => reject(err))
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
    return new Promise((resolve, reject) => {

      User.query()
      .patch({ activated: true })
      .where({ activationCode })
      .where({ activated: 0 })
      .then(numUpdated => {
        if (numUpdated === 1) { resolve(true) }
        else { reject(Error('Cannot activate user. Incorrect activation code.')) }
      })
      .catch(err => reject(err))
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

  createCourse(json) {
    return new Promise((resolve, reject) => {

      let data = _.pick(json, ['name', 'slug', 'code', 'description', 'icon'])

      data.created = Date.now()
      data.modified = Date.now()

      this.$relatedQuery('courses').insert(data)
      .then(course => resolve(course))
      .catch(err => reject(err))
    })
  }

  allCourses() {
    return new Promise((resolve, reject) => {
      this.$relatedQuery('courses')
      .where({ userId: this.id })
      .then(courses => resolve(courses))
      .catch(err => reject(err))
    })
  }

  courseById(id) {
    return new Promise((resolve, reject) => {
      this.$relatedQuery('courses')
      .eager('[objectives, vocabularys]')
      .where({ id })
      .then(courses => {
        if (courses[0]) { resolve(courses[0]) }
        else { reject(Error(`Could not find course with id ${id}`)) }
      })
      .catch(err => reject(err))
    })
  }

  courseBySlug(slug) {
    return new Promise((resolve, reject) => {
      this.$relatedQuery('courses')
      .where({ slug })
      .then(courses => {
        if (courses[0]) { resolve(courses[0]) }
        else { reject(Error(`Could not find course with slug ${slug}`)) }
      })
      .catch(err => reject(err))
    })
  }

  courseByCode(code) {
    return new Promise((resolve, reject) => {
      this.$relatedQuery('courses')
      .where({ code })
      .then(courses => {
        if (courses[0]) { resolve(courses[0]) }
        else { reject(Error(`Could not find course with code ${code}`)) }
      })
      .catch(err => reject(err))
    })
  }
}


module.exports = { User, USER_ROLES, UPLOADS_DIR }
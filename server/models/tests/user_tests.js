//======================================================
// user_tests.js
//
// Description: Unit tests for User model.
//
// See: 20190328032323_create_users_table, users_seed.js
//
// Version: 0.0.1
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

const debug = require('../../../utils/debug').create('user_tests.js')

process.env.NODE_ENV = 'test'

const { expect } = require('chai')
const faker = require('faker')
const sinon = require('sinon')

const moment = require('moment')

var { Knex } = require('../../db/db')

const { User } = require('../user')

const { 
  USER_CREDENTIALS,
  getRandomUserData
} = require('../../db/seeds/users_seed')


before(async function () {
  await Knex.migrate.rollback()
  await Knex.migrate.latest()
  await Knex.seed.run()
})


describe('User',function () {

  describe('create', function () {

    it('should create a user with valid data', async function () {
      let data = getRandomUserData()
      delete data.activationCode
      let user = await User.create(data)
      user = await User.read(user.id)
      expect(user).to.be.ok
      expect(user.profile).to.contain(data.profile)
      expect(user.activated).to.not.be.ok
      expect(user.activationCode).to.be.ok
      expect(user.created).to.be.ok
      expect(user.modified).to.be.ok
    })

    it('should not create a user with invalid email', async function () {
      let data = getRandomUserData(), user
      data.email = "whatever"
      try { user = await User.create(data) } 
      catch(error) { expect(user).to.not.be.ok }
    })

    it('should not create a user with a missing password', async function () {
      let data = getRandomUserData(), user
      data.password = ""
      try { user = await User.create(data)} 
      catch(error) { expect(user).to.not.be.ok }
    })

    it('should not create a user with an invalid password', async function () {
      let data = getRandomUserData(), user
      data.password = "whatever"
      try { user = await User.create(data) } 
      catch(error) { expect(user).to.not.be.ok }
    })

    it('should not create a user with an invalid role', async function () {
      let data = getRandomUserData(), user
      data.role = "whatever"
      try { user = await User.create(data) } 
      catch(error) { expect(user).to.not.be.ok }
    })

    it('should not create a user with an invalid phone', async function () {
      let data = getRandomUserData(), user
      data.profile.phone = "whatever"
      try { user = await User.create(data) } 
      catch(error) { expect(user).to.not.be.ok } 
    })

    it('should not create a user with an invalid photo', async function () {
      let data = getRandomUserData(), user
      data.profile.photo = "whatever"
      try { user = await User.create(data) }
      catch(error) { expect(user).to.not.be.ok }
    })

    it('should not create a user with a duplicate email', async function () {
      let users = await User.query(), user
          data = getRandomUserData()
      data.email = users[0].email
      try { user = await User.create(data) }
      catch(error) { expect(user).to.not.be.ok }
    })

    it('should not create a user with invalid profile field', async function () {
      let data = getRandomUserData()
      data.profile.extra = 'whatever'
      let user = await User.create(data)
      expect(user.profile.firstName).to.equal(data.profile.firstName)
      expect(user.profile.extra).to.equal(undefined)
    })

  })


  describe('read',function () {

    it('should get a user with a valid id', async function ()  {
      let user = await User.read(1)
      expect(user).to.be.ok
      expect(user.id).to.equal(1)
    })

    it('should not get a user with an invalid id', async function ()  {
      let user
      try { user = await User.read(-1) }
      catch(error) { expect(user).to.not.be.ok }
    })

  })

  describe('findByCredentials',function () {

    it('should find a user with valid credentials', async function () {
      let data = getRandomUserData(),
          password = data.password

      await User.create(data)
      let user = await User.findByCredentials(data.email, password)
      expect(user).to.be.ok
      expect(user.email).to.equal(data.email)
    })

    it('should not find a user with invalid email', async function ()  {
      let data = getRandomUserData(), user
          password = data.password,
          email = "whatever@wontwork.com"

      await User.create(data)
      try { user = await User.findByCredentials(email, password) }
      catch(error) { expect(user).to.not.be.ok }
    })

    it('should reject a user with invalid password', async function ()  {
      let data = getRandomUserData(), user
          password = "whatever"
          
      await User.create(data)
      try { user = await User.findByCredentials(data.email, password) }
      catch(error) { expect(user).to.not.be.ok }
    })

  })

  describe('findByEmail',function () {

    it('should find a user with valid email', async function () {
      let user = await User.findByEmail(USER_CREDENTIALS[2].email)
      expect(user.email).to.equal(USER_CREDENTIALS[2].email)
    })

    it('should reject finding a user with an invalid email', async function () {
      let user
      try { user = await User.findByEmail('invalidemail@whoever.com') }
      catch(error) { expect(user).to.not.be.ok }
    })

  })

  describe('update', function () {
     
    this.timeout(10000)

    it('should read a user and return model', async function () {
      let user = await User.read(2)
      expect(user).to.be.ok
    })

    it('should update a user with valid data', async function () {
      let data = getRandomUserData(),
          firstName = data.profile.firstName

      delete data.email
      delete data.activationCode
      delete data.activated
      delete data.role

      let user = await User.read(1)
      user = await user.update(data)
      expect(user.profile.firstName).to.equal(firstName)
    })

    it('should provide the user\'s full name', async function () {
      let user = await User.read(1),
          fullName = `${user.profile.firstName} ${user.profile.lastName}`

      expect(user.fullName).to.equal(fullName)
    })

    it('should not update email', async function () {
      let user = await User.read(1)

      user = await user.update({ email: 'whatever@whoever.com' })
      expect(user.email).to.not.equal('whatever@whoever.com')
    })

    it('should not allow updates with invalid data', async function () {
      let user = await User.read(1), updatedUser

      try { updatedUser = await user.update({ profile: { phone: '333' } }) }
      catch(error) { expect(updatedUser).to.not.be.ok }
    })

    it('should not allow updates to activation field', async function () {
      let user = await User.read(1)
      
      user = await user.update({ activated: true })
      expect(user.activated).to.not.equal(true)
    })

    it('should not update non-updateable fields', async function () {
      let data = getRandomUserData()
      data.role = 'root'

      let user = await User.read(1)
      user = await user.update(data)
      
      expect(user.profile).to.contain(data.profile)
      expect(user.email).to.not.equal(data.email)
      expect(user.role).to.not.equal(data.role)
      expect(user.activationCode).to.not.equal(data.activationCode)
      expect(user.activated).to.not.equal(data.activated)
      expect(user.created).to.not.equal(data.created)
      expect(user.modified).to.not.equal(data.modified)
    })

    it('should delete a previously generated passwordResetCode', async function () {
      let user = await User.create(getRandomUserData())

      expect(user.passwordResetCode).to.not.be.ok
      user = await user.generatePasswordResetCode()
      expect(user.passwordResetCode).to.be.ok
      user = await user.update({ password: 'abc123!++'})
      expect(user.passwordResetCode).to.not.be.ok
    })

  })

  describe('delete',function () {

    it('should delete a user', async function () {
      let data = getRandomUserData(),
          user = await User.create(data)
      
      expect(user).to.be.ok

      let num = await user.delete()
      expect(num).to.equal(1)
    })

  })

  describe('matchPassword', function () {
    
    it('should return the user if the supplied password matches user password', 
      async function () {

      let user = await User.read(2)

      user = await user.matchPassword(USER_CREDENTIALS[1].password)
      expect(user).to.be.ok
    })

    it('should return an error if the password does not match user password', 
      async function () {

      let user = await User.read(2), matched

      try { matched = await user.matchPassword(USER_CREDENTIALS[0].password) }
      catch(error) { expect(matched).to.not.be.ok }
    })

  })

  describe('activate',function () {

    it('should activate a user with correct activation code', async function () {
      let data = getRandomUserData()

      data.activated = false
      
      let user = await User.create(data)
      let activated = await User.activate(user.activationCode)
      expect(activated).to.equal(true)
    })

    it('should not activate a user with incorrect activation code', 
      async function () {

      let data = getRandomUserData()
      data.activated = false
      
      let user = await User.create(data), activated

      try { activated = user.activate('whatever') }
      catch(error) { expect(activated).to.not.be.ok }
    })

  })

  describe('generatePasswordResetCode', function () {
    
    it('should generate a unique password reset code', async function () {
      let user = await User.create(getRandomUserData())
      expect(user.passwordResetCode).to.not.be.ok
      user = await user.generatePasswordResetCode()
      expect(user.passwordResetCode).to.be.ok
    })

  })

  describe('confirmPasswordResetCode', function () {

    it('should confirm a valid password reset code', async function () {
      let user = await User.create(getRandomUserData())
      expect(user.passwordResetCode).to.not.be.ok
      user = await user.generatePasswordResetCode()
      expect(user.passwordResetCode).to.be.ok
      user = await user.confirmPasswordResetCode(user.passwordResetCode)
      expect(user).to.be.ok
    })

    it('should reject an invalid password reset code', async function () {
      let user = await User.create(getRandomUserData()), reset

      expect(user.passwordResetCode).to.not.be.ok
      user = await user.generatePasswordResetCode()
      expect(user.passwordResetCode).to.be.ok
      try { reset = await user.confirmPasswordResetCode('anything-goes')
      } catch (error) { expect(reset).to.not.be.ok }
    })

    it('should reject an expired password reset code', async function () {
      let user = await User.create(getRandomUserData()), reset
      user = await user.generatePasswordResetCode()
      let ahead =  new Date(moment().add(1, 'hour'))
      let clock = sinon.useFakeTimers(ahead)
      try {
        reset = await user.confirmPasswordResetCode(user.passwordResetCode)
      } catch (error) {
        clock.restore()
        expect(reset).to.not.be.ok
      }
    })

  })

  describe('fullName',function () {

    it('should get user\'s full name', async function () {
      let data = getRandomUserData()
          user = await User.create(data)

      expect(user.fullName).to.equal(`${user.profile.firstName} ${user.profile.lastName}`)
    })
    
  })
})
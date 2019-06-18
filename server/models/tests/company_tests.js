//======================================================
// company_tests.js
//
// Description: Unit tests for Company database model.
//
// See: 20190613204231_create_companies_table.js, companies_seed.js
//
// Version: 0.0.1
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

const debug = require('../../../utils/debug').create('companies_tests.js')

process.env.NODE_ENV = 'test'

const { expect } = require('chai')
const faker = require('faker')
const sinon = require('sinon')

const moment = require('moment')

var { Knex } = require('../../db/db')

const { User } = require('../user')
const { Company } = require('../company')

const { getRandomCompanyData } = require('../../db/seeds/companies_seed')


before(async function () {
  await Knex.migrate.rollback()
  await Knex.migrate.latest()
  await Knex.seed.run()
})


describe('Company', function () {

  describe.only('create', async function () {
    let user
    
    before(async function () {
      user = await User.read(1)
    })

    it('should create a company with valid data', async function () {
      let data = getRandomCompanyData()
      let company = await Company.create(user.id, user.id, data)
      company = await Company.read(company.id)
      expect(company).to.be.ok
      expect(company.ownerId).to.equal(user.id)
      expect(company.contactId).to.equal(user.id)
      expect(company.address).to.contain(data.address)
      expect(company.created).to.be.ok
      expect(company.modified).to.be.ok
    })

    it('should not create a company with a missing ownerId', async function () {
      let data = getRandomCompanyData(), company
      try { company = await Company.create(undefined, user.id, data) } 
      catch(error) { expect(company).to.not.be.ok }
    })

    it('should not create a company with a missing contactId', async function () {
      let data = getRandomCompanyData(), company
      try { company = await Company.create(user.id, undefined, data) } 
      catch(error) { expect(company).to.not.be.ok }
    })

    it('should not create a company with a missing name', async function () {
      let data = getRandomCompanyData(), company
      delete data.name
      try { company = await Company.create(user.id, user.id, data) } 
      catch(error) { expect(company).to.not.be.ok }
    })

    it('should not create a company with a missing address', async function () {
      let data = getRandomCompanyData(), company
      delete data.address
      try { company = await Company.create(user.id, user.id, data)} 
      catch(error) { expect(company).to.not.be.ok }
    })

    it('should not create a company with a missing address line1', 
      async function () {

      let data = getRandomCompanyData(), company
      delete data.address.line1
      try { company = await Company.create(user.id, user.id, data)} 
      catch(error) { expect(company).to.not.be.ok }
    })

    it('should create a company with a missing address line2', 
      async function () {

      let data = getRandomCompanyData(), company
      delete data.address.line2
      company = await Company.create(user.id, user.id, data)
      expect(company).to.be.ok
    })

    it('should not create a company with a missing address city', 
      async function () {

      let data = getRandomCompanyData(), company
      delete data.address.city
      try { company = await Company.create(user.id, user.id, data) } 
      catch(error) { expect(company).to.not.be.ok }
    })

    it('should not create a company with a missing address state', 
      async function () {

      let data = getRandomCompanyData(), company
      delete data.address.state
      try { company = await Company.create(user.id, user.id, data)} 
      catch(error) { expect(company).to.not.be.ok }
    })

    it('should not create a company with a missing address postalCode', 
      async function () {

      let data = getRandomCompanyData(), company
      delete data.address.postalCode
      try { company = await Company.create(user.id, user.id, data)} 
      catch(error) { expect(company).to.not.be.ok }
    })

    it('should not create a company with a missing address country', 
      async function () {

      let data = getRandomCompanyData(), company
      delete data.address.country
      try { company = await Company.create(user.id, user.id, data)} 
      catch(error) { expect(company).to.not.be.ok }
    })

  })


  describe('read',function () {

    it('should get a user with a valid id', async function ()  {
      let user = await User.read(1)
      expect(user).to.be.ok
      expect(user.id).to.equal(1)
    })

    it('should not get a user with an invalid id', async function ()  {
      try { await User.read(-1) }
      catch(error) {}
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
      let data = getRandomUserData(),
          password = data.password,
          email = "whatever@wontwork.com"

      await User.create(data)
      try { await User.findByCredentials(email, password) }
      catch(error) {}
    })

    it('should reject a user with invalid password', async function ()  {
      let data = getRandomUserData(),
          password = "whatever"
          
      await User.create(data)
      try { await User.findByCredentials(data.email, password) }
      catch(error) {}
    })

  })

  describe('findByEmail',function () {

    it('should find a user with valid email', async function () {
      let user = await User.findByEmail(USER_CREDENTIALS[2].email)
      expect(user.email).to.equal(USER_CREDENTIALS[2].email)
    })

    it('should reject finding a user with an invalid email', async function () {
      try { await User.findByEmail('invalidemail@whoever.com') }
      catch(error) {}
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
      let user = await User.read(1)
      
      try { await user.update({ profile: { phone: '333' } }) }
      catch(error) {}
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

      let user = await User.read(2)
      try { await user.matchPassword(USER_CREDENTIALS[0].password) }
      catch(error) {}
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
      
      let user = await User.create(data)

      try { user.activate('whatever') }
      catch(error) {}
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
      let user = await User.create(getRandomUserData())
      expect(user.passwordResetCode).to.not.be.ok
      user = await user.generatePasswordResetCode()
      expect(user.passwordResetCode).to.be.ok
      try {
        await user.confirmPasswordResetCode('anything-goes')
      } catch (error) {
        
      }
    })

    it('should reject an expired password reset code', async function () {
      let user = await User.create(getRandomUserData())
      user = await user.generatePasswordResetCode()
      let ahead =  new Date(moment().add(1, 'hour'))
      let clock = sinon.useFakeTimers(ahead)
      try {
        await user.confirmPasswordResetCode(user.passwordResetCode)
      } catch (error) {
        clock.restore()
      }
    })

  })

  describe('fullName',function () {

    it('should get user\'s full name', function (done) {
      let data = getRandomUserData()
      User.create(data)
      .then(user => {
        expect(user.fullName).to.equal(`${user.profile.firstName} ${user.profile.lastName}`)
        done()
      })
    })
  })
})

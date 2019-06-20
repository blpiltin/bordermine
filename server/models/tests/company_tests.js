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

var { Knex } = require('../../db/db')

const { Company } = require('../company')

const { getRandomUserData } = require('../../db/seeds/users_seed')
const { getRandomCompanyData } = require('../../db/seeds/companies_seed')


before(async function () {
  await Knex.migrate.rollback()
  await Knex.migrate.latest()
  await Knex.seed.run()
})


describe('Company', function () {

  describe('create', async function () {
    
    it('should create a company with valid data', async function () {
      let data = getRandomCompanyData()
      let company = await Company.create(data)
      company = await Company.read(company.id)
      expect(company).to.be.ok
      expect(company.name).to.equal(data.name)
      expect(company.address).to.contain(data.address)
      expect(company.created).to.be.ok
      expect(company.modified).to.be.ok
    })

    it('should not create a company with a missing name', async function () {
      let data = getRandomCompanyData(), company
      delete data.name
      try { company = await Company.create(data) } 
      catch(error) { expect(company).to.not.be.ok }
    })

    it('should not create a company with an invalid type', async function () {
      let data = getRandomCompanyData(), company
      data.type = 'whatever'
      try { company = await Company.create(data) } 
      catch(error) { expect(company).to.not.be.ok }
    })

    it('should not create a company with a missing address', async function () {
      let data = getRandomCompanyData(), company
      delete data.address
      try { company = await Company.create(data)} 
      catch(error) { expect(company).to.not.be.ok }
    })

    it('should not create a company with a missing address line1', 
      async function () {

      let data = getRandomCompanyData(), company
      delete data.address.line1
      try { company = await Company.create(data)} 
      catch(error) { expect(company).to.not.be.ok }
    })

    it('should create a company with a missing address line2', 
      async function () {

      let data = getRandomCompanyData(), company
      delete data.address.line2
      company = await Company.create(data)
      expect(company).to.be.ok
    })

    it('should not create a company with a missing address city', 
      async function () {

      let data = getRandomCompanyData(), company
      delete data.address.city
      try { company = await Company.create(data) } 
      catch(error) { expect(company).to.not.be.ok }
    })

    it('should not create a company with a missing address state', 
      async function () {

      let data = getRandomCompanyData(), company
      delete data.address.state
      try { company = await Company.create(data)} 
      catch(error) { expect(company).to.not.be.ok }
    })

    it('should not create a company with a missing address postalCode', 
      async function () {

      let data = getRandomCompanyData(), company
      delete data.address.postalCode
      try { company = await Company.create(data)} 
      catch(error) { expect(company).to.not.be.ok }
    })

    it('should not create a company with a missing address country', 
      async function () {

      let data = getRandomCompanyData(), company
      delete data.address.country
      try { company = await Company.create(data)} 
      catch(error) { expect(company).to.not.be.ok }
    })

  })


  describe('read', function () {

    it('should get a company with a valid id', async function ()  {
      let company = await Company.read(1)
      expect(company).to.be.ok
      expect(company.id).to.equal(1)
    })

    it('should not get a company with an invalid id', async function ()  {
      let company
      try { company = await Company.read(-1) }
      catch(error) { expect(company).to.not.be.ok }
    })

  })

  describe('update', function () {

    it('should update a company with valid data', async function () {
      let data = getRandomCompanyData(),
          company = await Company.read(1)
      company = await company.update(data)
      expect(company.address.line1).to.equal(data.address.line1)
    })

    it('should not allow updates to the company owner', async function () {
      let data = getRandomCompanyData()
          company = await Company.create(data)

      company = await company.update({ ownerId: 2})
      expect(company.ownerId).to.not.equal(2)
    })

    it('should not allow updates to the company contact', async function () {
      let data = getRandomCompanyData()
          company = await Company.create(data)

      company = await company.update({ contactId: 2})
      expect(company.contactId).to.not.equal(2)
    })

    it('should not allow updates to the company type', async function () {
      let data = getRandomCompanyData()
      data.type = 'carrier'
      let company = await Company.create(data)

      company = await company.update({ type: 'broker' })
      expect(company.type).to.equal('carrier')
    })

    it('should not allow updates with an invalid type', async function () {
      let company = await Company.read(1), updated
      
      try { updated = await company.update({ type: 'whatever' }) }
      catch(error) { expect(updated).to.not.be.ok }
    })

  })

  describe('updateOwner', function () {

    it('should update the company ownerId and contactId', async function () {
      let data = getRandomCompanyData()
          company = await Company.create(data)
      
      expect(company.ownerId).to.not.be.ok
      expect(company.contactId).to.not.be.ok

      company = await company.updateOwner(1)
      expect(company.ownerId).to.equal(1)
      expect(company.contactId).to.equal(1)
    })

  })

  describe('updateContact', function () {

    it('should update the company contactId', async function () {
      let data = getRandomCompanyData()
          company = await Company.create(data)
      
      expect(company.ownerId).to.not.be.ok
      expect(company.contactId).to.not.be.ok

      company = await company.updateContact(1)
      expect(company.ownerId).to.not.be.ok
      expect(company.contactId).to.equal(1)
    })

  })

  describe('delete', function () {

    it('should delete a company and related users', async function () {
      const { User } = require('../user')

      let deleted, 
          company = await Company.create(getRandomCompanyData()),
          user1 = await User.create(company.id, getRandomUserData()),
          user2 = await User.create(company.id, getRandomUserData())

      expect(company).to.be.ok
      expect(user1).to.be.ok
      expect(user2).to.be.ok

      let num = await company.delete()
      expect(num).to.equal(1)

      try { deleted = await Company.read(company.id) }
      catch(error) { expect(deleted).to.not.be.ok }

      try { deleted = await User.read(user1.id) }
      catch(error) { expect(deleted).to.not.be.ok }

      try { deleted = await User.read(user2.id) }
      catch(error) { expect(deleted).to.not.be.ok }
    })

  })

})

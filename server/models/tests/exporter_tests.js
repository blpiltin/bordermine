//======================================================
// exporter_tests.js
//
// Description: Unit tests for Exporter database model.
//
// See: 20190613204231_create_exporters_table.js, clients_seed.js
//
// Version: 0.0.1
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

const debug = require('../../../utils/debug').create('exporter_tests.js')

process.env.NODE_ENV = 'test'

// Chai needs to be included like this for sorting assertions to work
const chai = require('chai'),
      expect = chai.expect
chai.use(require('chai-sorted'))

var { Knex } = require('../../db/db')

const { Exporter } = require('../exporter')

const { getRandomUserData } = require('../../db/seeds/users_seed')
const { getRandomClientData } = require('../../db/seeds/clients_seed')


before(async function () {
  await Knex.migrate.rollback()
  await Knex.migrate.latest()
  await Knex.seed.run()
})


describe('Exporter', function () {

  describe('create', async function () {
    
    it('should create an exporter with valid data', async function () {
      let data = getRandomClientData('exporter')
      let exporter = await Exporter.create(1, 1, data)
      exporter = await Exporter.read(exporter.id)
      expect(exporter).to.be.ok
      expect(exporter.companyId).to.equal(1)
      expect(exporter.executive.id).to.equal(1)
      expect(exporter.type).to.equal('exporter')
      expect(exporter.name).to.equal(data.name)
      expect(exporter.address).to.contain(data.address)
      expect(exporter.contact).to.contain(data.contact)
      expect(exporter.created).to.be.ok
      expect(exporter.modified).to.be.ok
    })

    it('should not create an exporter with a missing name', async function () {
      let data = getRandomClientData('exporter'), exporter
      delete data.name
      try { exporter = await Exporter.create(1, 1, data) } 
      catch(error) { expect(exporter).to.not.be.ok }
    })

    it('should not create an exporter with an invalid type', async function () {
      let data = getRandomClientData('exporter'), exporter
      data.type = 'whatever'
      try { exporter = await Exporter.create(1, 1, data) } 
      catch(error) { expect(exporter).to.not.be.ok }
    })

    it('should not create an exporter with a missing address', async function () {
      let data = getRandomClientData('exporter'), exporter
      delete data.address
      try { exporter = await Exporter.create(1, 1, data)} 
      catch(error) { expect(exporter).to.not.be.ok }
    })

    it('should not create an exporter with a missing address line1', 
      async function () {

      let data = getRandomClientData('exporter'), exporter
      delete data.address.line1
      try { exporter = await Exporter.create(1, 1, data)} 
      catch(error) { expect(exporter).to.not.be.ok }
    })

    it('should create an exporter with a missing address line2', 
      async function () {

      let data = getRandomClientData('exporter'), exporter
      delete data.address.line2
      exporter = await Exporter.create(1, 1, data)
      expect(exporter).to.be.ok
    })

    it('should not create an exporter with a missing address city', 
      async function () {

      let data = getRandomClientData('exporter'), exporter
      delete data.address.city
      try { exporter = await Exporter.create(1, 1, data) } 
      catch(error) { expect(exporter).to.not.be.ok }
    })

    it('should not create an exporter with a missing address state', 
      async function () {

      let data = getRandomClientData('exporter'), exporter
      delete data.address.state
      try { exporter = await Exporter.create(1, 1, data)} 
      catch(error) { expect(exporter).to.not.be.ok }
    })

    it('should not create an exporter with a missing address postalCode', 
      async function () {

      let data = getRandomClientData('exporter'), exporter
      delete data.address.postalCode
      try { exporter = await Exporter.create(1, 1, data)} 
      catch(error) { expect(exporter).to.not.be.ok }
    })

    it('should not create an exporter with a missing address country', 
      async function () {

      let data = getRandomClientData('exporter'), exporter
      delete data.address.country
      try { exporter = await Exporter.create(1, 1, data)} 
      catch(error) { expect(exporter).to.not.be.ok }
    })

    it('should create an exporter with a missing contact', 
      async function () {

      let data = getRandomClientData('exporter'), exporter
      delete data.address.line2
      exporter = await Exporter.create(1, 1, data)
      expect(exporter).to.be.ok
    })

    it('should not create an exporter with an invalid contact email', 
      async function () {

      let data = getRandomClientData('exporter'), exporter
      data.contact.email = 'whatever'
      try { exporter = await Exporter.create(1, 1, data)} 
      catch(error) { expect(exporter).to.not.be.ok }
    })

    it('should not create an exporter with an invalid contact phone', 
      async function () {

      let data = getRandomClientData('exporter'), exporter
      data.contact.phone = '2'
      try { exporter = await Exporter.create(1, 1, data)} 
      catch(error) { expect(exporter).to.not.be.ok }
    })

    it('should not create an exporter with an invalid contact fax', 
      async function () {

      let data = getRandomClientData('exporter'), exporter
      data.contact.fax = '2'
      try { exporter = await Exporter.create(1, 1, data)} 
      catch(error) { expect(exporter).to.not.be.ok }
    })

  })


  describe('read', function () {

    it('should get an exporter with a valid id', async function ()  {
      let exporter = await Exporter.read(1)
      expect(exporter).to.be.ok
      expect(exporter.id).to.equal(1)
    })

    it('should not get an exporter with an invalid id', async function ()  {
      let exporter
      try { exporter = await Exporter.read(-1) }
      catch(error) { expect(exporter).to.not.be.ok }
    })

  })

  describe('update', function () {

    it('should update an exporter with valid data', async function () {
      let data = getRandomClientData('exporter'),
          exporter = await Exporter.read(1)
      exporter = await exporter.update(data)
      expect(exporter).to.be.ok
      expect(exporter.companyId).to.equal(1)
      expect(exporter.executive.id).to.equal(1)
      expect(exporter.type).to.equal('exporter')
      expect(exporter.name).to.equal(data.name)
      expect(exporter.address).to.contain(data.address)
      expect(exporter.contact).to.contain(data.contact)
    })

    it('should not allow updates to the exporter company', async function () {
      let data = getRandomClientData('exporter')
          exporter = await Exporter.create(1, 1, data)

      exporter = await exporter.update({ companyId: 2})
      expect(exporter.companyId).to.not.equal(2)
    })

    it('should not allow updates to the exporter executive', async function () {
      let data = getRandomClientData('exporter')
          exporter = await Exporter.create(1, 1, data)

      exporter = await exporter.update({ executiveId: 2})
      expect(exporter.executiveId).to.not.equal(2)
    })

    it('should not allow updates to the exporter type', async function () {
      let data = getRandomClientData('exporter'),
          exporter = await Exporter.create(1, 1, data)

      exporter = await exporter.update({ type: 'consignee' })
      expect(exporter.type).to.equal('exporter')
    })

    it('should not allow updates with an invalid type', async function () {
      let exporter = await Exporter.read(1), updated
      
      try { updated = await exporter.update({ type: 'whatever' }) }
      catch(error) { expect(updated).to.not.be.ok }
    })

  })

  describe('updateExecutive', function () {

    it('should update the exporter executiveId', async function () {
      let data = getRandomClientData('exporter'),
          exporter = await Exporter.create(1, 1, data)
      
      expect(exporter.executive.id).to.equal(1)
      
      exporter = await exporter.updateExecutive(2)
      expect(exporter.executive.id).to.equal(2)
    })

  })

  describe('delete', function () {

    it.skip('should delete an exporter and related manifests', async function () {
      const { User } = require('../user')

      let deleted, 
          exporter = await Exporter.create(1, 1, getRandomClientData('exporter')),
          user1 = await User.create(exporter.id, getRandomUserData()),
          user2 = await User.create(exporter.id, getRandomUserData())

      expect(exporter).to.be.ok
      expect(user1).to.be.ok
      expect(user2).to.be.ok

      let num = await exporter.delete()
      expect(num).to.equal(1)

      try { deleted = await Exporter.read(exporter.id) }
      catch(error) { expect(deleted).to.not.be.ok }

      try { deleted = await User.read(user1.id) }
      catch(error) { expect(deleted).to.not.be.ok }

      try { deleted = await User.read(user2.id) }
      catch(error) { expect(deleted).to.not.be.ok }
    })

  })

  describe('archive', function() {
    it('should archive an exporter and related manifests')
    it('should not affect unrelated manifests')
  })

  describe('unArchive', function() {
    it('should unArchive an exporter and related manifests')
    it('should not affect unrelated manifests')
  })

  describe('filter', function() {
    
    before(async () => { await Knex.seed.run() })
    
    it('should return first page of exporters without filter', 
      async function() {
      let obj = await Exporter.filter(2)
      expect(hasAllExporters(obj.records)).to.equal(true)
      expect(obj.records.length).to.equal(Exporter.DEFAULT_PAGE_LIMIT)
      expect(obj.filter.page).to.equal(1)
      expect(obj.filter.pages.length).to.equal(2)
    })

    it('should return first page of exporters with filter limit', 
      async function() {

      let filter = { limit: 3 }
      let obj = await Exporter.filter(2, filter)
      expect(hasAllExporters(obj.records)).to.equal(true)
      expect(obj.records.length).to.equal(3)
      expect(obj.filter.page).to.equal(1)
      expect(obj.filter.pages.length).to.equal(7)
    })

    it('should return correct page of exporters with page filter', 
      async function() {

      let filter = { limit: 3, page: 4 }
      let obj = await Exporter.filter(2, filter)
      expect(hasAllExporters(obj.records)).to.equal(true)
      expect(obj.records.length).to.equal(3)
      expect(obj.filter.page).to.equal(4)
      expect(obj.filter.pages.length).to.equal(7)
    })

    it('should return correctly sorted exporters with sort executiveId asc filter', 
      async function() {

      let filter = { limit: 5, page: 3, sort: 'executiveId' }
      let obj = await Exporter.filter(2, filter)
      expect(hasAllExporters(obj.records)).to.equal(true)
      expect(obj.records.length).to.equal(5)
      expect(obj.filter.page).to.equal(3)
      expect(obj.filter.pages.length).to.equal(4)
      expect(obj.records).to.be.sortedBy('executiveId')
    })

    it('should return correctly sorted exporters with sort name asc filter', 
      async function() {

      let filter = { limit: 10, page: 2, sort: 'lower(name)' }
      let obj = await Exporter.filter(2, filter)
      expect(hasAllExporters(obj.records)).to.equal(true)
      expect(obj.records.length).to.equal(10)
      expect(obj.filter.page).to.equal(2)
      expect(obj.filter.pages.length).to.equal(2)
      expect(obj.records).to.be.sortedBy('name')

    })

    it('should return correctly sorted exporters with sort executiveId desc filter', 
      async function() {

      let filter = { limit: 10, page: 1, sort: 'executiveId', dir: 'desc' }
      let obj = await Exporter.filter(2, filter)
      expect(hasAllExporters(obj.records)).to.equal(true)
      expect(obj.records.length).to.equal(10)
      expect(obj.filter.page).to.equal(1)
      expect(obj.filter.pages.length).to.equal(2)
      expect(obj.records).to.be.sortedBy('executiveId', { descending: true })
    })

    it('should return correctly sorted exporters with sort name desc filter', 
      async function() {

      let filter = { limit: 5, page: 2, sort: 'lower(name)', dir: 'desc' }
      let obj = await Exporter.filter(2, filter)
      expect(hasAllExporters(obj.records)).to.equal(true)
      expect(obj.records.length).to.equal(5)
      expect(obj.filter.page).to.equal(2)
      expect(obj.filter.pages.length).to.equal(4)
      expect(obj.records).to.be.sortedBy('name', { descending: true })
    })

    it('should return correct page for exporter id with filter using pageFor', 
      async function() {

      let filter = { limit: 2, pageFor: 5, sort: 'id', search: 'One' }
      let obj = await Exporter.filter(1, filter)
      expect(obj.records.length).to.equal(2)
      expect(obj.filter.page).to.equal(2)
    })

    it('should return only rows with matching search string in name', 
      async function() {

      let filter = { limit: 5, page: 1, search: 'Exporter' }
      let obj = await Exporter.filter(1, filter)
      expect(obj.records.length).to.equal(3)
      expect(obj.filter.page).to.equal(1)
      expect(obj.records.filter(obj => !obj.name.includes('Exporter')).length).to.equal(0)
    })

    it('should return only rows with matching search string in executive', 
      async function() {

      let filter = { limit: 5, page: 1, search: 'User3' }
      let obj = await Exporter.filter(1, filter)
      expect(obj.records.length).to.equal(2)
      expect(obj.filter.page).to.equal(1)
      expect(obj.records.filter(obj => !obj.executive.profile.lastName.includes('User3')).length).to.equal(0)
    })

    it('should return only rows with matching search string in address', 
      async function() {

      let filter = { limit: 5, page: 1, search: 'Country One' }
      let obj = await Exporter.filter(1, filter)
      expect(obj.records.length).to.equal(3)
      expect(obj.filter.page).to.equal(1)
      expect(obj.records.filter(obj => !obj.address.country.includes('Country One')).length).to.equal(0)
    })

    it('should return only rows with matching search string in contact', 
      async function() {

      let filter = { limit: 5, page: 1, search: 'CEO' }
      let obj = await Exporter.filter(1, filter)
      expect(obj.records.length).to.equal(2)
      expect(obj.filter.page).to.equal(1)
      expect(obj.records.filter(obj => !obj.contact.title.includes('CEO')).length).to.equal(0)
    })
  })
})


//======================================================
// Utils
//======================================================

const hasAllExporters = arr => 
  arr.filter(obj => obj.type !== 'exporter').length === 0
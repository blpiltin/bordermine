//======================================================
// vocabulary_tests.js
//
// Description: Unit tests for Course mongoose schema.
//
// Version: 0.0.1
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

const debug = require('../../../utils/debug').create('vocabulary_tests.js');

process.env.NODE_ENV = 'test'

// Chai needs to be included like this for sorting assertions to work
const chai = require('chai'),
      expect = chai.expect
chai.use(require('chai-sorted'))

const { Knex } = require('../../db/db')

const { Vocabulary } = require('../vocabulary')

const { USER_6_COURSES, USER_3_COURSES } = require('../../db/seeds/users_seed')


before(function(done) {
  Knex.migrate.rollback()
  .then(() => Knex.migrate.latest())
  .then(() => Knex.seed.run())
  .then(() => done())
})


describe('Vocabulary', function() { 

  describe.skip('update', function () {
     
    this.timeout(10000)

    // TODO
  })

  describe('filter', function() {
    
    it('should return first page of vocabularys without filter', 
      async function() {
      let obj = await Vocabulary.filter(USER_6_COURSES)
      expect(obj.records.length).to.equal(Vocabulary.DEFAULT_PAGE_LIMIT)
      expect(obj.filter.page).to.equal(1)
      expect(obj.filter.pages.length).to.equal(2)
    })

    it('should return first page of vocabularys with filter limit', 
      async function() {

      let filter = { limit: 3 }
      let obj = await Vocabulary.filter(USER_6_COURSES, filter)
      expect(obj.records.length).to.equal(3)
      expect(obj.filter.page).to.equal(1)
      expect(obj.filter.pages.length).to.equal(7)
    })

    it('should return correct page of vocabularys with page filter', 
      async function() {

      let filter = { limit: 3, page: 4 }
      let obj = await Vocabulary.filter(USER_6_COURSES, filter)
      expect(obj.records.length).to.equal(3)
      expect(obj.filter.page).to.equal(4)
      expect(obj.filter.pages.length).to.equal(7)
    })

    it('should return correctly sorted vocabularys with sort word asc filter', 
      async function() {

      let filter = { limit: 5, page: 3, sort: 'word' }
      let obj = await Vocabulary.filter(USER_6_COURSES, filter)
      expect(obj.records.length).to.equal(5)
      expect(obj.filter.page).to.equal(3)
      expect(obj.filter.pages.length).to.equal(4)
      expect(obj.records).to.be.sortedBy('word')
    })

    it('should return correctly sorted vocabularys with sort definition asc filter', 
      async function() {

      let filter = { limit: 10, page: 2, sort: 'lower(definition)' }
      let obj = await Vocabulary.filter(USER_6_COURSES, filter)
      expect(obj.records.length).to.equal(10)
      expect(obj.filter.page).to.equal(2)
      expect(obj.filter.pages.length).to.equal(2)
      expect(obj.records).to.be.sortedBy('definition')

    })

    it('should return correctly sorted vocabularys with sort word desc filter', 
      async function() {

      let filter = { limit: 10, page: 1, sort: 'word', dir: 'desc' }
      let obj = await Vocabulary.filter(USER_6_COURSES, filter)
      expect(obj.records.length).to.equal(10)
      expect(obj.filter.page).to.equal(1)
      expect(obj.filter.pages.length).to.equal(2)
      expect(obj.records).to.be.sortedBy('word', { descending: true })
    })

    it('should return correctly sorted vocabularys with sort definition desc filter', 
      async function() {

      let filter = { limit: 5, page: 2, sort: 'definition', dir: 'desc' }
      let obj = await Vocabulary.filter(USER_6_COURSES, filter)
      expect(obj.records.length).to.equal(5)
      expect(obj.filter.page).to.equal(2)
      expect(obj.filter.pages.length).to.equal(4)
      expect(obj.records).to.be.sortedBy('definition', { descending: true })
    })

    it('should return correct page for vocabulary id with filter using pageFor', 
      async function() {

      let filter = { limit: 3, pageFor: 5, sort: 'id', search: 'do' }
      let obj = await Vocabulary.filter(USER_6_COURSES, filter)
      expect(obj.records.length).to.equal(3)
      expect(obj.filter.page).to.equal(2)
      expect(obj.filter.pages.length).to.equal(7)
    })

    it('should return only rows with matching search string', 
      async function() {

      let filter = { limit: 2, page: 1, search: 'goodbye' }
      let obj = await Vocabulary.filter(USER_6_COURSES, filter)
      expect(obj.records.length).to.equal(2)
      expect(obj.filter.page).to.equal(1)
      expect(obj.filter.pages.length).to.equal(2)
      expect(obj.records[0].word.toLowerCase()).to.include('goodbye')
    })
  })
})

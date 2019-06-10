//======================================================
// course_tests.js
//
// Description: Unit tests for Course mongoose schema.
//
// Version: 0.0.1
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

const debug = require('../../../utils/debug').create('course_tests.js');

process.env.NODE_ENV = 'test'

const { expect } = require('chai')

var { Knex } = require('../../db/db')

const { User } = require('../user')
const { Course } = require('../course')

const { getRandomCourseData } = require('../../db/seeds/courses_seed')
const { getRandomObjectiveData } = require('../../db/seeds/objectives_seed')
const { getRandomVocabularyData } = require('../../db/seeds/vocabularys_seed')

const { USER_6_COURSES, USER_3_COURSES } = require('../../db/seeds/users_seed')


before(function(done) {
  Knex.migrate.rollback()
  .then(() => Knex.migrate.latest())
  .then(() => Knex.seed.run())
  .then(() => done())
})


describe('Course', function() { 

  describe('findOne', function() {

    this.timeout(10000)

    it('should find a course with valid info', function(done) {
      User.read(USER_3_COURSES)
      .then(user => {
        user.allCourses()
        .then(courses => {
          let id = courses[0].id
          let query = { userId: user.id, id }
          Course.findOne(query)
          .then(course => {
            expect(course).to.be.ok
            done()
          })
        })
      })
    })

    it('should not find a course with invalid info', function(done) {
      let query = { userId: 1000, id: 1 }
      Course.findOne(query)
      .catch(err => done())
    })
  })

  describe('update', function () {
     
    this.timeout(10000)

    it('should update a course with valid data', function(done) {
      User.read(USER_3_COURSES)
      .then(user => {
        let data = getRandomCourseData(user.id)
        user.allCourses()
        .then(courses => {
          courses[0].update(data)
          .then(course => {
            expect(course.name).to.equal(data.name)
            expect(course.slug).to.equal(data.slug)
            expect(course.code).to.equal(data.code)
            done()
          })
        })
      })
    })

    it('should not allow updates with invalid name', function(done) {
      User.read(USER_3_COURSES)
      .then(user => {
        let data = getRandomCourseData(user.id)
        data.name = '123$#$* __)))'
        user.allCourses()
        .then(courses => {
          courses[0].update(data)
          .catch(err => done())
        })
      })
    })

    it('should not allow updates with duplicate name', function(done) {
      User.read(USER_3_COURSES)
      .then(user => {
        let data = getRandomCourseData(user.id)
        user.allCourses()
        .then(courses => {
          data.name = courses[1].name
          courses[0].update(data)
          .catch(err => done())
        })
      })
    })

    it('should allow updates with duplicate name for different users', function(done) {
      User.read(USER_3_COURSES)
      .then(user1 => {
        let data = getRandomCourseData(user1.id)
        user1.allCourses()
        .then(courses => {
          User.read(USER_6_COURSES)
          .then(user2 => {
            data.name = user2.courses[0].name
            courses[0].update(data)
            .then(course => {
              expect(course.name).to.equal(data.name)
              expect(course.slug).to.equal(data.slug)
              expect(course.code).to.equal(data.code)
              done()
            })
          })
        })
      })
    })

    it('should not allow updates with invalid slug', function(done) {
      User.read(USER_3_COURSES)
      .then(user => {
        let data = getRandomCourseData(user.id)
        data.slug = 'hello there'
        user.allCourses()
        .then(courses => {
          courses[0].update(data)
          .catch(err => done())
        })
      })
    })

    it('should not allow updates with duplicate slug', function(done) {
      User.read(USER_3_COURSES)
      .then(user => {
        let data = getRandomCourseData(user.id)
        user.allCourses()
        .then(courses => {
          data.slug = courses[1].slug
          courses[0].update(data)
          .catch(err => done())
        })
      })
    })

    it('should allow updates with duplicate slug for different users', function(done) {
      User.read(USER_3_COURSES)
      .then(user1 => {
        let data = getRandomCourseData(user1.id)
        user1.allCourses()
        .then(courses => {
          User.read(USER_6_COURSES)
          .then(user2 => {
            data.slug = user2.courses[0].slug
            courses[0].update(data)
            .then(course => {
              expect(course.name).to.equal(data.name)
              expect(course.slug).to.equal(data.slug)
              expect(course.code).to.equal(data.code)
              done()
            })
          })
        })
      })
    })

    it('should not allow updates with duplicate code', function(done) {
      User.read(USER_3_COURSES)
      .then(user => {
        let data = getRandomCourseData(user.id)
        user.allCourses()
        .then(courses => {
          data.code = courses[1].code
          courses[0].update(data)
          .catch(err => done())
        })
      })
    })

    it('should allow updates with duplicate code for different users', function(done) {
      User.read(USER_3_COURSES)
      .then(user1 => {
        let data = getRandomCourseData(user1.id)
        user1.allCourses()
        .then(courses => {
          User.read(USER_6_COURSES)
          .then(user2 => {
            data.code = user2.courses[0].code
            courses[0].update(data)
            .then(course => {
              expect(course.name).to.equal(data.name)
              expect(course.slug).to.equal(data.slug)
              expect(course.code).to.equal(data.code)
              done()
            })
          })
        })
      })
    })
  })

  describe('createObjective', function() {

    it('should create an objective with valid data', function(done) {
      User.read(USER_6_COURSES)
      .then(user => {
        let data = getRandomObjectiveData(user.courses[0].id)
        user.courses[0].createObjective(data)
        .then(objective => {
          expect(objective.courseId).to.equal(user.courses[0].id)
          done()
        })
      })
    })

    it('should not create an objective with a duplicate code for same user', function(done) {
      User.read(USER_6_COURSES)
      .then(user => {
        let data = getRandomObjectiveData(user.courses[0].id)
        data.code = "0001"
        user.courses[0].createObjective(data)
        .then(() => {
          data.text = "Some random text."
          user.courses[0].createObjective(data)
          .catch(err => done())
        })
      })
    })

    it('should create duplicate objectives with a null code for same user', 
      async function() {
        user = await User.read(USER_6_COURSES)
        let numObjs = (await user.courses[0].allObjectives()).length
        let data = await getRandomObjectiveData(user.courses[0].id)
        data.code = null
        await user.courses[0].createObjective(data)
        data.text = "Some other random text."
        await user.courses[0].createObjective(data)
        expect((await user.courses[0].allObjectives()).length).to.equal(numObjs + 2)
    })

    it('should create an objective with a duplicate code for different users', function(done) {
      User.read(USER_6_COURSES)
      .then(user1 => {
        let data = getRandomObjectiveData(user1.courses[0].id)
        data.code = "0002"
        user1.courses[0].createObjective(data)
        .then(objective1 => {
          User.read(USER_3_COURSES)
          .then(user2 => {
            user2.courses[0].createObjective(data)
            .then(objective2 => {
              expect(objective1.courseId).to.equal(user1.courses[0].id)
              expect(objective2.courseId).to.equal(user2.courses[0].id)
              done()
            })
          })
        })
      })
    })

    it('should not create an objective with a duplicate text for same user', function(done) {
      User.read(USER_6_COURSES)
      .then(user => {
        let data = getRandomObjectiveData(user.courses[0].id)
        user.courses[0].createObjective(data)
        .then(() => {
          data.code = "01234ABCX"
          user.courses[0].createObjective(data)
          .catch(err => done())
        })
      })
    })

    it('should create an objective with a duplicate text for different users', function(done) {
      User.read(USER_6_COURSES)
      .then(user1 => {
        let data = getRandomObjectiveData(user1.courses[0].id)
        data.text = "Some random text."
        user1.courses[0].createObjective(data)
        .then(objective1 => {
          User.read(USER_3_COURSES)
          .then(user2 => {
            user2.courses[0].createObjective(data)
            .then(objective2 => {
              expect(objective1.courseId).to.equal(user1.courses[0].id)
              expect(objective2.courseId).to.equal(user2.courses[0].id)
              done()
            })
          })
        })
      })
    })
  })

  describe('allObjectives', function() {

    before(function(done) { Knex.seed.run().then(() => done()) })

    it('should return all of the objectives for the course', async function() {
      let user = await User.read(USER_6_COURSES)
      let course = user.courses[0]
      let objectives = await course.allObjectives()
      expect(objectives.length).to.equal(10)
    })

  })

  describe('objectiveById', function() {

    it('should return an objective given the id', async function() {
      let user = await User.read(USER_6_COURSES)
      let course = user.courses[0]
      let objectives = await course.allObjectives()
      let objective = await course.objectiveById(objectives[0].id)
      expect(objective).to.be.ok
    })

    it('should not return an objective given an invalid id', async function() {
      let user = await User.read(USER_6_COURSES)
      let course = user.courses[0]
      let objectives = await course.allObjectives()
      try {
        let objective = await course.objectiveById(9999)
      } catch (err) {
        return true
      }
    })

  })

  describe('deleteObjective', function() {

    it('should delete an objective given the id', async function() {
      let user = await User.read(USER_6_COURSES)
      let course = user.courses[0]
      let objectives = await course.allObjectives()
      let total = objectives.length
      let num = await course.deleteObjective(objectives[0].id)
      objectives = await course.allObjectives()
      expect(num).to.equal(1)
      expect(objectives.length).to.equal(total - 1)
    })

    it('should not delete an objective given an invalid id', async function() {
      let user = await User.read(USER_6_COURSES)
      let course = user.courses[0]
      let objectives = await course.allObjectives()
      let total = objectives.length
      let num = await course.deleteObjective(9999)
      objectives = await course.allObjectives()
      expect(num).to.equal(0)
      expect(objectives.length).to.equal(total)
    })

  })

  describe('createVocabulary', function() {

    it('should create vocabulary with valid data', 
      async function() {

      let user = await User.read(USER_6_COURSES)
      let data = getRandomVocabularyData(user.courses[0].id)
      let vocabulary = await user.courses[0].createVocabulary(data)
      expect(vocabulary.courseId).to.equal(user.courses[0].id)
      data = getRandomVocabularyData(user.courses[0].id)
      vocabulary = await user.courses[0].createVocabulary(data)
      expect(vocabulary.courseId).to.equal(user.courses[0].id)
    })

    it('should not create vocabulary with a duplicate word for same user', 
      async function() {

      let user = await User.read(USER_6_COURSES)
      let data = getRandomVocabularyData(user.courses[0].id)
      data.word = "specialone"
      await user.courses[0].createVocabulary(data)
      try {
        await user.courses[0].createVocabulary(data)
      } catch (error) { }
    })

    it('should create vocabulary with a duplicate word for different users', 
      async function() {

      let user = await User.read(USER_6_COURSES)
      let data = getRandomVocabularyData(user.courses[0].id)
      data.word = "something else"
      await user.courses[0].createVocabulary(data)
      let user2 = await User.read(USER_3_COURSES)
      await user2.courses[0].createVocabulary(data)
    })
  })

  describe('allVocabularys', function() {

    before(function(done) { Knex.seed.run().then(() => done()) })

    it('should return all of the vocabulary for the course', 
      async function() {

      let user = await User.read(USER_6_COURSES)
      let course = user.courses[0]
      let vocabulary = await course.allVocabularys()
      expect(vocabulary.length).to.equal(20)
    })

  })

  describe('vocabularyById', function() {

    it('should return a vocabulary record given the id', 
      async function() {
      
      let user = await User.read(USER_6_COURSES)
      let course = user.courses[0]
      let vocabulary = await course.allVocabularys()
      let record = await course.vocabularyById(vocabulary[0].id)
      expect(record).to.be.ok
    })

    it('should not return a vocabulary record given an invalid id', 
      async function() {

      let user = await User.read(USER_6_COURSES)
      let course = user.courses[0]
      let vocabulary = await course.allVocabularys()
      try {
        let record = await course.vocabularyById(9999)
      } catch (err) {
        return true
      }
    })

  })

  describe('deleteVocabulary', function() {

    it('should delete a vocabulary record given the id', 
      async function() {

      let user = await User.read(USER_6_COURSES)
      let course = user.courses[0]
      let vocabulary = await course.allVocabularys()
      let total = vocabulary.length
      let num = await course.deleteVocabulary(vocabulary[0].id)
      vocabulary = await course.allVocabularys()
      expect(num).to.equal(1)
      expect(vocabulary.length).to.equal(total - 1)
    })

    it('should not delete a vocabulary record given an invalid id', 
      async function() {

      let user = await User.read(USER_6_COURSES)
      let course = user.courses[0]
      let vocabulary = await course.allVocabularys()
      let total = vocabulary.length
      let num = await course.deleteVocabulary(9999)
      vocabulary = await course.allVocabularys()
      expect(num).to.equal(0)
      expect(vocabulary.length).to.equal(total)
    })

  })
})

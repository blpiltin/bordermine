//======================================================
// user_tests.js
//
// Description: Unit tests for User model.
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


const USER_TYPES = [
  'root', 
  'webmaster', 
  'schoolmaster', 
  'administrator', 
  'teacher', 
  'student', 
  'parent'
]

const { User } = require('../user')
const { Course } = require('../course')

const { 
  USER_CREDENTIALS,
  USER_0_COURSES,
  USER_3_COURSES,
  USER_6_COURSES
} = require('../../db/seeds/users_seed')

const { 
  getRandomCourseData,
  USER_3_COURSES_COURSE_ID,
  USER_6_COURSES_COURSE_ID
} = require('../../db/seeds/courses_seed')


before(function(done) {
  Knex.migrate.rollback()
  .then(() => Knex.migrate.latest())
  .then(() => Knex.seed.run())
  .then(() => done())
})


describe('User',function() {

  describe('create', function() {

    it('should create a user with valid data', function(done) {
      let data = getRandomUserData()
      delete data.activationCode
      User.create(data)
      .then(user => {
        User.read(user.id)
        .then(user => {
          expect(user).to.be.ok
          expect(user.profile).to.contain(data.profile)
          expect(user.activated).to.not.be.ok
          expect(user.activationCode).to.be.ok
          expect(user.created).to.be.ok
          expect(user.modified).to.be.ok
          done()
        })
      })
    })

    it('should not create a user with invalid email', function(done) {
      let data = getRandomUserData()
      data.email = "whatever"
      User.create(data)
      .catch(err => done())
    })

    it('should not create a user with a missing password', function(done) {
      let data = getRandomUserData()
      data.password = ""
      User.create(data)
      .catch(err => done())
    })

    it('should not create a user with an invalid password', function(done) {
      let data = getRandomUserData()
      data.password = "whatever"
      User.create(data)
      .catch(err => done())
    })

    it('should not create a user with an invalid role', function(done) {
      let data = getRandomUserData()
      data.role = "whatever"
      User.create(data)
      .catch(err => done())
    })

    it('should not create a user with an invalid phone', function(done) {
      let data = getRandomUserData()
      data.profile.phone = "whatever"
      User.create(data)
      .catch(err => done())
    })

    it('should not create a user with an invalid photo', function(done) {
      let data = getRandomUserData()
      data.profile.photo = "whatever"
      User.create(data)
      .catch(err => done())
    })

    it('should not create a user with a duplicate email', function(done) {
      User.query().then(users => {
        let data = getRandomUserData()
        data.email = users[0].email
        User.create(data)
        .catch(err => done())
      })
    })
  })


  describe('read',function() {

    it('should get a user with a valid id', function(done)  {
      User.read(1)
      .then(user => {
        expect(user).to.be.ok
        expect(user.id).to.equal(1)
        done()
      })
    })

    it('should not get a user with an invalid id', function(done)  {
      User.read(-1).catch(err => done())
    })
  })

  describe('findByCredentials',function() {

    it('should find a user with valid credentials', function(done)  {
      let data = getRandomUserData()
      let password = data.password
      User.create(data)
      .then(user => {
        User.findByCredentials(data.email, password)
        .then(user => {
          expect(user).to.be.ok
          expect(user.email).to.equal(data.email)
          done()
        })
      })
    })

    it('should not find a user with invalid email', function(done)  {
      let data = getRandomUserData()
      let password = data.password
      let email = "whatever@wontwork.com"
      User.create(data)
      .then(user => {
        User.findByCredentials(email, password)
        .catch(err => done())
      })
    })

    it('should reject a user with invalid password', function(done)  {
      let data = getRandomUserData()
      let password = "whatever"
      User.create(data)
      .then(user => {
        User.findByCredentials(data.email, password)
        .catch(err => done())
      })
   })
  })

  describe('findByEmail',function() {

    it('should find a user with valid email', function(done) {
      User.findByEmail(USER_CREDENTIALS[2].email)
      .then(user => {
        expect(user.email).to.equal(USER_CREDENTIALS[2].email)
        done()
      })
    })

    it('should reject finding a user with an invalid email', function(done) {
      User.findByEmail('invalidemail@whoever.com')
      .catch(err => done())
    })

  })

  describe('update', function () {
     
    this.timeout(10000)

    it('should read a user and return model', function(done) {
      User.read(2)
      .then(user => {
        expect(user).to.be.ok
        done()
      })
    })

    it('should update a user with valid data', function(done) {
      let data = getRandomUserData()
      let firstName = data.profile.firstName

      delete data.email
      delete data.activationCode
      delete data.activated
      delete data.role

      User.read(1)
      .then(user => {
        user.update(data)
        .then(user => {
          expect(user.profile.firstName).to.equal(firstName)
          done()
        })
      })
    })

    it('should provide the user\'s full name', function(done) {
      User.read(1)
      .then(user => {
        let fullName = `${user.profile.firstName} ${user.profile.lastName}`
        expect(user.fullName).to.equal(fullName)
        done()
      })
    })

    it('should not update email', function(done) {
      User.read(1)
      .then(user => {
        user.update({ email: 'whatever@whoever.com' })
        .then(user => {
          expect(user.email).to.not.equal('whatever@whoever.com')
          done()
        })
      })
    })

    it('should not allow updates with invalid data', function(done) {
      User.read(1)
      .then(user => {
        user.update({ profile: { phone: '333' } })
        .catch(err => done())
      })
    })

    it('should not allow updates to activation field', function(done) {
      User.read(1)
      .then(user => {
        user.update({ activated: true })
        .then(user => {
          expect(user.activated).to.not.equal(true)
          done()
        })
      })
    })

    it('should not update non-updateable fields', function(done) {
      let data = getRandomUserData()
      data.role = 'root'

      User.read(1)
      .then(user => {
        user.update(data)
        .then(user => {
          expect(user.profile).to.contain(data.profile)
          expect(user.email).to.not.equal(data.email)
          expect(user.role).to.not.equal(data.role)
          expect(user.activationCode).to.not.equal(data.activationCode)
          expect(user.activated).to.not.equal(data.activated)
          expect(user.created).to.not.equal(data.created)
          expect(user.modified).to.not.equal(data.modified)
          done()
        })
      })
    })

    it('should delete a previously generated passwordResetCode', async function() {
      let user = await User.create(getRandomUserData())
      expect(user.passwordResetCode).to.not.be.ok
      user = await user.generatePasswordResetCode()
      expect(user.passwordResetCode).to.be.ok
      user = await user.update({ password: 'abc123!++'})
      expect(user.passwordResetCode).to.not.be.ok
    })

  })

  describe('delete',function() {

    it('should delete a user', function(done) {
      let data = getRandomUserData()
      User.create(data)
      .then(user => {
        expect(user).to.be.ok
        user.delete()
        .then(num => {
          expect(num).to.equal(1)
          done()
        })
      })
    })

    it('should delete courses related to user', function(done) {
      User.read(USER_6_COURSES)
      .then(user => {
        expect(user.courses.length).to.equal(6)
        user.delete()
        .then(num => {
          expect(num).to.equal(1)
          Course.query().where('userId', USER_6_COURSES)
          .then(courses => {
            expect(courses.length).to.equal(0)
            done()
          })
        })
      })
    })
  })

  describe('matchPassword', function () {
    
    it('should return the user if the supplied password matches user password', function(done) {
      User.read(2)
      .then(user => {
        user.matchPassword(USER_CREDENTIALS[1].password)
        .then(user => {
          expect(user).to.be.ok
          done()
        })
      })
    })

    it('should return an error if the password does not match user password', function(done) {
      User.read(2)
      .then(user => {
        user.matchPassword(USER_CREDENTIALS[0].password)
        .catch(err => done())
      })
    })
  })

  describe('activate',function() {

    it('should activate a user with correct activation code', function(done) {
      let data = getRandomUserData()
      data.activated = false
      User.create(data)
      .then(user => {
        User.activate(user.activationCode)
        .then(activated => {
          expect(activated).to.equal(true)
          done()
        })
      })
    })

    it('should not activate a user with incorrect activation code', function(done) {
      let data = getRandomUserData()
      data.activated = false
      User.create(data)
      .then(user => {
        User.activate('whatever')
        .catch(err => done())
      })
    })
  })

  describe('generatePasswordResetCode', function() {
    
    it('should generate a unique password reset code', async function() {
      let user = await User.create(getRandomUserData())
      expect(user.passwordResetCode).to.not.be.ok
      user = await user.generatePasswordResetCode()
      expect(user.passwordResetCode).to.be.ok
    })

  })

  describe('confirmPasswordResetCode', function() {

    it('should confirm a valid password reset code', async function() {
      let user = await User.create(getRandomUserData())
      expect(user.passwordResetCode).to.not.be.ok
      user = await user.generatePasswordResetCode()
      expect(user.passwordResetCode).to.be.ok
      user = await user.confirmPasswordResetCode(user.passwordResetCode)
      expect(user).to.be.ok
    })

    it('should reject an invalid password reset code', async function() {
      let user = await User.create(getRandomUserData())
      expect(user.passwordResetCode).to.not.be.ok
      user = await user.generatePasswordResetCode()
      expect(user.passwordResetCode).to.be.ok
      try {
        await user.confirmPasswordResetCode('anything-goes')
      } catch (error) {
        
      }
    })

    it('should reject an expired password reset code', async function() {
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

  describe('createCourse', function() {

    this.timeout(20000)

    before(function(done) { Knex.seed.run().then(() => done()) })

    it('should create a course with valid data', function(done) {
      User.read(USER_0_COURSES)
      .then(user => {
        let data = getRandomCourseData()
        let name = data.name
        user.createCourse(data)
        .then(course => {
          expect(course.userId).to.equal(user.id)
          expect(course.name).to.equal(name)
          done()
        })
      })
    })

    it('should not create a course with a missing name', function(done) {
      User.read(USER_0_COURSES)
      .then(user => {
        let data = getRandomCourseData()
        data.name = null
        user.createCourse(data)
        .catch(err => done())
      })
    })

    it('should not create a course with an invalid name', function(done) {
      User.read(USER_0_COURSES)
      .then(user => {
        let data = getRandomCourseData()
        data.name = '123$#$* __)))'
        user.createCourse(data)
        .catch(err => done())
      })
    })

    it('should not create a course with a missing slug', function(done) {
      User.read(USER_0_COURSES)
      .then(user => {
        let data = getRandomCourseData()
        data.slug = null
        user.createCourse(data)
        .catch(err => done())
      })
    })

    it('should not create a course with an invalid slug', function(done) {
      User.read(USER_0_COURSES)
      .then(user => {
        let data = getRandomCourseData()
        data.slug = 'hello there'
        user.createCourse(data)
        .catch(err => done())
      })
    })

    it('should create a course with a duplicate name for different users', function(done) {
      User.read(USER_0_COURSES)
      .then(user => {
        let data = getRandomCourseData()
        let name = data.name
        user.createCourse(data)
        .then(course1 => {
          User.read(USER_6_COURSES)
          .then(user => {
            data = getRandomCourseData()
            data.name = name
            user.createCourse(data)
            .then(course2 => {
              expect(course1.name).to.equal(course2.name)
              expect(course1.id).to.not.equal(course2.id)
              done()
            })
          })
        })
      })
    })

    it('should create a course with a duplicate slug for different users', function(done) {
      User.read(USER_0_COURSES)
      .then(user1 => {
        let data = getRandomCourseData()
        let slug = data.slug
        user1.createCourse(data)
        .then(course1 => {
          User.read(USER_6_COURSES)
          .then(user2 => {
            data = getRandomCourseData()
            data.slug = slug
            user2.createCourse(data)
            .then(course2 => {
              expect(course1.slug).to.equal(course2.slug)
              expect(course1.id).to.not.equal(course2.id)
              done()
            })
          })
        })
      })
    })

    it('should create a course with a duplicate code for different users', function(done) {
      User.read(USER_0_COURSES)
      .then(user => {
        let data = getRandomCourseData()
        let code = data.code
        user.createCourse(data)
        .then(course1 => {
          User.read(USER_6_COURSES)
          .then(user => {
            data = getRandomCourseData()
            data.code = code
            user.createCourse(data)
            .then(course2 => {
              expect(course1.code).to.equal(course2.code)
              expect(course1.id).to.not.equal(course2.id)
              done()
            })
          })
        })
      })
    })

    it('should not create a course with a duplicate name for same user', function(done) {
      User.read(USER_0_COURSES)
      .then(user => {
        let data = getRandomCourseData()
        let name = data.name
        user.createCourse(data)
        .then(course => {
          data = getRandomCourseData()
          data.name = name
          user.createCourse(data)
          .catch(err => done())
        })
      })
    })

    it('should not create a course with a duplicate slug for same user', function(done) {
      User.read(USER_0_COURSES)
      .then(user => {
        let data = getRandomCourseData()
        let slug = data.slug
        user.createCourse(data)
        .then(course => {
          data = getRandomCourseData()
          data.slug = slug
          user.createCourse(data)
          .catch(err => done())
        })
      })
    })

    it('should not create a course with a duplicate code for same user', function(done) {
      User.read(USER_0_COURSES)
      .then(user => {
        let data = getRandomCourseData()
        let code = data.code = '01ABCDE1'
        user.createCourse(data)
        .then(course => {
          data = getRandomCourseData()
          data.code = code
          user.createCourse(data)
          .catch(err => done())
        })
      })
    })
  })

  describe('courseById',function() {

    before(function(done) { Knex.seed.run().then(() => done()) })

    it('should return a course given a valid id', function(done) {
      User.read(USER_6_COURSES)
      .then(user => {
        user.courseById(USER_6_COURSES_COURSE_ID)
        .then(course => {
          expect(course.userId).to.equal(user.id)
          done()
        })
      })
    })

    it('should not return a course given an invalid id', function(done) {
      User.read(USER_6_COURSES)
      .then(user => {
        user.courseById(USER_3_COURSES_COURSE_ID)
        .catch(err => done())
      })
    })

  })

  describe('courseBySlug', function() {
    
    it('should return a course given a valid slug', function(done) {
      User.read(USER_6_COURSES)
      .then(user => {
        let data = getRandomCourseData()
        data.name = "Some Name For 6"
        data.slug = "some-name-for-6"
        let slug = data.slug
        user.createCourse(data)
        .then(() => {
          user.courseBySlug(slug)
          .then(course => {
            expect(course.userId).to.equal(user.id)
            expect(course.slug).to.equal(slug)
            done()
          })
        })
      })
    })

    it('should not return a course given an invalid slug', function(done) {
      User.read(USER_6_COURSES)
      .then(user => {
        let data = getRandomCourseData()
        data.name = "Some Other Name For 6"
        data.slug = "some-other-name-for-6"
        user.createCourse(data)
        .then(course => {
          user.courseBySlug('whatever')
          .catch(err => done())
        })
      })
    })
  })

  describe('courseByCode', function() {
    it('should return a course given a valid code', function(done) {
      User.read(USER_6_COURSES)
      .then(user => {
        let data = getRandomCourseData()
        data.name = "Some Name For 6 2"
        data.slug = "some-name-for-6-2"
        data.code = "0001ABC"
        let code = data.code
        user.createCourse(data)
        .then(() => {
          user.courseByCode(code)
          .then(course => {
            expect(course.userId).to.equal(user.id)
            expect(course.code).to.equal(code)
            done()
          })
        })
      })
    })

    it('should not return a course given an invalid code', function(done) {
      User.read(USER_6_COURSES)
      .then(user => {
        let data = getRandomCourseData()
        data.name = "Some Other Name For 6 2"
        data.slug = "some-other-name-for-6-2"
        data.code = "0002ABC"
        user.createCourse(data)
        .then(course => {
          user.courseByCode('whatever')
          .catch(err => done())
        })
      })
    })
  })

  describe('allCourses', function() {

    before(function(done) { Knex.seed.run().then(() => done()) })

    it('should return the users\'s courses', function(done) {
      User.read(USER_6_COURSES)
      .then(user => {
        user.allCourses()
        .then(courses => {
          expect(courses.length).to.equal(6)
          expect(courses[0].userId).to.equal(user.id)
          expect(courses[courses.length -1].userId).to.equal(user.id)
          done()
        })
      })
    })
  })

  describe('fullName',function() {

    it('should get user\'s full name', function(done) {
      let data = getRandomUserData()
      User.create(data)
      .then(user => {
        expect(user.fullName).to.equal(`${user.profile.firstName} ${user.profile.lastName}`)
        done()
      })
    })
  })
})


//======================================================
// Utils
//======================================================

const getRandomUserData =function() {
  return {
    email: faker.internet.email(),
    password: faker.random.alphaNumeric(7) + 'a1?',
    activationCode: faker.random.uuid(),
    activated: true,
    role: faker.random.arrayElement(USER_TYPES),
    profile: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phone: faker.phone.phoneNumber(),
      room: faker.random.alphaNumeric(4),
      bio: faker.lorem.paragraphs(),
      photo: faker.random.boolean() ? 'test_photo_1.jpg' : null
    }
  }
}

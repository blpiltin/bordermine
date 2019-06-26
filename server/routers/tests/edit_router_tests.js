//======================================================
// edit_router_tests.js 
// 
// Description: Defines integration tests for edit_router.js
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.1
// History:
//  - 0.0.1: Initial tests
//======================================================

const debug = require('../../../utils/debug').create('edit_router.js')

process.env.NODE_ENV = 'test'

const request = require('supertest')
const { expect } = require('chai')
const sinon = require('sinon')
const fs = require('fs-extra')
const path = require('path')

var { Knex } = require('../../db/db')

const { 
  getDashboardPathFromEmail, 
  getEditPathFromEmail, 
  getUserPathFromEmail
} = require('../../utils/server_utils')

const { mailer } = require('../../utils/mailer')
const { app } = require('../../server')
const { User } = require('../../models/user')

const { 
  login,
  checkGetAuth, 
  checkGetUnauth,
  checkGetPermit,
  checkGetNonPermit,
  checkRedirect
} = require('../../tests/server_tests_utils')

const { USER_CREDENTIALS } = require('../../db/seeds/users_seed')

const uploadsDir = path.join(__dirname, '../../../client/uploads')
const fixturesDir = path.join(__dirname, '../../fixtures')


before(async function() {
  await Knex.migrate.rollback()
  await Knex.migrate.latest()
  await Knex.seed.run()
})


describe('Edit Router', () => {

  beforeEach(function(done) {
    this.timeout(10000)
    Knex.seed.run().then(() => done()) 
  })

  describe('get /', async function () {

  })

  // 
  // //======================================================
  // // User Routes
  // //======================================================

  // //------------------------------------------------------
  // // View Dashboard
  // //------------------------------------------------------
  // describe.only('GET /:domain/:user/dashboard', () => {
  //   let email = USER_CREDENTIALS[4].email
  //   let password = USER_CREDENTIALS[4].password
  //   let path = `${getDashboardPathFromEmail(email)}`

  //   it('should get the user\'s dashboard', done => 
  //     checkGetAuth(app, email, password, path, 'Dashboard', done))

  //   it('should not get the dashboard for guests', done =>
  //     checkGetUnauth(app, path, done))
  // })

  // //------------------------------------------------------
  // // View User Profile
  // //------------------------------------------------------
  // describe('GET /:domain/edit/:user/profile', () => {
  //   let email = USER_CREDENTIALS[4].email
  //   let password = USER_CREDENTIALS[4].password
  //   let path = `${getEditPathFromEmail(email)}/profile`

  //   it('should get the user\'s edit profile page', done => 
  //     checkGetAuth(app, email, password, path, 'Edit User Profile', done))

  //   it('should not get the edit profile page for guests', done => 
  //     checkGetUnauth(app, path, done))

  // })

  // //------------------------------------------------------
  // // Edit User Profile
  // //------------------------------------------------------
  // describe('POST /:domain/edit/:user/profile', () => {

  //   let email = USER_CREDENTIALS[2].email
  //   let password = USER_CREDENTIALS[2].password
  //   let profile = { 
  //     firstName: 'Brian', 
  //     lastName: 'Louis', 
  //     room: 'B123', 
  //     phone: '123-4567',
  //     bio: 'The best teacher on earth.' 
  //   }
  //   let profilePath = `${getEditPathFromEmail(email)}/profile`
    
  //   const cleanUp = (dir, done) => {
  //     fs.remove(dir)
  //     .then(() => {
  //       done()
  //     })
  //     .catch(err => {
  //       done(err)
  //     })
  //   }

  //   const uploadPhoto = (authUser, done) => {
  //     authUser
  //     .post(profilePath)
  //     .field('photo', 'test_photo_1.jpg')
  //     .attach('photo', fixturesDir + '/test_photo_1.jpg')
  //     .end((err, res) => {
  //       if (err) throw err
  //       done(authUser)
  //     })
  //   }

  //   it('should save the user\'s profile with valid information', done => {
  //     login(app, email, password, authUser => {
  //       authUser
  //         .post(profilePath)
  //         .field('firstName', profile.firstName)
  //         .field('lastName', profile.lastName)
  //         .field('room', profile.room)
  //         .field('phone', profile.phone)
  //         .field('bio', profile.bio)
  //       .expect(200)
  //       .expect(res => {
  //         expect(res.text).to.contain('Classmine | Edit User Profile')
  //       })
  //       .end((err, res) => {
  //         if (err) return done(err)
  //         User.findByEmail(email)
  //         .then(user => {
  //           expect(user.profile).to.contain(profile)
  //           done()
  //         })
  //         .catch(err => done(err))
  //       })
  //     })
  //   })

  //   it('should not save the user\'s profile with invalid information', done => {
  //     profile.phone = '444'

  //     login(app, email, password, (authUser) => {
  //       authUser
  //         .post(profilePath)
  //         .field('firstName', profile.firstName)
  //         .field('lastName', profile.lastName)
  //         .field('room', profile.room)
  //         .field('phone', profile.phone)
  //         .field('bio', profile.bio)
  //       .expect(400)
  //       .expect(res => {
  //         expect(res.text).to.contain('Classmine | Edit User Profile')
  //         expect(res.text).to.contain('problem')
  //       })
  //       .end((err, res) => {
  //         if (err) return done(err)
  //         User.findByEmail(email)
  //         .then(user => {
  //           expect(user.profile).to.not.contain(profile)
  //           done()
  //         })
  //         .catch(err => done(err))
  //       })
  //     })
  //   })

  //   it('should not save the profile page for guests', done => {
  //     request(app)
  //       .post(profilePath)
  //       .field('firstName', profile.firstName)
  //       .field('lastName', profile.lastName)
  //       .field('room', profile.room)
  //       .field('phone', profile.phone)
  //       .field('bio', profile.bio)
  //     .expect(302)
  //     .expect(res => {
  //       expect(res.header['location']).to.contain('/login')
  //     })
  //     .end((err, res) => {
  //       if (err) return done(err)
  //       User.findByEmail(email)
  //       .then(user => {
  //         expect(user.profile).to.not.contain(profile)
  //         done()
  //       })
  //       .catch(err => done(err))
  //     })
  //   })

  //   it('should save a valid photo', done => {
  //     profile.photo = 'test_photo_1.jpg'

  //     login(app, email, password, (authUser) => {
  //       authUser
  //         .post(profilePath)
  //         .field('firstName', profile.firstName)
  //         .field('lastName', profile.lastName)
  //         .field('photo', profile.photo)
  //         .attach('photo', fixturesDir + '/test_photo_1.jpg')
  //       .expect(200)
  //       .expect(res => {
  //         expect(res.text).to.contain('Classmine | Edit User Profile')
  //       })
  //       .end((err, res) => {
  //         if (err) return done(err)
  //         User.findByEmail(email)
  //         .then(user => {
  //           let dir = uploadsDir + '/' + user.id
  //           let path = dir + '/test_photo_1.jpg'
  //           expect(user.profile.photo).to.equal(profile.photo)
  //           fs.pathExists(path)
  //           .then(exists => {
  //             expect(exists).to.equal(true)
  //             cleanUp(dir, done)
  //           })
  //         })
  //         .catch(err => done(err))
  //       })
  //     })
  //   })

  //   it('should not save a non-image file', done => {
  //     profile.photo = 'test_file_1.pdf'

  //     login(app, email, password, (authUser) => {
  //       authUser
  //         .post(profilePath)
  //         .field('firstName', profile.firstName)
  //         .field('lastName', profile.lastName)
  //         .field('photo', profile.photo)
  //         .attach('photo', fixturesDir + '/test_file_1.pdf')
  //       .expect(400)
  //       .expect(res => {
  //         expect(res.text).to.contain('Classmine | Edit User Profile')
  //         expect(res.text).to.contain('problem')
  //       })
  //       .end((err, res) => {
  //         if (err) return done(err)
  //         User.findByEmail(email)
  //         .then(user => {
  //           let dir = uploadsDir + '/' + user.id
  //           let path = dir + '/test_file_1.pdf'
  //           expect(user.profile.photo).to.not.equal(profile.photo)
  //           fs.pathExists(path)
  //           .then(exists => {
  //             expect(exists).to.equal(false)
  //             done()
  //           })
  //         })
  //         .catch(err => done(err))
  //       })
  //     })
  //   })

  //   it('should delete the photo when delete field is present', done => {
  //     login(app, email, password, (authUser) => {
  //       uploadPhoto(authUser, (authUser) => {
  //         authUser
  //         .post(profilePath)
  //         .field('firstName', profile.firstName)
  //         .field('lastName', profile.lastName)
  //         .field('delete', 'Delete')
  //         .expect(200)
  //         .expect(res => {
  //           expect(res.text).to.contain('Classmine | Edit User Profile')
  //         })
  //         .end((err, res) => {
  //           if (err) return done(err)
  //           User.findByEmail(email)
  //           .then(user => {
  //             let dir = uploadsDir + '/' + user.id
  //             let path = dir + '/test_file_1.pdf'
  //             expect(user.profile.photo).to.not.equal('test_photo_1.jpg')
  //             fs.pathExists(path)
  //             .then(exists => {
  //               expect(exists).to.equal(false)
  //               done()
  //             })
  //           })
  //           .catch(err => done(err))
  //         })
  //       })
  //     })
  //   })
  // })

  // describe.skip('GET /:domain/edit/:user/courses', () => {
  //   it('should get the teacher\'s courses list page', () => {
      
  //   })

  //   it('should not get the courses list page for other users and guests', () => {

  //   })
  // })

  // describe.skip('GET /:domain/edit/:user/course', () => {
  //   it('should get the teacher\'s blank course edit page', () => {

  //   })

  //   it('should not get the blank edit detail page for other users and guests', () => {

  //   })
  // })

  // describe.skip('POST /dashboard/course', () => {
  //   it('should save the teacher\'s course and redirect to detail page', () => {

  //   })

  //   it('should not save the course for other users and guests', () => {

  //   })
  // })

  // describe.skip('GET /dashboard/course/:courseID', () => {
  //   it('should get the teacher\'s course detail page', () => {

  //   })

  //   it('should not get the course detail page for other users and guests', () => {

  //   })
  // })

  // describe.skip('POST /dashboard/course/:courseID', () => {
  //   it('should save the teacher\'s course', () => {

  //   })

  //   it('should not save the course for other users and guests', () => {

  //   })
  // })

  // describe.skip('DELETE /dashboard/course/:courseID', () => {
  //   it('should delete the teacher\'s course', () => {

  //   })

  //   it('should not delete the course for other users and guests', () => {

  //   })
  // })

  // describe.skip('GET /dashboard/course/:courseID/assignments', () => {
  //   it('should get the teacher\'s course assignments page', () => {

  //   })

  //   it('should not get the course assignments page for other users and guests', () => {

  //   })
  // })

  // describe.skip('GET /dashboard/course/:courseID/assignment', () => {
  //   it('should get the teacher\'s blank assignment page and redirect to detail page', () => {

  //   })

  //   it('should not get the blank assignment page for other users and guests', () => {

  //   })
  // })

  // describe.skip('POST /dashboard/course/:courseID/assignment', () => {
  //   it('should save the teacher\'s assignment to the correct course', () => {

  //   })

  //   it('should not save the assignment for other users and guests', () => {

  //   })
  // })

  // describe.skip('GET /dashboard/course/:courseID/assignment/:assignmentID', () => {
  //   it('should get the teacher\'s assignment detail page', () => {

  //   })

  //   it('should not get the assignment detail page for other users and guests', () => {

  //   })
  // })

  // describe.skip('DELETE /dashboard/course/:courseID/assignment/:assignmentID', () => {
  //   it('should delete the teacher\'s assignment from the correct course', () => {

  //   })

  //   it('should not delete the assignment for other users and guests', () => {

  //   })
  // })


  // // District Routes
  // //======================================================

  // // View District
  // //------------------------------------------------------
  // describe.skip('GET /:domain', () => {
  //   it('should get the webmaster view of the district page for webmasters', () => {
  //     // Webmasters belonging to this domain should be able to edit the district page
  //     //  and their dashboard will contain the relevant tools.
  //   })

  //   it('should get the public view of the district page for other users and guests', () => {
  //     // Other users and guests should see the district home page.
  //   })
  // })


  // // School Routes
  // //======================================================

  // // View School (schoolmaster)
  // //------------------------------------------------------
  // describe.skip('GET /:domain/:school', () => {
  //   it('should get the schoolmaster view of the school page for schoolmasters', () => {
  //     // Schoolmasters belonging to this domain should be able to edit the school page
  //     //  and their dashboard will contain the relevant tools.
  //   })

  //   it('should get the public view of the school page for other users and guests', () => {
  //     // Other users and guests should see the school home page.
  //   })
  // })


  // // Misc Routes
  // //======================================================

  // // View User Profile (administrator, teacher, student)
  // //------------------------------------------------------
  // describe('GET /:domain/:user/profile', () => {
  //   it('should get the owner view of the personal page for owners (administrator, teacher, student)', done => {
  //     // Administrators, teachers and students belonging to this domain should 
  //     //  be able to edit their personal page and their dashboard will contain 
  //     //  the relevant tools.
  //     let path = `${getUserPathFromEmail(USER_CREDENTIALS[2].email)}/profile`
  //     checkGetPermit(app, USER_CREDENTIALS[2].email, USER_CREDENTIALS[2].password, path, 'Edit View', done)
  //   })

  //   it('should get the public view of the personal page for domain users', done => {
  //     // Domain users see the public view of the user's personal page page.
  //     let email = USER_CREDENTIALS[3].email
  //     let password = USER_CREDENTIALS[3].password
  //     let path = `${getUserPathFromEmail(email)}/profile`
  //     checkGetAuth(app, email, password, path, 'About', done)
  //   })

  //   it('should be blocked for non-domain users', done => {
  //     let path = `${getUserPathFromEmail(USER_CREDENTIALS[4].email)}/profile`
  //     // Non-domain users see the public view of the user's personal page page.
  //     checkGetNonPermit(app, USER_CREDENTIALS[3].email, USER_CREDENTIALS[3].password, path, done)
  //   })

  //   it('should be blocked for guests', done => {
  //     let path = `${getUserPathFromEmail(USER_CREDENTIALS[3].email)}/profile`
  //     // Gests should be redirected to the home or login page.
  //     checkGetUnauth(app, path, done)
  //   })
  // })

  // // View Teacher Course (teacher)
  // //------------------------------------------------------
  // describe.skip('GET /:domain/:user/:course', () => {
  //   it('should get the owner view of the course page for owners (teacher)', () => {
  //     // The owner course view should contain access to everything
  //     //  including the ability to add/edit/delete elements on the
  //     //  page by clicking on them.
  //     // The edits on this page should alter the underlying course content.
  //   })

  //   it('should get the public course page for other users', () => {
  //     // The public view should contain access to all of the 
  //     //  course elements minus the ability to edit anything on the page.
  //   })

  //   it('should be blocked for guests', () => {
  //     // Guests should be redirected to the home or login page.
  //   })
  // })

  // // View Course Secion
  // //------------------------------------------------------
  // describe.skip('GET /:domain/:user/:course/:section', () => {
  //   it('should get the owner view of the section page for owners (teacher)', () => {
  //     // The owner section view should contain access to everything
  //     //  including the ability to add/edit/delete elements on the
  //     //  page by clicking on them.
  //     // The edits on this page should alter scheduling and 
  //     //  inclusion/exclusion of section-specific content.
  //     // The teacher section view should also contain a link to the 
  //     //  student submissions for each assignment.
  //   })

  //   it('should get the student view of the section page for students (members)', () => {
  //     // The student section view should contain access to all of the 
  //     //  course elements plus the ability to submit assignments and view
  //     //  grades and feedback on assignments.
  //   })

  //   it('should get the parent view of the section page for parents (members)', () => {
  //     // The parent section view should contain access to all of the 
  //     //  course elements plus the ability to view grades and feedback
  //     //  for the related student.
  //   })

  //   it('should get the administrator view of the section page for administrators', () => {
  //     // The administrator section view should contain access to all of the 
  //     //  course elements plus the ability to view grades and feedback
  //     //  for any district student.
  //   })

  //   it('should be blocked for other users and guests', () => {
  //     // Other users and guests should be redirected to the home or login page.
  //   })
  // })
  
})

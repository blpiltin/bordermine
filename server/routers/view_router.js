const debug = require('../../utils/debug').create('view_router.js')

const express = require('express')
const router = express.Router()
const createError = require('http-errors')

const { permit } = require('../middleware/permissions')

const { 
  viewDashboard 
} = require('../controllers/dashboard_controller')

const { 
  viewUserProfile
} = require('../controllers/user_controller')

// const { 
//   viewCourseInfo
// } = require('../controllers/course_controller')

// const { Course } = require('../models/course')


//------------------------------------------------------
// View Dashboard
//------------------------------------------------------
router.get('/dashboard', permit('owner'), (req, res) => viewDashboard(req, res))

//------------------------------------------------------
// Use for AJAX course menu. 
// #Note: in development see playground/client/js/dashboard.js
//------------------------------------------------------
// router.get('/dashboard/courses', async (req, res) => {
//   let courses = await res.locals.user.courses
//   res.send({ courses })
// })


//======================================================
// View User (Profile)
//======================================================

router.get('/', (req, res) => res.redirect(`${req.baseUrl}/profile`))
router.get('/profile', permit({ domain: 'user'}), (req, res) => viewUserProfile(req, res))


//======================================================
// View Course
//======================================================

// router.get('/course/:course_id', permit({ domain: 'user' }), async (req, res, next) => viewCourseInfo(req, res, next))
// router.get('/course/:course_id/objectives', (req, res) => res.redirect('./'))
// router.get('/course/:course_id/about', (req, res) => res.redirect('./'))
// router.get('/:course_slug', permit({ domain: 'user' }), async (req, res, next) => viewCourseInfo(req, res, next))
// router.get('/:course_slug/objectives', (req, res) => res.redirect('./'))
// router.get('/:course_slug/about', (req, res) => res.redirect('./'))


//======================================================
// Setup up course res.locals.view properties based on course_slug
//======================================================
// router.param('course_slug', async (req, res, next) => {
//   debug.log('got to router.param course_slug')
//   try {
//     await setLocalsViewCourse(req, res)
//     next()
//   } catch (error) {
//     next(createError(404))
//   }
// })

//======================================================
// Setup up course res.locals.view properties based on course_id
//======================================================
// router.param('course_id', async (req, res, next) => {
//   try {
//     await setLocalsViewCourse(req, res)
//     next()
//   } catch (error) {
//     next(createError(404))
//   }
// })


//======================================================
// Utils
//======================================================

//------------------------------------------------------
// Setup course res.locals.view based on type of request parameter
//------------------------------------------------------
// const setLocalsViewCourse = async (req, res) => {
//   let query = req.params.course_id 
//     ? { userId: res.locals.view.owner.id, id: req.params.course_id  }
//     : { userId: res.locals.view.owner.id, slug: req.params.course_slug  }
//   let course = await Course.findOne(query)
//   res.locals.view.course = course
//   let pattern = req.params.course_id ? req.params.course_id : req.params.course_slug
//   res.locals.view.home = req.originalUrl.match('(.+' + pattern + ')')[0]
// }


module.exports = router

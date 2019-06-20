const debug = require('../../utils/debug').create('edit_router.js')

const express = require('express')
const router = express.Router()
const { permit } = require('../middleware/permissions')

const { 
  editUser,
  saveUser,
  editUserProfile,
  saveUserProfile
} = require('../controllers/user_controller')

// const {
//   newCourse,
//   createCourse,
//   editCourseInfo,
//   saveCourseInfo,
//   editCourse
// } = require('../controllers/course_controller')

// const {
//   newObjective,
//   createObjective,
//   editObjective,
//   saveObjective,
//   deleteObjective,
//   deleteObjectives,
//   editObjectives
// } = require('../controllers/objective_controller')


//======================================================
// Handle the user account and profile routes here
//======================================================

//------------------------------------------------------
// #Todo: Technically this should edit the user's account info
//------------------------------------------------------
router.get('/', permit('owner'), (req, res) => 
  editUser(req, res))
router.post('/', permit('owner'), (req, res) => 
  saveUser(req, res))

//------------------------------------------------------
// Edit the user's profile
//------------------------------------------------------
router.get('/profile', permit('owner'), (req, res) => 
  editUserProfile(req, res))
router.post('/profile', permit('owner'), (req, res) => 
  saveUserProfile(req, res))

//======================================================
// Course edit routes
//======================================================

//------------------------------------------------------
// Create new course, edit and save course info 
//------------------------------------------------------
// router.get('/course', 
//   permit('owner', 'teacher'), (req, res) => newCourse(req, res))
// router.post('/course', 
//   permit('owner', 'teacher'), (req, res) => createCourse(req, res))
// router.get('/course/:course_id/info', 
//   permit('owner', 'teacher'), (req, res) => editCourseInfo(req, res))
// router.post('/course/:course_id/info', 
//   permit('owner', 'teacher'), (req, res) => saveCourseInfo(req, res))

//------------------------------------------------------
// Primary edit course page
//------------------------------------------------------
// router.get('/course/:course_id', 
//   permit('owner', 'teacher'), (req, res) => editCourse(req, res))

//------------------------------------------------------
// Course Objective edit routes
// Create new objective, edit, save and list course objectives
//------------------------------------------------------
// router.get('/course/:course_id/objective', 
//   permit('owner', 'teacher'), (req, res) => newObjective(req, res))
// router.post('/course/:course_id/objective', 
//   permit('owner', 'teacher'), (req, res) => createObjective(req, res))
// router.get('/course/:course_id/objective/:objective_id', 
//   permit('owner', 'teacher'), (req, res) => editObjective(req, res))
// router.post('/course/:course_id/objective/:objective_id', 
//   permit('owner', 'teacher'), (req, res) => saveObjective(req, res))
// router.get('/course/:course_id/objective/:objective_id/delete', 
//   permit('owner', 'teacher'), (req, res) => deleteObjective(req, res))
// router.get('/course/:course_id/objectives', 
//   permit('owner', 'teacher'), (req, res) => editObjectives(req, res))
// router.post('/course/:course_id/objectives/delete', 
//   permit('owner', 'teacher'), (req, res) => deleteObjectives(req, res))


//======================================================
// Add course_id to res.locals for use in forms and tempaltes
//======================================================
// router.param('course_id', async (req, res, next, course_id) => {
//   res.locals.course = await res.locals.user.courseById(course_id)
//   res.locals.home = req.originalUrl.match('(.+' + course_id + ')')[0]
//   next()
// })


module.exports = router;
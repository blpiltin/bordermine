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

const {
  newCourse,
  createCourse,
  editCourseInfo,
  saveCourseInfo,
  editCourse
} = require('../controllers/course_controller')

const {
  newObjective,
  createObjective,
  editObjective,
  saveObjective,
  deleteObjective,
  deleteObjectives,
  editObjectives
} = require('../controllers/objective_controller')

const {
  newVocabulary,
  createVocabulary,
  editVocabulary,
  saveVocabulary,
  deleteVocabulary,
  deleteVocabularys,
  editVocabularys
} = require('../controllers/vocabulary_controller')

const {
  newActivity,
  createActivity,
  editActivity,
  saveActivity,
  deleteActivity,
  editActivities,
  deleteActivities
} = require('../controllers/activity_controller')


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
router.get('/course', 
  permit('owner', 'teacher'), (req, res) => newCourse(req, res))
router.post('/course', 
  permit('owner', 'teacher'), (req, res) => createCourse(req, res))
router.get('/course/:course_id/info', 
  permit('owner', 'teacher'), (req, res) => editCourseInfo(req, res))
router.post('/course/:course_id/info', 
  permit('owner', 'teacher'), (req, res) => saveCourseInfo(req, res))

//------------------------------------------------------
// Primary edit course page
//------------------------------------------------------
router.get('/course/:course_id', 
  permit('owner', 'teacher'), (req, res) => editCourse(req, res))

//------------------------------------------------------
// Course Objective edit routes
// Create new objective, edit, save and list course objectives
//------------------------------------------------------
router.get('/course/:course_id/objective', 
  permit('owner', 'teacher'), (req, res) => newObjective(req, res))
router.post('/course/:course_id/objective', 
  permit('owner', 'teacher'), (req, res) => createObjective(req, res))
router.get('/course/:course_id/objective/:objective_id', 
  permit('owner', 'teacher'), (req, res) => editObjective(req, res))
router.post('/course/:course_id/objective/:objective_id', 
  permit('owner', 'teacher'), (req, res) => saveObjective(req, res))
router.get('/course/:course_id/objective/:objective_id/delete', 
  permit('owner', 'teacher'), (req, res) => deleteObjective(req, res))
router.get('/course/:course_id/objectives', 
  permit('owner', 'teacher'), (req, res) => editObjectives(req, res))
router.post('/course/:course_id/objectives/delete', 
  permit('owner', 'teacher'), (req, res) => deleteObjectives(req, res))

//------------------------------------------------------
// Course Vocabulary edit routes
// Create new vocabulary, edit, save and list course vocabulary
//------------------------------------------------------
router.get('/course/:course_id/vocabulary', 
  permit('owner', 'teacher'), (req, res) => newVocabulary(req, res))
router.post('/course/:course_id/vocabulary', 
  permit('owner', 'teacher'), (req, res) => createVocabulary(req, res))
router.get('/course/:course_id/vocabulary/:vocabulary_id', 
  permit('owner', 'teacher'), (req, res) => editVocabulary(req, res))
router.post('/course/:course_id/vocabulary/:vocabulary_id', 
  permit('owner', 'teacher'), (req, res) => saveVocabulary(req, res))
router.get('/course/:course_id/vocabulary/:vocabulary_id/delete', 
  permit('owner', 'teacher'), (req, res) => deleteVocabulary(req, res))
router.get('/course/:course_id/vocabularys', 
  permit('owner', 'teacher'), (req, res) => editVocabularys(req, res))
router.post('/course/:course_id/vocabularys/delete', 
  permit('owner', 'teacher'), (req, res) => deleteVocabularys(req, res))

//------------------------------------------------------
// Course Activity edit routes
// Create new activity, edit, save and list activities
//------------------------------------------------------
router.get('/course/:course_id/lesson', 
  permit('owner', 'teacher'), (req, res) => newActivity(req, res, 'lesson'))
router.post('/course/:course_id/lesson', 
  permit('owner', 'teacher'), (req, res) => createActivity(req, res, 'lesson'))
router.get('/course/:course_id/lesson/:activity_id', 
  permit('owner', 'teacher'), (req, res) => editActivity(req, res, 'lesson'))
router.post('/course/:course_id/lesson/:activity_id', 
  permit('owner', 'teacher'), (req, res) => saveActivity(req, res, 'lesson'))
router.get('/course/:course_id/lesson/:activity_id/delete', 
  permit('owner', 'teacher'), (req, res) => deleteActivity(req, res, 'lesson'))
router.get('/course/:course_id/lessons', 
  permit('owner', 'teacher'), (req, res) => editActivities(req, res, 'lesson'))
router.post('/course/:course_id/lessons/delete', 
  permit('owner', 'teacher'), (req, res) => deleteActivities(req, res, 'lesson'))


//======================================================
// Add course_id to res.locals for use in forms and tempaltes
//======================================================
router.param('course_id', async (req, res, next, course_id) => {
  res.locals.course = await res.locals.user.courseById(course_id)
  res.locals.home = req.originalUrl.match('(.+' + course_id + ')')[0]
  next()
})


module.exports = router;
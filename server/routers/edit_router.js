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
  editCompany,
  saveCompany
} = require('../controllers/company_controller')

// const {
//   newClient,
//   createClient,
//   editClientInfo,
//   saveClientInfo,
//   editClient
// } = require('../controllers/client_controller')

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

//------------------------------------------------------
// Edit the user's company (if owner)
//------------------------------------------------------
router.get('/company', permit('owner', 'owner'), (req, res) => 
  editCompany(req, res))
router.post('/company', permit('owner', 'owner'), (req, res) => 
  saveCompany(req, res))

//======================================================
// Client edit routes
//======================================================

//------------------------------------------------------
// Create new client, edit and save client info 
//------------------------------------------------------
// router.get('/client', 
//   permit('owner', 'teacher'), (req, res) => newClient(req, res))
// router.post('/client', 
//   permit('owner', 'teacher'), (req, res) => createClient(req, res))
// router.get('/client/:client_id/info', 
//   permit('owner', 'teacher'), (req, res) => editClientInfo(req, res))
// router.post('/client/:client_id/info', 
//   permit('owner', 'teacher'), (req, res) => saveClientInfo(req, res))

//------------------------------------------------------
// Primary edit client page
//------------------------------------------------------
// router.get('/client/:client_id', 
//   permit('owner', 'teacher'), (req, res) => editClient(req, res))

//------------------------------------------------------
// Client Objective edit routes
// Create new objective, edit, save and list client objectives
//------------------------------------------------------
// router.get('/client/:client_id/objective', 
//   permit('owner', 'teacher'), (req, res) => newObjective(req, res))
// router.post('/client/:client_id/objective', 
//   permit('owner', 'teacher'), (req, res) => createObjective(req, res))
// router.get('/client/:client_id/objective/:objective_id', 
//   permit('owner', 'teacher'), (req, res) => editObjective(req, res))
// router.post('/client/:client_id/objective/:objective_id', 
//   permit('owner', 'teacher'), (req, res) => saveObjective(req, res))
// router.get('/client/:client_id/objective/:objective_id/delete', 
//   permit('owner', 'teacher'), (req, res) => deleteObjective(req, res))
// router.get('/client/:client_id/objectives', 
//   permit('owner', 'teacher'), (req, res) => editObjectives(req, res))
// router.post('/client/:client_id/objectives/delete', 
//   permit('owner', 'teacher'), (req, res) => deleteObjectives(req, res))


//======================================================
// Add client_id to res.locals for use in forms and tempaltes
//======================================================
// router.param('client_id', async (req, res, next, client_id) => {
//   res.locals.client = await res.locals.user.clientById(client_id)
//   res.locals.home = req.originalUrl.match('(.+' + client_id + ')')[0]
//   next()
// })


module.exports = router;
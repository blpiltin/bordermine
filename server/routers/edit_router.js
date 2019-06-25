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

const {
  newClient,
  createClient,
  editClient,
  saveClient,
  deleteClient,
  deleteClients,
  editClients
} = require('../controllers/client_controller')


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
// Create new client, edit, save and list clients
//------------------------------------------------------
router.get('/client', 
  permit('domain', 'user'), (req, res) => newClient(req, res))
router.post('/client', 
  permit('domain', 'user'), (req, res) => createClient(req, res))
router.get('/client/:client_id', 
  permit('domain', 'user'), (req, res) => editClient(req, res))
router.post('/client/:client_id', 
  permit('domain', 'user'), (req, res) => saveClient(req, res))
router.get('/client/:client_id/delete', 
  permit('domain', 'user'), (req, res) => deleteClient(req, res))
router.get('/clients/', 
  permit('domain', 'user'), (req, res) => editClients(req, res))
router.post('/clients/delete', 
  permit('domain', 'user'), (req, res) => deleteClients(req, res))


//======================================================
// Add client_id to res.locals for use in forms and tempaltes
//======================================================
router.param('client_id', async (req, res, next, client_id) => {
  res.locals.client = await res.locals.user.clientById(client_id)

  // TODO: Figure out what the homePath was supposed to be used for. Back button?
  res.locals.homePath = req.originalUrl.match('(.+' + client_id + ')')[0]

  next()
})


module.exports = router;
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


//------------------------------------------------------
// Create new exporter, edit, save and list exporters
//------------------------------------------------------
router.get('/exporter', 
  permit('domain', 'user'), (req, res) => newClient(req, res, 'exporter'))
router.post('/exporter', 
  permit('domain', 'user'), (req, res) => createClient(req, res, 'exporter'))
router.get('/exporter/:exporter_id', 
  permit('domain', 'user'), (req, res) => editClient(req, res, 'exporter'))
router.post('/exporter/:exporter_id', 
  permit('domain', 'user'), (req, res) => saveClient(req, res, 'exporter'))
router.get('/exporter/:exporter_id/delete', 
  permit('domain', 'user'), (req, res) => deleteClient(req, res, 'exporter'))
router.get('/exporters/', 
  permit('domain', 'user'), (req, res) => editClients(req, res, 'exporter'))
router.post('/exporters/delete', 
  permit('domain', 'user'), (req, res) => deleteClients(req, res, 'exporter'))


//======================================================
// Add exporter_id to res.locals for use in forms and tempaltes
//======================================================
router.param('exporter_id', async (req, res, next, exporter_id) => {
  res.locals.exporter = await res.locals.user.exporterById(exporter_id)

  // TODO: Figure out what the homePath was supposed to be used for. Back button?
  res.locals.homePath = req.originalUrl.match('(.+' + exporter_id + ')')[0]

  next()
})


module.exports = router;
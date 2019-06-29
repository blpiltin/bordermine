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


//------------------------------------------------------
// Path: /company/companyId/user/userId/edit/
// #Todo: Technically this should edit the user's account info
//------------------------------------------------------
router.get('/account', permit('owner'), (req, res) => editUser(req, res))
router.post('/account', permit('owner'), (req, res) => saveUser(req, res))

//------------------------------------------------------
// Path: /company/companyId/user/userId/edit/profile
// Edit the user's profile
//------------------------------------------------------
router.get('/profile', permit('owner'), (req, res) => editUserProfile(req, res))
router.post('/profile', permit('owner'), (req, res) => saveUserProfile(req, res))

//------------------------------------------------------
// Path: /company/companyId/user/userId/edit/company
// Edit the user's company (if owner)
//------------------------------------------------------
router.get('/company', permit('owner', 'owner'), (req, res) => 
  editCompany(req, res))
router.post('/company', permit('owner', 'owner'), (req, res) => 
  saveCompany(req, res))


//------------------------------------------------------
// Path: /companyId/edit/exporter
// Create new exporter, edit, save and list exporters
//------------------------------------------------------
router.get('/exporter', 
  permit('company', 'user'), (req, res) => newClient(req, res, 'exporter'))
router.post('/exporter', 
  permit('company', 'user'), (req, res) => createClient(req, res, 'exporter'))
router.get('/exporter/:clientId', 
  permit('company', 'user'), (req, res) => editClient(req, res, 'exporter'))
router.post('/exporter/:clientId', 
  permit('company', 'user'), (req, res) => saveClient(req, res, 'exporter'))
router.get('/exporter/:clientId/delete', 
  permit('company', 'user'), (req, res) => deleteClient(req, res, 'exporter'))
router.get('/exporters/', 
  permit('company', 'user'), (req, res) => editClients(req, res, 'exporter'))
router.post('/exporters/delete', 
  permit('company', 'user'), (req, res) => deleteClients(req, res, 'exporter'))


//------------------------------------------------------
// Add client to res.locals for use in forms and tempaltes
//------------------------------------------------------
router.param('clientId', async (req, res, next, clientId) => {
  res.locals.client = await res.locals.user.clientById(clientId)

  // TODO: Figure out what the homePath was supposed to be used for. Back button?
  res.locals.homePath = req.originalUrl.match('(.+' + clientId + ')')[0]

  next()
})


module.exports = router;
const debug = require('../../utils/debug').create('user_router.js')

const express = require('express')
const router = express.Router()

const { permit } = require('../middleware/permissions')

const { viewDashboard } = require('../controllers/dashboard_controller')

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
// Path: /company/companyId/user/userId/dashboard
// View Dashboard
//------------------------------------------------------
router.get('/dashboard', permit('owner'), (req, res) => viewDashboard(req, res))

//------------------------------------------------------
// Path: /company/companyId/user/userId/account
// Edit the user's account info
//------------------------------------------------------
router.get('/account', permit('owner'), (req, res) => editUser(req, res))
router.post('/account', permit('owner'), (req, res) => saveUser(req, res))

//------------------------------------------------------
// Path: /company/companyId/user/userId/profile
// Edit the user's profile
//------------------------------------------------------
router.get('/profile', permit('owner'), (req, res) => editUserProfile(req, res))
router.post('/profile', permit('owner'), (req, res) => saveUserProfile(req, res))

//------------------------------------------------------
// Path: /company/companyId/user/userId/company
// Edit the user's company (if owner)
//------------------------------------------------------
router.get('/company', permit('owner', 'owner'), (req, res) => 
  editCompany(req, res))
router.post('/company', permit('owner', 'owner'), (req, res) => 
  saveCompany(req, res))


//------------------------------------------------------
// Path: /company/companyId/user/userId/exporter
// Path: /company/companyId/user/userId/exporters
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
  if (!res.locals.route) { res.locals.route = {} }
  res.locals.route.clientId = clientId
  next()
})


module.exports = router;
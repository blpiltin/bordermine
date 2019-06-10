const express = require('express')
const router = express.Router()

const createError = require('http-errors')
const { viewDomain } = require('../controllers/domain_controller')
const { User, uploadsDir } = require('../models/user')

const { 
  getEmailFromPath,
  getUserNameFromEmail,
  getUserPathFromEmail
} = require('../utils/server_utils.js')


//======================================================
// View the domain (district) page
//======================================================

// router.get('/:domain', resolve, (req, res) => viewDomain(req, res))
router.get('/', (req,res) => viewDomain(req, res))


//------------------------------------------------------
// Route edit paths to the edit router
//------------------------------------------------------
router.use('/edit/:user', require('./edit_router'))


//======================================================
// User specific view routes
//======================================================

//------------------------------------------------------
// Route view paths to view router
//------------------------------------------------------
router.use('/:user', require('./view_router'))


//======================================================
// Setup up user res.locals.view properties for view paths
//======================================================
router.param('user', async (req, res, next, user) => {
  let email = getEmailFromPath(res.locals.view.domain, user)
  try {
    let owner = await User.findByEmail(email)
    res.locals.view.owner = owner
    res.locals.view.ownerId = owner.id
    res.locals.view.ownerName = getUserNameFromEmail(email)
    res.locals.view.ownerPath = getUserPathFromEmail(email)
    res.locals.view.uploadsPath = '/uploads/' + owner.id
    res.locals.view.uploadsDir = uploadsDir + '/' + owner.id + '/'

    // Make view nav data available in templates
		res.locals.view.nav = {}
		if (owner.role === 'teacher') {
			res.locals.view.nav.courses = await owner.courses
    }
    
    next()
  } catch (err) {
    next(createError(404))
  }
})


module.exports = router;
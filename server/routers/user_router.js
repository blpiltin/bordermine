const express = require('express')
const router = express.Router()

const { permit } = require('../middleware/permissions')

const { viewDashboard } = require('../controllers/dashboard_controller')


//------------------------------------------------------
// View Dashboard
//------------------------------------------------------
router.get('/dashboard', permit('owner'), (req, res) => viewDashboard(req, res))

//------------------------------------------------------
// Route edit paths to the edit router
//------------------------------------------------------
router.use('/edit', require('./edit_router'))


module.exports = router;
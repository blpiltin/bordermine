//======================================================
// home_router.js 
// 
// Description: Define routes for guest site users
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.1
// History:
//  - 0.0.1: Initial version.
//======================================================

const debug = require('../../utils/debug').create('home_router.js')

const express = require('express')
const router = express.Router()
const { redirect } = require('../middleware/permissions')
const { 
	viewHome, 
	userJoin, 
	sendActivationCode,
	userActivate, 
	viewLogin, 
	userLogin, 
	userLogout,
	sendPasswordResetCode,
	resetPassword
} = require('../controllers/home_controller')


//------------------------------------------------------
// A temporary route used to research the inner workings of 
// request and response objects.
//------------------------------------------------------
router.get('/test', (req, res) => {
	debug.log(req.protocol)
	debug.log(req.get('Host'))
	res.send(req.protocol + ' ' + req.get('Host'))
})

router.get('/', redirect, (req, res) => {
	if (res.locals.host) {
		// Repeat flash error and message for second redirect
		let error = req.query.error ? req.query.error : res.locals.error
		let message = req.query.message ? req.query.message : res.locals.message
		if (error) res.flash('error', error)
		if (message) res.flash('message', message)
		res.status(200).redirect('/' + res.locals.host)
	} else {
		viewHome(req, res)
	}
})

router.get('/join', redirect, (req, res) => res.render('home/join'))
router.post('/join', (req, res) => userJoin(req, res))
router.get('/activate', redirect, (req, res) => userActivate(req, res))
router.get('/login', redirect, (req, res) => viewLogin(req, res))
router.post('/login', (req, res) => userLogin(req, res))
router.get('/logout', (req, res) => userLogout(req, res))
router.get('/email/:for', redirect, (req, res) =>
	res.render('home/email', { for: req.params.for }))
router.post('/email/activation', (req, res) => sendActivationCode(req, res))
router.post('/email/password', (req, res) => sendPasswordResetCode(req, res))
router.get('/password', redirect, (req, res) => resetPassword(req, res))
router.post('/password', (req, res) => resetPassword(req, res))
router.get('/about', (req, res) => res.render('home/about'))


module.exports = router;
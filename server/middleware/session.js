//======================================================
// session.js 
// 
// Description: Routines for setting up authenticated user
//  session variables.
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.1
// History:
//  - 0.0.1: Initial version.
//======================================================

const debug = require('../../utils/debug').create('session.js')

const createError = require('http-errors')

const { User } = require('../models/user')


//------------------------------------------------------
// Middleware to aid in setting up res.locals.user
// variables based on session for use in templates and 
// for redirection.
//------------------------------------------------------
const populate = async (req, res, next) => {
	let user = null

	res.locals.path = req.path
	res.locals.back = req.headers.referrer || req.headers.referer

	// Set user info based on session
	if (req.session && req.session.userId) {
		
		try {
			user = await User.read(req.session.userId)
		} catch (err) {
			req.session = null
			return next(createError(404))
		}
		
		res.locals.user = user
		res.locals.user.domain = user.companyId
		res.locals.user.userPath = 
			`company/${user.companyId}/user/${user.id}`
		res.locals.user.dashboardPath = 
			`company/${user.companyId}/user/${user.id}/dashboard`
		res.locals.user.editPath = 
			`company/${user.companyId}/user/${user.id}/edit`
		res.locals.user.uploadsPath = '/uploads/' + user.id
		res.locals.user.uploadsDir = User.uploadsDir + '/' + user.id + '/'
	}

	res.locals.message = res.locals.flash.message
	res.locals.error = res.locals.flash.error

	next()
}


module.exports = { populate }

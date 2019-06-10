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

const { User, UPLOADS_DIR } = require('../models/user')
const { 
	getDomainFromEmail,
	getEditPathFromEmail, 
	getUserPathFromEmail, 
	getDashboardPathFromEmail
} = require('../utils/server_utils')


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
		res.locals.user.domain = getDomainFromEmail(user.email)
		res.locals.user.userPath = getUserPathFromEmail(user.email)
		res.locals.user.dashboardPath = getDashboardPathFromEmail(user.email)
		res.locals.user.editPath = getEditPathFromEmail(user.email)
		res.locals.user.uploadsPath = '/uploads/' + user.id
		res.locals.user.uploadsDir = UPLOADS_DIR + '/' + user.id + '/'

		// Make additional nav data available in templates
		if (user.role === 'teacher') {
			res.locals.courses = await user.courses
		}
	}
	res.locals.message = res.locals.flash.message
	res.locals.error = res.locals.flash.error
	next()
}


module.exports = { populate }

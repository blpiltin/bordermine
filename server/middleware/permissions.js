//======================================================
// permissions.js 
// 
// Description: Defines permissions routines to be used as middleware for
//  server.js.
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
// Version 0.0.3
// History:
//  - 0.0.1: Initial version.
//  - 0.0.2: Modify to use cookies instead of web tokens.
//  - 0.0.3: Add storage of user to res.locals.user for use in templates.
//======================================================

const debug = require('../../utils/debug').create('permit.js')

const createError = require('http-errors')


//------------------------------------------------------
// Check permissions based on user role.
// Preconditions: resolve must be called before this middleware
//  if anything but 'owner' (no params) permissions are passed.
//------------------------------------------------------
const permit = (users, roles) => {
  return async (req, res, next) => {
    let reject = true

    if (req.session && req.session.userId) {
      // So far we have authentication, 'owner' permission only

      if (users === 'owner' || users === 'all') {
        // Use for authentication purposes only. User should be logged in.
        reject = false
      } else if (users) {
        // Check for user's domain matching view domain
        if (users.domain === 'user' && res.locals.user.domain === res.locals.view.domain) {
          reject = false
        }
      }

      if (typeof roles === 'string' && roles !== res.locals.user.role) {
        reject = true
      }

      if (reject) {
        return next(createError(404))
      } else {
        next()
      }
    } else {
      // User not logged in
      let error = 'You do not have permission to access the requested resource.' +
        ' Please login before continuing.'
      res.flash('error', error)
      return res.status(401).redirect('/login')
    }
  }
}

// Redirect an authenticated user to the dashboard.
//------------------------------------------------------
const redirect = (req, res, next) => {
  if (req.session && req.session.userId) {
    // Flash any error or message query parameters before redirecting
    if (req.query.error) res.flash('error', req.query.error)
    if (req.query.message) res.flash('message', req.query.message)
    res.redirect(res.locals.user.dashboardPath)
  } else {
    next()
  }
}


module.exports = { permit, redirect }

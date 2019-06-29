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

      if (users === 'all') {
        // Any authenticated user permissions
        reject = false
      } else if (users === 'company' && 
        res.locals.user.companyId == res.locals.route.companyId) {
        // User who is also part of the company permissions
        reject = false
      } else if (users === 'owner' &&
        res.locals.user.companyId == res.locals.route.companyId &&
        res.locals.user.id == res.locals.route.userId) {
        // Exact match of logged in user and path permissions (most stringent)
        reject = false
      }

      if (roles) { reject = !canRole(res.locals.user.role, roles) }

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

//------------------------------------------------------
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

//======================================================
// Utils
//======================================================

//------------------------------------------------------
// Check to see if userRole has >= permissions of permittedRole
//------------------------------------------------------
const canRole = (userRole, permittedRole) => {
  let { User } = require('../models/user'),
      userLevel = User.roles.indexOf(userRole),
      permittedLevel = User.roles.indexOf(permittedRole)
  return userLevel <= permittedLevel
}


module.exports = { permit, redirect }

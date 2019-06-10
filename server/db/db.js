//======================================================
// db.js
//
// Description: Set up database connection and initialize
//  objection models.
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
// Version 0.0.1
// History:
//  - 0.0.1: Initial version.
//======================================================

const debug = require('../../utils/debug').create('db.js')

const env = require('../config/config').env

const config = require('./knexfile')[env]
const Knex = require('knex')(config)

const { Model } = require('objection')


//------------------------------------------------------
// Bind objection model base class to knex
//------------------------------------------------------
Model.knex(Knex)

//------------------------------------------------------
// Check to make sure we're using the correct database
//------------------------------------------------------
if (env !== 'production') {
  debug.log('Using database', config.connection.filename)
}


module.exports = { Knex }

//======================================================
// 20190328032323_create_users_table.js.js
//
// Description: Use the knex schema class to create the
//  users table. 
//
// NOTE: use 'knex migrate:latest' or 'knex migrate:rollback'
//  from within db directory.
//
// Version: 0.0.1
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

const { User } = require('../../models/user')


exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.increments()
    table.string('email').notNullable().unique()
    table.string('password').notNullable()
    table.enu('role', User.roles).notNullable()
    table.json('profile')
    table.string('activationCode')
    table.string('passwordResetCode')
    table.timestamp('activated')
    table.timestamp('created')
    table.timestamp('modified')
    table.integer('companyId').references('companies.id')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users')
}

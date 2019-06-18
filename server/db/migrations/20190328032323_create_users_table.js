//======================================================
// 20190328032323_create_users_table.js
//
// Description: Define the knex schema class to create the
//  users database table. 
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


exports.up = function (knex, Promise) {
  return knex.schema.createTable('users', function (table) {

    table.increments('id')
    table.integer('companyId').references('companies.id')
    
    table.string('email').notNullable().unique()
    table.string('password').notNullable()
    table.enu('role', User.roles).notNullable()
    table.jsonb('profile')
    table.string('activationCode')
    table.string('passwordResetCode')
    table.timestamp('activated')

    table.timestamp('created').defaultTo(knex.fn.now())
    table.timestamp('modified').defaultTo(knex.fn.now())

  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('users')
}

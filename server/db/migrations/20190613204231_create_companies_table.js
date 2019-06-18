//======================================================
// 20190613204231_create_companies_table.js
//
// Description: Define the knex schema class to create the
//  companies database table. 
//
// NOTE: use 'knex migrate:latest' or 'knex migrate:rollback'
//  from within db directory.
//
// Version: 0.0.1
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

const { Company } = require('../../models/company')


exports.up = function (knex, Promise) {
  return knex.schema.createTable('companies', function (table) {

    table.increments('id')
    table.integer('ownerId').notNullable().references('users.id')
    table.integer('contactId').notNullable().references('users.id')

    table.enu('type', Company.types).notNullable()
    table.string('name').notNullable().unique()
    table.jsonb('address').notNullable()
    table.string('logo')

    table.timestamp('created').defaultTo(knex.fn.now())
    table.timestamp('modified').defaultTo(knex.fn.now())

  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('companies')
}

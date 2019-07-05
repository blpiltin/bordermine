
//======================================================
// 20190613212119_create_clients_table.js
//
// Description: Define the knex schema class to create the
//  clients database table. 
//
// NOTE: use 'knex migrate:latest' or 'knex migrate:rollback'
//  from within db directory.
//
// Version: 0.0.1
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

const { Client } = require('../../models/client')


exports.up = function(knex, Promise) {
  return knex.schema.createTable('clients', function(table) {

    table.increments('id')
    table.integer('companyId').notNullable().references('companies.id')
    table.integer('executiveId').notNullable().references('users.id')

    table.enu('type', Client.types).notNullable()
    table.string('name').notNullable()
    table.jsonb('address')
    table.jsonb('contact')
    table.jsonb('extra')
    table.text('notes')

    table.boolean('archive')

    table.timestamp('created').defaultTo(knex.fn.now())
    table.timestamp('modified').defaultTo(knex.fn.now())

    table.unique(['companyId', 'name'])
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('clients')
}

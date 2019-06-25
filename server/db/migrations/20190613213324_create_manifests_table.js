//======================================================
// 20190613213324_create_manifests_table.js
//
// Description: Define the knex schema class to create the
//  manifests database table. 
//
// NOTE: use 'knex migrate:latest' or 'knex migrate:rollback'
//  from within db directory.
//
// Version: 0.0.1
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

exports.up = function(knex, Promise) {
  return knex.schema.createTable('manifests', function(table) {

    table.increments('id')

    table.integer('companyId').notNullable().references('companies.id')
    table.integer('originatorId').notNullable().references('users.id')
    table.integer('exporterId').references('clients.id')
    table.integer('consigneeId').references('clients.id')

    table.string('scn')
    table.string('accessCode').unique()
    table.text('notes')

    table.boolean('archive')
    
    table.timestamp('created')
    table.timestamp('modified')

    table.unique(['scn', 'companyId'])
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('manifests')
}

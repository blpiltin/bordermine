const { COMPANY_TYPES } = require('../../models/company')


exports.up = function(knex, Promise) {
  return knex.schema.createTable('companies', function(table) {
    table.increments()
    table.enu('type', COMPANY_TYPES).notNullable()
    table.integer('ownerId').notNullable().references('users.id')
    table.integer('contactId').notNullable().references('users.id')
    table.string('name').notNullable().unique()
    table.string('address1').notNullable()
    table.string('address2')
    table.string('city').notNullable()
    table.string('state').notNullable()
    table.string('postalCode').notNullable()
    table.string('country').notNullable()
    table.string('logo')
    table.timestamp('created')
    table.timestamp('modified')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('companies')
}

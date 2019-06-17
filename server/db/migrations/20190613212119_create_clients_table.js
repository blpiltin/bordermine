
exports.up = function(knex, Promise) {
  return knex.schema.createTable('clients', function(table) {
    table.increments()
    table.integer('companyId').notNullable().references('companies.id')
    table.integer('ownerId').references('users.id')
    table.string('name').notNullable().unique()
    table.string('address1').notNullable()
    table.string('address2')
    table.string('city').notNullable()
    table.string('state').notNullable()
    table.string('postalCode').notNullable()
    table.string('country').notNullable()
    table.json('contact')
    table.text('notes')
    table.timestamp('created')
    table.timestamp('modified')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('clients')
}

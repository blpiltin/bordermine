exports.up = function(knex, Promise) {
  return knex.schema.createTable('manifests', function(table) {
    table.increments()
    table.integer('companyId').notNullable().references('companies.id')
    table.integer('originatorId').notNullable().references('users.id')
    table.integer('clientId').references('clients.id')
    table.string('accessCode')
    table.text('notes')
    table.timestamp('created')
    table.timestamp('modified')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('manifests')
}

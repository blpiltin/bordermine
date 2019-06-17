exports.up = function(knex, Promise) {
  return knex.schema.createTable('items', function(table) {
    table.increments()
    table.integer('manifestId').notNullable().references('manifests.id')
    table.string('description')
    table.integer('quantity')
    table.text('notes')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('items')
}

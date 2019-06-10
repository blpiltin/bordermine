
exports.up = function(knex, Promise) {
  return knex.schema.createTable('courses', function(table) {
    table.increments()
    table.integer('userId').references('users.id').onDelete('CASCADE')
    table.string('name').notNullable()
    table.string('slug').notNullable()
    table.string('code')
    table.text('description')
    table.string('icon')
    table.timestamp('created')
    table.timestamp('modified')

    table.unique(['userId', 'name'])
    table.unique(['userId', 'slug'])
    table.unique(['userId', 'code'])
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('courses')
}

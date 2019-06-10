exports.up = function(knex, Promise) {
  return knex.schema.createTable('vocabularys', function(table) {
    table.increments()
    table.integer('courseId').references('courses.id').onDelete('CASCADE')
    table.string('word').notNullable()
    table.text('definition')
    table.string('image')
    
    table.unique(['courseId', 'word'])
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('vocabularys')
}

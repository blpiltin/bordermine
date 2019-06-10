exports.up = function(knex, Promise) {
  return knex.schema.createTable('objectives', function(table) {
    table.increments()
    table.integer('courseId').references('courses.id').onDelete('CASCADE')
    table.string('code')
    table.text('text').notNullable()
    
    table.unique(['courseId', 'code'])
    table.unique(['courseId', 'text'])
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('objectives')
};


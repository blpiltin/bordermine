const { USER_ROLES } = require('../../models/user')


exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.increments()
    table.string('email').notNullable().unique()
    table.string('password').notNullable()
    table.enu('role', USER_ROLES).notNullable()
    table.json('profile')
    table.string('activationCode')
    table.string('passwordResetCode')
    table.timestamp('activated')
    table.timestamp('created')
    table.timestamp('modified')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users')
}

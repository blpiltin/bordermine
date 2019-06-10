const debug = require('../utils/debug').create('site_view_domain_tests.js');

process.env.NODE_ENV = 'test'

const { WebDriver } = require('./utils/web_driver');
const driver = WebDriver.getInstance();

const { getDomainFromEmail } = require('../server/utils/server_utils');

var { Knex } = require('../server/db/db')

const { USER_CREDENTIALS } = require('../server/db/seeds/users_seed')


before(function(done) {
  Knex.migrate.rollback()
  .then(() => Knex.migrate.latest())
  .then(() => Knex.seed.run())
  .then(() => done())
})

describe('Domain View Test', () => {

  it('visiting domain page should return public view for guests.', async function () {
    let path = `${driver.HOST}/${getDomainFromEmail(USER_CREDENTIALS[2].email)}`;
    await driver.logout();
    await driver.get(path); // /:domain/:user
    await driver.expectLocationToBe(path);
    await driver.expectPageToContain('district homepage');
  });

  it('visiting domain page should return owner view for owners.');

  it('visiting domain page should redirect to branded view for hosted urls.');
});
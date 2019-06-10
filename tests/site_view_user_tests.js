const debug = require('../utils/debug').create('site_view_user_tests.js');

process.env.NODE_ENV = 'test'

const { WebDriver } = require('./utils/web_driver');
const driver = WebDriver.getInstance();

const { getUserPathFromEmail } = require('../server/utils/server_utils');

var { Knex } = require('../server/db/db')

const { USER_CREDENTIALS } = require('../server/db/seeds/users_seed')


before(function(done) {
  Knex.migrate.rollback()
  .then(() => Knex.migrate.latest())
  .then(() => Knex.seed.run())
  .then(() => done())
})

describe('User Profile View Test', () => {

  //------------------------------------------------------
  // Administrators, teachers and students belonging to this domain should 
  //  be able to edit their personal page and their dashboard will contain 
  //  the relevant tools.
  //------------------------------------------------------
  it('visiting personal page should return ownder view for owners (administrator, teacher, student)');

  //------------------------------------------------------
  // Non-owner users see the public view of the user's personal page page.  
  //------------------------------------------------------
  it('visiting personal page should return the public view of the personal page for other users');

  //------------------------------------------------------
  // Guests should be redirected to the login page.
  //------------------------------------------------------
  it('visiting personal page should be blocked for guests', async function() {
    this.timeout(driver.TIMEOUT);
    let path = `${driver.HOST}${getUserPathFromEmail(USER_CREDENTIALS[2].email)}`;
    await driver.logout();
    await driver.get(path); // /:domain/:user
    await driver.expectLocationToBe('/login');
    await driver.expectPageToContain('permission');
  });

  it('visiting personal page should be blocked when owner is not activated');
});
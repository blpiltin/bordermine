const debug = require('../utils/debug').create('site_edit_course_tests.js')

process.env.NODE_ENV = 'test'

const { WebDriver } = require('./utils/web_driver')
const driver = WebDriver.getInstance()

const { By }  = require('selenium-webdriver')

const { 
  getEditPathFromEmail,
  getUserPathFromEmail,
  getDashboardPathFromEmail
 } = require('../server/utils/server_utils')

var { Knex } = require('../server/db/db')

var { User } = require('../server/models/user')

const { USER_CREDENTIALS } = require('../server/db/seeds/users_seed')


before(async function() {
  await Knex.migrate.rollback()
  await Knex.migrate.latest()
  await Knex.seed.run()
})

describe('Edit User Course Test', function() {

  this.timeout(driver.TIMEOUT)

  let email = USER_CREDENTIALS[3].email
  let password = USER_CREDENTIALS[3].password
  
  let dashBoardPath = getDashboardPathFromEmail(email)
  let newCoursePath = getEditPathFromEmail(email) + '/course'

  let formData = {
    name: 'Test Course 1',
    slug: 'test-course-1',
    description: 'This is some sort of description.',
    icon: '/home/blpiltin/Projects/classmine/server/tests/fixtures/test_photo_1.jpg'
  }

  before(async function() { 
    await driver.logout()
    await driver.login(email, password) 
  })

  beforeEach(async function() { await Knex.seed.run() })
  
  it('clicking new course link should show new course page', async function() {
    // #Note: the below strategy is good for clicking hidden links
    let link = await driver.findElement(By.xpath('//*[@id="lnkNewCourse"]'))
    await driver.executeScript("arguments[0].click();", link)
    await driver.actions().pause(2000).perform(); 
    await driver.expectLocationToBe(newCoursePath)
    await driver.expectPageToContain('New Course')
  })

  it('filling out valid form and submitting should create new Course', async function() {
    await driver.get(driver.HOST + newCoursePath)
    await driver.findElement(By.name('name')).sendKeys(formData.name)
    await driver.findElement(By.name('slug')).sendKeys(formData.slug)
    await driver.findElement(By.name('description')).sendKeys(formData.description) 
    await driver.findElement(By.name('icon')).sendKeys(formData.icon)
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectPageToContain('curriculum edit')
  })

  it('selecting a course from the list should show course edit page', async function() {
    await driver.get(driver.HOST + dashBoardPath)
    let link = await driver.findElement(By.xpath('//*[@id="lnkEditCourse2"]'))
    await driver.executeScript("arguments[0].click();", link)
    await driver.actions().pause(2000).perform(); 
    await driver.expectLocationToBe(`${newCoursePath}/2`)
    await driver.expectPageToContain('curriculum edit page')
  })
})
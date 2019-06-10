const debug = require('../utils/debug').create('site_edit_user_tests.js')

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

describe('Edit User Profile Test', function() {

  this.timeout(driver.TIMEOUT)

  let email = USER_CREDENTIALS[2].email
  let password = USER_CREDENTIALS[2].password
  let profilePath = `${getEditPathFromEmail(email)}/profile`
  let formData = {
    firstName: 'Hungry', 
    lastName: 'Howie',
    room: 'B1234',
    phone: '111-222-3456 x123',
    bio: 'I am a great guy!'
  }
  
  before(async function() { 
    await driver.logout()
    await driver.login(email, password) 
  })

  beforeEach(async function() { await Knex.seed.run() })
  
  it('clicking profile link should show profile edit page', async function() {
    // #Note: the below strategy is good for clicking hidden links
    let link = await driver.findElement(By.xpath('//*[@id="lnkProfile"]'))
    await driver.executeScript("arguments[0].click();", link)
    await driver.actions().pause(2000).perform(); 
    await driver.expectLocationToBe(profilePath)
    await driver.expectPageToContain('name="firstName"')
    let user = await User.read(3);
    await driver.expectPageToContain('<input id="firstName" class="form-control" ' +
      'type="text" name="firstName" placeholder="Enter your first name" ' + 
      'value="' + user.profile.firstName + '" required="">')
  })

  it('filling out valid form and submitting should save profile', async function() {
    await driver.get(driver.HOST + profilePath)
    await driver.findElement(By.name('firstName')).sendKeys(formData.firstName)
    await driver.findElement(By.name('lastName')).sendKeys(formData.lastName)
    await driver.findElement(By.name('room')).sendKeys(formData.room)
    await driver.findElement(By.name('phone')).sendKeys(formData.phone)
    await driver.findElement(By.name('bio')).sendKeys(formData.bio);                                                                                             
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectLocationToBe(profilePath)
    await driver.expectPageToContain([
      'value="' + formData.firstName + '"', 
      'value="' + formData.lastName + '"', 
      'value="' + formData.room + '"', 
      'value="' + formData.phone + '"', 
      formData.bio 
    ])
  })

  it('filling out invalid form and submitting should show error', async function() {
    formData.phone = '111'
    await driver.get(driver.HOST + profilePath)
    await driver.findElement(By.name('firstName')).sendKeys(formData.firstName)
    await driver.findElement(By.name('lastName')).sendKeys(formData.lastName)
    await driver.findElement(By.name('room')).sendKeys(formData.room)
    await driver.findElement(By.name('phone')).sendKeys(formData.phone)
    await driver.findElement(By.name('bio')).sendKeys(formData.bio);                                                                                             
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectLocationToBe(profilePath)
    await driver.expectPageToContain('Please enter your phone number beginning with ' +
      'the area code. Use the letter "x" for the extension.')
  })

  it.skip('selecting photo and submitting should save profile', async function() {
    // #Todo: figure out how to test for this
  })

  it.skip('selecting photo and submitting twice should not delete photo', async function() {
    // #Todo: figure out how to test for this
  })

  it.skip('selecting invalid file and submitting should return error', async function() {
    // #Todo: figure out how to test for this
  })

  it.skip('clicking delete button should delete photo from profile', async function() {
    // #Todo: figure out how to test for this
  })

  it('clicking on live view link should show profile view page', async function() {
    let viewPath = `${driver.HOST}${getUserPathFromEmail(email)}`;
    await driver.get(driver.HOST + profilePath)
    await driver.findElement(By.id('btnView')).click()
    await driver.expectLocationToBe(viewPath)
    await driver.expectPageToContain('Test Teacher3')
  })

})

describe('Edit User Account Info Test', function() {

  this.timeout(driver.TIMEOUT)

  let email = USER_CREDENTIALS[2].email
  let password = USER_CREDENTIALS[2].password
  let accountPath = `${getEditPathFromEmail(email)}`
  let dashboardPath = `${getDashboardPathFromEmail(email)}`

  before(async function() { 
    await driver.logout()
    await driver.login(email, password) 
  })

  beforeEach(async function() { await Knex.seed.run() })
  
  it('clicking account link should show account info edit page', async function() {
    // #Note: the below strategy is good for clicking hidden links
    let link = await driver.findElement(By.xpath('//*[@id="lnkAccount"]'))
    await driver.executeScript("arguments[0].click();", link)
    await driver.actions().pause(2000).perform()
    await driver.expectLocationToBe(accountPath)
    await driver.expectPageToContain('name="role"')
  })

  it('submitting correct passwords should change user password', async function() {
    let newPassword = 'abc123jjj!'
    await driver.get(driver.HOST + accountPath)
    await driver.findElement(By.name('currentPassword')).sendKeys(password)
    await driver.findElement(By.name('password')).sendKeys(newPassword)
    await driver.findElement(By.name('passwordConfirm')).sendKeys(newPassword)                                                                                            
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.actions().pause(2000).perform()
    await driver.expectLocationToBe(dashboardPath)
    await driver.expectPageToContain('alert-success')
  })

  it('submitting incorrect current password should show error', async function() {
    let newPassword = 'abc123jjj!'
    await driver.get(driver.HOST + accountPath)
    await driver.findElement(By.name('currentPassword')).sendKeys('whatever')
    await driver.findElement(By.name('password')).sendKeys(newPassword)
    await driver.findElement(By.name('passwordConfirm')).sendKeys(newPassword)                                                                                            
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.actions().pause(2000).perform()
    await driver.expectLocationToBe(accountPath)
    await driver.expectPageToContain('alert-danger')
  })

  it('submitting invalid new password should not submit', async function() {
    let newPassword = 'abc123jjj!'
    await driver.get(driver.HOST + accountPath)
    await driver.findElement(By.name('currentPassword')).sendKeys(password)
    await driver.findElement(By.name('password')).sendKeys('whatever')
    await driver.findElement(By.name('passwordConfirm')).sendKeys('whatever')                                                                                            
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.actions().pause(2000).perform()
    await driver.expectLocationToBe(accountPath)
    await driver.expectPageToContain('was-validated')
  })

  it('submitting non-matching password confirm should show error', async function() {
    let newPassword = 'abc123jjj!'
    await driver.get(driver.HOST + accountPath)
    await driver.findElement(By.name('currentPassword')).sendKeys(password)
    await driver.findElement(By.name('password')).sendKeys(newPassword)
    await driver.findElement(By.name('passwordConfirm')).sendKeys(newPassword + 'a')                                                                                            
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.actions().pause(2000).perform()
    await driver.expectLocationToBe(accountPath)
    await driver.expectPageToContain('alert-danger')
  })
})
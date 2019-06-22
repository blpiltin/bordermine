//======================================================
// site_edit_user_tests.js 
// 
// Description: Defines functional tests for the site
//  edit user pages including password and profile changes.
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.1
// History:
//  - 0.0.1: Initial tests
//======================================================

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

const fixturesDir = require('path').join(__dirname, './fixtures')


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
    title: 'President',
    phone: '+22 111-222-3456 x123'
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
    await driver.findElement(By.name('title')).sendKeys(formData.title)
    await driver.findElement(By.name('phone')).sendKeys(formData.phone)                                                                                          
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectLocationToBe(profilePath)
    await driver.expectPageToContain([
      'value="' + formData.firstName + '"', 
      'value="' + formData.lastName + '"', 
      'value="' + formData.title + '"', 
      'value="' + formData.phone + '"'
    ])
  })

  it('filling out invalid form and submitting should show error', async function() {
    await driver.get(driver.HOST + profilePath)
    await driver.findElement(By.name('firstName')).sendKeys(formData.firstName)
    await driver.findElement(By.name('lastName')).sendKeys(formData.lastName)
    await driver.findElement(By.name('phone')).sendKeys('111')
    await driver.findElement(By.name('title')).sendKeys(formData.title);                                                                                             
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectLocationToBe(profilePath)
    await driver.expectPageToContain('Please enter your phone number beginning with ' +
      'the area code. Use the letter "x" for the extension.')
  })

  it('selecting photo and submitting should save profile', async function() {
    await driver.get(driver.HOST + profilePath)
    await fillProfileForm(formData, 'test_photo_1.jpg')
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectLocationToBe(profilePath)
    await driver.expectPageToContain('test_photo_1.jpg')
  })

  it('selecting photo and saving twice should not delete photo', async function() {
    await driver.get(driver.HOST + profilePath)
    await fillProfileForm(formData, 'test_photo_1.jpg')
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectLocationToBe(profilePath)
    await driver.expectPageToContain('test_photo_1.jpg')
    await driver.get(driver.HOST + profilePath)
    formData.title = 'Vice President'
    await fillProfileForm(formData)
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectLocationToBe(profilePath)
    await driver.expectPageToContain('test_photo_1.jpg')
  })

  it('selecting invalid file and submitting should return error', async function() {
    await driver.get(driver.HOST + profilePath)
    await fillProfileForm(formData, 'test_file_1.pdf')
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectLocationToBe(profilePath)
    await driver.expectPageToContain('alert')
  })

  it('clicking delete button should delete photo from profile', async function() {
    await driver.get(driver.HOST + profilePath)
    await fillProfileForm(formData, 'test_photo_1.jpg')
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectPageToContain('test_photo_1.jpg')
    await driver.get(driver.HOST + profilePath)
    await driver.findElement(By.id('btnDeletePhoto')).click()
    await driver.expectLocationToBe(profilePath)
    await driver.expectPageToContain('input id="photo"')
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

//======================================================
// Utils
//======================================================

const fillProfileForm = async (formData, fileName) => {
  await driver.findElement(By.name('firstName')).sendKeys(formData.firstName)
  await driver.findElement(By.name('lastName')).sendKeys(formData.lastName)
  await driver.findElement(By.name('phone')).sendKeys(formData.phone)
  await driver.findElement(By.name('title')).sendKeys(formData.title)
  if (fileName) {
    await driver.findElement(By.name('photo')).sendKeys(fixturesDir + '/' + fileName)
  }
}
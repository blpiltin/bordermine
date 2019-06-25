//======================================================
// site_edit_company_tests.js 
// 
// Description: Defines functional tests for the site
//  edit company pages.
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.1
// History:
//  - 0.0.1: Initial tests
//======================================================

const debug = require('../utils/debug').create('site_edit_client_tests.js')

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

const { USER_CREDENTIALS } = require('../server/db/seeds/users_seed')
const { getRandomCompanyData } = require('../server/db/seeds/companies_seed')

const fixturesDir = require('path').join(__dirname, './fixtures')

const SITE_TITLE = process.env.SITE_TITLE


before(async function() {
  await Knex.migrate.rollback()
  await Knex.migrate.latest()
  await Knex.seed.run()
})

describe.only('Edit Client Page Access', function () {
  this.timeout(driver.TIMEOUT)

  beforeEach(async function() { 
    await driver.logout()
  })

  //------------------------------------------------------
  // Test with no login
  //------------------------------------------------------
  it('guests should not have access to it', async function () {
    let clientPath = `${getEditPathFromEmail(USER_CREDENTIALS[0].email)}/client`

    await driver.get(driver.HOST + clientPath)
    await driver.expectPageToContain('Error')
  })

  //------------------------------------------------------
  // Test with user from company 2 but path from company 1
  //------------------------------------------------------
  it('users from other companys should not have access to it', async function () {
    let clientPath = `${getEditPathFromEmail(USER_CREDENTIALS[0].email)}/client`
        email = USER_CREDENTIALS[3].email,
        password = USER_CREDENTIALS[3].password

    await driver.login(email, password)
    await driver.get(driver.HOST + clientPath)
    await driver.expectPageToContain('Error')
  })

})

describe('New Client Page', function () {

  this.timeout(driver.TIMEOUT)

  let email = USER_CREDENTIALS[0].email,
      password = USER_CREDENTIALS[0].password,
      newClientPath = `${getEditPathFromEmail(email)}/client`,
      formData

  before(async function() { 
    await driver.logout()
    await driver.login(email, password) 
  })

  beforeEach(async function() { 
    formData = getRandomCompanyData()
    await Knex.seed.run() 
  })

  it('clicking company link should show it for owner', async function() {
    // #Note: the below strategy is good for clicking hidden links
    let link = await driver.findElement(By.xpath('//*[@id="lnkCompany"]'))
    await driver.executeScript("arguments[0].click();", link)
    await driver.actions().pause(2000).perform()
    await driver.expectLocationToBe(companyPath)
    await driver.expectPageToContain('name="address.line1"')
  })

  it('clicking cancel button should return user to dashboard', async function() {
    await driver.get(driver.HOST + companyPath)
    await driver.findElement(By.id('btnCancel')).click()
    await driver.expectLocationToBe(getDashboardPathFromEmail(email))
    await driver.expectTitleToBe(`${SITE_TITLE} | Dashboard`)
  })

  it('filling out valid form and submitting should save company', async function() {
    await driver.get(driver.HOST + companyPath)
    await fillCompanyForm(formData)                                                                                    
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectLocationToBe(companyPath)
    await driver.expectPageToContain([
      'value="' + formData.name + '"', 
      'value="' + formData.address.line1 + '"'
    ])
  })

  it('cancelling after save should return user to dashboard', async function() {
    await driver.get(driver.HOST + companyPath)
    await fillCompanyForm(formData)                                                                                    
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.actions().pause(1000).perform()
    await driver.findElement(By.id('btnCancel')).click()
    await driver.expectLocationToBe(getDashboardPathFromEmail(email))
    await driver.expectTitleToBe(`${SITE_TITLE} | Dashboard`)
  })

  it('selecting logo and submitting should save logo', async function() {
    await driver.get(driver.HOST + companyPath)
    await fillCompanyForm(formData, 'test_photo_1.jpg')
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectLocationToBe(companyPath)
    await driver.expectPageToContain('test_photo_1.jpg')
  })

  it('selecting logo and saving twice should not delete logo', async function() {
    await driver.get(driver.HOST + companyPath)
    await fillCompanyForm(formData, 'test_photo_1.jpg')
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectLocationToBe(companyPath)
    await driver.expectPageToContain('test_photo_1.jpg')
    await driver.get(driver.HOST + companyPath)
    formData.postalCode = '77777'
    await fillCompanyForm(formData)
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectLocationToBe(companyPath)
    await driver.expectPageToContain('test_photo_1.jpg')
  })

  it('selecting invalid file and submitting should return error', async function() {
    await driver.get(driver.HOST + companyPath)
    await fillCompanyForm(formData, 'test_file_1.pdf')
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectLocationToBe(companyPath)
    await driver.expectPageToContain('alert')
  })

  it('clicking delete button should delete logo from profile', async function() {
    await driver.get(driver.HOST + companyPath)
    await fillCompanyForm(formData, 'test_photo_1.jpg')
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectPageToContain('test_photo_1.jpg')
    await driver.get(driver.HOST + companyPath)
    await driver.findElement(By.id('btnDeletePhoto')).click()
    await driver.expectLocationToBe(companyPath)
    await driver.expectPageToContain('input id="logo"')
  })

})


//======================================================
// Utils
//======================================================

const fillCompanyForm = async (formData, fileName) => {
  await driver.findElement(By.name('name')).sendKeys(formData.name)
  await driver.findElement(By.name('address.line1')).sendKeys(formData.address.line1)
  await driver.findElement(By.name('address.line2')).sendKeys(formData.address.line2)
  await driver.findElement(By.name('address.city')).sendKeys(formData.address.city)
  await driver.findElement(By.name('address.state')).sendKeys(formData.address.state)
  await driver.findElement(By.name('address.postalCode')).sendKeys(formData.address.postalCode)
  await driver.findElement(By.name('address.country')).sendKeys(formData.address.country)
  if (fileName) {
    await driver.findElement(By.name('logo')).sendKeys(fixturesDir + '/' + fileName)
  }
}
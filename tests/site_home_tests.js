//======================================================
// site_home_tests.js 
// 
// Description: Defines functional tests for the site
//  home pages.
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.1
// History:
//  - 0.0.1: Initial tests
//======================================================

const debug = require('../utils/debug').create('site_home_tests.js')

process.env.NODE_ENV = 'test'

const { WebDriver } = require('./utils/web_driver')
const driver = WebDriver.getInstance()

const { By }  = require('selenium-webdriver')
const { expect } = require('chai')

const sinon = require('sinon')

const { mailer } = require('../server/utils/mailer')

var { Knex } = require('../server/db/db')

const { USER_CREDENTIALS } = require('../server/db/seeds/users_seed')

require('../server/config/config')
const SITE_TITLE = process.env.SITE_TITLE


before(function(done) {
  Knex.migrate.rollback()
  .then(() => Knex.migrate.latest())
  .then(() => Knex.seed.run())
  .then(() => done())
})

describe('Home Page Test', () => {

  before(async function() {
    await driver.logout()
  })

  it('should go to homepage and check title is Bordermine Homepage', async function() {
    await driver.get(driver.HOST)
    let title = await driver.getTitle()
    expect(title).to.equal(`${SITE_TITLE} | Home`)
  })
})

describe('Navbar Test', () => {
  before(async function() {
    await driver.logout()
    await driver.get(driver.HOST + '/join')
  })

  it('should return to homepage when logo label clicked', async function() {
    await driver.findElement(By.id('lbl-logo')).click()
    let title = await driver.getTitle()
    expect(title).to.equal(`${SITE_TITLE} | Home`)
  })

  it('should return to homepage when Home menu clicked', async function() {
    await driver.findElement(By.linkText('Home')).click()
    let title = await driver.getTitle()
    expect(title).to.equal(`${SITE_TITLE} | Home`)
  })

})

describe('User Join Test', () => {

  let fake

  beforeEach((done) => {
    fake = sinon.fake()
    sinon.replace(mailer, 'sendActivation', fake)
    done()
  })
  
  afterEach((done) => {
    sinon.restore()
    done()
  })

  it('clicking join button should go to join page', async function() {
    await driver.get(driver.HOST)
    await driver.findElement(By.id('btnJoin')).click()
    let title = await driver.getTitle()
    expect(title).to.equal(`${SITE_TITLE} | Join`)
  })

  it('submitting valid form should redirect to homepage with activation message', async function() {
    this.timeout(driver.TIMEOUT)
    await driver.get(driver.HOST + '/join')
    await driver.findElement(By.name('user.profile.firstName')).sendKeys('Test')
    await driver.findElement(By.name('user.profile.lastName')).sendKeys('User1')
    await driver.findElement(By.name('user.email')).sendKeys('test1@whoever.com')
    await driver.findElement(By.xpath('//*[@id="company.type"]/option[2]')).click()
    await driver.findElement(By.name('company.name')).sendKeys('Test Company 1')
    await driver.findElement(By.name('company.address.line1')).sendKeys('123 Test Road')
    await driver.findElement(By.name('company.address.line2')).sendKeys('Test Suite 1')
    await driver.findElement(By.name('company.address.city')).sendKeys('Test City')
    await driver.findElement(By.name('company.address.state')).sendKeys('Test State')
    await driver.findElement(By.name('company.address.postalCode')).sendKeys('12345')
    await driver.findElement(By.name('company.address.country')).sendKeys('Test Country')
    await driver.findElement(By.name('user.password')).sendKeys('123abc!')
    await driver.findElement(By.name('user.passwordConfirm')).sendKeys('123abc!')
    await driver.findElement(By.id('btnSubmit')).click()
    //await driver.actions().pause(2000).perform();   // #example #pause
    let title = await driver.getTitle()
    expect(title).to.equal(`${SITE_TITLE} | Home`)
    let html = await driver.getPageSource()
    expect(html).to.contain('account was succesfully created')
    expect(fake.callCount).to.equal(1)
  })
})

describe.skip('Account Activation Test', () => {
  // #Todo: Figure out how to test for this
  // #Hint: Use fakes to intercept activation code and then get the url

  it('clicking activation link should activate account', async function() {
    
  })

  it('providing wrong activation code should present error', async function() {

  })
})


describe('Send Activation Link Test', function() {

  this.timeout(driver.TIMEOUT)

  before(function(done) { Knex.seed.run().then(() => done()) })

  beforeEach(async function() {
    driver.logout()
  })

  it('clicking activation reset button should show email page', async function() {
    this.timeout(driver.TIMEOUT)
    await driver.get(driver.HOST + '/join')
    await driver.findElement(By.id('btnSendActivation')).click()
    await driver.expectLocationToBe('/email/activation')
  })

  it('submitting a valid email should send email and redirect to homepage with '
      + 'reset message', async function() {

    let fake = sinon.fake()
    sinon.replace(mailer, 'sendActivation', fake)
    await sendActivationLinkRequest(USER_CREDENTIALS[0].email)
    let title = await driver.getTitle()
    expect(title).to.equal(`${SITE_TITLE} | Home`)
    let html = await driver.getPageSource()
    expect(html).to.contain('activation link has been sent')
    expect(fake.callCount).to.equal(1)
    sinon.restore()

  })

  it('submitting an invalid email should not send email but should redirect to '
      + 'homepage with reset message', async function() {

    let fake = sinon.fake()
    sinon.replace(mailer, 'sendActivation', fake)
    await sendActivationLinkRequest('whatever@whatever.com')
    let title = await driver.getTitle()
    expect(title).to.equal(`${SITE_TITLE} | Home`)
    let html = await driver.getPageSource()
    expect(html).to.contain('activation link has been sent')
    expect(fake.callCount).to.equal(0)
    sinon.restore()
  })
  
})

describe('Login Test', () => {
  
  before(function(done) { Knex.seed.run().then(() => done()) })

  beforeEach(async function() {
    driver.logout()
  })

  it('clicking login button should show login page', async function() {
    this.timeout(driver.TIMEOUT)
    await driver.get(driver.HOST)
    await driver.findElement(By.id('lnkLogin')).click()
    await driver.expectLocationToBe('/login')
  })

  it('logging in active user should redirect to user dashboard', async function() {
    this.timeout(driver.TIMEOUT)
    await driver.login(USER_CREDENTIALS[2].email, USER_CREDENTIALS[2].password)
    await driver.expectLocationToBe('/dashboard')
  })

  it('logging in inactive user should redirect to home page', async function() {
    this.timeout(driver.TIMEOUT)
    await driver.login(USER_CREDENTIALS[1].email, USER_CREDENTIALS[1].password)
    await driver.expectTitleToBe(`${SITE_TITLE} | Home`)
    let html = await driver.getPageSource()
    expect(html).to.contain('problem')
    expect(html).to.contain('activation link')
  })

  it('logging in with wrong credentials should show error', async function() {
    this.timeout(driver.TIMEOUT)
    await driver.login(USER_CREDENTIALS[1].email, USER_CREDENTIALS[2].password)
    await driver.expectLocationToBe('/login')
    await driver.expectPageToContain(['error', 'password'])
  })
})

describe('Password Reset Test', function() {

  this.timeout(driver.TIMEOUT)

  before(function(done) { Knex.seed.run().then(() => done()) })

  beforeEach(async function() {
    driver.logout()
  })

  it('clicking password reset button should show email page', async function() {
    this.timeout(driver.TIMEOUT)
    await driver.get(driver.HOST + '/login')
    await driver.findElement(By.id('btnResetPassword')).click()
    await driver.expectLocationToBe('/email')
  })

  it('submitting a valid email should send email and redirect to homepage with '
      + 'reset message', async function() {

    let fake = sinon.fake()
    sinon.replace(mailer, 'sendPasswordReset', fake)
    await sendPasswordResetRequest(USER_CREDENTIALS[1].email)
    let title = await driver.getTitle()
    expect(title).to.equal(`${SITE_TITLE} | Home`)
    let html = await driver.getPageSource()
    expect(html).to.contain('reset code has been sent')
    expect(fake.callCount).to.equal(1)
    sinon.restore()

  })

  it('submitting an invalid email should not send email but should redirect to '
      + 'homepage with reset message', async function() {

    let fake = sinon.fake()
    sinon.replace(mailer, 'sendPasswordReset', fake)
    await sendPasswordResetRequest('whatever@whatever.com')
    let title = await driver.getTitle()
    expect(title).to.equal(`${SITE_TITLE} | Home`)
    let html = await driver.getPageSource()
    expect(html).to.contain('reset code has been sent')
    expect(fake.callCount).to.equal(0)
    sinon.restore()
  })

  it('submitting valid data should allow user to reset password', async function() {
    // Fake the sending of the reset code request and get the code from fake
    let fake = sinon.fake()
    sinon.replace(mailer, 'sendPasswordReset', fake)
    let email = USER_CREDENTIALS[1].email
    await sendPasswordResetRequest(email)
    let code = fake.lastCall.args[0].passwordResetCode
    let url = `${driver.HOST}/password?code=${code}`
    expect(fake.callCount).to.equal(1)
    sinon.restore()

    // Click on the URL using the cdoe from fake
    await driver.get(url)
    await driver.findElement(By.name('email')).sendKeys(email)
    await driver.findElement(By.name('password')).sendKeys('amazing123')
    await driver.findElement(By.name('passwordConfirm')).sendKeys('amazing123')
    await driver.findElement(By.id('btnSubmit')).click()
    await driver.expectLocationToBe('/login')
    let html = await driver.getPageSource()
    expect(html).to.contain('login to continue')
  })
})


//======================================================
// Utils
//======================================================

const sendPasswordResetRequest = async function(email) {
  await driver.get(driver.HOST + '/email/password')
  await driver.findElement(By.name('email')).sendKeys(email)
  await driver.findElement(By.id('btnSubmit')).click()
}

const sendActivationLinkRequest = async function(email) {
  await driver.get(driver.HOST + '/email/activation')
  await driver.findElement(By.name('email')).sendKeys(email)
  await driver.findElement(By.id('btnSubmit')).click()
}
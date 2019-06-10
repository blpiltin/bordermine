const debug = require('../../utils/debug').create('web_driver.js');

const { expect } = require('chai');
const { Builder, By }  = require('selenium-webdriver');


// Set up the webdriver as a singleton
//------------------------------------------------------
const WebDriver = (function() {
  
  let _driver;

  function createInstance() {

    debug.log('Creating web driver instance.');

    require('../../server/server');
    
    let driver = new Builder().forBrowser('firefox').build();

    driver.TIMEOUT = 30000;
    driver.HOST = "http://localhost:3000";
    
    driver.login = async (username, password) => {
        await driver.get(driver.HOST + '/login');
        await driver.findElement(By.name('email')).sendKeys(username);
        await driver.findElement(By.name('password')).sendKeys(password);
        await driver.findElement(By.id('btnSubmit')).click(); 
      };
  
    driver.logout = async () => {
      await driver.get(driver.HOST + '/logout');
    };
  
    driver.expectLocationToBe = async (path) => {
      let location = await driver.getCurrentUrl();
      expect(location).to.contain(path);  // #Todo: fix this to be more precise
    };
    
    driver.expectTitleToBe = async (title) => {
      let html = await driver.getTitle();
      expect(html).to.equal(title);
    },
    
    driver.expectPageToContain = async function(text) {
      let html = await driver.getPageSource();
      if (typeof text === 'string') {
        expect(html).to.contain(text);
      } else {
        for (str in text) {
          expect(html).to.contain(str);
        }
      }
    }

    driver.logPage = async function(stream) {
      let html = await driver.getPageSource()
      stream.log(html)
    }

    beforeEach(function() {
      this.timeout(driver.TIMEOUT);
    });

    before(async function() {
      this.timeout(driver.TIMEOUT);
      try {
        await driver.get(driver.HOST);
      } catch (err) {
        console.log(err.message);
      }
    });

    after(async function() {
      this.timeout(driver.TIMEOUT);
      try {
        driver && await driver.quit();
      } catch (err) {
        console.log(err.message);
      }
    });

    return driver;
  }

  return {
    getInstance: function () {
      if (!_driver) {
        _driver = createInstance();
      }
      return _driver;
    }
  };
})();


module.exports = { WebDriver };
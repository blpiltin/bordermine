//======================================================
// debug_tests.js 
// 
// Description: Defines integration tests for debug.js
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
// Version 0.1.1
// History:
//  - 0.0.1: Initial tests
//  - 0.1.1: Add test for auto stringify JSON objects
//======================================================

const {expect} = require('chai');
const fs = require('fs');
const debug = require('../debug').create();

const debug1 = require('../debug').create();
const debug2 = require('../debug').create();

describe('Debug', () => {

  let getString = () => 'Testing on ' + new Date();

  before(() => {
    debug1.toLog('debug1_tests.log');
    debug2.toLog('debug2_tests.log');
  });

  beforeEach(() => {
    debug1.on();
    debug2.on();
  });

  after(() => {
    fs.exists('debug1_tests.log', () => {
      fs.unlinkSync('debug1_tests.log');
    });
    fs.exists('debug2_tests.log', () => {
      fs.unlinkSync('debug2_tests.log');
    });
  });

  it('should be on when first created', () => {
    let str1 = getString();
    let logged = debug1.log(str1);
    expect(logged).to.equal(str1);
  });

  it('should be able to turn on and off', () => {
    let str1 = getString();
    debug1.off();
    let logged = debug1.log(str1);
    expect(logged).to.be.false;
    debug1.on();
    logged = debug1.log(str1);
    expect(logged).to.equal(str1);
  });

  it('should not interfere with another debug object', () => {
    let str1 = getString();
    let str2 = getString() + 2;
    let logged1 = debug1.log(str1);
    let logged2 = debug2.log(str2);
    expect(logged1 === logged2);
    debug2.off();
    logged1 = debug1.log(str1);
    logged2 = debug2.log(str1);
    expect(logged1 !== logged2);
  });

  it('should log a matching tag', () => {
    let str1 = getString();
    let tag = "@ Test 1";
    debug1.on(tag);
    let logged = debug1.log(str1);
    expect(logged).to.be.false;
    logged = debug1.log(tag, str1);
    expect(logged).to.equal(tag + ' ' + str1);
  });

  it('should log multiple matching tags', () => {
    let str1 = getString();
    let tags = ['@ Test 1', '@ Tag 2', 'Thing 3'];
    debug1.on(tags);
    let logged = debug1.log(str1);
    expect(logged).to.be.false;
    logged = debug1.log(tags[1], str1);
    expect(logged).to.equal(tags[1] + ' ' + str1);
    logged = debug1.log(tags[2], str1);
    expect(logged).to.equal(tags[2] + ' ' + str1);
  });

  it('should use a prefix when set', () => {
    let str1 = getString();
    let prefix = "test.js";
    debug1.setPrefix(prefix)
    let logged = debug1.log(str1);
    expect(logged).to.equal(prefix + ': ' + str1);
  });

  it('should automatically convert objects to strings', () => {
    let str1 = { hello:'hello', there:'there', how:'how'};
    let str2 = "normal string";
    let str3 = "normal string too";
    debug1.setPrefix();
    let logged = debug1.log(str2, str1, str3);
    expect(logged).to.equal('normal string {"hello":"hello","there":"there","how":"how"} normal string too');
  });
});

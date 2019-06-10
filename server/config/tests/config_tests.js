//======================================================
// config_tests.js 
// 
// Description: Defines integration tests for config.js
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.1
// History:
//  - 0.0.1: Initial tests
//======================================================

const {expect} = require('chai')


before(async() => {
  process.env.NODE_ENV = 'test'
  require('../config')
})

describe('Config', () => {

  it('should load all variables from private config file', async() => {
    expect(process.env.TEST_PRIVATE_ALL).to.equal('variable-for-private-all')
    expect(process.env.TEST_PRIVATE_DEVELOPMENT).to.equal(undefined)
  })

  it('should load specific environment variables from private config file', async() => {
    expect(process.env.TEST_PRIVATE_TEST).to.equal('variable-for-private-test')
    expect(process.env.TEST_PRIVATE_DEVELOPMENT).to.equal(undefined)
  })

  it('should load all variables from public config file', async() => {
    expect(process.env.TEST_PUBLIC_ALL).to.equal('variable-for-public-all')
    expect(process.env.TEST_PUBLIC_DEVELOPMENT).to.equal(undefined)
  })

  it('should load specific environment variables from public config file', async() => {
    expect(process.env.TEST_PUBLIC_TEST).to.equal('variable-for-public-test')
    expect(process.env.TEST_PUBLIC_DEVELOPMENT).to.equal(undefined)
  })
})

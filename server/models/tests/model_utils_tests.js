//======================================================
// model_utils_tests.js
//
// Description: Unit tests for model_utils.js
//
// Version: 0.0.1
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

process.env.NODE_ENV = 'test'

const { expect } = require('chai')

const { nullifyEmpty } = require('../model_utils')


describe('Models Utils', function() { 

  describe('nullifyEmpty', function() {

    it('should make empty object fields null', function(done) {
      let obj = { string: 'abc', empty1: '', number: 123, empty2: '' }
      nullifyEmpty(obj)
      expect(obj.empty1).to.equal(null)
      expect(obj.empty2).to.equal(null)
      done()
    })

    it('should not modify non-empty object fields', function(done) {
      let obj = { string: 'abc', empty1: '', number: 123, empty2: '' }
      nullifyEmpty(obj)
      expect(obj.string).to.equal('abc')
      expect(obj.number).to.equal(123)
      done()
    })

  })

})


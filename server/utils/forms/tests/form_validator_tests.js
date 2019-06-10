//======================================================
// form_validator_tests.js 
// 
// Description: Defines integration tests for form_validator.js
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
// Version 0.0.2
// History:
//  - 0.0.1: Initial tests.
//  - 0.0.2: Breakout tests for seperate generator and validator objects.
//======================================================

const debug = require('../../../../utils/debug').create('form_validator_tests.js');

const {expect} = require('chai');

const {FormValidator} = require('../form_validator.js');
const forms = require('./test_forms.json');

describe('FormValidator', () => {

  it('should validate valid form fields', () => {
    let fv = new FormValidator(forms['test']);
    let data = {
      email: 'test@email.com',
      password: 'user1Pass!',
      passwordConfirm: 'user1Pass!',
      role: 'teacher'
    };
    let errors = fv.validate(data);
    expect(errors).to.be.null;
    data = {
      email: 'who@ever.where.com',
      password: '123abc!',
      passwordConfirm: '123abc!',
      role: 'student'
    };
    errors = fv.validate(data);
    expect(errors).to.be.null;
  });

  it('should reject missing input fields', () => {
    let fv = new FormValidator(forms['test']);
    let data = {
      password: 'abc123!',
      passwordConfirm: 'abc123!',
      role: 'teacher'
    };
    let errors = fv.validate(data);
    expect(errors.length).to.equal(1);
  });

  it('should reject missing select fields', () => {
    let fv = new FormValidator(forms['test']);
    let data = {
      email: 'test@email.com',
      password: 'abc123!',
      passwordConfirm: 'abc123!'
    };
    let errors = fv.validate(data);
    expect(errors.length).to.equal(1);
  });

  it('should reject invalid pattern fields', () => {
    let fv = new FormValidator(forms['test']);
    let data = {
      email: 'test@email.com',
      password: 'abc 123',
      passwordConfirm: 'abc 123',
      role: 'teacher'
    };
    let errors = fv.validate(data);
    expect(errors.length).to.equal(1);
  });

  it('should reject unequal matching fields', () => {
    let fv = new FormValidator(forms['test']);
    let data = {
      email: 'test@email.com',
      password: 'abc123!',
      passwordConfirm: 'ab123!',
      role: 'teacher'
    };
    let errors = fv.validate(data);
    expect(errors.length).to.equal(1);
  });

  it('should skip modelOnly fields', () => {
    let fv = new FormValidator(forms['test']);
    let data = {
      email: 'test@email.com',
      password: 'user1Pass!',
      passwordConfirm: 'user1Pass!',
      role: 'teacher',
      modelEmail: 'somethingnotvalid'
    };
    let errors = fv.validate(data);
    expect(errors).to.be.null;
  })
});

//======================================================
// form_generator_tests.js 
// 
// Description: Defines unit tests for form_generator.js
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.2
// History:
//  - 0.0.1: Initial tests.
//  - 0.0.2: Breakout tests for separate generator and validator objects.
//======================================================

const debug = require('../../../../utils/debug').create('form_tests.js');

const {expect} = require('chai');
const fs = require('fs');

const {FormGenerator} = require('../form_generator.js');
const forms = require('./test_forms.json');

describe('FormGenerator', () => {

  it('should render a form object to HTML', (done) => {
    fs.readFile(__dirname + '/test_form.hbs', 'utf8', (err, data) => {
      if (err) throw err;
      let fg = new FormGenerator(forms['test']);
      let html = fg.renderHTML();
      expect(html).to.have.string(data);
      done();
    });
  });
});

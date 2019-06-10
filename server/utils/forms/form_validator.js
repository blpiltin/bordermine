//======================================================
// form_validator.js
//
// Description: Utility class for server-side validation
//  of forms.
//
// Note: Use field spec from forms.json
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

const debug = require('../../../utils/debug').create('form_validator.js')

const { ModelValidator } = require('../model_validator')


class FormValidator extends ModelValidator {

  validate(fields = {}, files = {}) {
    return super.getErrors(this.fields, fields, false, files)
  }  

}


module.exports = { FormValidator }
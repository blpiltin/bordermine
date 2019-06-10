//======================================================
// model_validator.js
//
// Description: Utility class for server-side validation
//  of objection models.
//
// Note: Use field spec from forms.json
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// TODO: Add validation for data type and length
//======================================================

const debug = require('../../utils/debug').create('model_validator.js')
debug.off()

const Validator = require('objection').Validator


class ModelValidator extends Validator {
  
  constructor(fieldSpec) {
    super()
    this.fields = fieldSpec.fields ? fieldSpec.fields : {}
  }

  validate(args) {
    // The model instance. May be empty at this point.
    const model = args.model

    // The properties to validate. After validation these values will
    // be merged into `model` by objection.
    const json = args.json

    // `ModelOptions` object. If your custom validator sets default
    // values, you need to check the `opt.patch` boolean. If it is true
    // we are validating a patch object and the defaults should not be set.
    const opt = args.options

    // A context object shared between the validation methods. A new
    // object is created for each validation operation. You can store
    // any data here.
    const ctx = args.ctx

    // Do your validation here and throw any exception if the
    // validation fails.
    let errors = this.getErrors(this.fields, json, opt.patch)
    if (errors) throw Error(errors[0].message)

    // You need to return the (possibly modified) json.
    return json
  }  

  //------------------------------------------------------
  // Return errors for models if files is null, 
  //  ignoring "formOnly" fields, otherwise
  //  return errors for forms, ignforing "modelOnly" fields
  //------------------------------------------------------
  getErrors(fields, data, patch, files) {

    debug.log('validating model with:', data)

    let errors = []
    let keys = patch ? data : fields

    for (let key in keys) {

      let field = fields[key]

      // Pass fields that are not in spec, should be filtered at model level
      if (!field) { continue }

      // Pass fields that are "formOnly" when in model mode (files === null)
      if (!files && field.formOnly) { continue }

      // Pass fields that are "modelOnly" when in form mode (files !== null)
      if (files && field.modelOnly) { continue }
      
      let name = key
      let value = files && files[name] ? files[name].name : data[name]

      if (field.type === 'json') {
        let jsonErrors = this.getErrors(field.fields, value, patch)
        if (jsonErrors && jsonErrors.length) errors = errors.concat(jsonErrors)
      } else if (field.type === 'select') {
        if (field.required && (!value || 
          (field.options && Object.keys(field.options).indexOf(value) < 0))) {
          errors.push({ field: name, message: field.requiredError })
        }
      } else {
        if (field.required && (!value || value.trim() === '')) {
          errors.push({ field: name, message: field.requiredError })
        } else if (field.pattern && (value && !value.match(field.pattern))) {
          errors.push({ field: name, message: field.patternError ? field.patternError : field.requiredError })
        } else if (field.matches && (value && value !== data[field.matches])) {
          errors.push({ field: name, message: field.matchesError ? field.matchesError : field.requiredError })
        }
      }
    }

    return errors.length ? errors : null
  }
}


module.exports = { ModelValidator }
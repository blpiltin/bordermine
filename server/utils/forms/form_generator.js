//======================================================
// form_generator.js
//
// Description: Utility class to generate form HTML for
//  use with bootstrap client-side validation.
// 
// Note: Use form spec from forms.json
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

function FormGenerator(form) {

  this.action = form.action ? form.action : '/'
  this.method = form.method ? form.method : 'post'
  this.fields = form.fields ? form.fields : {}
  this.submit = form.submit ? form.submit : 'Submit'
  this.enctype = form.enctype ? form.enctype : ''
  
  this.renderHTML = function() {
    let html = 
      '<form class="needs-validation" novalidate ' +
      (this.enctype ? 'enctype="' + this.enctype + '" ' : '') + 
      'action="' + this.action + '" method="' + this.method + '">\n'

    for (const key in this.fields) {
      let field = this.fields[key]
      let name = key

      if (field.modelOnly) { continue } 
      
      html += '  <div class="form-group form-row">\n'
      html += '    <div class="col">\n'
      html += '      <label for="' + name + '">' + field.label + '</label>\n'

      if (['text', 'email', 'password'].indexOf(field.type) >= 0) {
        html += '      <input id="' + name + '" class="form-control"' +
          ' type="' + field.type + '" name="' + name + '"' +
          (field.placeholder ? ' placeholder="' + field.placeholder + '"' : '') +
          (field.pattern ? ' pattern="' + field.pattern.toString().replace(/\//g, '') + '"' : '') +
          ' value="{{fields.' + name + '}}"' +
          (field.required ? ' required' : '') + 
          (field.disabled ? ' disabled="' + field.disabled + '"' : '') + 
          (field.accept ? ' accept="' + field.accept + '"' : '') + 
          (field.autocomplete ? ' autocomplete="' + field.autocomplete + '">\n' : '>\n')
      } else if (field.type === 'textarea') {
        html += '      <textarea id="' + name + '" class="form-control"' +
        ' name="' + name + '"' +
        (field.placeholder ? ' placeholder="' + field.placeholder + '"' : '') +
        (field.pattern ? ' pattern="' + field.pattern.toString().replace(/\//g, '') + '"' : '') +
        (field.required ? ' required' : '') + 
        (field.accept ? ' accept="' + field.accept + '"' : '') + 
        (field.rows ? ' rows="' + field.rows + '"' : '') +
        (field.autocomplete ? ' autocomplete="' + field.autocomplete + '">' : '>') +  '{{fields.' + name + '}}</textarea>\n'
      } else if (field.type === 'file') {
        html += '      <input id="' + name + '" class=" form-control-file btn btn-outline-secondary"' +
          ' type="' + field.type + '" name="' + name + '"' +
          (field.pattern ? ' pattern="' + field.pattern.toString().replace(/\//g, '') + '"' : '') +
          (field.required ? ' required' : '') + 
          (field.accept ? ' accept="' + field.accept + '"' : '') + 
          (field.autocomplete ? ' autocomplete="' + field.autocomplete + '">\n' : '>\n')
      } else if (field.type === 'select') {
        html += '      <select id="' + name + '" class="custom-select" name="' + name + '" ' +
          (field.required ? 'required>\n' : '>\n')
        if (field.placeholder) {
          html += '        <option value="" {{checkSelected fields.' + name + ' ""}}>' +
            field.placeholder + '</option>\n'
        }
        for (let optionName in field.options) {
          let optionText = field.options[optionName]
          html += '        <option value="' + optionName + '" ' +
            '{{checkSelected fields.' + name + ' "' + optionName + '"}}>' +
            optionText + '</option>\n'
        }
        html += '      </select>\n'
      }
      if (field.required && field.requiredError) {
        html += '      <div class="invalid-feedback">' + field.requiredError + '</div>\n'
      } else if (field.pattern && field.patternError) {
        html += '      <div class="invalid-feedback">' + field.patternError + '</div>\n'
      } else if (field.matches && field.matchesError) {
        html += '      <div class="invalid-feedback">' + field.matchesError + '</div>\n'
      }
      html += '    </div>\n'
      html += '  </div>\n'
    }
    
    html += '  <button type="submit" class="btn btn-primary" id="btnSubmit">' +
      this.submit + '</button>\n'
    html += '  <button class="btn btn-primary cm-hidden" id="spinner" type="button" disabled>\n' +
            '    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>\n' +
            '    Saving...\n' +
            '  </button>\n'
    html += '  <button type="button" class="btn btn-secondary" id="btnCancel" onclick="location.href=\'{{back}}\'">Cancel</button>\n'
    html += '</form>\n'

    return html
  }
}

module.exports = { FormGenerator }

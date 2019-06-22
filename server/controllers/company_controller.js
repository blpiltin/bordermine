//======================================================
// company_controller.js 
// 
// Description: Defines logic and file handling for 
//  company edit requests.
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.1
// History:
//  - 0.0.1: Initial version
//======================================================

const debug = require('../../utils/debug').create('copmany_controller.js')

const fs = require('fs-extra')
const _ = require('lodash')

const { coalesce } = require('../utils/server_utils')

const { FormValidator }  = require('../utils/forms/form_validator')
const forms = require('../utils/forms/company_forms.json')

const edit_layout = 'dashboard_layout'


const editCompany = (req, res) => {
  res.render('edit/edit_company', { 
    fields: res.locals.user.company, layout: edit_layout 
  })
}

const saveCompany = async (req, res) => {
  let errors = 
    new FormValidator(forms['edit_company']).validate(req.fields, req.files),
      fields = coalesce(req.fields)

	if (errors) {
		res.status(400).render('edit/edit_company', { 
      fields, errors, layout: edit_layout 
    })
	} else {
		try {
      let company = res.locals.user.company
      if (req.files && req.files.logo && req.files.logo.name) {
        // #Todo: delete existing photo before saving new one.
        let file = req.files.logo
        await fs.move(file.path, res.locals.user.uploadsDir + file.name, { 
          overwrite: true 
        })
        fields.logo = file.name
      } else if (req.fields.delete) {
        await fs.remove(res.locals.user.uploadsDir + company.logo)
        fields.logo = null
      }
      company = await company.update(fields)
      let message = 'Company was updated succesfully.'
			res.render('edit/edit_company', { 
        fields, message, layout: edit_layout 
      })
		} catch(error) {
			res.status(400).render('edit/edit_company', { 
        fields, error, layout: edit_layout 
      })
		}
	}
}


module.exports = {
  editCompany,
  saveCompany
}

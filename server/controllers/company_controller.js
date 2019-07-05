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

const { DASHBOARD_MENU } = require('./dashboard_controller')

const layout = 'dashboard_layout'
const sidebar = DASHBOARD_MENU

const editCompany = (req, res) => {
  res.render('user/company', { 
    layout, sidebar, fields: res.locals.user.company
  })
}

const saveCompany = async (req, res) => {
  let errors = 
    new FormValidator(forms['edit_company']).validate(req.fields, req.files),
      fields = coalesce(req.fields)

	if (errors) {
		res.status(400).render('user/company', { 
      layout, sidebar, fields, errors
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
			res.render('user/company', { 
        layout, sidebar, fields, message
      })
		} catch(error) {
			res.status(400).render('user/company', { 
        layout, sidebar, fields, error
      })
		}
	}
}


module.exports = {
  editCompany,
  saveCompany
}

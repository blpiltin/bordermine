const debug = require('../../utils/debug').create('user_controller.js')

const fs = require('fs-extra')
const _ = require('lodash')

const { User } = require('../models/user')

const { FormValidator }  = require('../utils/forms/form_validator')
const forms = require('../utils/forms/user_forms.json')

const { DASHBOARD_MENU } = require('./dashboard_controller')

const layout = 'dashboard_layout'
const dashbar = DASHBOARD_MENU

const editUser = async (req, res) => {
  let fields = { role: res.locals.user.role }
  res.render('user/account', { layout, dashbar, fields })
}

const saveUser = async (req, res) => {
  let fields = _.merge(req.fields, { role: res.locals.user.role }),
      errors = new FormValidator(forms['edit_user']).validate(fields)

	if (errors) {
    res.status(400).render('user/account', {
      layout, dashbar, fields, errors
    })
	} else {
		try {
      let user = res.locals.user
      await user.matchPassword(req.fields.currentPassword)
			await user.update({ password: req.fields.password })
			res.flash('message', 'Your account was succesfully updated.')
			res.redirect(res.locals.user.dashboardPath)
		} catch(error) {
      res.status(400).render('user/account', { 
        layout, dashbar, fields, error
      })
		}
	}
}

//======================================================
// User Profile
//======================================================

const editUserProfile = async (req, res) => {
  try {
    let user = await User.read(req.session.userId)
    res.render('user/profile', { 
      layout, dashbar, fields: user.profile
    })
  } catch(error) {
    res.status(400).render('user/profile', { 
      layout, dashbar, fields: req.fields, error
    })
  }
}

const saveUserProfile = async (req, res) => {
  let errors = new FormValidator(forms['edit_user_profile']).validate(req.fields, req.files)
	if (errors) {
		res.status(400).render('user/profile', { 
      layout, dashbar, fields: req.fields, errors 
    })
	} else {
		try {
      let user = await User.read(req.session.userId)
      if (req.files && req.files.photo && req.files.photo.name) {
        // #Todo: delete existing photo before saving new one.
        let file = req.files.photo
        await fs.move(file.path, res.locals.user.uploadsDir + file.name, { overwrite: true })
        req.fields.photo = file.name
      } else if (req.fields.delete) {
        await fs.remove(res.locals.user.uploadsDir + user.profile.photo)
        req.fields.photo = null
      }
      // #Todo: save fields with style: { profile.firstName, profile.lastName... }
      //    to avoid overwriting.
      user = await user.update({ profile: req.fields })
      let message = 'Your profile was updated succesfully.'
			res.render('user/profile', { 
        layout, dashbar, fields: req.fields, message
      })
		} catch(error) {
			res.status(400).render('user/profile', { 
        layout, dashbar, fields: req.fields, error
      })
		}
	}
}


module.exports = {
  editUser,
  saveUser,
  editUserProfile,
  saveUserProfile
}

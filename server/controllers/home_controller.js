//======================================================
// home_controller.js
// 
// Description: Defines controller methods for home routes.
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.1
// History:
//  - 0.0.1: Initial version
//======================================================

const debug = require('../../utils/debug').create('home_controller.js')

const { 
	getHost, 
	getDashboardPathFromEmail, 
	encodeURL,
	coalesce
} = require('../utils/server_utils')

const { mailer } = require('../utils/mailer')

const { User } = require('../models/user')
const { Company } = require('../models/company')

const { FormValidator }  = require('../utils/forms/form_validator')
const forms = require('../utils/forms/home_forms.json')


//------------------------------------------------------
// Render view for home page
//------------------------------------------------------
const viewHome = (req, res) => {
	let message = req.query.message ? req.query.message : res.locals.message
	res.status(res.locals.error ? 400 : 200).render('home/home', { message })
}

//------------------------------------------------------
// Handle user join reqests by creating a new user and 
// sending a activation email. 
// Redirect to home on success, show errors on failure.
//------------------------------------------------------
const userJoin = async (req, res) => {
	let errors = new FormValidator(forms['join']).validate(req.fields),
			fields = coalesce(req.fields),
			user, company

	// #Todo: Check for match between host and email domain for non-parents.
	if (errors) {
		res.status(400).render('home/join', { fields, errors })
	} else {
		try {
			company = await Company.create(fields.company)
			fields.user.role = 'owner'
			user = await User.create(company.id, fields.user)
			company.updateOwner(user.id)
			await mailer.sendActivation(user, getHost(req))
			let message = 'Your account was succesfully created. ' +
				'Please check your email for instructions on activating your account.'
			res.flash('message', message)
			res.redirect('/')
		} catch (error) {
			debug.log(error.message, error.code)
			if (company) { company.delete() }
			if (error.code === 'SQLITE_CONSTRAINT') {
				error = 'That email is already in use.'
			}
			res.status(400).render('home/join', { fields, error }); 
		}
	}
}

//------------------------------------------------------
// Handle post requests to resend the activation code
//------------------------------------------------------
const sendActivationCode = async (req, res) => {

	let fields = req.fields, 
			errors = new FormValidator(forms['email']).validate(fields),
			message = 'A new activation link has been sent to the email address '
			+ 'provided. Please check your email for instructions on activating your '
			+ 'account. If you do not receive an email shortly please confirm '
			+ 'the provided email address is correct and try again.'

	if (errors) {
		res.status(400).render('home/email', { for: 'activation', fields, errors })
	} else {
		try {
			user = await User.findByEmail(fields.email)
			await mailer.sendActivation(user, getHost(req))
		} catch (error) {
			if (error.code === 'SERVER_ERROR') {
				res.flash('error', error.message)
				res.redirect('/')
			}
		} finally {
			// Flash the same message for both valid and invalid email addresses
			// 	for security purposes.
			res.flash('message', message)
			res.redirect('/')
		}
	}
}

//------------------------------------------------------
// Activate a user's account with valid code.
//------------------------------------------------------
const userActivate = async (req, res) => {
	try {
		await User.activate(req.query.code)
		res.flash('message', 'Activation successful. Please login to continue.')
		res.redirect('/login')
	} catch (error) {
		res.flash('error', error.message)
		res.redirect('/')
	}
}

const viewLogin = (req, res) => {
	res.status(res.locals.error ? 401 : 200).render('home/login')
}

//------------------------------------------------------
// Login activated user by adding to session and redirecting
// to dashboard.
//------------------------------------------------------
const userLogin = async (req, res) => {
	let user = null
	try {
		user = await User.findByCredentials(req.fields.email, req.fields.password)
		if (!user.activated) {
			let error = 'Check your email for an activation link before logging in for the first time.'
			res.flash('error', error)
			res.redirect('/')
		} else {
			req.session.userId = user.id
			res.redirect(getDashboardPathFromEmail(user.email))
		}
	} catch (err) {
		if (!user) err = 'Invalid username or password. Please try again or join.'
		res.status(400).render('home/login', { fields:req.fields, error:err })
	}
}

//------------------------------------------------------
// Logout user by deleting the sesssion. Redirect to home.
//------------------------------------------------------
const userLogout = (req, res) => {
	if (req.session) req.session = null
  res.redirect(encodeURL('/', { message: 'Thank you for using classmine. Come back soon!' })); 
}

//------------------------------------------------------
// Allow the use to reset his/password by setting and 
// emailing the password reset code.
//------------------------------------------------------
const sendPasswordResetCode = async (req, res) => {

	let fields = req.fields, 
			errors = new FormValidator(forms['email']).validate(fields),
			message = 'A password reset code has been sent to the email address '
			+ 'provided. Please check your email for instructions on resettting your '
			+ 'password. If you do not receive an email shortly please confirm '
			+ 'the provided email address is correct and try again.'

	if (errors) {
		res.status(400).render('home/email', { for: 'password', fields, errors })
	} else {
		try {
			let user = await User.findByEmail(fields.email)
			user = await user.generatePasswordResetCode()
			await mailer.sendPasswordReset(user, getHost(req))
		} catch (error) {
			if (error.code === 'SERVER_ERROR') {
				res.flash('error', error.message)
				res.redirect('/')
			}
		} finally {
			// Flash the same message for both valid and invalid email addresses
			// 	for security purposes.
			res.flash('message', message)
			res.redirect('/')
		}
	}
}

//------------------------------------------------------
// Reset a user's password with valid code.
//------------------------------------------------------
const resetPassword = async (req, res) => {
	if (req.method === 'GET') {
		res.render('home/password', { code: encodeURIComponent(req.query.code) })
	} else if (req.method === 'POST') {
		try {
			if (req.fields.password !== req.fields.passwordConfirm) {
				throw Error('Password and password confirmation do not match.')
			}
			let user = await User.findByEmail(req.fields.email)
			await user.confirmPasswordResetCode(req.query.code)
			await user.update({ password: req.fields.password })
			res.flash('message', 'Password reset successful. Please login to continue.')
			res.redirect('/login')
		} catch (error) {
			res.flash('error', error.message)
			if (error.code === 'CODE_INVALID') { res.redirect('/email') }
			else { 
				res.redirect('/password?code=' +  encodeURIComponent(req.query.code)) 
			}
		}
	}
}


module.exports = { 
	viewHome, 
	userJoin, 
	userActivate, 
	sendActivationCode,
	viewLogin, 
	userLogin, 
	userLogout,
	sendPasswordResetCode,
	resetPassword
}

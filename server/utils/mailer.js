//======================================================
// mailer.js
//
// Description: Simple wrapper for nodemailer. 
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

const debug = require('../../utils/debug').create('mailer.js')

const env = require('../config/config').env
const err = require('../../utils/error')

const nodemailer = require('nodemailer')
const {encodeURL} = require('./server_utils')

if (env === 'production') { debug.toLog() }

const homeHost = process.env.HOME_HOST || 'localhost'
const port = process.env.PORT || 3000
const siteTitle = process.env.SITE_TITLE

let mailerUp = false


//------------------------------------------------------
// Configuration
//------------------------------------------------------
let options = {
  host: process.env.SMTP_SERVER || "debugmail.io",
  port: process.env.SMTP_PORT || 25,
  tls: process.env.SMTP_TLS || (process.env.SMTP_PORT == 25 ? false : true),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
}
let mailer = nodemailer.createTransport(options)

//------------------------------------------------------
// Use for sanity check.
//------------------------------------------------------
mailer.test = () => {
  debug.log('Testing SMTP mailer connection.')
  setTimeout(() => {
    if (!mailerUp) { 
      debug.log('SERVER ERROR: SMTP mailer not available.')
      debug.log(' mailer.options: ', mailer.options)
    }
  }, 3000)
  mailer.verify()
  .then(() => { 
    mailerUp = true
    debug.log('SMTP mailer up and running.')
  })
  .catch(err => { debug.log('SMTP mailer ERROR: ' + err.message )})
}

//------------------------------------------------------
// Send the activation email for the given user.
//------------------------------------------------------
mailer.sendActivation = async (user, host, sender) => {
  if (!mailerUp) { 
    err.gen('Unable to send activation code. Please try again later.', 'SERVER_ERROR') 
  }
  let path = host ? host + '/activate': `http://${homeHost}:${port}/activate`
  let url = encodeURL(path, { code: user.activationCode })
  let msg = {
    from: sender || process.env.SMTP_SENDER,
    to: env === 'production' ? user.email : process.env.SMTP_RECIPIENT,
    subject: `Activate Your ${siteTitle} Account`,
    html: `Please activate your ${siteTitle.toLowerCase()} account by clicking <a href="${url}">here.</a>`,
    text: `Please activate your ${siteTitle.toLowerCase()} account by going to this link ${url}`
  }
  return mailer.sendMail(msg)
}

//------------------------------------------------------
// Send the password reset email for the given user.
//------------------------------------------------------
mailer.sendPasswordReset = async (user, host, sender) => {
  if (!mailerUp) { 
    err.gen('Unable to send password reset code. Please try again later.', 'SERVER_ERROR') 
  }
  let path = host ? host + '/password':  `http://${homeHost}:${port}/activate`
  let url = encodeURL(path, { code: user.passwordResetCode })
  let msg = {
    from: sender || process.env.SMTP_SENDER,
    to: env === 'production' ? user.email : process.env.SMTP_RECIPIENT,
    subject: `Reset Your ${siteTitle} Password`,
    html: `Please reset your ${siteTitle.toLowerCase()} password by clicking <a href="${url}">here.</a>`,
    text: `Please reset your ${siteTitle.toLowerCase()} password by going to this link ${url}`
  }
  return mailer.sendMail(msg)
}


module.exports = { mailer }

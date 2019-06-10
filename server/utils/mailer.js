//======================================================
// mailer.js
//
// Description: Simple wrapper for nodemailer. 
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

const debug = require('../../utils/debug').create('mailer.js')
const config = require('../config/config')

const nodemailer = require('nodemailer')
const {encodeURL} = require('./server_utils')

if (config.env === 'production') debug.toLog()


//------------------------------------------------------
// Configuration
//------------------------------------------------------
let options = {
  host: process.env.SMTP_SERVER || "debugmail.io",
  port: process.env.SMTP_PORT || 25,
  tls: process.env.SMTP_PORT === 25 ? false : true,
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
  mailer.verify()
  .then(() => { 
    debug.log('SMTP mailer up and running.'); 
  })
  .catch(err => { debug.log('SMTP mailer ERROR: ' + err.message )})
}

//------------------------------------------------------
// Send the activation email for the given user.
//------------------------------------------------------
mailer.sendActivation = async (user, host, sender) => {
  let path = host ? host + '/activate': 'http://classmine.com/activate'
  let url = encodeURL(path, { code: user.activationCode })
  let msg = {
    from: sender || process.env.SMTP_SENDER,
    to: user.email || process.env.SMTP_RECIPIENT,
    subject: 'Activate Your Classmine Account',
    html: 'Please activate your classmine account by clicking '
      + '<a href="' + url + '">here.</a>',
    text: 'Please activate your classmine account by going to this link ' + url
  }
  return mailer.sendMail(msg)
}

//------------------------------------------------------
// Send the password reset email for the given user.
//------------------------------------------------------
mailer.sendPasswordReset = async (user, host, sender) => {
  let path = host ? host + '/password': 'http://classmine.com/password'
  let url = encodeURL(path, { code: user.passwordResetCode })
  let msg = {
    from: sender || process.env.SMTP_SENDER,
    to: user.email || process.env.SMTP_RECIPIENT,
    subject: 'Reset Your Classmine Password',
    html: 'Please reset your classmine password by clicking '
      + '<a href="' + url + '">here.</a>',
    text: 'Please reset your classmine password by going to this link ' + url
  }
  return mailer.sendMail(msg)
}


module.exports = { mailer }

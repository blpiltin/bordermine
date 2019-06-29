//======================================================
// server.js
//
// Description: Express server configuration and entry point. 
//
// Version: 0.0.3
// History:
//	- 0.0.1: Initial commit. Home page visible.
//	- 0.0.2: Renamed src to client directory and moved views under it.
// 	- 0.0.3: Updated to use seperate routers under routes directory.
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

const env = require('./config/config').env
const debug = require('../utils/debug').create('server.js')

const path = require('path')
const fs = require('fs-extra')
const express = require('express')
const hbs = require('express-handlebars')
const handlebars = require('handlebars');			// Required for handlebars-helpers
const helpers = require('handlebars-helpers')(
	['string', 'math', 'comparison', 'array', 'html']
)
const session = require('cookie-session')
const formidable = require('express-formidable')
const createError = require('http-errors')
const flash = require('express-flash-2')

const { mailer } = require('./utils/mailer')

const clientPath = path.join(__dirname, '../client')
const viewsPath = path.join(__dirname, '../client/views')
const tempDir = path.join(__dirname, '../temp')

const port = process.env.PORT || 3000


//======================================================
// Setup server environment
//======================================================
debug.log('Environment:', env)
const app = express()


//======================================================
// Log errors to file. 
//======================================================
app.use((req, res, next) => {
	let now = new Date().toString()
	let log = `${now}: ${req.method} ${req.originalUrl}`

	fs.appendFile('server.log', log + '\n', (err) => {
		if (err) {
			console.log('Unable to append to server.log.')
		}
	})
	next()
})


//======================================================
// Set up formidable middleware for parsing form data 
// and files within request body.
//======================================================
const formOpts = {
	encoding: 'utf-8',
	uploadDir: tempDir,
	multiples: true,
	keepExtensions: true,
	maxFileSize: 50 * 1024 * 1024,			// 50 MB
}
app.use(formidable(formOpts))

// Create temp directory for formidable uploads if it doesn't exist.
fs.ensureDir(tempDir)
.catch(err => debug.log('creating temp directory', err))


//======================================================
// Set up static directories.
//======================================================
app.use(express.static(clientPath))
app.set('views', viewsPath)


//======================================================
// Set up handlebars for templating html pages.
//======================================================
app.engine('hbs', hbs({
	extname: 'hbs', 
	defaultLayout: 'home_layout',
	layoutsDir: viewsPath + '/layouts',
	partialsDir: viewsPath + '/partials',
	helpers: require('./utils/helpers')
}))
app.set('view engine', 'hbs')


//======================================================
// Configure view cache.
//======================================================
if (env === 'production') { app.enable('view cache') } 
else { app.disable('view cache') }


//======================================================
// Set up sesssions.
//======================================================
const sessionOptions = {
	secret: process.env.SESSION_SECRET || "alskjdf8a9s7dflkjsdlkjf09s8df09uskj",
	maxAge: 1000 * 60 * 60 * 24 * 3,		// 3 days
	httpOnly: false											// #Todo: update when using https
}
app.use(session(sessionOptions))


//======================================================
// Set up flash messaging.
//======================================================
app.use(flash())


//======================================================
// Set up middleware for paid tier branding/hosting.
//======================================================
app.use(require('./middleware/hosting').host)


//======================================================
// Set up utility middleware for populating res.locals
// session variables.
//======================================================
app.use(require('./middleware/session').populate)


//======================================================
// Test mailer
//======================================================
mailer.test()


//======================================================
// Configure routes
//======================================================

//------------------------------------------------------
// Guest (non-authentiecated) routes
//------------------------------------------------------
app.use('/', require('./routers/home_router'))

//------------------------------------------------------
// User edit routess
//------------------------------------------------------
app.use('/company/:companyId/user/:userId', require('./routers/user_router'))

//------------------------------------------------------
// Setup up company res.locals.route properties
//------------------------------------------------------
app.param('companyId', (req, res, next, companyId) => {
	if (!res.locals.route) { res.locals.route = {} }
	res.locals.route.companyId = companyId
	next()
})

//------------------------------------------------------
// Setup up user res.locals.route properties
//------------------------------------------------------
app.param('userId', (req, res, next, userId) => {
	if (!res.locals.route) { res.locals.route = {} }
	res.locals.route.userId = userId
	next()
})

//------------------------------------------------------
// #example: Put the site into maintenance mode. 
//------------------------------------------------------
// app.use((req, res, next) => {
// 	res.render('maintenance.hbs')
// 	// Notice there is no call to next!
// })

//------------------------------------------------------
// #example: Get a static file from the client directory. 
//------------------------------------------------------
// router.get('/', function(req, res) {
// 	res.sendfile('index.html')
// })


//======================================================
// Handle 404 (file not found) errors.
//======================================================

app.use((req, res, next) => next(createError(404)))

//------------------------------------------------------
// Render the 404 (file not found) error page. 
// Include error messages in development.
//------------------------------------------------------
app.use((err, req, res, next) => {
  // res.locals.message = err.message
  res.locals.error = env === 'development' ? err : null
  res.status(err.status || 500)
  res.render('error')
})


//======================================================
// Start the server
//======================================================
app.listen(port, () => {
	debug.log(`${process.env.SITE_TITLE} server is running on port ${port}`)
})


module.exports = { app };
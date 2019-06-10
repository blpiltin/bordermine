//======================================================
// hosting.js 
// 
// Description: Routines for setting up a branded/hosted
//  user experience.
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
// Version 0.0.1
// History:
//  - 0.0.1: Initial version.
//======================================================

const env = require('../config/config').env

const homeHosts = ['0.1', '127.0.0.1', 'localhost', process.env.HOME_HOST];


const host = async (req, res, next) => {
	let hostName = req.header('test-host') ? req.header('test-host') :
		req.hostname.match(/([^.]+\.\w+|[^.]+)$/)[0];
	if (homeHosts.indexOf(hostName) < 0) {
		res.locals.host = hostName;
  }
  next();
}


module.exports = { host }

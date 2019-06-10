//======================================================
// config.js 
// 
// Description: Set up configuration environment variables.
//  Possible configurations include:
//    For private config (private.json): test, development
//    For public config (public.json): test, development, production, all 
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.1
// History:
//  - 0.0.1: Initial version.
//======================================================

const env = process.env.NODE_ENV || 'development'
const files = ['./private_config.json', './public_config.json']

let config, envConfig


for (file in files) {
  config = require(files[file])

  envConfig = config['all']
  Object.keys(envConfig).forEach(key => {
    process.env[key] = envConfig[key]
  })

  envConfig = config[env]
  Object.keys(envConfig).forEach(key => {
    process.env[key] = envConfig[key]
  })
}


module.exports = { env };
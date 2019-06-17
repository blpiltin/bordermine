//======================================================
// error.js 
// 
// Description: Utility routines for generating errors.
// 
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.1.1
// History:
//  - 0.0.1: Initial version.
//======================================================

module.exports.gen = function(message, code) {
  let error = new Error(message)
  if (code) { error.code = code }
  throw error
}

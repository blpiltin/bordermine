//======================================================
// debug.js 
// 
// Description: Utility object for logging debug messages.
// 
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.1.1
// History:
//  - 0.0.1: Initial version.
//  - 0.1.1: Add auto stringify for JSON objects.
//======================================================

const Debug = {};

Debug.GLOBAL_DEBUG = true;

const fs = require('fs');
const {Console} = require('console');

Debug.create = function(prefix='') {

  let logger = new Console({stdout:process.stdout});
  let activated = true;
  let tags = null;
  let pre = prefix;
  let out = null;

  return {

    on: function(strings=null) {
      activated = true;
      tags = strings;
    },
    off: function() {
      activated = false;
    },
    debugging: function(state) {
      activated = state;
    },
    toLog: function(name='debug.log') {
      out = fs.createWriteStream(name);
      logger = new Console({stdout: out});
    },
    toConsole: function() {
      logger = new Console({stdout:process.stdout});
    },
    setPrefix: function(toString) {
      pre = toString;
    },
    log: function(str) {
      let tagged = tags && (tags === arguments[0] || 
        Array.isArray(tags) && tags.find((tag) => tag === arguments[0]));
      if (typeof str === 'object') str = JSON.stringify(str);
      for (var i = 1; i < arguments.length; i++) {
        if (typeof arguments[i] === 'object') {
          str += ' ' + JSON.stringify(arguments[i]);
        } else {
          str += ' ' + arguments[i];
        }
      }
      if (activated && Debug.GLOBAL_DEBUG) {
        if (!tags || tagged) {
          let newStr = pre && pre !== '' ? pre + ': ' + str : str;
          logger.log(newStr);
          return newStr;
        }
      }
      return false;
    }
  };
}

module.exports = Debug;

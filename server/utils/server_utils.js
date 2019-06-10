// server_utils.js
//
// Description: Miscellaneous utility functions for server side use. 
//
// Version: 0.0.1
// History:
//	- 0.0.1: Initial version.
// Author: Brian Piltin
// URL: 
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================


// URL related
//======================================================

const getParam = (param => param ? param : null);
const encodeURL = (path, params) => 
  (params && typeof params === 'object') ? path + "?" + serialize(params) : path;

// Serialize an object into URI encoding.
//------------------------------------------------------
const serialize = (obj) => {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

//------------------------------------------------------
// Get the host minus the path. 
// #note add  + req.originalUrl; to the end for the full path.
const getHost = (req) => req.protocol + '://' + req.get('Host'); 

// Get a valid email from the url path.
//------------------------------------------------------
const getEmailFromPath = (domain, user) => user + '@' + domain;

// Get a valid domain name from the user's email.
//------------------------------------------------------
const getDomainFromEmail = (email) => `${email.match(/([^@]+)/g)[1]}`

// Get a valid user name from the user's email.
//------------------------------------------------------
const getUserNameFromEmail = (email) => `${email.match(/([^@]+)/g)[0]}`

// Get a valid user path from the user's email.
//------------------------------------------------------
const getUserPathFromEmail = (email) => `/${getDomainFromEmail(email)}/${getUserNameFromEmail(email)}`

// Get a valid path from the user's email.
//------------------------------------------------------
const getDashboardPathFromEmail = (email) => `/${getDomainFromEmail(email)}/${getUserNameFromEmail(email)}/dashboard`

// Get a valid path from the user's email.
//------------------------------------------------------
const getEditPathFromEmail = (email) => `/${getDomainFromEmail(email)}/edit/${getUserNameFromEmail(email)}`


// Miscellaneous
//======================================================

// Given an object with dotted keys (field1.field2.field3: value), 
// create a tree structure from the keys of the form: 
// (field1: { field2: { field3: value }})
//------------------------------------------------------
const coalesce = (obj) => {
  let newObj = {};
  for (key in obj) {
    var segs = key.split('.');
    let seg = segs.shift();
    if (segs.length == 0) {
      newObj[seg] = obj[key];
    } else if (segs.length == 1) {
      if (!newObj[seg]) newObj[seg] = {};
      newObj[seg][segs[0]] = obj[key];
    } else {
      newObj[seg][segs.join('.')] = obj[key];
    }
  }
  for (key in newObj) {
    let val = newObj[key];
    if (typeof val === 'object' && typeof val !== null) 
      newObj[key] = coalesce(val);
  }
  return newObj;
}

// Strip HTML tags and elements from string.
//------------------------------------------------------
const stripHTML = str => str.replace(/<(?:.|\n)*?>/gm, '');


module.exports = { 
  getParam, 
  serialize,
  encodeURL, 
  getHost, 
  getEmailFromPath,
  getDomainFromEmail,
  getUserNameFromEmail,
  getUserPathFromEmail,
  getDashboardPathFromEmail,
  getEditPathFromEmail,
  coalesce,
  stripHTML
};
const handlebars = require('handlebars')
const _ = require('lodash')

const { serialize } = require('./server_utils')


//======================================================
// Define handlebars helper functions.
//======================================================

//------------------------------------------------------
// Return the current year
//------------------------------------------------------
const getCurrentYear = () => new Date().getFullYear()

//------------------------------------------------------
// Get the title for the site based on SITE_TITLE env var
//------------------------------------------------------
const siteTitle = obj => {
  require('../config/config')
  return process.env.SITE_TITLE || 'Mymine'
}

//------------------------------------------------------
// Get the title for the page based on the template name
//------------------------------------------------------
const pageTitle = getTitle = (obj) => {
  let words = obj.data.exphbs.view.replace(/.*\//, '').split('_')
	return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const copyrightUrl = obj => {
  require('../config/config')
  return process.env.COPYRIGHT_URL || '' 
}

//------------------------------------------------------
// Check selected item in select dropdown
//------------------------------------------------------
const checkSelected = (selected, value) => selected === value ? ' selected ': ''

//------------------------------------------------------
// Replace empty fields with a question mark
//------------------------------------------------------
const question = (field) => field ? field : '?'

//------------------------------------------------------
// Replace the classmine hostname if user is coming from a 
// "branded" url.
//------------------------------------------------------
const hostName = (host) => host ? host : siteTitle()

//------------------------------------------------------
// For using font awesome icons or svg sprites as icons
// #Note: Run gulp sprites to generate sprites from svg
//------------------------------------------------------
const icon = (name) => {
  if (name.startsWith('fa-')) {
    return new handlebars.SafeString(`<span class="fa-icon fas ${name}"></span>`)
  }
	let html = `<svg viewBox="0 0 1 1" class="icon ${name}">` +
		`<use xlink:href="/assets/svg/symbols.svg#${name}"></use></svg>`
	return new handlebars.SafeString(html)
}

//------------------------------------------------------
// For getting the current view from within the template
// #Todo: There must be an easier way...
//------------------------------------------------------
const isView = (name) => name === obj.data.exphbs.view

//------------------------------------------------------
// Determine which dashbar submenu is shown based on path
//------------------------------------------------------
const getMenuShow = (menu, path) => {
  let segs = path.split('/')
  if (segs[5] && segs[5].match(menu)) { return 'show' }
  return ''
}

//------------------------------------------------------
// Convert object to URL params
// @param keys comma separated string of keys
//------------------------------------------------------
const getParams = (obj, keys) => {
  if (keys) {
    return obj ? serialize(_.pick(obj, keys.split(','))) : ''
  }
	return obj ? serialize(obj) : ''
}

const getParamsA = (obj, keys) => {
  let params = getParams(obj, keys); 
  return params ? '&' + params : ''
}

const getParamsQ = (obj, keys) => {
  let params = getParams(obj, keys); 
  return params ? '?' + params : ''
}

//------------------------------------------------------
// Convert object and key to URL param
//------------------------------------------------------
const getParam = (obj, key) => {
	return obj ? serialize(_.pick(obj, [key])) : ''
}


module.exports = {
  getCurrentYear,
  siteTitle,
  getTitle,
  pageTitle,
  copyrightUrl,
  checkSelected,
  question,
  hostName,
  icon,
  isView,
  getMenuShow,
  getParam,
  getParams,
  getParamsA,
  getParamsQ
}
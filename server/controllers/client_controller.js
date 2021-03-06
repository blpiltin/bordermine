//======================================================
// client_controller.js 
// 
// Description: Defines the client controller class.
// 
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.1
// History:
//  - 0.0.1: Initial version.
//======================================================

const debug = require('../../utils/debug').create('client_controller.js')

const _ = require('lodash')

const { serialize, coalesce } = require('../utils/server_utils')
const { flashParamsRedirect } = require('./controller_utils')

const { FormValidator }  = require('../utils/forms/form_validator')
const forms = require('../utils/forms/client_forms.json')

const { Client } = require('../models/client')

const { DASHBOARD_MENU } = require('./dashboard_controller')

const layout = 'dashboard_layout'
const dashbar = DASHBOARD_MENU


//======================================================
// Edit client routines
//======================================================

//------------------------------------------------------
// Response for GET new client request
//------------------------------------------------------
const newClient = async (req, res, type) => {
  let mode = 'new', 
      title = `${_.capitalize(type)}`, 
      fields = { type }
  res.render('user/client', { mode, title, layout, dashbar, fields })
}

//------------------------------------------------------
// Response for POST new client request
//------------------------------------------------------
const createClient = async (req, res, type) => {
  let mode = 'new',
      title = `${_.capitalize(type)}`,
      types = Client.getPluralName(type),
      fields = _.merge(req.fields, type),
      formStr = JSON.stringify(forms['edit_client']).replace(/{{fields\.type}}/g, type),
      errors = new FormValidator(JSON.parse(formStr)).validate(fields, req.files)

  fields = coalesce(fields)

  if (errors) {
    if (req.query.redirect === type) {
      res.flash('errors', errors)
      res.redirect(type + '?' + serialize(req.query))
    } else {
      res.status(400).render('user/client', { 
        mode, title, layout, dashbar, fields, errors 
      })
    }
  } else {
    try {
      let client = await res.locals.user.createClient(type, fields)
      req.query.pageFor = client.id
      res.flash('message', `The ${type} was saved succesfully.`)
      res.redirect(types + '?' + serialize(req.query))
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        error = `${type === 'exporter' ? 'An exporter' : 'A consignee'} with that name already exists.`
      }
      if (req.query.redirect === type) {
        res.flash('error', error.message || error)
        res.redirect(types + '?' + serialize(req.query))
      } else {
        res.status(400).render('user/client', { 
          mode, title, layout, dashbar, fields, error 
        })
      }
    }
  }
}

//------------------------------------------------------
// Response for GET existing client request
//------------------------------------------------------
const editClient = async (req, res, type) => {
  let title = `${_.capitalize(type)}`
  try {
    let companyId = res.locals.user.companyId,
        clientId = res.locals.route.clientId,
        fields = await Client.readByCompany(companyId, clientId)
    res.render('user/client', { title, layout, dashbar, fields })
  } catch (error) {
    res.flash('error', error.message || error)
    res.status(404).redirect(`../${Client.getPluralName(type)}`)
  }
}

//------------------------------------------------------
// Response for POST existing client request
//------------------------------------------------------
const saveClient = async (req, res, type) => {
  let title = `${_.capitalize(type)}`, 
      types = Client.getPluralName(type),
      fields = req.fields,
      formStr = JSON.stringify(forms['edit_client']).replace(/{{fields\.type}}/g, type),
      errors = new FormValidator(JSON.parse(formStr)).validate(fields, req.files)

  fields = coalesce(fields)

  if (errors) {
    if (req.query.redirect === type) {
      res.flash('errors', errors)
      res.redirect(`../${types}` + '?' + serialize(req.query))
    } else {
      res.status(400).render('user/client', { 
        title, layout, dashbar, fields, errors
      })
    }
  } else {
    try {
      let companyId = res.locals.user.companyId,
          clientId = res.locals.route.clientId,
          client = await Client.readByCompany(companyId, clientId)

      await client.update(fields)
      req.query.pageFor = clientId
      res.flash('message', `The ${type} was saved succesfully.`)
      res.redirect(`../${types}` + '?' + serialize(req.query))
    } catch (error) {
      console.log(error)
      if (error.message.includes('UNIQUE constraint failed')) {
        error = `${type === 'exporter' ? 'An exporter' : 'A consignee'} with that name already exists.`
      }
      if (req.query.redirect === type) {
        res.flash('error', error.message || error)
        res.redirect(`../${types}` + '?' + serialize(req.query))
      } else {
        res.status(400).render('user/client', { 
          title, layout, dashbar, fields, error: error.message || error 
        })
      }
    }
  }
}

//------------------------------------------------------
// Response for GET delete existing client request
//------------------------------------------------------
const deleteClient = async (req, res, type) => {
  try {
    let course = await res.locals.user.courseById(req.params.course_id)
    await course.deleteClient(req.params.client_id)
    res.flash('message', 'The client was deleted succesfully.')
    res.redirect('../../clients')
  } catch (error) {
    res.flash('error', error.message || error)
    res.status(400).redirect('../../clients')
  }
}

//------------------------------------------------------
// Response for GET clients request
//------------------------------------------------------
const editClients = async (req, res, type) => {
  let types = Client.getPluralName(type),
      title = _.capitalize(types), 
      filter = {}

  if (flashParamsRedirect(req, res, types)) { return }

  if (req.query.page) { filter.page = req.query.page }
  if (req.query.search) { 
    filter.search = req.query.search
    delete req.query['pageFor']   // pageFor should only be used once
  }
  if (req.query.sort) { filter.sort = req.query.sort }
  if (req.query.dir) { filter.dir = req.query.dir }
  if (req.query.pageFor) { filter.pageFor = req.query.pageFor }

  try {
    let companyId = res.locals.user.companyId,
        data = await Client.filter({ companyId, type }, filter)
    res.render('user/clients', { 
      title, layout, dashbar, 
      records: data.records, filter: data.filter, type, types
    })
  } catch (error) {
    res.flash('error', error.message || error)
    res.status(400).redirect(res.locals.user.dashboardPath)
  }
}

//------------------------------------------------------
// Response for POST delete client request
//------------------------------------------------------
const deleteClients = async (req, res) => {
  let ids = req.fields["data[]"]
  try {
    if (!ids) throw 'There was a problem deleting the client: no data received.'
    let course = await res.locals.user.courseById(req.params.course_id)
    if (typeof ids === 'string') ids = [ ids ]
    for (let i in ids) {
      await course.deleteClient(ids[i])
    }
    res.send({ 'status': 'ok', 'message': 'The client was deleted succesfully.' })
  } catch (error) {
    res.flash('error', error.message || error)
    res.send({ 'status': 'error', 'message': error.message || error })
  }
}


module.exports = {
  newClient,
  createClient,
  editClient,
  saveClient,
  deleteClient,
  editClients,
  deleteClients
}
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

const { serialize } = require('../utils/server_utils')
const { flashParamsRedirect } = require('./controller_utils')

const { FormValidator }  = require('../utils/forms/form_validator')
const forms = require('../utils/forms/client_forms.json')

const { Client } = require('../models/client')

const { DASHBOARD_MENU } = require('./dashboard_controller')

const EDIT_LAYOUT = 'dashboard_layout'


//======================================================
// Edit client routines
//======================================================

//------------------------------------------------------
// Response for GET new client request
//------------------------------------------------------
const newClient = async (req, res, type) => {
  let title = `New ${_.capitalize(type)}`, 
      layout = EDIT_LAYOUT,
      sidebar = DASHBOARD_MENU,
      fields = { type }
  res.render('edit/edit_client', { title, layout, sidebar, fields })
}

//------------------------------------------------------
// Response for POST new client request
//------------------------------------------------------
const createClient = async (req, res, type) => {
  let title = `New ${_.capitalize(type)}`, 
      layout = EDIT_LAYOUT, 
      sidebar = DASHBOARD_MENU,
      pluralName = Client.getPluralName(type),
      fields = _.merge(req.fields, type),
      errors = new FormValidator(forms['edit_client']).validate(fields)

  if (errors) {
    if (req.query.redirect === type) {
      res.flash('errors', errors)
      res.redirect(type + '?' + serialize(req.query))
    } else {
      res.status(400).render('edit/edit_client', { 
        title, layout, sidebar, fields, errors 
      })
    }
  } else {
    try {
      let client = await res.locals.user.createClient(type, fields)
      req.query.pageFor = client.id
      res.flash('message', `The ${type} was saved succesfully.`)
      res.redirect(pluralName + '?' + serialize(req.query))
    } catch (error) {
      if (error.message.search('UNIQUE constraint failed')) {
        error = `${type === 'exporter' ? 'An exporter' : 'A consignee'} with that name already exists.`
      }
      if (req.query.redirect === type) {
        res.flash('error', error)
        res.redirect(pluralName + '?' + serialize(req.query))
      } else {
        res.status(400).render('edit/edit_client', { 
          title, layout, sidebar, fields, error 
        })
      }
    }
  }
}

//------------------------------------------------------
// Response for GET existing client request
//------------------------------------------------------
const editClient = async (req, res, type) => {
  let title = `Edit ${_.capitalize(type)}`, 
      layout = EDIT_LAYOUT,
      sidebar = DASHBOARD_MENU

  try {
    let companyId = res.locals.user.companyId,
        id = req.params.client_id,
        client = Client.readByCompany(companyId, id),
        fields = client
    res.render('edit/edit_client', { title, sidebar, fields, layout })
  } catch (error) {
    res.flash('error', `The requested ${type} was not found.`)
    res.status(404).redirect(`../${Client.getPluralName(type)}`)
  }
}

//------------------------------------------------------
// Response for POST existing client request
//------------------------------------------------------
const saveClient = async (req, res, type) => {
  let title = `New ${_.capitalize(type)}`, 
  layout = EDIT_LAYOUT, 
  sidebar = DASHBOARD_MENU,
  pluralName = Client.getPluralName(type),
  fields = _.merge(req.fields, type),
  errors = new FormValidator(forms['edit_client']).validate(fields)

  if (errors) {
    if (req.query.redirect === type) {
      res.flash('errors', errors)
      res.redirect(`../${pluralName}` + '?' + serialize(req.query))
    } else {
      res.status(400).render('edit/edit_client', { 
        title, layout, sidebar, fields, errors
      })
    }
  } else {
    try {
      let companyId = res.locals.user.companyId,
          id = req.params.client_id,
          client = Client.readByCompany(companyId, id)

      client = await client.update(fields)
      res.flash('message', `The ${type} was saved succesfully.`)
      res.redirect(`../${pluralName}` + '?' + serialize(req.query))
    } catch (error) {
      if (error.message.search('UNIQUE constraint failed')) {
        error = `${type === 'exporter' ? 'An exporter' : 'A consignee'} with that name already exists.`
      }
      if (req.query.redirect === type) {
        res.flash('error', error)
        res.redirect(`../${pluralName}` + '?' + serialize(req.query))
      } else {
        res.status(400).render('edit/edit_client', { 
          title, layout, sidebar, fields, error 
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
    res.flash('error', error)
    res.status(400).redirect('../../clients')
  }
}

//------------------------------------------------------
// Response for GET clients request
//------------------------------------------------------
const editClients = async (req, res, type) => {

  if (flashParamsRedirect(req, res, 'clients')) return

  let 
    sidebar = DASHBOARD_MENU, 
    filter = {}

  if (req.query.page) { filter.page = req.query.page }
  if (req.query.search) { 
    filter.search = req.query.search
    delete req.query['pageFor']   // pageFor should only be used once
  }
  if (req.query.sort) { filter.sort = req.query.sort }
  if (req.query.dir) { filter.dir = req.query.dir }
  if (req.query.pageFor) { filter.pageFor = req.query.pageFor }

  try {
    let data = await Client.filter(req.params.course_id, filter)
    res.render('edit/edit_course_clients', { 
      records: data.records, sidebar, filter: data.filter, 
      layout: EDIT_LAYOUT, title: 'Edit Course Client'
    })
  } catch (error) {
    res.flash('error', error)
    res.status(400).redirect('/')
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
    res.flash('error', error)
    res.send({ 'status': 'error', 'message': error })
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
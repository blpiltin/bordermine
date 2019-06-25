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
const newClient = async (req, res) => {
  let sidebar = DASHBOARD_MENU
  res.render('edit/edit_course_client', { 
    title: 'New Course client', sidebar, layout: EDIT_LAYOUT 
  })
}

//------------------------------------------------------
// Response for POST new client request
//------------------------------------------------------
const createClient = async (req, res) => {
  let title = 'New Client', layout = EDIT_LAYOUT, sidebar = DASHBOARD_MENU
  let fields = req.fields
  let errors = new FormValidator(forms['edit_course_client']).validate(fields)
  if (errors) {
    if (req.query.redirect === 'client') {
      res.flash('errors', errors)
      res.redirect('client' + '?' + serialize(req.query))
    } else {
      res.status(400).render('edit/edit_course_client', { 
        title, sidebar, fields, errors, layout 
      })
    }
  } else {
    try {
      let course = await res.locals.user.courseById(req.params.course_id)
      let client = await course.createClient(fields)
      req.query.pageFor = client.id
      res.flash('message', 'The course client was saved succesfully.')
      res.redirect('clients' + '?' + serialize(req.query))
    } catch (error) {
      if (error.message.search('UNIQUE constraint failed')) {
        error = 'Client with that word already exists.'
      }
      if (req.query.redirect === 'client') {
        res.flash('error', error)
        res.redirect('clients' + '?' + serialize(req.query))
      } else {
        res.status(400).render('edit/edit_course_client', { 
          title, sidebar, fields, error, layout 
        })
      }
    }
  }
}

//------------------------------------------------------
// Response for GET existing client request
//------------------------------------------------------
const editClient = async (req, res) => {
  let title = 'Edit Course Client', layout = EDIT_LAYOUT, sidebar = DASHBOARD_MENU
  try {
    let course = await res.locals.user.courseById(req.params.course_id)
    let client = await course.clientById(req.params.client_id)
    res.render('edit/edit_course_client', { title, sidebar, fields: client, layout })
  } catch (error) {
    res.flash('error', 'The requested course client was not found.')
    res.status(404).redirect('../clients')
  }
}

//------------------------------------------------------
// Response for POST existing client request
//------------------------------------------------------
const saveClient = async (req, res) => {
  let title = 'Edit Course Client', layout = EDIT_LAYOUT, sidebar = DASHBOARD_MENU
  let fields = req.fields
  let errors = new FormValidator(forms['edit_course_client']).validate(fields)
  if (errors) {
    if (req.query.redirect === 'clients') {
      res.flash('errors', errors)
      res.redirect('../clients' + '?' + serialize(req.query))
    } else {
      res.status(400).render('edit/edit_course_client', { 
        title, sidebar, fields, errors, layout
      })
    }
  } else {
    try {
      let course = await res.locals.user.courseById(req.params.course_id)
      let client = await course.clientById(req.params.client_id)
      client = await client.update(fields)
      res.flash('message', 'The course client was saved succesfully.')
      res.redirect('../clients' + '?' + serialize(req.query))
    } catch (error) {
      if (error.message.search('UNIQUE constraint failed')) {
        error = 'Client with that word already exists.'
      }
      if (req.query.redirect === 'clients') {
        res.flash('error', error)
        res.redirect('../clients' + '?' + serialize(req.query))
      } else {
        res.status(400).render('edit/edit_course_client', { 
          title, sidebar, fields, error, layout 
        })
      }
    }
  }
}

//------------------------------------------------------
// Response for GET delete existing client request
//------------------------------------------------------
const deleteClient = async (req, res) => {
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
const editClients = async (req, res) => {

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
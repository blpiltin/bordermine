const debug = require('../../utils/debug').create('objective_controller.js')

const { serialize } = require('../utils/server_utils')
const { flashParamsRedirect } = require('./controller_utils')

const { FormValidator }  = require('../utils/forms/form_validator')
const forms = require('../utils/forms/course_forms.json')

const { EDIT_COURSE_MENU } = require('./course_controller')

const EDIT_LAYOUT = 'dashboard_layout'


//======================================================
// Edit objective routines
//======================================================

//------------------------------------------------------
// Response for GET new objective request
//------------------------------------------------------
const newObjective = async (req, res) => {
  let sidebar = EDIT_COURSE_MENU
  res.render('edit/edit_course_objective', { 
    title: 'New Course Objective', sidebar, layout: EDIT_LAYOUT 
  })
}

//------------------------------------------------------
// Response for POST new objective request
//------------------------------------------------------
const createObjective = async (req, res) => {
  let title = 'New Course Objective', layout = EDIT_LAYOUT, sidebar = EDIT_COURSE_MENU
  let fields = req.fields
  let errors = new FormValidator(forms['edit_course_objective']).validate(fields)
  if (errors) {
    if (req.query.redirect === 'objectives') {
      res.flash('errors', errors)
      res.redirect('objectives' + '?' + serialize(req.query))
    } else {
      res.status(400).render('edit/edit_course_objective', { 
        title, sidebar, fields, errors, layout 
      })
    }
  } else {
    try {
      let course = await res.locals.user.courseById(req.params.course_id)
      let objective = await course.createObjective(fields)
      req.query.pageFor = objective.id
      res.flash('message', 'The course objective was saved succesfully.')
      res.redirect('objectives' + '?' + serialize(req.query))
    } catch (error) {
      if (error.message.search('UNIQUE constraint failed')) {
        error = 'An objective with that code or text already exists.'
      }
      if (req.query.redirect === 'objectives') {
        res.flash('error', error)
        res.redirect('objectives' + '?' + serialize(req.query))
      } else {
        res.status(400).render('edit/edit_course_objective', { 
          title, sidebar, fields, error, layout 
        })
      }
    }
  }
}

//------------------------------------------------------
// Response for GET existing objective request
//------------------------------------------------------
const editObjective = async (req, res) => {
  let title = 'Edit Course Objective', layout = EDIT_LAYOUT, sidebar = EDIT_COURSE_MENU
  try {
    let course = await res.locals.user.courseById(req.params.course_id)
    let objective = await course.objectiveById(req.params.objective_id)
    res.render('edit/edit_course_objective', { title, sidebar, fields: objective, layout })
  } catch (error) {
    res.flash('error', 'The requested course objective was not found.')
    res.status(404).redirect('../objectives')
  }
}

//------------------------------------------------------
// Response for POST existing objective request
//------------------------------------------------------
const saveObjective = async (req, res) => {
  let title = 'Edit Course Objective', layout = EDIT_LAYOUT, sidebar = EDIT_COURSE_MENU
  let fields = req.fields
  let errors = new FormValidator(forms['edit_course_objective']).validate(fields)
  if (errors) {
    if (req.query.redirect === 'objectives') {
      res.flash('errors', errors)
      res.redirect('../objectives' + '?' + serialize(req.query))
    } else {
      res.status(400).render('edit/edit_course_objective', { 
        title, sidebar, fields, errors, layout 
      })
    }
  } else {
    try {
      let course = await res.locals.user.courseById(req.params.course_id)
      let objective = await course.objectiveById(req.params.objective_id)
      objective = await objective.update(fields)
      res.flash('message', 'The course objective was saved succesfully.')
      res.redirect('../objectives' + '?' + serialize(req.query))
    } catch (error) {
      if (error.message.search('UNIQUE constraint failed')) {
        error = 'An objective with that code or text already exists.'
      }
      debug.log(req.query.redirect)
      if (req.query.redirect === 'objectives') {
        res.flash('error', error)
        res.redirect('../objectives' + '?' + serialize(req.query))
      } else {
        res.status(400).render('edit/edit_course_objective', { 
          title, sidebar, fields, error, layout 
        })
      }
    }
  }
}

//------------------------------------------------------
// Response for GET delete existing objective request
//------------------------------------------------------
const deleteObjective = async (req, res) => {
  try {
    let course = await res.locals.user.courseById(req.params.course_id)
    await course.deleteObjective(req.params.objective_id)
    res.flash('message', 'The objective was deleted succesfully.')
    res.redirect('../../objectives')
  } catch (error) {
    res.flash('error', error)
    res.status(400).redirect('../../objectives')
  }
}

//------------------------------------------------------
// Response for GET objectives request
//------------------------------------------------------
const editObjectives = async (req, res) => {
  if (flashParamsRedirect(req, res, 'objectives')) return
  let sidebar = EDIT_COURSE_MENU, filter = {}
  if (req.query.search) { filter.search = req.query.search.toLowerCase(); }
  if (req.query.sort) { filter.sort = req.query.sort; }
  if (req.query.dir) { filter.dir = req.query.dir; }
  let pageSize = 10
  try {
    let course = await res.locals.user.courseById(req.params.course_id)
    let objectives = await course.allObjectives()
    if (objectives && objectives.length) {
      if (filter.search) {
        objectives = objectives.filter(obj => 
          obj.code && obj.code.toLowerCase().includes(filter.search) || 
          obj.text && obj.text.toLowerCase().includes(filter.search))
      }
      if (objectives.length && filter.sort in objectives[0]) {
        objectives.sort((a, b) => {
          let first = filter.dir === 'desc' ? b[filter.sort] : a[filter.sort]
          let second = filter.dir === 'desc' ? a[filter.sort] : b[filter.sort]
          if (first.toLowerCase() < second.toLowerCase()) { return -1; }
          else if (first.toLowerCase() > second.toLowerCase()) { return 1; }
          return 0
        })
      }
      filter.pages = new Array(Math.ceil(objectives.length / pageSize)).fill(0).map((val, i) => i + 1)
      if (filter.pages.length > 1) {
        if (req.query.pageFor) {
          filter.page = Math.ceil((objectives.findIndex(obj => obj.id == req.query.pageFor) + 1) / pageSize)
        } else { 
          if (!req.query.page || req.query.page < 1) { filter.page = 1; }
          else if (req.query.page > filter.pages.length) { filter.page = filter.pages.length; }
          else { filter.page = req.query.page; } 
        }
        let start = (filter.page - 1) * pageSize
        objectives = objectives.slice(start, start + pageSize)
      } else { filter.pages = null; }
    }
    res.render('edit/edit_course_objectives', { objectives, sidebar, filter, layout: EDIT_LAYOUT })
  } catch (error) {
    res.flash('error', error)
    res.status(400).redirect('/')
  }
}

//------------------------------------------------------
// Response for POST delete objectives request
//------------------------------------------------------
const deleteObjectives = async (req, res) => {
  let ids = req.fields["data[]"]
  try {
    if (!ids) throw 'There was a problem deleting the objective: no data received.'
    let course = await res.locals.user.courseById(req.params.course_id)
    if (typeof ids === 'string') ids = [ ids ]
    for (let i in ids) {
      await course.deleteObjective(ids[i])
    }
    res.send({ 'status': 'ok', 'message': 'The objectives were deleted succesfully.' })
  } catch (error) {
    res.flash('error', error)
    res.send({ 'status': 'error', 'message': error })
  }
}


module.exports = {
  newObjective,
  createObjective,
  editObjective,
  saveObjective,
  deleteObjective,
  editObjectives,
  deleteObjectives
}
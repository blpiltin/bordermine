const debug = require('../../utils/debug').create('activity_controller.js')

const _ = require('lodash')

const { serialize, stripHTML } = require('../utils/server_utils')
const { flashParamsRedirect } = require('./controller_utils')

const { Course } = require('../models/course')
const { Activity } = require('../models/activity')

const { EDIT_COURSE_MENU } = require('./course_controller')

const EDIT_LAYOUT = 'dashboard_layout'

const newActivity = async (req, res, type) => {
  let title = 'New ' + _.capitalize(type)
  let layout = EDIT_LAYOUT, sidebar = EDIT_COURSE_MENU
  let fields = { type }
  res.render('edit/edit_activity', { title, fields, sidebar, layout })
}

const createActivity = async (req, res, type) => {
  let title = 'New ' + _.capitalize(type)
  let layout = EDIT_LAYOUT, sidebar = EDIT_COURSE_MENU
  let fields = req.fields
  let errors = new FormValidator(form['edit_activity']).validate(fields)
  if (errors) {
    res.status(400).render('edit/edit_activity', { title, sidebar, fields, errors, layout })
  } else {
    try {
      let course = await Course.findOne({ 
        userId: req.session.userId, _id: req.params.course_id 
      })
      fields.type = type
      let activity = await course.addActivity(fields)
      req.query.pageFor = activity._id
      res.flash('message', `The ${type} was saved succesfully.`)
      res.redirect(Activity.pluralName(type) + '?' + serialize(req.query))
    } catch (error) {
      if (error.code === 11000) error = `A duplicate ${type} already exists.`
      res.status(400).render('edit/edit_activity', { title, sidebar, fields, error, layout })
    }
  }
}

const editActivity = async (req, res, type) => {
  let title = 'Edit ' + _.capitalize(type); 
  let layout = EDIT_LAYOUT, sidebar = EDIT_COURSE_MENU
  try {
    let course = await Course.findOne({ 
      userId: req.session.userId, _id: req.params.course_id 
    })
    let activity = await course.activities.id(req.params.activity_id )
    res.render('edit/edit_activity', { title, sidebar, fields: activity, layout })
  } catch (error) {
    res.flash('error', `The requested ${type} was not found.`)
    res.status(404).redirect('../' + Activity.pluralName(type))
  }
}

const saveActivity = async (req, res, type) => {
  let title = 'Edit ' + _.capitalize(type)
  let layout = EDIT_LAYOUT
  let fields = req.fields
  let errors = new FormValidator(form['edit_activity']).validate(fields)
  if (errors) {
    res.status(400).render('edit/edit_activity', { title, fields, errors, layout })
  } else {
    try {
      let course = await Course.findOne({ 
        userId: req.session.userId, _id: req.params.course_id 
      })
      let activity = await course.activities.id(req.params.activity_id )
      for (let key in fields) activity[key] = fields[key]
      activity.type = type;   // Just in case the type was modfied?
      await course.save()
      res.flash('message', `The ${type} was saved succesfully.`)
      res.redirect('../' + Activity.pluralName(type) + '?' + serialize(req.query))
    } catch (error) {
      if (error.code === 11000) error = 'A duplicate activity already exists.'
      res.status(400).render('edit/edit_activity', { title, fields, error, layout })
    }
  }
}

const deleteActivity = async (req, res, type) => {
  try {
    let course = await Course.findOne({ 
      userId: req.session.userId, _id: req.params.course_id 
    })
    await course.deleteActivity(req.params.activity_id)
    res.flash('message', 'The activity was deleted succesfully.')
    res.redirect('../../' + Activity.pluralName(type))
  } catch (error) {
    res.flash('error', error)
    res.status(400).redirect('../../' + Activity.pluralName(type))
  }
}


const editActivities = async (req, res, type) => {
  let sidebar = EDIT_COURSE_MENU, layout = EDIT_LAYOUT; pluralName = Activity.pluralName(type)
  let title = 'Edit ' + _.capitalize(pluralName)
  debug.log('pluralName:', pluralName)
  let filter = {}
  if (flashParamsRedirect(req, res, pluralName)) return
  if (req.query.search) { filter.search = req.query.search.toLowerCase(); }
  if (req.query.sort) { filter.sort = req.query.sort; }
  if (req.query.dir) { filter.dir = req.query.dir; }
  debug.log('req.query', req.query)
  let pageSize = 10
  try {
    debug.log('userId:', req.session.userId, 'course_id:', req.params.course_id)
    let course = await Course.findOne({ 
      userId: req.session.userId, _id: req.params.course_id 
    })
    let activities = await course.activitiesByType(type)
    // let activities = await course.activities
    debug.log('activities:', activities)
    if (activities && activities.length) {
      if (filter.search) {
        activities = activities.filter(obj => 
          obj.title && obj.title.toLowerCase().includes(filter.search) || 
          obj.description && obj.description.toLowerCase().includes(filter.search) ||
          obj.unit && obj.unit.toLowerCase().includes(filter.search))
      }
      if (activities.length && filter.sort in activities[0]) {
        activities.sort((a, b) => {
          let first = filter.dir === 'desc' ? b[filter.sort] : a[filter.sort]
          let second = filter.dir === 'desc' ? a[filter.sort] : b[filter.sort]
          if (first.toLowerCase() < second.toLowerCase()) { return -1; }
          else if (first.toLowerCase() > second.toLowerCase()) { return 1; }
          return 0
        })
      }
      filter.pages = new Array(Math.ceil(activities.length / pageSize)).fill(0).map((val, i) => i + 1)
      if (filter.pages.length > 1) {
        if (req.query.pageFor) {
          filter.page = Math.ceil((activities.findIndex(obj => obj._id == req.query.pageFor) + 1) / pageSize)
        } else { 
          if (!req.query.page || req.query.page < 1) { filter.page = 1; }
          else if (req.query.page > filter.pages.length) { filter.page = filter.pages.length; }
          else { filter.page = req.query.page; } 
        }
        let start = (filter.page - 1) * pageSize
        activities = activities.slice(start, start + pageSize)
      } else { filter.pages = null; }
    }
    res.render('edit/edit_activities', { title, activities, type, pluralName, sidebar, filter, layout })
  } catch (error) {
    debug.log(error.message)
    res.flash('error', error)
    res.status(400).redirect('/')
  }
}

const deleteActivities = async (req, res, type) => {
  let ids = req.fields["data[]"]
  try {
    if (!ids) throw `There was a problem deleting the ${Activity.pluralName(type)}: no data received.`
    let course = await Course.findOne({ 
      userId: req.session.userId, _id: req.params.course_id 
    })
    if (typeof ids === 'string') ids = [ ids ]
    for (let i in ids) {
      await course.deleteActivity(ids[i])
    }
    res.send({ 'status': 'ok', 'message': `The  ${Activity.pluralName(type)} were deleted succesfully.` })
  } catch (error) {
    res.flash('error', error)
    res.send({ 'status': 'error', 'message': error })
  }
}


module.exports = {
  newActivity,
  createActivity,
  editActivity,
  saveActivity,
  deleteActivity,
  editActivities,
  deleteActivities
}
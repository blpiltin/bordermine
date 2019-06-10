const debug = require('../../utils/debug').create('course_controller.js')

const fs = require('fs-extra')

const { FormValidator }  = require('../utils/forms/form_validator')
const forms = require('../utils/forms/course_forms.json')

const EDIT_LAYOUT = 'dashboard_layout'
const EDIT_COURSE_MENU = {
  objectives: true, vocabularys: true, lessons: true, assignments: true, 
  assessments: true, resources: true, files: true, info: true, settings: true
}


//======================================================
// Edit course routines
//======================================================

const newCourse = async (req, res) => {
  res.render('edit/edit_course_info', { title: 'New Course', layout: EDIT_LAYOUT })
}

const createCourse = async (req, res) => {
  let title = 'New Course', fields = req.fields, layout = EDIT_LAYOUT
  let errors = new FormValidator(forms['edit_course_info']).validate(fields, req.files)
  if (errors) {
    res.status(400).render('edit/edit_course_info', { title, fields, errors, layout })
  } else {
    try {
      let user = res.locals.user
      fields.userId = user.id
      let course = await user.createCourse(fields)
      await saveFile(req, res, course)
      res.flash('message', 'The course was saved succesfully.')
      res.redirect('course/' + course.id)
    } catch (error) {
      if (error.message.search('UNIQUE constraint failed')) {
        error = 'A course with that name, slug, or code already exists.'
      }
      res.status(400).render('edit/edit_course_info', { title, fields, error, layout })
    }
  }
}

const editCourseInfo = async (req, res) => {
  let title = 'Edit Course Info', layout = EDIT_LAYOUT, sidebar = EDIT_COURSE_MENU
  let course = await res.locals.user.courseById(req.params.course_id)
  if (course) {
    sidebar_id = req.params.course_id
    res.render('edit/edit_course_info', { title, sidebar, fields: course, layout })
  } else {
    res.flash('error', 'The requested course was not found.')
    res.status(404).redirect(res.locals.user.dashboardPath)
  }
}

const saveCourseInfo = async (req, res) => {
  let title = 'Edit Course Info', layout = EDIT_LAYOUT, sidebar = EDIT_COURSE_MENU
  let fields = req.fields, course = null;
  let errors = new FormValidator(forms['edit_course_info'])
    .validate(fields, req.files)
  if (errors) {
    res.status(400).render('edit/edit_course_info', { title, fields, errors, layout })
  } else {
    try {
      course = await res.locals.user.courseById(req.params.course_id)
      await course.update(fields)
      await deleteFile(req, res, course)
      await saveFile(req, res, course)
      res.flash('message', 'The course was saved succesfully.')
      res.redirect(res.locals.user.editPath + '/course/' + course.id)
    } catch (error) {
      if (error.message.search('UNIQUE constraint failed')) {
        error = 'A course with that name, slug, or code already exists.'
      }
      res.status(400).render('edit/edit_course_info', { 
        title, sidebar, fields: course, error, layout 
      })
    }
  }
}

const editCourse = async (req, res) => {
  try {
    let title = 'Edit Course', layout = EDIT_LAYOUT, sidebar = EDIT_COURSE_MENU
    let course = await res.locals.user.courseById(req.params.course_id)
    sidebar_id = req.params.course_id
    res.render('edit/edit_course', { title, sidebar, sidebar_id, fields: course, layout })
  } catch (error) {
    res.flash('error', 'The requested course was not found.')
    res.status(404).redirect(res.locals.user.dashboardPath)
  }
}

//======================================================
// View Course Routines
//======================================================
const viewCourseInfo = async (req, res, next) => {
  let course = res.locals.view.course
  let viewerIsOwner = res.locals.user && (res.locals.user.email === res.locals.view.owner.email)
  res.render('view/view_course_info', { course, viewerIsOwner, layout: 'course_view_layout' })
}


//======================================================
// Utils
//======================================================

//------------------------------------------------------
// Save a file from the req.files object. 
// Side effect: Modifies the req.fields[name] if the file is saved.
//------------------------------------------------------
const saveFile = async (req, res, course) => {
  if (req.files && req.files.icon && req.files.icon.name) {
    // #Todo: delete existing photo before saving new one.
    let file = req.files.icon
    await fs.move(file.path, res.locals.user.uploadsDir + file.name, { overwrite: true })
    await course.update({ icon: file.name })
  }
}

//------------------------------------------------------
// Delete a file from the req.fields.delete field.
// Side effect: Modifies the req.fields[name] if the file is deleted.
//------------------------------------------------------
const deleteFile = async (req, res, course) => {
  if (req.fields.delete) {
    await fs.remove(res.locals.user.uploadsDir + req.fields.icon)
    await course.update({ icon: null })
  }
}


module.exports = {
  EDIT_COURSE_MENU,
  newCourse,
  createCourse,
  editCourseInfo,
  saveCourseInfo,
  editCourse,
  viewCourseInfo
}

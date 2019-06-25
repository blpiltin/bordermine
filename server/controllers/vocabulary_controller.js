const debug = require('../../utils/debug').create('vocabulary_controller.js')

const { serialize } = require('../utils/server_utils')
const { flashParamsRedirect } = require('./controller_utils')

const { FormValidator }  = require('../utils/forms/form_validator')
const forms = require('../utils/forms/course_forms.json')

const { Vocabulary } = require('../models/vocabulary')

const { EDIT_COURSE_MENU } = require('./course_controller')

const EDIT_LAYOUT = 'dashboard_layout'


//======================================================
// Edit vocabulary routines
//======================================================

//------------------------------------------------------
// Response for GET new vocabulary request
//------------------------------------------------------
const newVocabulary = async (req, res) => {
  let sidebar = EDIT_COURSE_MENU
  res.render('edit/edit_course_vocabulary', { 
    title: 'New Course Vocabulary', sidebar, layout: EDIT_LAYOUT 
  })
}

//------------------------------------------------------
// Response for POST new vocabulary request
//------------------------------------------------------
const createVocabulary = async (req, res) => {
  let title = 'New Course Vocabulary', layout = EDIT_LAYOUT, sidebar = EDIT_COURSE_MENU
  let fields = req.fields
  let errors = new FormValidator(forms['edit_course_vocabulary']).validate(fields)
  if (errors) {
    if (req.query.redirect === 'vocabulary') {
      res.flash('errors', errors)
      res.redirect('vocabulary' + '?' + serialize(req.query))
    } else {
      res.status(400).render('edit/edit_course_vocabulary', { 
        title, sidebar, fields, errors, layout 
      })
    }
  } else {
    try {
      let course = await res.locals.user.courseById(req.params.course_id)
      let vocabulary = await course.createVocabulary(fields)
      req.query.pageFor = vocabulary.id
      res.flash('message', 'The course vocabulary was saved succesfully.')
      res.redirect('vocabularys' + '?' + serialize(req.query))
    } catch (error) {
      if (error.message.search('UNIQUE constraint failed')) {
        error = 'Vocabulary with that word already exists.'
      }
      if (req.query.redirect === 'vocabulary') {
        res.flash('error', error)
        res.redirect('vocabularys' + '?' + serialize(req.query))
      } else {
        res.status(400).render('edit/edit_course_vocabulary', { 
          title, sidebar, fields, error, layout 
        })
      }
    }
  }
}

//------------------------------------------------------
// Response for GET existing vocabulary request
//------------------------------------------------------
const editVocabulary = async (req, res) => {
  let title = 'Edit Course Vocabulary', layout = EDIT_LAYOUT, sidebar = EDIT_COURSE_MENU
  try {
    let course = await res.locals.user.courseById(req.params.course_id)
    let vocabulary = await course.vocabularyById(req.params.vocabulary_id)
    res.render('edit/edit_course_vocabulary', { title, sidebar, fields: vocabulary, layout })
  } catch (error) {
    res.flash('error', 'The requested course vocabulary was not found.')
    res.status(404).redirect('../vocabularys')
  }
}

//------------------------------------------------------
// Response for POST existing vocabulary request
//------------------------------------------------------
const saveVocabulary = async (req, res) => {
  let title = 'Edit Course Vocabulary', layout = EDIT_LAYOUT, sidebar = EDIT_COURSE_MENU
  let fields = req.fields
  let errors = new FormValidator(forms['edit_course_vocabulary']).validate(fields)
  if (errors) {
    if (req.query.redirect === 'vocabularys') {
      res.flash('errors', errors)
      res.redirect('../vocabularys' + '?' + serialize(req.query))
    } else {
      res.status(400).render('edit/edit_course_vocabulary', { 
        title, sidebar, fields, errors, layout
      })
    }
  } else {
    try {
      let course = await res.locals.user.courseById(req.params.course_id)
      let vocabulary = await course.vocabularyById(req.params.vocabulary_id)
      vocabulary = await vocabulary.update(fields)
      res.flash('message', 'The course vocabulary was saved succesfully.')
      res.redirect('../vocabularys' + '?' + serialize(req.query))
    } catch (error) {
      if (error.message.search('UNIQUE constraint failed')) {
        error = 'Vocabulary with that word already exists.'
      }
      if (req.query.redirect === 'vocabularys') {
        res.flash('error', error)
        res.redirect('../vocabularys' + '?' + serialize(req.query))
      } else {
        res.status(400).render('edit/edit_course_vocabulary', { 
          title, sidebar, fields, error, layout 
        })
      }
    }
  }
}

//------------------------------------------------------
// Response for GET delete existing vocabulary request
//------------------------------------------------------
const deleteVocabulary = async (req, res) => {
  try {
    let course = await res.locals.user.courseById(req.params.course_id)
    await course.deleteVocabulary(req.params.vocabulary_id)
    res.flash('message', 'The vocabulary was deleted succesfully.')
    res.redirect('../../vocabularys')
  } catch (error) {
    res.flash('error', error)
    res.status(400).redirect('../../vocabularys')
  }
}

//------------------------------------------------------
// Response for GET vocabularys request
//------------------------------------------------------
const editVocabularys = async (req, res) => {

  if (flashParamsRedirect(req, res, 'vocabularys')) return

  let 
    sidebar = EDIT_COURSE_MENU, 
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
    let data = await Vocabulary.filter({ courseId: req.params.course_id }, filter)
    res.render('edit/edit_course_vocabularys', { 
      records: data.records, sidebar, filter: data.filter, 
      layout: EDIT_LAYOUT, title: 'Edit Course Vocabulary'
    })
  } catch (error) {
    res.flash('error', error)
    res.status(400).redirect('/')
  }
}

//------------------------------------------------------
// Response for POST delete vocabulary request
//------------------------------------------------------
const deleteVocabularys = async (req, res) => {
  let ids = req.fields["data[]"]
  try {
    if (!ids) throw 'There was a problem deleting the vocabulary: no data received.'
    let course = await res.locals.user.courseById(req.params.course_id)
    if (typeof ids === 'string') ids = [ ids ]
    for (let i in ids) {
      await course.deleteVocabulary(ids[i])
    }
    res.send({ 'status': 'ok', 'message': 'The vocabulary was deleted succesfully.' })
  } catch (error) {
    res.flash('error', error)
    res.send({ 'status': 'error', 'message': error })
  }
}


module.exports = {
  newVocabulary,
  createVocabulary,
  editVocabulary,
  saveVocabulary,
  deleteVocabulary,
  editVocabularys,
  deleteVocabularys
}
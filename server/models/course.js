//======================================================
// course.js 
// 
// Description: Defines the course model.
// 
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.2
// History:
//  - 0.0.1: Initial version.
//  - 0.0.2: Converted to Objection/Knex from Mongoose
//======================================================

const debug = require('../../utils/debug').create('course.js')

const _ = require('lodash')

const fs = require('fs-extra')
const path = require('path')

const { Model } = require('objection')
const { Objective } = require('./objective')
const { Vocabulary } = require('./vocabulary')

const { nullifyEmpty } = require('./model_utils')

const { ModelValidator }  = require('../utils/model_validator')
const forms = require('../utils/forms/course_forms.json')

const UPLOADS_DIR = path.join(__dirname, '../../client/uploads')


class Course extends Model {

  static get tableName() { return 'courses' }

  static get relationMappings() {
    return {
      objectives: {
        relation: Model.HasManyRelation,
        modelClass: Objective,
        join: {
          from: 'courses.id',
          to: 'objectives.courseId'
        }
      },
      vocabularys: {
        relation: Model.HasManyRelation,
        modelClass: Vocabulary,
        join: {
          from: 'courses.id',
          to: 'vocabularys.courseId'
        }
      }
    }
  }

  static createValidator() { return new ModelValidator(forms['edit_course_info']) }

  //------------------------------------------------------
  // TODO: include file saving/deleting here at the model level
  //  instead of at the controller level.
  //------------------------------------------------------
  update(json) {
    return new Promise((resolve, reject) => {
      let data = _.pick(json, ['name', 'slug', 'code', 'description', 'icon'])

      data.modified = Date.now()

      Course.query().patchAndFetchById(this.id, data)
      .then(course => resolve(course))
      .catch(err => reject(err))
    })
  }

  //------------------------------------------------------
  // Find a course given a json query
  //------------------------------------------------------
  static findOne(json) {
    return new Promise((resolve, reject) => {
      Course.query()
      .eager('[objectives, vocabularys]')
      .where(json)
      .then(courses => {
        if (courses[0]) { resolve(courses[0]) }
        else { reject(Error('Could not find requested course.')) }
      })
      .catch(err => reject(err))
    })
  }

  createObjective(json) {
    return new Promise((resolve, reject) => {

      let data = _.pick(json, ['code', 'text'])
      nullifyEmpty(data)

      this.$relatedQuery('objectives').insert(data)
      .then(objective => resolve(objective))
      .catch(err => reject(err))
    })
  }

  deleteObjective(id) {
    return new Promise((resolve, reject) => {
      Objective.query().delete().where({ id })
      .then(num => resolve(num))
      .catch(err => reject(err))
    }) 
  }

  allObjectives() {
    return new Promise((resolve, reject) => {
      this.$relatedQuery('objectives')
      .where({ courseId: this.id })
      .then(objectives => resolve(objectives))
      .catch(err => reject(err))
    })
  }

  objectiveById(id) {
    return new Promise((resolve, reject) => {
      this.$relatedQuery('objectives')
      .where({ id })
      .then(objectives => {
        if (objectives[0]) { resolve(objectives[0]) }
        else { reject(Error(`Could not find objective with id ${id}`)) }
      })
      .catch(err => reject(err))
    })
  }

  createVocabulary(json) {
    return new Promise((resolve, reject) => {

      let data = _.pick(json, ['word', 'definition', 'image'])

      this.$relatedQuery('vocabularys').insert(data)
      .then(vocabulary => resolve(vocabulary))
      .catch(err => reject(err))
    })
  }

  allVocabularys() {
    return new Promise((resolve, reject) => {
      this.$relatedQuery('vocabularys')
      .where({ courseId: this.id })
      .then(vocabularys => resolve(vocabularys))
      .catch(err => reject(err))
    })
  }

  vocabularyById(id) {
    return new Promise((resolve, reject) => {
      this.$relatedQuery('vocabularys')
      .where({ id })
      .then(vocabulary => {
        if (vocabulary[0]) { resolve(vocabulary[0]) }
        else { reject(Error(`Could not find vocabulary with id ${id}`)) }
      })
      .catch(err => reject(err))
    })
  }

  deleteVocabulary(id) {
    return new Promise((resolve, reject) => {
      Vocabulary.query().delete().where({ id })
      .then(num => resolve(num))
      .catch(err => reject(err))
    }) 
  }
}

// const _ = require('lodash');

// const { Database } = require('../db/database');

// const { ObjectiveSchema } = require('./objective');
// const { ActivitySchema } = require('./activity');

// var CourseSchema = new Database.Schema({
//   user_id: {
//     type: Database.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   name: { type: String, required: true },
//   code: { type: String },
//   slug: { type: String, required: true },
//   description: { type: String },
//   icon: { type: String },
//   objectives: [ ObjectiveSchema ],
//   activities: [ ActivitySchema ]
// });

// CourseSchema.index({ user_id: 1, name: 1 }, { unique: true });
// CourseSchema.index({ user_id: 1, slug: 1 }, { unique: true });
// CourseSchema.index({ 'objectives.code': 1, 'objectives.text': 1 }, { unique: true, sparse: true });
// CourseSchema.index({ 'activities.type': 1, 'activities.title': 1 }, { unique: true, sparse: true });
// CourseSchema.index({ 'activities.type': 1, 'activities.slug': 1 }, { unique: true, sparse: true });
// CourseSchema.index({ 'activities.vocabulary.word': 1 }, { unique: true, sparse: true });

// CourseSchema.methods.toJSON = function () {
//   var obj = this.toObject();
//   debug.log(obj);
//   return _.pick(obj, ['_id', 'user_id', 'name', 'description', 'icon']);
// };

// CourseSchema.methods.activitiesByType = async function (type) {
//   return await this.activities.filter(obj => obj.type === type);
// }

// CourseSchema.methods.addObjective = async function (objective) {
//   try {
//     this.objectives.push(objective);
//     await this.save();
//     return this.objectives[this.objectives.length - 1];
//   } catch (error) {
//     throw 'There was a problem adding the objective: ' + error.message;
//   }
// };

// CourseSchema.methods.deleteObjective = async function (_id) {
//   try {
//     this.objectives.id(_id).remove();
//     await this.save();
//   } catch (error) {
//     throw 'There was a problem deleting the objective: ' + error.message;
//   }
// };


// CourseSchema.methods.addActivity = async function (activity) {
//   try {
//     this.activities.push(activity);
//     await this.save();
//     return this.activities[this.activities.length - 1];
//   } catch (error) {
//     throw 'There was a problem adding the activity: ' + error.message;
//   }
// };

// CourseSchema.methods.deleteActivity = async function (_id) {
//   try {
//     this.activities.id(_id).remove();
//     await this.save();
//   } catch (error) {
//     throw 'There was a problem deleting the activity: ' + error.message;
//   }
// };


// var Course = Database.model('Course', CourseSchema);

module.exports = { Course };
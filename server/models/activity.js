//======================================================
// activity.js 
// 
// Description: Defines activity base class.
// 
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.2
// History:
//  - 0.0.1: Initial version.
//  - 0.0.4: Converted to Objection/Knex from Mongoose
//======================================================

const { BaseModel } = require('./base_model')


const ACTIVITY_TYPES = [
  'lesson', 
  'assignment', 
  'assessment', 
  'resource', 
  'news', 
  'event', 
  'agenda', 
  'announcement'
]


class Activity extends BaseModel {

  static get tableName() { return 'activities' }

  static get relationMappings() {
    return {
      course: {
        relation: Model.HasOneRelation,
        modelClass: Course,
        join: {
          from: 'activities.courseId',
          to: 'courses.id'
        }
      },
      unit: {
        relation: Model.HasOneRelation,
        modelClass: Unit,
        join: {
          from: 'activities.unitId',
          to: 'units.id'
        }
      }
    }
  }

  static pluralName() {
    return type === 'news' ? 'news' : type + 's'
  }

  get summarize() {
    console.log(stripHTML(this.description).match(/^(\w|\d|\s)+(\.|\?|\!|\n)/));
    return this.summary 
      ? this.summary 
      : this.description && stripHTML(this.description).match(/^(\w|\d|\s)+(\.|\?|\!|\n)/)[0];
  }
}


module.exports = { Activity, ACTIVITY_TYPES }

// const _ = require('lodash');

// const { stripHTML } = require('../utils/server_utils');
// const { Database } = require('../db/database');

// const { VocabularySchema } = require('./vocabulary');


// var ActivitySchema = new Database.Schema ({
//   type: { 
//     type: String, 
//     enum: [ 'lesson', 'assignment', 'assessment', 'resource', 'news', 'event', 'agenda', 'announcement' ],
//     required: true
//   },
//   title: { type: String, required: true },
//   slug: { type: String, required: true },
//   description: { type: String },
//   order: { type: Number },
//   summary: { type: String },
//   teacherNotes: { type: String },
//   studentNotes: { type: String },
//   unit: Database.Schema.Types.ObjectId,
//   objectives: [ Database.Schema.Types.ObjectId ],
//   vocabulary: [ VocabularySchema ],
//   groupModifications: [{
//     target: {
//       type: String,
//       enum: [ 'advanced', 'special education', 'english language learner' ]
//     },
//     type: { 
//       type: String,
//       enum: [ 'append', 'replace' ]
//     },
//     description: { type: String },
//     studentNotes: { type: String }
//   }],
//   topics: [ String ],
//   image: { type: String },
//   link: { type: String },
//   sticky: { type: Boolean }
// });

// ActivitySchema.statics.pluralName = type => type === 'news' ? 'news' : type + 's';

// ActivitySchema.virtual('summarize').get(function () {
//   console.log(stripHTML(this.description).match(/^(\w|\d|\s)+(\.|\?|\!|\n)/));
//   return this.summary 
//     ? this.summary 
//     : this.description && stripHTML(this.description).match(/^(\w|\d|\s)+(\.|\?|\!|\n)/)[0];
// });

// var Activity = Database.model('Activity', ActivitySchema);


// module.exports = { ActivitySchema, Activity }
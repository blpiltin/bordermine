const _ = require('lodash');

const { Database } = require('../db/database');

const { UserSchema } = require('./user');
const { ActivitySchema } = require('./activity');


var SectionSchema = new Database.Schema ({
  course_id: {
    type: Database.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  code: { type: String, required: true },
  startDate: { type: String },
  endDate: { type: String },
  notes: { type: String },
  students: [{ 
    user_id: {
      type: Database.Schema.Types.ObjectId,
      ref: 'User'
    },
    designation: {
      type: String,
      enum: [ 'advanced', 'special education', 'english language learner' ]
    }
  }],
  parents:[{ 
    type: Database.Schema.Types.ObjectId,
    ref: 'User'
  }],
  posts: [{
    activity: { type: ActivitySchema },
    studentNotesRevealTime: { type: Date },
    userModifications: [{
      users: [{ 
        type: Database.Schema.Types.ObjectId,
        ref: 'User'
      }],
      type: {
        type: String,
        enum: ['append', 'replaceGroup', 'replaceAll']
      },
      description: { type: String },
      studentNotes: { type: String },
      dueDate: { type: Date },
      dueString: { 
        type: String,
        enum: ['before school', 'before class', 'beginning of class', 'end of class', 'end of school day', 'midnight']
      }
    }],
    dueDate: { type: Date },
    dueString: { 
      type: String,
      enum: ['before school', 'before class', 'beginning of class', 'end of class', 'end of school day', 'midnight']
    },
    location: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    entireDay: { type: Boolean },
    publishDate: { type: Date, required: true, default: Date.now },
    expirationDate: { type: Date },
    publishStatus: { 
      type: String,
      enum: ['private', 'protected', 'public']
    },
    password: { type: String }
  }],
  agendas: [ AgendaSchema ],
  announcements: [ AnnouncementSchema ]
});

SectionSchema.index({ course_id: 1, code: 1 }, { unique: true });


var Section = Database.model('Section', SectionSchema);


module.exports = { SectionSchema, Section }
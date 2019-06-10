const bcrypt = require('bcryptjs')
const faker = require('faker')
faker.seed(777)  // Gives same results each execution


const { USER_ROLES } = require('../../models/user')
const { 
  USER_1_COURSES, 
  USER_3_COURSES, 
  USER_6_COURSES
} = require ('./users_seed')

const NUM_STATIC_COURSES = 5
const NUM_RANDOM_COURSES = 5

const USER_3_COURSES_COURSE_ID = 3
const USER_6_COURSES_COURSE_ID = 5

//------------------------------------------------------
// Seed the users table with both static and random data
//------------------------------------------------------
seed = function(knex, Promise) {
  return knex('courses').del()
  .then(function () {
    return knex('courses').insert(fillStaticCourseData())
  })
  .then(function () {
    return knex('courses').insert(fillRandomCourseData(USER_6_COURSES))
  })
}


//======================================================
// Utils
//======================================================

const fillStaticCourseData = () => {
  return [
    {
      id: 1, 
      userId: USER_1_COURSES,
      name: 'Test Course 1',
      slug: 'test-course-1',
      modified: Date.now(),
      created: Date.now()
    },
    {
      id: 2, 
      userId: USER_3_COURSES,
      name: 'Test Course 2',
      slug: 'test-course-2',
      modified: Date.now(),
      created: Date.now()
    },
    {
      id: 3, 
      userId: USER_3_COURSES,
      name: 'Test Course 3',
      slug: 'test-course-3',
      code: 'TC0003',
      modified: Date.now(),
      created: Date.now()
    },
    {
      id: 4, 
      userId: USER_3_COURSES,
      name: 'Test Course 4',
      slug: 'test-course-4',
      code: 'TC0004',
      description: 'This is the test course 4 description.',
      icon: 'test_icon_1.jpg',
      modified: Date.now(),
      created: Date.now()
    },
    {
      id: 5, 
      userId: USER_6_COURSES,
      name: 'Test Course 5',
      slug: 'test-course-5',
      modified: Date.now(),
      created: Date.now()
    }
  ]
}

const fillRandomCourseData = (userId) => {
  let data = []

  for (var i = 0; i < NUM_RANDOM_COURSES; i++) {
    data.push(getRandomCourseData(USER_6_COURSES))
  }
  
  return data
}

const getRandomCourseData = (userId) => {
  let name = faker.lorem.words(3)
  return {
    userId,
    name,
    slug: name.toLowerCase().replace(/ /g, '-'),
    code: faker.random.boolean() ? faker.random.alphaNumeric(6) : null,
    description: faker.lorem.paragraphs(3),
    icon: faker.random.boolean() ? 'test_icon_1.jpg' : null,
    modified: Date.now(),
    created: Date.now()
  }
}


module.exports = { 
  seed, 
  getRandomCourseData,
  USER_3_COURSES_COURSE_ID,
  USER_6_COURSES_COURSE_ID
}
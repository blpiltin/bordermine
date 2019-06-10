const bcrypt = require('bcryptjs')
const faker = require('faker')
faker.seed(777)  // Gives same results each execution

const { 
  USER_3_COURSES_COURSE_ID, 
  USER_6_COURSES_COURSE_ID
} = require ('./courses_seed')

const NUM_RANDOM_OBJECTIVES = 6


//------------------------------------------------------
// Seed the objectives table with both static and random data
//------------------------------------------------------
seed = function(knex, Promise) {
  return knex('objectives').del()
  .then(function () {
    return knex('objectives').insert(fillStaticObjectiveData())
  })
  .then(function () {
    return knex('objectives').insert(fillRandomObjectiveData(USER_6_COURSES_COURSE_ID))
  })
}


//======================================================
// Utils
//======================================================

const fillStaticObjectiveData = () => {
  return [
    {
      id: 1, 
      courseId: USER_3_COURSES_COURSE_ID,
      code: '1.3.1',
      text: 'This is the description for the test objective 1.'
    },
    {
      id: 2, 
      courseId: USER_6_COURSES_COURSE_ID,
      code: '1.6.1',
      text: 'This is the description for the test objective 1.'
    },
    {
      id: 3, 
      courseId: USER_6_COURSES_COURSE_ID,
      text: 'This is the description for the test objective 2.'
    },
    {
      id: 4, 
      courseId: USER_6_COURSES_COURSE_ID,
      code: '1.3.1',
      text: 'This is the description for the test objective 3.'
    },
    {
      id: 5, 
      courseId: USER_6_COURSES_COURSE_ID,
      text: 'This is the description for the test objective 4.'
    }
  ]
}

const fillRandomObjectiveData = (courseId) => {
  let data = []

  for (var i = 0; i < NUM_RANDOM_OBJECTIVES; i++) {
    data.push(getRandomObjectiveData(courseId))
  }
  
  return data
}

const getRandomObjectiveData = (courseId) => {
  return {
    courseId,
    code: faker.random.boolean() ? faker.random.alphaNumeric(6) : null,
    text: faker.lorem.paragraphs(1)
  }
}


module.exports = { 
  seed, 
  getRandomObjectiveData
}
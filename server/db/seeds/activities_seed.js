const faker = require('faker')
faker.seed(777)  // Gives same results each execution

const { 
  USER_3_COURSES_COURSE_ID, 
  USER_6_COURSES_COURSE_ID
} = require ('./courses_seed')

const NUM_RANDOM_VOCABULARYS = 16


//------------------------------------------------------
// Seed the vocabularys table with both static and random data
//------------------------------------------------------
seed = function(knex, Promise) {
  return knex('vocabularys').del()
  .then(function () {
    return knex('vocabularys').insert(fillStaticVocabularyData())
  })
  .then(function () {
    return knex('vocabularys').insert(fillRandomVocabularyData(USER_6_COURSES_COURSE_ID))
  })
}


//======================================================
// Utils
//======================================================

const fillStaticVocabularyData = () => {
  return [
    {
      id: 1, 
      courseId: USER_3_COURSES_COURSE_ID,
      word: 'hello',
      definition: 'This is the description for the test vocabulary 1.'
    },
    {
      id: 2, 
      courseId: USER_6_COURSES_COURSE_ID,
      word: 'hello goodbye',
      definition: 'This is the description for the test vocabulary 1.',
      image: 'test_image_1.jpg'
    },
    {
      id: 3, 
      word: 'something',
      courseId: USER_6_COURSES_COURSE_ID
    },
    {
      id: 4, 
      courseId: USER_6_COURSES_COURSE_ID,
      word: 'where',
      definition: 'This is the goodbye description for the test vocabulary 3.',
      image: 'test_image_1.jpg'
    },
    {
      id: 5, 
      courseId: USER_6_COURSES_COURSE_ID,
      word: 'GoodBYE when',
      definition: 'This is the description for the test vocabulary 4.'
    }
  ]
}

const fillRandomVocabularyData = (courseId) => {
  let data = []

  for (var i = 0; i < NUM_RANDOM_VOCABULARYS; i++) {
    data.push(getRandomVocabularyData(courseId))
  }
  
  return data
}

const getRandomVocabularyData = (courseId) => {
  return {
    courseId,
    word: faker.random.alphaNumeric(6),
    definition: faker.random.boolean() ? faker.lorem.paragraphs(1) : null,
    image: faker.random.boolean() ? 'test_image_1.jpg' : null
  }
}


module.exports = { 
  seed, 
  getRandomVocabularyData
}
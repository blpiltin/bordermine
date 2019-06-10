const bcrypt = require('bcryptjs')
const faker = require('faker')
faker.seed(777)  // Gives same results each execution

const { USER_ROLES } = require('../../models/user')


const NUM_STATIC_USERS = 5
const NUM_RANDOM_USERS = 5

const USER_NOT_ACTIVATED = 1
const USER_NO_PROFILE = 2
const USER_PARTIAL_PROFILE = 3
const USER_0_COURSES = 2
const USER_1_COURSES = 3
const USER_3_COURSES = 4
const USER_6_COURSES = 5

const USER_CREDENTIALS = 
  Array(NUM_STATIC_USERS + NUM_RANDOM_USERS).fill(true).map(elem => {
    let password = faker.random.alphaNumeric(7) + 'a1?'

    return { 
      email: faker.internet.email(),
      password,
      hash: bcrypt.hashSync(password, 10),
      activationCode: faker.random.uuid()
    }
  })


//------------------------------------------------------
// Seed the users table with both static and random data
//------------------------------------------------------
const seed = function(knex, Promise) {
  return knex('users').del()
  .then(function () {
    return knex('users').insert(getStaticUserData())
  })
  .then(function () {
    return knex('users').insert(getRandomUserData())
  })
}


//======================================================
// Utils
//======================================================

const getStaticUserData = () => {
  return [
    {
      id: 1, 
      email: USER_CREDENTIALS[0].email,
      password: USER_CREDENTIALS[0].hash,
      activationCode: USER_CREDENTIALS[0].activationCode,
      activated: false,
      role: 'teacher',
      created: Date.now(),
      modified: Date.now()
    },
    {
      id: 2, 
      email: USER_CREDENTIALS[1].email,
      password: USER_CREDENTIALS[1].hash,
      role: 'teacher',
      activationCode: USER_CREDENTIALS[1].activationCode,
      activated: false,
      created: Date.now(),
      modified: Date.now()
    },
    {
      id: 3, 
      email: USER_CREDENTIALS[2].email,
      password: USER_CREDENTIALS[2].hash,
      role: 'teacher',
      activationCode: USER_CREDENTIALS[2].activationCode,
      activated: true,
      created: Date.now(),
      modified: Date.now(),
      profile: JSON.stringify({
        firstName: 'Test',
        lastName: 'Teacher3'
      })
    },
    {
      id: 4,
      email: USER_CREDENTIALS[3].email,
      password: USER_CREDENTIALS[3].hash,
      role: 'teacher',
      activationCode: USER_CREDENTIALS[3].activationCode,
      activated: true,
      created: Date.now(),
      modified: Date.now(),
      profile: JSON.stringify({
        firstName: 'Test',
        lastName: 'Teacher4',
        room: 'A-444',
        phone: '999-999-9999 x999',
        bio: 'This is a test bio. Isn\'t it beautiful?',
        photo: 'test_photo_1.jpg'
      })
    },
    {
      id: 5,
      email: USER_CREDENTIALS[4].email,
      password: USER_CREDENTIALS[4].hash,
      role: 'teacher',
      activationCode: USER_CREDENTIALS[4].activationCode,
      activated: true,
      created: Date.now(),
      modified: Date.now(),
      profile: JSON.stringify({
        firstName: 'Test',
        lastName: 'Teacher5',
        room: 'A-555',
        phone: '999-999-9999 x999',
        bio: 'This is a test bio. Isn\'t it beautiful?',
        photo: 'test_photo_1.jpg'
      })
    }
  ]
}

const getRandomUserData = () => {
  let data = []

  for (var i = 0; i < NUM_RANDOM_USERS; i++) {
    data.push({
      email: USER_CREDENTIALS[NUM_STATIC_USERS + i].email,
      password: USER_CREDENTIALS[NUM_STATIC_USERS + i].hash,
      activationCode: USER_CREDENTIALS[NUM_STATIC_USERS + i].activationCode,
      activated: true,
      role: faker.random.arrayElement(USER_ROLES),
      created: Date.now(),
      modified: Date.now(),
      profile: JSON.stringify({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        phone: faker.phone.phoneNumber(),
        room: faker.random.alphaNumeric(4),
        bio: faker.lorem.paragraphs(),
        photo: faker.random.boolean() ? 'test_photo_1.jpg' : null
      })
    })
  }
  
  return data
}


module.exports = { 
  seed,
  USER_CREDENTIALS,
  USER_0_COURSES,
  USER_1_COURSES, 
  USER_3_COURSES, 
  USER_6_COURSES
}
//======================================================
// users_seed.js
//
// Description: Seed the users database table for testing
//  and development purposes.
//
// Version: 0.0.1
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

const bcrypt = require('bcryptjs')

const faker = require('faker')
faker.seed(777)   // Gives same data for each execution

const { User } = require('../../models/user')


const NUM_STATIC_USERS = 5
const NUM_RANDOM_USERS = 5


//------------------------------------------------------
// Create and array with user credentials including:
//  email, password (unhashed), hash password, activationCode
//------------------------------------------------------
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
      role: 'owner',
      created: Date.now(),
      modified: Date.now()
    },
    {
      id: 2, 
      email: USER_CREDENTIALS[1].email,
      password: USER_CREDENTIALS[1].hash,
      role: 'owner',
      activationCode: USER_CREDENTIALS[1].activationCode,
      activated: false,
      created: Date.now(),
      modified: Date.now()
    },
    {
      id: 3, 
      email: USER_CREDENTIALS[2].email,
      password: USER_CREDENTIALS[2].hash,
      role: 'owner',
      activationCode: USER_CREDENTIALS[2].activationCode,
      activated: true,
      created: Date.now(),
      modified: Date.now(),
      profile: JSON.stringify({
        firstName: 'Test',
        lastName: 'Owner3'
      })
    },
    {
      id: 4,
      email: USER_CREDENTIALS[3].email,
      password: USER_CREDENTIALS[3].hash,
      role: 'owner',
      activationCode: USER_CREDENTIALS[3].activationCode,
      activated: true,
      created: Date.now(),
      modified: Date.now(),
      profile: JSON.stringify({
        firstName: 'Test',
        lastName: 'Owner4',
        phone: '999-999-9999 x999',
        title: 'CEO',
        photo: 'test_photo_1.jpg'
      })
    },
    {
      id: 5,
      email: USER_CREDENTIALS[4].email,
      password: USER_CREDENTIALS[4].hash,
      role: 'owner',
      activationCode: USER_CREDENTIALS[4].activationCode,
      activated: true,
      created: Date.now(),
      modified: Date.now(),
      profile: JSON.stringify({
        firstName: 'Test',
        lastName: 'Owner5',
        phone: '999-999-9999 x999',
        title: 'Learning Man',
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
      role: faker.random.arrayElement(User.roles),
      created: Date.now(),
      modified: Date.now(),
      profile: JSON.stringify({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        phone: faker.phone.phoneNumber(),
        title: faker.random.words(),
        photo: faker.random.boolean() ? 'test_photo_1.jpg' : null
      })
    })
  }
  
  return data
}


module.exports = { 
  seed,
  USER_CREDENTIALS
}
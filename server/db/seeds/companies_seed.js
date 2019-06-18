//======================================================
// companies_seed.js
//
// Description: Seed the companies database table for testing
//  and development purposes.
//
// Version: 0.0.1
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

const faker = require('faker')
faker.seed(777)   // Gives same data for each execution

const { Company } = require('../../models/company')

const NUM_STATIC_COMPANIES = 3
const NUM_RANDOM_COMPANIES = 3


//------------------------------------------------------
// Seed the companies table with both static and random data
//------------------------------------------------------
const seed = function (knex, Promise) {
  return knex('companies').del()
  .then(function () {
    return knex('companies').insert(getStaticCompanyDataArray())
  })
  .then(function () {
    return knex('companies').insert(getRandomCompanyDataArray())
  })
}


//======================================================
// Utils
//======================================================

const getStaticCompanyDataArray = () => {
  return [
    {
      id: 1, 
      ownerId: 1,
      contactId: 1,
      type: 'broker',
      name: 'Company Name 1',
      address: JSON.stringify({
        line1: '111 Company Address Line 1',
        line2: 'Suite 111',
        city: 'City One',
        state: 'One State',
        postalCode: '1111',
        country: 'Country One'
      }),
      logo: 'test_photo_1.jpg'
    },
    {
      id: 2, 
      ownerId: 1,
      contactId: 1,
      type: 'carrier',
      name: 'Company Name 2',
      address: JSON.stringify({
        line1: '222 Company Address Line 1',
        line2: 'Suite 222',
        city: 'City Two',
        state: 'Two State',
        postalCode: '22222',
        country: 'Country Two'
      }),
      logo: 'test_photo_1.jpg'
    },
    {
      id: 3, 
      ownerId: 1,
      contactId: 1,
      type: 'broker',
      name: 'Company Name 3',
      address: JSON.stringify({
        line1: '333 Company Address Line 3',
        city: 'City Three',
        state: 'Three State',
        postalCode: '33333',
        country: 'Country Three'
      }),
      logo: null
    }
  ]
}

const getRandomCompanyDataArray = () => {
  let arr = []

  for (var i = 0; i < NUM_RANDOM_COMPANIES; i++) {
    let data = getRandomCompanyData()

    data.address = JSON.stringify(data.address)

    arr.push(data)
  }
  
  return arr
}

const getRandomCompanyData = (ownerId = 1, contactId = 1) => {
  return {
    ownerId,
    contactId,
    type: faker.random.arrayElement(Company.types),
    name: faker.company.companyName(),
    address: {
      line1: faker.address.streetAddress(),
      line2: faker.random.boolean() ? faker.address.secondaryAddress() : '',
      city: faker.address.city(),
      state: faker.address.state(),
      postalCode: faker.address.zipCode(),
      country: faker.address.country()
    },
    logo: faker.random.boolean() ? 'test_photo_1.jpg' : null,
    created: Date.now(),
    modified: Date.now()
  }
}


module.exports = { 
  seed,
  getRandomCompanyData,
  NUM_STATIC_COMPANIES,
  NUM_RANDOM_COMPANIES
}
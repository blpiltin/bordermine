//======================================================
// clients_seed.js
//
// Description: Seed the clients database table for testing
//  and development purposes.
//
// Version: 0.0.1
//
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//======================================================

const faker = require('faker')
faker.seed(777)   // Gives same data for each execution

const { Client } = require('../../models/client')

const NUM_STATIC_CLIENTS = 6
const NUM_RANDOM_CLIENTS = 40


//------------------------------------------------------
// Seed the clients table with both static and random data
//------------------------------------------------------
const seed = function (knex, Promise) {
  return knex('clients').del()
  .then(function () {
    return knex('clients').insert(getStaticClientDataArray())
  })
  .then(function () {
    return knex('clients').insert(getRandomClientDataArray())
  })
}


//======================================================
// Utils
//======================================================

const getStaticClientDataArray = () => {
  return [
    {
      id: 1, 
      companyId: 1,
      executiveId: 1,
      type: 'exporter',
      name: 'Exporter Name 1',
      address: JSON.stringify({
        line1: '111 Client Address Line 1',
        line2: 'Suite 111',
        city: 'City One',
        state: 'One State',
        postalCode: '1111',
        country: 'Country One'
      }),
      contact: JSON.stringify({
        firstName: 'Client',
        lastName: 'Contact 1',
        phone: '111-111-1111',
        fax: '111-111-1111',
        email: 'client1@testclient.com'
      }),
      notes: 'Some notes for test client 1 here.'
    },
    {
      id: 2, 
      companyId: 1,
      executiveId: 1,
      type: 'exporter',
      name: 'Client Name 2',
      address: JSON.stringify({
        line1: '111 Client Address Line 1',
        line2: 'Suite 111',
        city: 'City One',
        state: 'One State',
        postalCode: '1111',
        country: 'Country Two'
      }),
      contact: JSON.stringify({
        firstName: 'Client',
        lastName: 'Contact 2',
        phone: '111-111-1111',
        fax: '111-111-1111',
        email: 'client2@testclient.com',
        title: 'CEO'
      }),
      notes: 'Some notes for test client 2 here.'
    },
    {
      id: 3, 
      companyId: 1,
      executiveId: 1,
      type: 'exporter',
      name: 'Exporter Name 3',
      address: JSON.stringify({
        line1: '111 Client Address Line 1',
        line2: 'Suite 111',
        city: 'City One',
        state: 'One State',
        postalCode: '1111',
        country: 'Country One'
      }),
      contact: JSON.stringify({
        firstName: 'Client',
        lastName: 'Contact 3',
        phone: '111-111-1111',
        fax: '111-111-1111',
        email: 'client3@testclient.com',
        title: 'President'
      }),
      notes: 'Some notes for test client 3 here.'
    },
    {
      id: 4, 
      companyId: 1,
      executiveId: 1,
      type: 'consignee',
      name: 'Client Name 4',
      address: JSON.stringify({
        line1: '111 Client Address Line 1',
        line2: 'Suite 111',
        city: 'City One',
        state: 'One State',
        postalCode: '1111',
        country: 'Country Two'
      }),
      contact: JSON.stringify({
        firstName: 'Client',
        lastName: 'Contact 4',
        phone: '111-111-1111',
        fax: '111-111-1111',
        email: 'client4@testclient.com',
        title: 'CEO'
      }),
      notes: 'Some notes for test client 4 here.'
    },
    {
      id: 5, 
      companyId: 1,
      executiveId: 3,
      type: 'exporter',
      name: 'Exporter Name 5',
      address: JSON.stringify({
        line1: '111 Client Address Line 1',
        line2: 'Suite 111',
        city: 'City One',
        state: 'One State',
        postalCode: '1111',
        country: 'Country Two'
      }),
      contact: JSON.stringify({
        firstName: 'Client',
        lastName: 'Contact 5',
        phone: '111-111-1111',
        fax: '111-111-1111',
        email: 'client5@testclient.com',
        title: 'Client Title'
      }),
      notes: 'Some notes for test client 5 here.'
    },
    {
      id: 6, 
      companyId: 1,
      executiveId: 3,
      type: 'exporter',
      name: 'Client Name 6',
      address: JSON.stringify({
        line1: '111 Client Address Line 1',
        line2: 'Suite 111',
        city: 'City One',
        state: 'One State',
        postalCode: '1111',
        country: 'Country One'
      }),
      contact: JSON.stringify({
        firstName: 'Client',
        lastName: 'Contact 6',
        phone: '111-111-1111',
        fax: '111-111-1111',
        email: 'client6@testclient.com',
        title: 'CEO'
      }),
      notes: 'Some notes for test client 6 here.'
    }
  ]
}

const getRandomClientDataArray = () => {
  let arr = []

  for (var i = 0; i < NUM_RANDOM_CLIENTS; i++) {
    let type = Client.types[i % Client.types.length]
    let data = getRandomClientData(type)

    data.address = JSON.stringify(data.address)
    data.contact = JSON.stringify(data.contact)
    data.extra = JSON.stringify(data.extra)

    arr.push(data)
  }
  
  return arr
}

const getRandomClientData = (type, companyId = 2, executiveId = 5) => {
  return {
    companyId,
    executiveId,
    type: type || faker.random.arrayElement(Client.types),
    name: faker.company.companyName(),
    address: {
      line1: faker.address.streetAddress(),
      line2: faker.random.boolean() ? faker.address.secondaryAddress() : '',
      city: faker.address.city(),
      state: faker.address.state(),
      postalCode: faker.address.zipCode(),
      country: faker.address.country()
    },
    contact: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      phone: faker.phone.phoneNumber(),
      fax: faker.phone.phoneNumber(),
      email: faker.internet.email(),
      title: faker.random.words()
    },
    notes: faker.lorem.lines(),
    created: Date.now(),
    modified: Date.now()
  }
}


module.exports = { 
  seed,
  getRandomClientData,
  NUM_STATIC_CLIENTS,
  NUM_RANDOM_CLIENTS
}
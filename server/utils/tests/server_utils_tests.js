const {expect} = require('chai');
const sinon = require('sinon');

const {
  getParam,
  encodeURL,
  serialize,
  getHost,
  getEmailFromPath,
  getDomainFromEmail,
  getUserNameFromEmail,
  getUserPathFromEmail,
  getDashboardPathFromEmail,
  getEditPathFromEmail,
  coalesce
} = require('../server_utils');

describe('Server Utils', () => {
  describe('getParam', () => {
    it('should return a value when passed a value', () => 
      expect(getParam('value')).to.equal('value'));
    it('should return null when passed anything else', () => 
      expect(getParam('')).to.be.null);
  });

  describe('encodeURL', () => {
    it('should encode a path and an params as an object as a valid URL', () => {
      let path = '/somepath';
      let params = { 
        param1: 'value1', 
        param2: 'value2',
        longtext1: 'This is a string that could be encoded as well',
        param3: 'value3' }
      let result = '/somepath?param1=value1&param2=value2&longtext1=This%20is%20a%20string%20that%20could%20be%20encoded%20as%20well&param3=value3'
      expect(encodeURL(path, params)).to.equal(result);
    })
  });

  describe('serialize', () => {
    it('should encode an object containing params as a valid URI', () => {
      let params = { 
        param1: 'value1', 
        param2: 'value2',
        longtext1: 'This is a string that could be encoded as well',
        param3: 'value3' }
      let result = 'param1=value1&param2=value2&longtext1=This%20is%20a%20string%20that%20could%20be%20encoded%20as%20well&param3=value3'
      expect(serialize(params)).to.equal(result);
    })
  });

  describe('getHost', () => {
    var fake = sinon.fake.returns('localhost:3000');
    var req = { protocol: 'http', get: (param) => fake(param) };

    it('should take a request and return the host string', () => {
      expect(getHost(req)).to.equal('http://localhost:3000');
      expect(fake.lastArg).to.equal('Host')
    })
  });

  describe('getEmailFromPath', () => {
    it('should take a domain and user name and return a valid email', () => {
      expect(getEmailFromPath('test.com', 'dave.williams')).to.equal('dave.williams@test.com');
    })
  });

  describe('getDomainFromEmail', () => {
    it('should take an email and return a domain name', () => {
      expect(getDomainFromEmail('dave.williams@test.com')).to.equal('test.com');
    })
  });

  describe('getUserNameFromEmail', () => {
    it('should take an email and return a user name', () => {
      expect(getUserNameFromEmail('dave.williams@test.com')).to.equal('dave.williams');
    })
  });

  describe('getUserPathFromEmail', () => {
    it('should take an email and return the user path', () => {
      expect(getUserPathFromEmail('dave.williams@test.com')).to.equal('/test.com/dave.williams');
    })
  });

  describe('getDashboardPathFromEmail', () => {
    it('should take an email and return the dashboard path', () => {
      expect(getDashboardPathFromEmail('dave.williams@test.com')).to.equal('/test.com/dave.williams/dashboard');
    })
  });

  describe('getEditPathFromEmail', () => {
    it('should take an email and return the edit path', () => {
      expect(getEditPathFromEmail('dave.williams@test.com')).to.equal('/test.com/edit/dave.williams');
    })
  });

  describe('coalesce', () => {
    const source = {
      "field0": "value0",
      "profile.field1": "value1", 
      "profile.field2": "value2", 
      "profile.field3": "value3", 
      "field1": "value1", 
      "field2": "value2",
      "profile.name.last": "piltin",
      "profile.name.middle": "louis",
      "profile.name.first": "brian",
      "profile.photo": "hello.jpg",
      "field4": "value4",
      "profile.name.sur": "something",
      "profile.username": "dad",
      "course.name": "coursename1",
      "course.section": 2, 
      "course.date": "November",
      "course.students.number": 10,
      "course.students.failing": 20,
      "course.students.honor_role": true,
      "field5": true
    }

    const result = { 
      field0: 'value0',
      profile:
       { field1: 'value1',
         field2: 'value2',
         field3: 'value3',
         name:
          { last: 'piltin',
            middle: 'louis',
            first: 'brian',
            sur: 'something' },
         photo: 'hello.jpg',
         username: 'dad' },
      field1: 'value1',
      field2: 'value2',
      field4: 'value4',
      course:
       { name: 'coursename1',
         section: 2,
         date: 'November',
         students: { number: 10, failing: 20, honor_role: true } },
      field5: true 
    }
    
    it('should take an object with "embedded keys" and coalesce the objects', () => {
      expect(coalesce(source)).to.deep.include(result);
    })
  });
});

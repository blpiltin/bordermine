const request = require('supertest');
const { expect } = require('chai');


//------------------------------------------------------
// Login a user
//------------------------------------------------------
const login = (app, email, password, done, test) => {
  let authUser = request.agent(app)
  authUser
    .post('/login')
    .field('email', email)
    .field('password', password)
    .expect(res => test && test(res))
    .end((err, res) => {
      if (err) throw err
      done(authUser, res)
    })
}

//------------------------------------------------------
// Check that a user has access to the supplied path
//------------------------------------------------------
const checkGetAuth = (app, email, password, path, title, done) => {
  login(app, email, password, authUser => {
    authUser
      .get(path)
      .expect(200)
      .expect(res => {
        expect(res.text).to.contain('Classmine | ' + title);
      })
      .end(done);
  });
}

//------------------------------------------------------
// Check that the supplied path is innaccessible
//------------------------------------------------------
const checkGetUnauth = (app, path, done) => {
  request(app)
    .get(path)
    .expect(302)
    .expect(res => {
      expect(res.header['location']).to.contain('/login');
    })
    .end(done);
};

//------------------------------------------------------
// Check the the user has permissions for the supplied path
//------------------------------------------------------
const checkGetPermit = (app, email, password, path, text, done) => {
  login(app, email, password, (authUser) => {
    authUser
      .get(path)
      .expect(200)
      .expect(res => {
        expect(res.text).to.contain(text);
      })
      .end(done);
  });
}

//------------------------------------------------------
// Check that the user doesn't have permissions for the supplied path
//------------------------------------------------------
const checkGetNonPermit = (app, email, password, path, done) => {
  login(app, email, password, (authUser) => {
    authUser
      .get(path)
      .expect(404)
      .expect(res => {
        expect(res.text).to.contain('Error');
      })
      .end(done);
  });
}

//------------------------------------------------------
// Check that a request for the path redirects to the redirectPath
//------------------------------------------------------
const checkRedirect = (app, path, redirectPath, done, email, password) => {
  if (email && password) {
    login(app, email, password, (authUser, res) => {
      expect(res.header['location']).to.contain(redirectPath);
      done();
    });
  } else {
    request(app)
      .get(path)
      .expect(302)
      .expect(res => {
        expect(res.header['location']).to.contain(redirectPath);
      })
      .end(done);
  }
}


module.exports = {
  login,
  checkGetAuth, 
  checkGetUnauth, 
  checkGetPermit, 
  checkGetNonPermit,
  checkRedirect
}

const { serialize } = require('../utils/server_utils')


//------------------------------------------------------
// Convert error and message query params into flash messsages
// and redirect. Cleans params off of url while displaying messages.
//------------------------------------------------------
const flashParamsRedirect = (req, res, path) => {
  for (let key in req.query) {
    if (key === 'error' || key === 'message') {
      let text = req.query[key];
      delete req.query[key];
      res.flash(key, text);
      res.redirect(path + '?' + serialize(req.query));
      return true;
    }
  }
  return false;
}


module.exports = {
  flashParamsRedirect
}
const debug = require('../../utils/debug').create('domain_controller.js');

const view_layout = 'domain_view_layout';


const viewDomain = (req, res) => {
  res.status(res.locals.error ? 400 : 200).render('view/view_domain', { layout: view_layout });
}


module.exports = { viewDomain }

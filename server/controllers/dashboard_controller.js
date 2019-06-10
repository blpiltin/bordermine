const debug = require('../../utils/debug').create('dashboard_controller.js');

const layout = 'dashboard_layout';


const viewDashboard = (req, res) => res.render('dashboard', { layout });


module.exports = {
  viewDashboard
}
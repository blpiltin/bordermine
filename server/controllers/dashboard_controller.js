const debug = require('../../utils/debug').create('dashboard_controller.js');

const layout = 'dashboard_layout';

const DASHBOARD_MENU = {
  manifests: true, exporters: true, consignees: true, users: true, settings: true
}

const viewDashboard = (req, res) => res.render('dashboard', { layout });


module.exports = {
  viewDashboard,
  DASHBOARD_MENU
}
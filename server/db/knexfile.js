const path = require('path')


module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, './classmine_dev.db')
    },
    useNullAsDefault: true
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, './classmine_tst.db')
    },
    seeds: {
      directory: path.join(__dirname, './seeds')
    },
    migrations: {
      directory: path.join(__dirname, './migrations')
    },
    useNullAsDefault: true
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, './classmine_prd.db')
    },
    useNullAsDefault: true
  }

}

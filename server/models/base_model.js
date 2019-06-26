const debug = require('../../utils/debug').create('cm_model.js');

const _ = require('lodash')

const { Model } = require('objection')

//------------------------------------------------------
// Class providing utility functions for the Objection model class.
//------------------------------------------------------
class BaseModel extends Model {

  static get DEFAULT_PAGE_LIMIT() { return 10 }
  
  static get pluralName() { throw new Error('pluralName must be implemented!') }
  static get sortCols() { throw new Error('sortCols must be implemented!') }
  static get searchCols() { throw new Error('searchCols must be implemented!') }
  
  //------------------------------------------------------
  // Filter, sort and paginate vocabulary records based on 
  //  the where object: { colName: colVal } for where clause
  //  the filter object: { search, sort, dir, page, limit, for }
  //
  // Return: object including updated filter and records
  //------------------------------------------------------
  static filter(where, filter = {}) {
    return new Promise(async (resolve, reject) => {
      let 
        tableName = this.tableName,
        searchCols = this.searchCols,
        newFilt = _.cloneDeep(filter),
        { search, pageFor } = newFilt,
        limit = newFilt.limit || this.DEFAULT_PAGE_LIMIT,
        filterStr = getFilterStr(tableName, where, newFilt, searchCols)
  
      newFilt.page = newFilt.page || 1
      
      try {
        let records = await this.raw(filterStr),
            count = records.length
  
        if (pageFor) {
          newFilt.page = 
              Math.ceil((records.findIndex(rec => rec.id == pageFor) + 1) / limit)
        } else if (search) {
          records = searchRecords(records, search, searchCols)
          count = records.length
        } else {
          // Get page count using seperate query
          let countStr = getCountStr(tableName, where),
              data = await this.raw(countStr)
          count = data[0] && data[0]['count(`id`)']
        }
        
        newFilt.pages = getPagesArr(count, limit)
        if (pageFor || search) {
          if (newFilt.pages.length > 1) { 
            records = getPageRecords(records, newFilt) 
          } else { newFilt.pages = null }
          if (newFilt.pages && newFilt.page > newFilt.pages.length) { 
            newFilt.page = newFilt.pages.length 
          }
        }
  
        resolve({ filter: newFilt, records })
  
      } catch (err) { reject(err) }
    })
  }

  //------------------------------------------------------
  // Filter, sort and paginate vocabulary records based on 
  //  the where object: { colName: colVal } for where clause
  //  the filter object: { search, sort, dir, page, limit, for }
  //
  // Return: object including updated filter and records
  //------------------------------------------------------
  static filterNew(where, filter = {}, eager) {
    return new Promise(async (resolve, reject) => {
      try {
        let searchCols = this.searchCols,
            newFilt = _.cloneDeep(filter),
            { search, pageFor } = newFilt,
            limit = newFilt.limit || BaseModel.DEFAULT_PAGE_LIMIT,
            page = newFilt.page || 1,
            offset = (page - 1) * limit,
            query = this.query()

        newFilt.page = newFilt.page || 1

        if (eager) { query = query.eager(eager) }
        if (where) { query = query.where(where) }
        if (newFilt.sort) { 
          if (newFilt.dir === 'desc') { 
            query = query.orderByRaw(newFilt.sort + ' desc')
          } else 
            query = query.orderByRaw(newFilt.sort + ' asc')
        }
        if (!(search || pageFor)) { query = query.limit(limit).offset(offset) }

        let records = await query,
            count = records.length
  
        if (pageFor) {
          newFilt.page = 
              Math.ceil((records.findIndex(rec => rec.id == pageFor) + 1) / limit)
        } else if (search) {
          records = searchRecords(records, search, searchCols)
          count = records.length
        } else {
          // Get page count using seperate query
          let query = this.query()
          if (where) { query = query.where(where).count() }
          else { query = query.count() }
          let data = await query
          count = data[0] && data[0]['count(*)']
        }
        
        newFilt.pages = getPagesArr(count, limit)
        if (pageFor || search) {
          if (newFilt.pages.length > 1) { 
            records = getPageRecords(records, newFilt) 
          } else { newFilt.pages = null }
          if (newFilt.pages && newFilt.page > newFilt.pages.length) { 
            newFilt.page = newFilt.pages.length 
          }
        }
  
        resolve({ filter: newFilt, records })
  
      } catch (err) { reject(err) }
    })
  }
}


//======================================================
// Utils
//======================================================

//------------------------------------------------------
// Dynamically construct the query string based on filter
//------------------------------------------------------
const getFilterStr = (tableName, where, filter, searchCols) => {
  let 
    page = filter.page || 1,
    lower = searchCols.includes(filter.sort) ? `lower(${filter.sort})` : filter.sort,
    sort = 
      filter.sort 
        ? ` order by ${lower} ${filter.dir || 'asc'}` 
        : '',
    limit = filter.limit || BaseModel.DEFAULT_PAGE_LIMIT,
    offset = (page - 1) * limit,
    str =
      'select `' + tableName + '`.* from `' + tableName + '`' + 
      getWhereStr(where) + 
      sort + 
      (!(filter.search || filter.pageFor) 
        ? ' limit ' + limit + ' offset ' + offset 
        : '')
    return str
}

//------------------------------------------------------
// Dynamically construct the count query string
//------------------------------------------------------
const getCountStr = (tableName, where) => {
  let str = 
    'select count(`id`) from `' + tableName + '`' + 
    getWhereStr(where)
  return str
}

//------------------------------------------------------
// Dynamically contruct the SQL where string from 
//  column names and values
//------------------------------------------------------
const getWhereStr = (where) => {
  let str = where ? ' where' : ''
  for (key in where) {
    if (str !== ' where') { str += ' and' }
    let val = 
      typeof where[key] === 'string' 
        ? `'${where[key]}'`
        : where[key]
    str += ` \`${key}\` = ${val}`
  }
  return str
}

//------------------------------------------------------
// Perform a full-text search on all records
//------------------------------------------------------
const searchRecords = (records, str, cols) => {
  if (!records || !records[0]) return records
  cols = cols ? cols : Object.keys(records[0])
  str = str.toLowerCase()
  return records.filter(rec => 
    cols.some(col => {
      if (col.includes('.')) {
        // Handle search columns with a dotted path, ie: executive.profile
        let obj = _.get(rec, col)
        return obj && _.valuesIn(obj).join().toLowerCase().includes(str)
      }
      if (rec[col] instanceof Object) {
        // Handle JSON columns by flattening the values into lowercase strings
        return rec[col] && _.valuesIn(rec[col]).join().toLowerCase().includes(str)
      } else {
        // Handle any other type by converting to lower case string
        return rec[col] && rec[col].toString().toLowerCase().includes(str)
      }
    })
  )
}

//------------------------------------------------------
// Construct the array of page numbers based on row count and limit
//------------------------------------------------------
const getPagesArr = (count, limit) => {
  return new Array(Math.ceil(count / limit)).fill(0).map((val, i) => i + 1)
}

//------------------------------------------------------
// Manually filter records for a specific page
//------------------------------------------------------
const getPageRecords = (records, filter) => {
  let 
    limit = filter.limit || BaseModel.DEFAULT_PAGE_LIMIT,
    start = (filter.page - 1) * limit
  return records.slice(start, start + limit)
}


module.exports = { BaseModel }
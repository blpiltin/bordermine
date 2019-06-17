const debug = require('../../utils/debug').create('cm_model.js');

const _ = require('lodash')

const { Model } = require('objection')

//------------------------------------------------------
// Class providing utility functions for the Objection model class.
//------------------------------------------------------
class BaseModel extends Model {

  static get DEFAULT_PAGE_LIMIT() { return 10 }
  
  static get parentCol() { throw new Error('parentCol must be implemented!') }
  static get searchCols() { throw new Error('searchCols must be implemented!') }

  //------------------------------------------------------
  // Filter, sort and paginate vocabulary records based on 
  //  the filter object: { search, sort, dir, page, limit, for }
  //
  // Return: object including updated filter and records
  //------------------------------------------------------
  static filter(parentId, filter = {}) {
    return new Promise(async (resolve, reject) => {
      let 
        tableName = this.tableName,
        parentCol = this.parentCol,
        searchCols = this.searchCols,
        newFilt = _.cloneDeep(filter),
        { search, pageFor } = newFilt,
        limit = newFilt.limit || this.DEFAULT_PAGE_LIMIT,
        filterStr = getFilterStr(tableName, parentCol, parentId, newFilt, searchCols)
  
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
          let countStr = getCountStr(tableName, parentCol, parentId),
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
}


//======================================================
// Utils
//======================================================

//------------------------------------------------------
// Dynamically construct the query string based on filter
//------------------------------------------------------
const getFilterStr = (tableName, colName, colVal, filter, searchCols) => {
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
      ' where `' + colName + '` = ' + colVal + sort + 
      (!(filter.search || filter.pageFor) 
        ? ' limit ' + limit + ' offset ' + offset 
        : '')
    return str
}

//------------------------------------------------------
// Dynamically construct the count query string
//------------------------------------------------------
const getCountStr = (tableName, colName, colVal) => {
  let str = 
    'select count(`id`) from `' + tableName + '`' + 
    ' where `' + colName + '` = ' + colVal
  return str
}

//------------------------------------------------------
// Manually search on all records
//------------------------------------------------------
const searchRecords = (records, str, cols) => {
  if (!records || !records[0]) return records
  cols = cols ? cols : Object.keys(records[0])
  str = str.toLowerCase()
  return records.filter(rec => 
    cols.some(col => rec[col] && rec[col].toString().toLowerCase().includes(str))
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
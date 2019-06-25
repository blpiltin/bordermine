//======================================================
// exporter.js 
// 
// Description: Defines the exporter model.
// 
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.1
// History:
//  - 0.0.1: Initial version.
//======================================================

const debug = require('../../utils/debug').create('exporter.js');

const _ = require('lodash')

const { Client } = require('./client')


class Exporter extends Client {

  // static get relationMappings() {
  //   const { Manifest } = require('./manifest')

  //   return _.merge(super.relationMappings,
  //     { manifests: {
  //       relation: this.HasManyRelation,
  //       modelClass: Manifest,
  //       join: {
  //         from: 'clients.id',
  //         to: 'manifests.exporterId'
  //       }
  //     }
  //   })
  // }

  static createValidator() { 
    return new ModelValidator(super.forms['edit_client'].replace(' client', ' exporter')) 
  }

  static create(companyId, executiveId, json) {
    return super.create(companyId, executiveId, 'exporter', json)
  }

  static filter(companyId, filterSpec) {
    return super.filterNew({ companyId, type: 'exporter' }, filterSpec, 'executive')
  }
}


module.exports = { Exporter }
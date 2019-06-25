//======================================================
// consignee.js 
// 
// Description: Defines the consignee model.
// 
// Author: Brian Piltin
// Copyright: (C) 2019 Brian Piltin. All rights reserved.
//
// Version 0.0.1
// History:
//  - 0.0.1: Initial version.
//======================================================

const debug = require('../../utils/debug').create('consignee.js');

const _ = require('lodash')

const { Client } = require('./client')


class Consignee extends Client {

  static get relationMappings() {
    const { Manifest } = require('./manifest')

    return _.merge(super.relationMappings,
      { manifests: {
        relation: this.HasManyRelation,
        modelClass: Manifest,
        join: {
          from: 'clients.id',
          to: 'manifests.consigneeId'
        }
      }
    })
  }

  static createValidator() { 
    return new ModelValidator(super.forms['edit_client'].replace(' client', ' consignee')) 
  }

  static create(companyId, executiveId, json) {
    return super.create(companyId, executiveId, 'consignee', json)
  }
}


module.exports = { Consignee }
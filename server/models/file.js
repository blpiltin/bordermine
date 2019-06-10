const { Database } = require('../db/database');


var FileSchema = new Database.Schema({
  name: { type: String, required: true },
  label: { type: String },
  tags: [ String ]
});


var File = Database.model('File', FileSchema);


module.exports = { FileSchema, File }
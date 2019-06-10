
const fs = require('fs');
const { FormGenerator } = require('../form_generator');

let fileName = process.argv[2];
let formName = process.argv[3];

console.log('Attempting to create form ' + formName + ' from ' + fileName + '...');

if (!fileName) {
  console.log('Missing form filename... exiting.');
  return;
}

const forms = require(fileName);

Object.keys(forms).forEach((key) => {
  console.log('Found form ' + key);
  if (!formName || key === formName) {
    // process the form
    console.log('Processing form ' + key + '...');
    let str = new FormGenerator(forms[key]).renderHTML();
    fs.writeFile(key + '_form.hbs', str, (err) => {
      if (err) throw err;
      console.log('File written as ' + key + '_form.hbs');
    })
  }
});

const nullifyEmpty = function(data) {
  for (key in data) {
    if (data[key] === '') { data[key] = null }
  }
}


module.exports = { nullifyEmpty }

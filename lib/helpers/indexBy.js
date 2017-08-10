'use strict';

module.exports = function indexBy(data, key) {
  let obj = {};
  for (let item of data) {
    if (item[key] != null) {
      obj[item[key]] = item;
    }
  }
  return obj;
};

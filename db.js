'use strict'

const MYSQLCONNSTR = process.env.MYSQLCONNSTR_localdb

module.exports = {
  getInfo: function (callback) {
    console.log(MYSQLCONNSTR)
    callback(MYSQLCONNSTR)
  }
}